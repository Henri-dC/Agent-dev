<template>
  <canvas ref="animationCanvas" class="fixed inset-0 w-full h-full z-0"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const animationCanvas = ref(null);
let ctx;
let bubbles = []; // Renommé de particles à bubbles
let animationFrameId;

const numBubbles = 40; // Nombre de bulles
const bubbleMinRadius = 8; // Rayon minimum des bulles
const bubbleMaxRadius = 25; // Rayon maximum des bulles
const bubbleMinSpeedY = 0.3; // Vitesse de remontée minimale
const bubbleMaxSpeedY = 1.0; // Vitesse de remontée maximale
const bubbleSpeedX = 0.3; // Dérive latérale maximale
const bubbleColorR = 56;  // Nouvelle composante R de #38B2AC (secondary-accent)
const bubbleColorG = 178; // Nouvelle composante G de #38B2AC
const bubbleColorB = 172; // Nouvelle composante B de #38B2AC

class Bubble {
  constructor(canvasWidth, canvasHeight) {
    this.reset(canvasWidth, canvasHeight);
  }

  reset(canvasWidth, canvasHeight) {
    this.radius = Math.random() * (bubbleMaxRadius - bubbleMinRadius) + bubbleMinRadius;
    this.x = Math.random() * canvasWidth;
    this.y = canvasHeight + this.radius; // Commencer juste en dessous de l'écran
    this.vx = (Math.random() - 0.5) * bubbleSpeedX * 2; // Dérive latérale légère (-bubbleSpeedX à +bubbleSpeedX)
    this.vy = Math.random() * (bubbleMaxSpeedY - bubbleMinSpeedY) + bubbleMinSpeedY; // Vitesse de remontée
    this.alpha = Math.random() * 0.4 + 0.2; // Opacité initiale (0.2 à 0.6)
    this.rotation = Math.random() * Math.PI * 2; // Rotation initiale
    this.rotationSpeed = (Math.random() - 0.5) * 0.01; // Vitesse de rotation légère
  }

  update(canvasWidth, canvasHeight) {
    this.y -= this.vy;
    this.x += this.vx;
    this.rotation += this.rotationSpeed;

    // Fade out as it reaches the top 20% of the screen
    const fadeStart = canvasHeight * 0.2;
    if (this.y < fadeStart) {
      this.alpha = Math.max(0, this.alpha - 0.005); // Diminuer progressivement l'opacité
    }

    // Wrap around horizontally
    if (this.x < -this.radius) {
      this.x = canvasWidth + this.radius;
    } else if (this.x > canvasWidth + this.radius) {
      this.x = -this.radius;
    }

    // Reset if it goes off screen (top) or becomes completely transparent
    if (this.y < -this.radius || this.alpha <= 0) {
      this.reset(canvasWidth, canvasHeight);
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${bubbleColorR}, ${bubbleColorG}, ${bubbleColorB}, ${this.alpha})`;
    ctx.fill();
    ctx.restore();
  }
}

const initCanvas = () => {
  if (!animationCanvas.value) return;

  ctx = animationCanvas.value.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  bubbles = [];
  for (let i = 0; i < numBubbles; i++) {
    bubbles.push(
      new Bubble(ctx.canvas.width, ctx.canvas.height)
    );
  }

  animate();
};

const resizeCanvas = () => {
  if (animationCanvas.value) {
    animationCanvas.value.width = window.innerWidth;
    animationCanvas.value.height = window.innerHeight;
  }
};

const animate = () => {
  animationFrameId = requestAnimationFrame(animate);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  for (let i = 0; i < bubbles.length; i++) {
    bubbles[i].update(ctx.canvas.width, ctx.canvas.height);
    bubbles[i].draw(ctx);
  }
};

onMounted(() => {
  initCanvas();
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas);
  cancelAnimationFrame(animationFrameId);
});
</script>
