const canvas = document.getElementById('bg-animation');
const ctx = canvas.getContext('2d');

let particlesArray = [];
const numberOfParticles = 80; // Nombre de particules pour l'effet
const maxParticleSize = 5;
const minParticleSize = 1;
const maxSpeed = 0.5;
const lineDistance = 120; // Distance max pour lier les particules avec des lignes

// Couleurs issues de tailwind.config.js
const particleColor = '#2C4A5A'; // primary-text
const lineColor = '#9ABBDD';   // text-light

// Fonction pour convertir une couleur hexadécimale en RGB
function hexToRgb(hex) {
    let r = 0, g = 0, b = 0;
    // Handle 3-digit hex
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        // Handle 6-digit hex
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
    }
    return { r, g, b };
}

const particleRgb = hexToRgb(particleColor);
const lineRgb = hexToRgb(lineColor);

// Redimensionner le canvas avec la fenêtre
window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init(); // Réinitialiser les particules pour qu'elles s'adaptent à la nouvelle taille
});

// Classe Particle
class Particle {
    constructor(canvasWidth, canvasHeight) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.size = Math.random() * (maxParticleSize - minParticleSize) + minParticleSize;
        this.speedX = (Math.random() * maxSpeed * 2) - maxSpeed; // Entre -maxSpeed et +maxSpeed
        this.speedY = (Math.random() * maxSpeed * 2) - maxSpeed; // Entre -maxSpeed et +maxSpeed
        this.opacity = Math.random() * 0.5 + 0.3; // Opacité variable pour un effet plus doux
    }

    update(canvasWidth, canvasHeight) {
        this.x += this.speedX;
        this.y += this.speedY;

        // Rebondir sur les bords
        if (this.x > canvasWidth - this.size || this.x < this.size) {
            this.speedX = -this.speedX;
        }
        if (this.y > canvasHeight - this.size || this.y < this.size) {
            this.speedY = -this.speedY;
        }
    }

    draw(ctx) {
        ctx.fillStyle = `rgba(${particleRgb.r}, ${particleRgb.g}, ${particleRgb.b}, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Initialiser les particules
function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particlesArray = [];
    for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle(canvas.width, canvas.height));
    }
}

// Fonction d'animation
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Effacer le canvas

    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update(canvas.width, canvas.height);
        particlesArray[i].draw(ctx);

        // Dessiner des lignes entre les particules proches
        for (let j = i; j < particlesArray.length; j++) {
            let p1 = particlesArray[i];
            let p2 = particlesArray[j];
            let distance = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

            if (distance < lineDistance) {
                // L'opacité de la ligne diminue avec la distance
                const lineOpacity = 1 - (distance / lineDistance);
                ctx.strokeStyle = `rgba(${lineRgb.r}, ${lineRgb.g}, ${lineRgb.b}, ${lineOpacity})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animate);
}

// Lancer l'initialisation et l'animation
init();
animate();
