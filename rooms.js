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