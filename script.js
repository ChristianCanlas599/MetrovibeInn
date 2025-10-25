// Menu toggle
const menuToggle = document.querySelector(".toggle");
const menu = document.querySelector(".menu");

menuToggle.addEventListener("click", () => {
  menuToggle.classList.toggle("active");
  menu.classList.toggle("active");
});

// Background music
const bgMusic = document.getElementById("bg-music");
const toggleBtn = document.getElementById("music-toggle");
const icon = toggleBtn.querySelector("i");

document.body.addEventListener("click", () => {
  bgMusic.play().catch(() => console.log("Autoplay blocked"));
}, { once: true });

toggleBtn.addEventListener("click", () => {
  if (bgMusic.paused) {
    bgMusic.play();
    icon.classList.replace("fa-volume-xmark", "fa-volume-high");
  } else {
    bgMusic.pause();
    icon.classList.replace("fa-volume-high", "fa-volume-xmark");
  }
});

// Smooth scroll
document.querySelectorAll('.menu a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
      menu.classList.remove("active");
      menuToggle.classList.remove("active");
    }
  });
});