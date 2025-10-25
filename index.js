
const menuToggle = document.querySelector(".toggle");
const menu = document.querySelector(".menu");
const menuCheckbox = document.getElementById("menu-checkbox");
const menuClose = document.querySelector(".menu-close");
const hudToggle = document.getElementById("hud-toggle");


function openMenu() {
  menu.classList.add("active");
  menuToggle.classList.add("active");
  if (menuCheckbox) menuCheckbox.checked = true;
  if (hudToggle) hudToggle.setAttribute("aria-expanded", "true");
  if (menu) menu.setAttribute("aria-hidden", "false");
}
function closeMenu() {
  menu.classList.remove("active");
  menuToggle.classList.remove("active");
  if (menuCheckbox) menuCheckbox.checked = false;
  if (hudToggle) hudToggle.setAttribute("aria-expanded", "false");
  if (menu) menu.setAttribute("aria-hidden", "true");
}
function toggleMenu() {
  if (menu.classList.contains("active")) closeMenu(); else openMenu();
}


menuToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleMenu();
});


menuToggle.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    toggleMenu();
  }
});


if (menuClose) {
  menuClose.addEventListener("click", (e) => {
    e.stopPropagation();
    closeMenu();
  });
}


window.addEventListener("click", (e) => {
  if (menu.classList.contains("active")) {
    const withinMenu = e.composedPath().includes(menu);
    const withinToggle = e.composedPath().includes(menuToggle);
    if (!withinMenu && !withinToggle) closeMenu();
  }
});


document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menu.classList.contains("active")) {
    closeMenu();
  }
});

document.querySelectorAll('.menu a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
      closeMenu();
    }
  });
});


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


function initHotelMap() {
  const hotelCoords = [14.5995, 120.9842]; 

  const map = L.map('hotel-map', {
    zoomControl: true,
    attributionControl: true,
    scrollWheelZoom: false
  }).setView(hotelCoords, 15);
  window.hotelMap = map;

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  const pinHtml = `
    <div class="map-pin">
      <span class="pulse"></span>
      <span class="inner"></span>
    </div>
  `;
  const pinIcon = L.divIcon({
    className: '',
    html: pinHtml,
    iconSize: [44, 44],
    iconAnchor: [22, 44]
  });

  const marker = L.marker(hotelCoords, { icon: pinIcon }).addTo(map);
  marker.bindPopup('<h3>Metrovibe Inn</h3><p>123 Metro Street, Manila</p>');

  setTimeout(() => marker.openPopup(), 400);
  map.zoomControl.setPosition('topright');


  setTimeout(() => {
    try {
      map.invalidateSize();
      map.setView(hotelCoords, map.getZoom());
    } catch (e) { console.warn(e); }
  }, 350);
}

window.addEventListener('load', () => {
  try {
    initHotelMap();
  } catch (e) {
    console.warn('Leaflet map not initialized:', e);
  }
});


const destinationSection = document.getElementById('destination');
if (destinationSection && window.IntersectionObserver) {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && window.hotelMap) {
        setTimeout(() => window.hotelMap.invalidateSize(), 200);
      }
    });
  }, { threshold: 0.5 });
  obs.observe(destinationSection);
}

