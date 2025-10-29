import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins for development purposes.
// In production, specify a limited origin, e.g., origin: 'http://localhost:5173'
app.use(cors({ origin: '*' }));

app.use(express.json()); // Middleware to parse JSON request bodies

// --- Placeholder for WooCommerce API setup (uncomment and configure for real integration) ---
/*
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

const wooApi = new WooCommerceRestApi({
  url: process.env.WOO_API_URL, // Your store URL, e.g., 'https://yourwordpresssite.com'
  consumerKey: process.env.WOO_CONSUMER_KEY, // Your consumer key
  consumerSecret: process.env.WOO_CONSUMER_SECRET, // Your consumer secret
  version: 'wc/v3', // WooCommerce WP REST API version
  queryStringAuth: true // Force Basic Authentication as query string params, for some servers
});
*/

// --- Mock product data for demonstration ---
// This data will be sent if the real WooCommerce API call is commented out or fails.
const mockProducts = [
  { id: 1, name: 'T-shirt Logo', price: '25.00€', imageUrl: 'https://via.placeholder.com/300x200?text=T-shirt+Logo', description: 'Un t-shirt confortable avec le logo de la marque.' },
  { id: 2, name: 'Mug de Collection', price: '12.99€', imageUrl: 'https://via.placeholder.com/300x200?text=Mug+Collection', description: 'Un mug unique pour les collectionneurs.' },
  { id: 3, name: 'Casquette Élégante', price: '18.00€', imageUrl: 'https://via.placeholder.com/300x200?text=Casquette+Elegante', description: 'Casquette stylée pour toutes les occasions.' },
  { id: 4, name: 'Sac à dos Urbain', price: '55.50€', imageUrl: 'https://via.placeholder.com/300x200?text=Sac+a+dos+Urbain', description: 'Sac à dos pratique et robuste pour la ville.' }
];

// Define the API route for fetching products
app.get('/api/products', async (req, res) => {
  console.log('Request received for /api/products');
  try {
    // --- To use real WooCommerce data, uncomment the block below and comment out the mock data part ---
    /*
    const { data } = await wooApi.get('products', {
      per_page: 10, // Fetch 10 products
      status: 'publish' // Only published products
    });
    console.log('Fetched real products from WooCommerce.');
    res.json(data);
    */

    // --- Sending mock data for demonstration ---
    console.log('Sending mock products data to frontend.');
    res.json(mockProducts);

  } catch (error) {
    console.error('Error fetching products from WooCommerce (or mock data):', error.message);
    // You might want to send more detailed error info in development, but generalize in production.
    res.status(500).json({ message: 'Failed to fetch products from the external API.', error: error.message });
  }
});

// Simple root route to confirm backend is running
app.get('/', (req, res) => {
  res.send('Node.js Backend API is running!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});
