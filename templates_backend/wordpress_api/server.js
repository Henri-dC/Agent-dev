require("dotenv").config();
const express = require("express");
const cors = require("cors");
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
const axios = require("axios");
const multer = require("multer");
const FormData = require("form-data");
const Mailjet = require("node-mailjet");
const sharp = require("sharp");
const jwt = require("jsonwebtoken");

const cache = new Map(); // Stores cached responses
const DEFAULT_TTL = 60 * 60 * 6 * 1000; // Default TTL: 6 hours in milliseconds

function invalidateProductCaches() {
  const productCacheKeys = [];
  for (const key of cache.keys()) {
    if (
      key.startsWith("/api/products") ||
      key.startsWith("/api/product-categories") || // Product categories can affect product display
      key.startsWith("/api/media") // Media can affect product images
    ) {
      productCacheKeys.push(key);
    }
  }
  for (const key of productCacheKeys) {
    cache.delete(key);
  }
  console.log("Product-related caches invalidated.");
}

function cacheMiddleware(req, res, next) {
  const key = req.originalUrl; // Use the full URL as the cache key

  if (cache.has(key)) {
    const cachedData = cache.get(key);
    if (Date.now() < cachedData.expiry) {
      // Set headers from cache before sending response
      if (cachedData.headers) {
        for (const [header, value] of Object.entries(cachedData.headers)) {
          res.setHeader(header, value);
        }
        // Also re-expose the headers
        res.setHeader(
          "Access-Control-Expose-Headers",
          Object.keys(cachedData.headers).join(", ")
        );
      }
      return res.json(cachedData.data);
    } else {
      cache.delete(key); // Remove expired item
    }
  }

  // If not in cache or expired, proceed with the request
  const originalJson = res.json;
  res.json = (body) => {
    // Get headers to cache
    const headersToCache = {};
    const totalPages = res.getHeader("X-WP-TotalPages");
    const totalItems = res.getHeader("X-WP-Total");

    if (totalPages) headersToCache["X-WP-TotalPages"] = totalPages;
    if (totalItems) headersToCache["X-WP-Total"] = totalItems;

    // Store data and headers in cache
    cache.set(key, {
      data: body,
      headers: headersToCache,
      expiry: Date.now() + DEFAULT_TTL,
    });

    // Call original json function
    originalJson.call(res, body);
  };
  next();
}

process.on("uncaughtException", (err) => {
  console.error("🚨 Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("🚨 Unhandled Rejection:", reason);
});

const requiredEnvVars = [
  "WOO_API_URL",
  "WOO_CONSUMER_KEY",
  "WOO_CONSUMER_SECRET",
  "WP_USERNAME",
  "WP_PASSWORD",
  "MAILJET_API_KEY",
  "MAILJET_SECRET_KEY",
  "MAIL_FROM",
  "MAIL_TO_ADMIN",
  "ADMIN_USERNAME",
  "ADMIN_PASSWORD",
  "JWT_SECRET",
  "RECAPTCHA_SECRET_KEY", // Add reCAPTCHA secret key to required env vars
];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(
    `Erreur: Les variables d'environnement suivantes sont manquantes: ${missingEnvVars.join(
      ", "
    )}`
  );
  console.error(
    "Veuillez créer un fichier .env à la racine du projet et y définir ces variables."
  );
  process.exit(1); // Arrête le processus si des variables sont manquantes
}

// reCAPTCHA verification function
async function verifyRecaptcha(token) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;

  try {
    const response = await axios.post(verificationUrl);
    const data = response.data;
    if (data.success) {
      return true;
    } else {
      console.error("reCAPTCHA verification failed:", data["error-codes"]);
      return false;
    }
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error.message);
    return false;
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration de WooCommerce API
const wooApi = new WooCommerceRestApi({
  url: process.env.WOO_API_URL,
  consumerKey: process.env.WOO_CONSUMER_KEY,
  consumerSecret: process.env.WOO_CONSUMER_SECRET,
  version: "wc/v3",
});

// Mailjet setup
const mailjet = new Mailjet({
  apiKey: process.env.MAILJET_API_KEY,
  apiSecret: process.env.MAILJET_SECRET_KEY,
});

// Configuration de l'API WordPress (pour les articles et médias)
const WP_API_URL = process.env.WP_API_URL;
const WP_USERNAME = process.env.WP_USERNAME;
const WP_PASSWORD = process.env.WP_PASSWORD;

// Configuration de Multer pour l'upload de fichiers
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(
  cors({
    exposeHeaders: "X-WP-TotalPages",
  })
);
app.use(express.json());

// Route de test
app.get("/", (req, res) => {
  res.send(
    "Backend tontonriton est en marche motherfucker ! (Deployment Test - mardi 28 octobre 2025)"
  );
});

// Endpoint pour créer une commande WooCommerce
app.post("/api/orders", async (req, res) => {
  const orderData = req.body;
  const recaptchaToken = orderData.recaptchaToken; // Get recaptchaToken from orderData

  if (!recaptchaToken) {
    return res.status(400).json({ error: "Le jeton reCAPTCHA est manquant." });
  }

  // Verify reCAPTCHA token
  const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
  if (!isRecaptchaValid) {
    return res.status(400).json({
      error: "Échec de la vérification reCAPTCHA. Veuillez réessayer.",
    });
  }

  try {
    // Remove recaptchaToken from orderData before sending to WooCommerce
    delete orderData.recaptchaToken;

    const { data: orderResponse } = await wooApi.post("orders", orderData);

    res.status(201).json(orderResponse);

    const mailOptions = {
      from: process.env.MAIL_FROM,
      to: orderData.billing.email,
      subject: "Confirmation de votre commande Titounet",
      html: `
        <h1>Merci pour votre commande !</h1>
        <p>Votre commande #${
          orderResponse.id
        } a été reçue et est en cours de traitement.</p>
        <p>Détails de la commande:</p>
        <ul>
          ${(orderResponse.line_items || [])
            .map(
              (item) =>
                `<li>${item.name} (x${item.quantity}) - ${item.total} €</li>`
            )
            .join("")}
        </ul>
        <p>Total: ${orderResponse.total} €</p>
        <p>Nous vous contacterons bientôt pour les détails de livraison.</p>
        <p>Cordialement,<br>L'équipe Titounet</p>
      `,
    };

    const request = mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: process.env.MAIL_FROM,
            Name: "Titounet",
          },
          To: [
            {
              Email: orderData.billing.email,
              Name: `${orderData.billing.first_name} ${orderData.billing.last_name}`,
            },
          ],
          Subject: mailOptions.subject,
          TextPart: "",
          HTMLPart: mailOptions.html,
        },
      ],
    });

    request
      .then((result) => {
        // Log success silently or to a dedicated logger
      })
      .catch((err) => {
        console.error(
          "Erreur lors de l'envoi de l'email de confirmation en arrière-plan:",
          err.statusCode,
          err.message
        );
      });

    // Envoyer l'email de notification à l'administrateur
    const adminMailOptions = {
      from: process.env.MAIL_FROM,
      to: process.env.MAIL_TO_ADMIN,
      subject: `Nouvelle commande #${orderResponse.id}`,
      html: `
        <h1>Une nouvelle commande a été passée sur Titounet !</h1>
        <p>Commande #${orderResponse.id}</p>
        <p>Client: ${orderData.billing.first_name} ${
        orderData.billing.last_name
      } (${orderData.billing.email})</p>
        <p>Détails de la commande:</p>
        <ul>
          ${(orderResponse.line_items || [])
            .map(
              (item) =>
                `<li>${item.name} (x${item.quantity}) - ${item.total} €</li>`
            )
            .join("")}
        </ul>
        <p>Total: ${orderResponse.total} €</p>
        <p>Adresse de livraison:</p>
        <p>
          ${orderData.shipping.first_name} ${orderData.shipping.last_name}<br>
          ${orderData.shipping.address_1}<br>
          ${orderData.shipping.postcode} ${orderData.shipping.city}<br>
          ${orderData.shipping.country}
        </p>
      `,
    };

    const adminRequest = mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: process.env.MAIL_FROM,
            Name: "Titounet",
          },
          To: [
            {
              Email: process.env.MAIL_TO_ADMIN,
            },
          ],
          Subject: adminMailOptions.subject,
          TextPart: "",
          HTMLPart: adminMailOptions.html,
        },
      ],
    });

    adminRequest
      .then((result) => {
        // Log success silently or to a dedicated logger
      })
      .catch((err) => {
        console.error(
          "Erreur lors de l'envoi de l'email de notification à l'administrateur:",
          err.statusCode,
          err.message
        );
      });
  } catch (error) {
    console.error(
      "Erreur WooCommerce lors de la création de commande:",
      error.response?.data || error.message,
      error.stack
    );
    res.status(500).json({
      error: "Erreur lors de la création de la commande",
      details: error.response?.data || error.message,
    });
  }
});

// Endpoint pour récupérer les commandes WooCommerce
app.get("/api/orders", async (req, res) => {
  try {
    const params = { ...req.query };
    // Assurer la pagination si nécessaire
    if (params.per_page) {
      params.per_page = parseInt(params.per_page, 10);
    }
    if (params.page) {
      params.page = parseInt(params.page, 10);
    }
    const { data } = await wooApi.get("orders", params);
    res.status(200).json(data);
  } catch (error) {
    console.error(
      "Backend: Erreur lors de la récupération des commandes:",
      error.response?.data || error.message
    );
    res.status(error.response?.status || 500).json({
      error: "Erreur lors de la récupération des commandes",
      details: error.response?.data || error.message,
    });
  }
});

// --- Authentification ---
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    // Create a token
    const token = jwt.sign({ username: username }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({ message: "Connexion réussie", token: token });
  } else {
    res.status(401).json({ message: "Identifiants incorrects" });
  }
});

// --- Endpoints Produits ---
app.post("/api/products", async (req, res) => {
  const productData = req.body;

  try {
    const { data } = await wooApi.post("products", productData);
    invalidateProductCaches(); // Invalidate cache after product creation
    res.status(201).json(data);
  } catch (error) {
    console.error(
      "Backend: Erreur lors de la création du produit:",
      error.response?.data || error.message
    );
    res.status(error.response?.status || 500).json({
      error: "Erreur lors de la création du produit",
      details: error.response?.data || error.message,
    });
  }
});

app.get("/api/products", cacheMiddleware, async (req, res) => {
  try {
    const params = { ...req.query };
    if (params.per_page) {
      params.per_page = parseInt(params.per_page, 10);
    }
    if (params.page) {
      params.page = parseInt(params.page, 10);
    }
    const { data: products } = await wooApi.get("products", params);

    // Enhance products with price range for variable products
    const enhancedProducts = await Promise.all(
      products.map(async (product) => {
        if (product.type === "variable") {
          try {
            const { data: variations } = await wooApi.get(
              `products/${product.id}/variations`
            );
            if (variations && variations.length > 0) {
              const prices = variations
                .map((v) => parseFloat(v.price))
                .filter((p) => !isNaN(p));
              if (prices.length > 0) {
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                if (minPrice === maxPrice) {
                  product.price = minPrice;
                  product.price_html = `${minPrice} €`; // Explicitly set for single price variable products
                } else {
                  product.price = minPrice; // Set price to minPrice for range display
                  product.price_html = `À partir de ${minPrice} €`;
                }
              } else {
                // If no variations have prices, clear price_html and price
                product.price = null;
                product.price_html = "";
              }
            } else {
              // If no variations, clear price_html and price
              product.price = null;
              product.price_html = "";
            }
          } catch (variationError) {
            console.error(
              `Failed to fetch variations for product ${product.id}:`,
              variationError.message
            );
            // Fallback: if variations fail, clear price_html and price
            product.price = null;
            product.price_html = "";
          }
        } else {
          // For simple products, ensure price_html is set using its price
          if (product.price) {
            product.price_html = `${product.price} €`;
          } else {
            product.price_html = "";
          }
        }
        return product;
      })
    );

    res.status(200).json(enhancedProducts);
  } catch (error) {
    console.error(
      "Backend: Erreur lors de la récupération des produits:",
      error.response?.data || error.message
    );
    res.status(error.response?.status || 500).json({
      error: "Erreur lors de la récupération des produits",
      details: error.response?.data || error.message,
    });
  }
});

app.get("/api/products/featured", cacheMiddleware, async (req, res) => {
  try {
    const { data } = await wooApi.get("products", {
      featured: true,
      ...req.query,
    });
    res.status(200).json(data);
  } catch (error) {
    console.error(
      "Backend: Erreur lors de la récupération des produits mis en avant:",
      error.response?.data || error.message
    );
    res.status(error.response?.status || 500).json({
      error: "Erreur lors de la récupération des produits mis en avant",
      details: error.response?.data || error.message,
    });
  }
});

app.get("/api/products/:id", cacheMiddleware, async (req, res) => {
  try {
    const productId = req.params.id;
    const { data } = await wooApi.get(`products/${productId}`, req.query);
    res.status(200).json(data);
  } catch (error) {
    console.error(
      "Backend: Erreur lors de la récupération du produit:",
      error.response?.data || error.message
    );
    res.status(error.response?.status || 500).json({
      error: "Erreur lors de la récupération du produit",
      details: error.response?.data || error.message,
    });
  }
});

app.put("/api/products/:id", async (req, res) => {
  const productId = req.params.id;
  const productData = req.body;

  try {
    const { data } = await wooApi.put(`products/${productId}`, productData);
    invalidateProductCaches(); // Invalidate cache after product update
    res.status(200).json(data);
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour du produit:",
      error.response?.data || error.message
    );
    res.status(error.response?.status || 500).json({
      error: "Erreur lors de la mise à jour du produit",
      details: error.response?.data || error.message,
    });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  const productId = req.params.id;

  try {
    const { data } = await wooApi.delete(`products/${productId}`, {
      force: true,
    });
    invalidateProductCaches(); // Invalidate cache after product deletion
    res.status(200).json(data);
  } catch (error) {
    console.error(
      "Erreur lors de la suppression du produit:",
      error.response?.data || error.message
    );
    res.status(error.response?.status || 500).json({
      error: "Erreur lors de la suppression du produit",
      details: error.response?.data || error.message,
    });
  }
});

app.get(
  "/api/products/:product_id/variations",
  cacheMiddleware,
  async (req, res) => {
    const productId = req.params.product_id;

    try {
      const { data } = await wooApi.get(`products/${productId}/variations`, {
        per_page: 50,
      }); // Request up to 50 variations
      res.status(200).json(data);
    } catch (error) {
      console.error(
        `Backend: Erreur lors de la récupération des variations pour le produit ${productId}:`,
        error.response?.data || error.message
      );
      res.status(error.response?.status || 500).json({
        error: `Erreur lors de la récupération des variations pour le produit ${productId}`,
        details: error.response?.data || error.message,
      });
    }
  }
);

app.post("/api/products/:product_id/variations", async (req, res) => {
  const productId = req.params.product_id;
  const variationData = req.body; // Expecting variation data in the request body

  try {
    const { data } = await wooApi.post(
      `products/${productId}/variations`,
      variationData
    );
    invalidateProductCaches(); // Invalidate cache after variation creation
    res.status(201).json(data);
  } catch (error) {
    console.error(
      `Backend: Erreur lors de la création de la variation pour le produit ${productId}:`,
      error.response?.data || error.message
    );
    res.status(error.response?.status || 500).json({
      error: `Erreur lors de la création de la variation pour le produit ${productId}`,
      details: error.response?.data || error.message,
    });
  }
});

app.put(
  "/api/products/:product_id/variations/:variation_id",
  async (req, res) => {
    const productId = req.params.product_id;
    const variationId = req.params.variation_id;
    const variationData = req.body;

    try {
      const { data } = await wooApi.put(
        `products/${productId}/variations/${variationId}`,
        variationData
      );
      invalidateProductCaches(); // Invalidate cache after variation update
      res.status(200).json(data);
    } catch (error) {
      console.error(
        `Backend: Erreur lors de la mise à jour de la variation ${variationId} pour le produit ${productId}:`,
        error.response?.data || error.message
      );
      res.status(error.response?.status || 500).json({
        error: `Erreur lors de la mise à jour de la variation ${variationId} pour le produit ${productId}`,
        details: error.response?.data || error.message,
      });
    }
  }
);

app.get(
  "/api/products/attributes/:attribute_id/terms",
  cacheMiddleware,
  async (req, res) => {
    const attributeId = req.params.attribute_id;

    try {
      const { data } = await wooApi.get(
        `products/attributes/${attributeId}/terms`,
        req.query
      );
      res.status(200).json(data);
    } catch (error) {
      console.error(
        `Backend: Erreur lors de la récupération des termes pour l'attribut ${attributeId}:`,
        error.response?.data || error.message
      );
      res.status(error.response?.status || 500).json({
        error: `Erreur lors de la récupération des termes pour l'attribut ${attributeId}`,
        details: error.response?.data || error.message,
      });
    }
  }
);

app.post("/api/products/attributes/:attribute_id/terms", async (req, res) => {
  const attributeId = req.params.attribute_id;
  const termData = req.body;

  try {
    const { data } = await wooApi.post(
      `products/attributes/${attributeId}/terms`,
      termData
    );
    invalidateProductCaches(); // Invalidate cache after attribute term creation
    res.status(201).json(data);
  } catch (error) {
    console.error(
      `Backend: Erreur lors de la création du terme pour l'attribut ${attributeId}:`,
      error.response?.data || error.message
    );
    res.status(error.response?.status || 500).json({
      error: `Erreur lors de la création du terme pour l'attribut ${attributeId}`,
      details: error.response?.data || error.message,
    });
  }
});

app.delete(
  "/api/products/attributes/:attribute_id/terms/:term_id",
  async (req, res) => {
    const { attribute_id, term_id } = req.params;

    try {
      const { data } = await wooApi.delete(
        `products/attributes/${attribute_id}/terms/${term_id}`,
        { force: true }
      );
      invalidateProductCaches(); // Invalidate cache after attribute term deletion
      res.status(200).json(data);
    } catch (error) {
      console.error(
        `Backend: Erreur lors de la suppression du terme ${term_id} pour l'attribut ${attribute_id}:`,
        error.response?.data || error.message
      );
      res.status(error.response?.status || 500).json({
        error: `Erreur lors de la suppression du terme`,
        details: error.response?.data || error.message,
      });
    }
  }
);

app.delete(
  "/api/products/:product_id/variations/:variation_id",
  async (req, res) => {
    const productId = req.params.product_id;
    const variationId = req.params.variation_id;
    const forceDelete = req.query.force === "true"; // Check for force=true in query params

    try {
      const { data } = await wooApi.delete(
        `products/${productId}/variations/${variationId}`,
        { force: forceDelete }
      );
      invalidateProductCaches(); // Invalidate cache after variation deletion
      res.status(200).json(data);
    } catch (error) {
      console.error(
        `Backend: Erreur lors de la suppression de la variation ${variationId} pour le produit ${productId}:`,
        error.response?.data || error.message
      );
      res.status(error.response?.status || 500).json({
        error: `Erreur lors de la suppression de la variation ${variationId} pour le produit ${productId}`,
        details: error.response?.data || error.message,
      });
    }
  }
);

// --- Endpoints Catégories ---
app.get("/api/product-categories", async (req, res) => {
  try {
    const params = { ...req.query };
    if (params.per_page) {
      params.per_page = parseInt(params.per_page, 10);
    }
    if (params.page) {
      params.page = parseInt(params.page, 10);
    }
    const { data } = await wooApi.get("products/categories", params);
    res.status(200).json(data);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des catégories de produits:",
      error.response?.data || error.message
    );
    res.status(error.response?.status || 500).json({
      error: "Erreur lors de la récupération des catégories de produits",
      details: error.response?.data || error.message,
    });
  }
});

app.put("/api/product-categories/:id", async (req, res) => {
  const categoryId = req.params.id;
  const categoryData = req.body;

  try {
    const { data } = await wooApi.put(
      `products/categories/${categoryId}`,
      categoryData
    );
    invalidateProductCaches(); // Invalidate cache after category update
    res.status(200).json(data);
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour de la catégorie de produit:",
      error.response?.data || error.message
    );
    res.status(error.response?.status || 500).json({
      error: "Erreur lors de la mise à jour de la catégorie de produit",
      details: error.response?.data || error.message,
    });
  }
});

// --- Endpoints Médias ---
app.post("/api/media", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Aucun fichier fourni" });
  }

  const formData = new FormData();
  formData.append("file", req.file.buffer, req.file.originalname);

  try {
    const response = await axios.post(`${WP_API_URL}/wp/v2/media`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Basic ${Buffer.from(
          `${WP_USERNAME}:${WP_PASSWORD}`
        ).toString("base64")}`,
      },
    });
    invalidateProductCaches(); // Invalidate cache after media upload
    res.status(201).json(response.data);
  } catch (error) {
    console.error(
      "Erreur lors du téléchargement du média:",
      error.response ? error.response.data : error.message
    );
    res.status(error.response ? error.response.status : 500).json({
      error: "Erreur lors du téléchargement du média",
      details: error.response ? error.response.data : error.message,
    });
  }
});

app.get("/api/media", cacheMiddleware, async (req, res) => {
  try {
    const response = await axios.get(`${WP_API_URL}/wp/v2/media`, {
      params: req.query,
      auth: {
        username: WP_USERNAME,
        password: WP_PASSWORD,
      },
    });

    // Capture the specific headers you need
    const totalPages = response.headers["x-wp-totalpages"];
    const totalItems = response.headers["x-wp-total"];
    // Send the headers to the front end
    res.setHeader("X-WP-TotalPages", totalPages);
    res.setHeader("X-WP-Total", totalItems);
    // ➡️ Add this line to expose the custom headers to the browser
    res.setHeader(
      "Access-Control-Expose-Headers",
      "X-WP-TotalPages, X-WP-Total"
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "Backend: Erreur lors de la récupération des médias (Axios):",
      error.response ? error.response.data : error.message
    );
    res.status(error.response ? error.response.status : 500).json({
      error: "Erreur lors de la récupération des médias",
      details: error.response ? error.response.data : error.message,
    });
  }
});

app.get("/api/media/:id", cacheMiddleware, async (req, res) => {
  try {
    const mediaId = req.params.id;
    const response = await axios.get(`${WP_API_URL}/wp/v2/media/${mediaId}`, {
      params: req.query,
      auth: {
        username: WP_USERNAME,
        password: WP_PASSWORD,
      },
    });

    const mediaData = response.data;

    // Generate blurred placeholder if it's an image and has a source_url
    if (
      mediaData.media_details &&
      mediaData.media_details.sizes &&
      mediaData.media_details.sizes.full &&
      mediaData.media_details.sizes.full.source_url
    ) {
      try {
        const imageUrl = mediaData.media_details.sizes.full.source_url;
        const imageResponse = await axios.get(imageUrl, {
          responseType: "arraybuffer",
        });
        const blurredBuffer = await sharp(imageResponse.data)
          .resize(20, 20) // Tiny size
          .blur(1) // Apply a slight blur
          .jpeg({ quality: 50 }) // Compress as JPEG
          .toBuffer();
        mediaData.placeholder_url = `data:image/jpeg;base64,${blurredBuffer.toString(
          "base64"
        )}`;
      } catch (placeholderError) {
        console.error(
          `Error generating placeholder for media ${mediaId}:`,
          placeholderError.message
        );
        // Fallback: do not add placeholder_url if generation fails
      }
    }

    res.status(200).json(mediaData);
  } catch (error) {
    console.error(
      "Backend: Erreur lors de la récupération du média (Axios):",
      error.response ? error.response.data : error.message
    );
    res.status(error.response ? error.response.status : 500).json({
      error: "Erreur lors de la récupération du média",
      details: error.response ? error.response.data : error.message,
    });
  }
});

app.get("/api/media_category", cacheMiddleware, async (req, res) => {
  try {
    const response = await axios.get(
      `${WP_API_URL}/wp/v2/attachment_category`,
      {
        params: req.query,
        auth: {
          username: WP_USERNAME,
          password: WP_PASSWORD,
        },
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "Backend: Erreur lors de la récupération des catégories de médias (Axios):",
      error.response ? error.response.data : error.message
    );
    res.status(error.response ? error.response.status : 500).json({
      error: "Erreur lors de la récupération des catégories de médias",
      details: error.response ? error.response.data : error.message,
    });
  }
});

app.get("/api/media/category/:slug", cacheMiddleware, async (req, res) => {
  const categorySlug = req.params.slug;

  if (!categorySlug) {
    return res
      .status(400)
      .json({ error: "Le slug de la catégorie est requis" });
  }

  try {
    // 1. Fetch the parent category ID from the slug
    const parentCategoryResponse = await axios.get(
      `${WP_API_URL}/wp/v2/attachment_category`,
      {
        params: { slug: categorySlug },
        auth: { username: WP_USERNAME, password: WP_PASSWORD },
      }
    );

    if (
      !parentCategoryResponse.data ||
      parentCategoryResponse.data.length === 0
    ) {
      return res
        .status(404)
        .json({ error: `Catégorie parente '${categorySlug}' non trouvée.` });
    }
    const parentCategoryId = parentCategoryResponse.data[0].id;

    // 2. Fetch all child categories
    const childCategoriesResponse = await axios.get(
      `${WP_API_URL}/wp/v2/attachment_category`,
      {
        params: { parent: parentCategoryId, per_page: 100 },
        auth: { username: WP_USERNAME, password: WP_PASSWORD },
      }
    );
    const childCategoryIds = childCategoriesResponse.data.map((cat) => cat.id);

    // 3. Combine parent and child IDs
    const allCategoryIds = [parentCategoryId, ...childCategoryIds];

    // 4. Fetch media using all the category IDs
    const mediaResponse = await axios.get(`${WP_API_URL}/wp/v2/media`, {
      params: {
        attachment_category: allCategoryIds.join(","), // Pass a comma-separated string of IDs
        ...req.query,
      },
      auth: {
        username: WP_USERNAME,
        password: WP_PASSWORD,
      },
    });

    // Forward pagination headers
    const totalPages = mediaResponse.headers["x-wp-totalpages"];
    const totalItems = mediaResponse.headers["x-wp-total"];
    if (totalPages) {
      res.setHeader("X-WP-TotalPages", totalPages);
    }
    if (totalItems) {
      res.setHeader("X-WP-Total", totalItems);
    }
    // Expose headers to the browser
    res.setHeader(
      "Access-Control-Expose-Headers",
      "X-WP-TotalPages, X-WP-Total"
    );

    res.status(200).json(mediaResponse.data);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des médias par catégorie:",
      error.response ? error.response.data : error.message
    );
    res.status(error.response ? error.response.status : 500).json({
      error: "Erreur lors de la récupération des médias par catégorie",
      details: error.response ? error.response.data : error.message,
    });
  }
});

app.put("/api/media/:mediaId", async (req, res) => {
  const mediaId = req.params.mediaId;
  const { attachment_category } = req.body;

  if (!Array.isArray(attachment_category)) {
    return res.status(400).json({
      error:
        "Le corps de la requête doit contenir un tableau 'attachment_category'.",
    });
  }

  try {
    const response = await axios.post(
      `${WP_API_URL}/wp/v2/media/${mediaId}`,
      {
        attachment_category: attachment_category,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        auth: {
          username: WP_USERNAME,
          password: WP_PASSWORD,
        },
      }
    );
    invalidateProductCaches(); // Invalidate cache after media category update
    res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "Backend: Erreur lors de la mise à jour des catégories du média (Axios):",
      error.response ? error.response.data : error.message
    );
    res.status(error.response ? error.response.status : 500).json({
      error: "Erreur lors de la mise à jour des catégories du média",
      details: error.response ? error.response.data : error.message,
    });
  }
});

app.delete("/api/media/:mediaId", async (req, res) => {
  const mediaId = req.params.mediaId;

  try {
    const response = await axios.delete(
      `${WP_API_URL}/wp/v2/media/${mediaId}?force=true`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${WP_USERNAME}:${WP_PASSWORD}`
          ).toString("base64")}`,
        },
      }
    );
    invalidateProductCaches(); // Invalidate cache after media deletion
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Backend: Erreur lors de la suppression du média (Axios):");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
      console.error("Data:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
    res.status(error.response ? error.response.status : 500).json({
      error: "Erreur lors de la suppression du média",
      details: error.response ? error.response.data : error.message,
    });
  }
});

// --- Endpoints Articles ---
app.get("/api/articles", cacheMiddleware, async (req, res) => {
  try {
    const response = await axios.get(`${WP_API_URL}/wp/v2/posts`, {
      params: req.query,
      auth: {
        username: WP_USERNAME,
        password: WP_PASSWORD,
      },
    });
    res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "Backend: Erreur lors de la récupération des articles (Axios):",
      error.response ? error.response.data : error.message
    );
    res.status(error.response?.status || 500).json({
      error: "Erreur lors de la récupération des articles",
      details: error.response ? error.response.data : error.message,
    });
  }
});

app.get("/api/articles/:id", cacheMiddleware, async (req, res) => {
  try {
    const articleId = req.params.id;
    const response = await axios.get(`${WP_API_URL}/wp/v2/posts/${articleId}`, {
      params: req.query,
      auth: {
        username: WP_USERNAME,
        password: WP_PASSWORD,
      },
    });
    res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "Backend: Erreur lors de la récupération de l'article (Axios):",
      error.response ? error.response.data : error.message
    );
    res.status(error.response?.status || 500).json({
      error: "Erreur lors de la récupération de l'article",
      details: error.response ? error.response.data : error.message,
    });
  }
});

// New Endpoint for WordPress Pages
app.get("/api/pages/:id", cacheMiddleware, async (req, res) => {
  try {
    const pageId = req.params.id;
    const response = await axios.get(`${WP_API_URL}/wp/v2/pages/${pageId}`, {
      params: req.query,
      auth: {
        username: WP_USERNAME,
        password: WP_PASSWORD,
      },
    });
    res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "Backend: Erreur lors de la récupération de la page (Axios):",
      error.response ? error.response.data : error.message
    );
    res.status(error.response?.status || 500).json({
      error: "Erreur lors de la récupération de la page",
      details: error.response ? error.response.data : error.message,
    });
  }
});

// --- Endpoints Instagram ---
app.get(
  "/api/titounet/v1/featured-instagram",
  cacheMiddleware,
  async (req, res) => {
    try {
      const response = await axios.get(
        `${WP_API_URL}/titounet/v1/featured-instagram`,
        {
          params: req.query,
          auth: {
            username: WP_USERNAME,
            password: WP_PASSWORD,
          },
        }
      );
      res.status(200).json(response.data);
    } catch (error) {
      console.error(
        "Backend: Erreur lors de la récupération des posts Instagram favoris (Axios):",
        error.response ? error.response.data : error.message
      );
      res.status(error.response ? error.response.status : 500).json({
        error: "Erreur lors de la récupération des posts Instagram favoris",
        details: error.response ? error.response.data : error.message,
      });
    }
  }
);

app.post("/api/titounet/v1/featured-instagram", async (req, res) => {
  const { post_ids } = req.body;

  if (!Array.isArray(post_ids)) {
    return res
      .status(400)
      .json({ error: "Le paramètre post_ids doit être un tableau." });
  }

  try {
    const response = await axios.post(
      `${WP_API_URL}/titounet/v1/featured-instagram`,
      { post_ids },
      {
        auth: {
          username: WP_USERNAME,
          password: WP_PASSWORD,
        },
      }
    );
    invalidateProductCaches(); // Invalidate cache after updating featured Instagram posts
    res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "Backend: Erreur lors de la mise à jour des posts Instagram favoris (Axios):",
      error.response ? error.response.data : error.message
    );
    res.status(error.response?.status || 500).json({
      error: "Erreur lors de la mise à jour des posts Instagram favoris",
      details: error.response ? error.response.data : error.message,
    });
  }
});

app.get("/api/instagram/media", cacheMiddleware, async (req, res) => {
  const userId = req.query.userId;
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const postIdsParam = req.query.postIds; // Get postIds from query
  const featuredIds = postIdsParam ? postIdsParam.split(",") : []; // Split into array

  if (!userId) {
    return res.status(400).json({ error: "User ID is required." });
  }

  if (!accessToken) {
    console.error(
      "INSTAGRAM_ACCESS_TOKEN is not set in environment variables."
    );
    return res.status(500).json({
      error: "Instagram Access Token is not configured on the server.",
    });
  }

  const url = `https://graph.instagram.com/${userId}/media?fields=id,caption,media_type,media_url,permalink,children{id,media_type,media_url}&access_token=${accessToken}`;

  try {
    const response = await axios.get(url);
    let instagramPosts = response.data.data;

    // Filter posts based on featuredIds BEFORE processing
    if (featuredIds.length > 0) {
      instagramPosts = instagramPosts.filter((post) =>
        featuredIds.includes(post.id)
      );
    }

    const processedPosts = await Promise.all(
      instagramPosts.map(async (post) => {
        if (post.media_type === "IMAGE" && post.media_url) {
          try {
            const imageResponse = await axios.get(post.media_url, {
              responseType: "arraybuffer",
            });
            const image = sharp(imageResponse.data);
            const metadata = await image.metadata();

            const resizedImageBuffer = await image.resize(200, 200).toBuffer();
            const resizedBase64 = `data:image/jpeg;base64,${resizedImageBuffer.toString(
              "base64"
            )}`;

            return { ...post, resized_media_url: resizedBase64 };
          } catch (resizeError) {
            console.error(
              `Error resizing Instagram image ${post.id}:`,
              resizeError.message,
              resizeError.stack
            );
            return { ...post, resized_media_url: post.media_url }; // Fallback to original
          }
        } else if (
          post.media_type === "CAROUSEL_ALBUM" &&
          post.children &&
          post.children.data
        ) {
          const resizedChildren = await Promise.all(
            post.children.data.map(async (child) => {
              if (child.media_type === "IMAGE" && child.media_url) {
                try {
                  const childImageResponse = await axios.get(child.media_url, {
                    responseType: "arraybuffer",
                  });
                  const childImage = sharp(childImageResponse.data);
                  const childMetadata = await childImage.metadata();

                  const resizedChildImageBuffer = await childImage
                    .resize(200, 200)
                    .toBuffer();
                  const resizedChildBase64 = `data:image/jpeg;base64,${resizedChildImageBuffer.toString(
                    "base64"
                  )}`;

                  return { ...child, resized_media_url: resizedChildBase64 };
                } catch (childResizeError) {
                  console.error(
                    `Error resizing Instagram child image ${child.id}:`,
                    childResizeError.message,
                    childResizeError.stack
                  );
                  return { ...child, resized_media_url: child.media_url }; // Fallback to original
                }
              }
              return child; // Return original child if not an image or no media_url
            })
          );
          return { ...post, resized_children: resizedChildren };
        }
        return post; // Return original post if not an image or no media_url
      })
    );

    res.status(200).json({ data: processedPosts });
  } catch (error) {
    console.error(
      "Backend: Erreur lors de la récupération des médias Instagram:",
      error.response ? error.response.data : error.message
    );
    res.status(error.response?.status || 500).json({
      error: "Erreur lors de la récupération des médias Instagram",
      details: error.response ? error.response.data : error.message,
    });
  }
});

// --- Endpoints Paramètres ---
app.get(
  "/api/settings/order-summary-note",
  cacheMiddleware,
  async (req, res) => {
    try {
      const response = await axios.get(
        `${WP_API_URL}/titounet/v1/admin/options/order-summary-note`, // New custom endpoint
        {
          auth: {
            username: WP_USERNAME,
            password: WP_PASSWORD,
          },
        }
      );
      // The new PHP endpoint returns { value: '...' }, so we pass that directly
      res.status(200).json(response.data);
    } catch (error) {
      console.error(
        "Backend: Erreur lors de la récupération de la note de résumé de commande (Axios):",
        error.response ? error.response.data : error.message
      );
      res.status(error.response?.status || 500).json({
        error:
          "Erreur lors de la récupération de la note de résumé de commande",
        details: error.response ? error.response.data : error.message,
      });
    }
  }
);

app.post("/api/settings/order-summary-note", async (req, res) => {
  const { note } = req.body; // Expecting the note in 'note' property

  // Invalidate the cache for the GET endpoint
  const cacheKey = "/api/settings/order-summary-note";
  if (cache.has(cacheKey)) {
    cache.delete(cacheKey);
  }

  if (!note) {
    // Check for 'note'
    return res.status(400).json({ error: "Le contenu de la note est requis." });
  }

  try {
    const response = await axios.post(
      // Changed to axios.post
      `${WP_API_URL}/titounet/v1/admin/options/order-summary-note`, // Correct endpoint
      { note: note }, // Send 'note' as expected by PHP endpoint
      {
        headers: {
          "Content-Type": "application/json",
        },
        auth: {
          username: WP_USERNAME,
          password: WP_PASSWORD,
        },
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "Backend: Erreur lors de la mise à jour de la note de résumé de commande (Axios):",
      error.response ? error.response.data : error.message
    );
    res.status(error.response?.status || 500).json({
      error: "Erreur lors de la mise à jour de la note de résumé de commande",
      details: error.response ? error.response.data : error.message,
    });
  }
});

// --- Contact Form Endpoint ---
app.post("/api/contact", async (req, res) => {
  const { name, email, inquiryType, subject, message, recaptchaToken } =
    req.body; // Get recaptchaToken

  if (
    !name ||
    !email ||
    !inquiryType ||
    !subject ||
    !message ||
    !recaptchaToken
  ) {
    return res
      .status(400)
      .json({ error: "Tous les champs sont requis, y compris le reCAPTCHA." });
  }

  // Verify reCAPTCHA token
  const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
  if (!isRecaptchaValid) {
    return res.status(400).json({
      error: "Échec de la vérification reCAPTCHA. Veuillez réessayer.",
    });
  }

  const mailOptions = {
    from: process.env.MAIL_FROM,
    to: process.env.MAIL_TO_ADMIN, // Send to admin email
    subject: `[Contact Titounet - ${inquiryType}] ${subject}`,
    html: `
      <h1>Nouveau message de contact</h1>
      <p><strong>Nom:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Type de demande:</strong> ${inquiryType}</p>
      <p><strong>Sujet:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
  };

  // Send the response immediately, then send the email in the background
  res.status(200).json({ message: "Message envoyé avec succès." }); // <--- Send response first

  const request = mailjet.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: process.env.MAIL_FROM,
          Name: "Titounet",
        },
        To: [
          {
            Email: process.env.MAIL_TO_ADMIN,
          },
        ],
        Subject: mailOptions.subject,
        TextPart: "",
        HTMLPart: mailOptions.html,
      },
    ],
  });

  request
    .then((result) => {
      // Log success silently or to a dedicated logger
    })
    .catch((err) => {
      console.error(
        "Backend: Erreur lors de l'envoi de l'email de contact en arrière-plan:",
        err.statusCode,
        err.message
      );
    });
});

// Démarrage du serveur
try {
  const server = app.listen(PORT, () => {
    console.log(`✅ Serveur backend démarré sur le port ${PORT}`);
  });

  server.on("close", () => {
    console.log("❌ Serveur fermé");
  });
} catch (error) {
  console.error("Erreur lors du démarrage du serveur:", error);
  process.exit(1);
}
