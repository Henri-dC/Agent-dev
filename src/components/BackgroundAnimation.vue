<template>
  <canvas ref="animationCanvas" class="fixed inset-0 w-full h-full z-0"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const animationCanvas = ref(null);
let ctx;
let particles = [];
let animationFrameId;

const numParticles = 100; // Increased number of particles for more density
const maxDistance = 180; // Increased max distance for lines to connect for more visible connections
const particleSpeed = 0.8; // Slightly increased speed of particles

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = Math.random() * particleSpeed * 2 - particleSpeed; // -speed to +speed
    this.vy = Math.random() * particleSpeed * 2 - particleSpeed;
    this.radius = Math.random() * 2 + 1.5; // Increased radius for better visibility (from 0.8 to 3.5 max)
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Bounce off edges
    if (this.x < 0 || this.x > ctx.canvas.width) {
      this.vx *= -1;
    }
    if (this.y < 0 || this.y > ctx.canvas.height) {
      this.vy *= -1;
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(44, 74, 90, 0.6)'; // Using primary-text color (darker) with 60% opacity for better contrast
    ctx.fill();
  }
}

const initCanvas = () => {
  if (!animationCanvas.value) return; // Ensure canvas element exists

  ctx = animationCanvas.value.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  particles = [];
  for (let i = 0; i < numParticles; i++) {
    particles.push(
      new Particle(
        Math.random() * ctx.canvas.width,
        Math.random() * ctx.canvas.height
      )
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
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clear only the canvas

  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();

    for (let j = i + 1; j < particles.length; j++) {
      const p1 = particles[i];
      const p2 = particles[j];
      const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

      if (dist < maxDistance) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        const opacity = 1 - (dist / maxDistance);
        ctx.strokeStyle = `rgba(44, 74, 90, ${opacity * 0.4})`; // Using primary-text color with varying opacity, max 40%
        ctx.lineWidth = 1; // Slightly increased line width
        ctx.stroke();
      }
    }
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
