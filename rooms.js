// menu/HUD elements (may not exist on all pages)
const menuToggle = document.querySelector(".toggle");
const menu = document.querySelector(".menu");
const menuCheckbox = document.getElementById("menu-checkbox");
const menuClose = document.querySelector(".menu-close");
const hudToggle = document.getElementById("hud-toggle");

if (menuToggle && menu) {
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
}


(function () {
  const GRID_ID = 'rooms-grid';
  const SELECT_KEY = 'selectedRoomTemp';
  const grid = document.getElementById(GRID_ID);
  const proceedBtn = document.getElementById('proceed-btn');
  const inlineForm = document.getElementById('rooms-booking-form');
  const roomsName = document.getElementById('rooms-name');
  const roomsCheckin = document.getElementById('rooms-checkin');
  const roomsQty = document.getElementById('rooms-qty');
  const roomsUnit = document.getElementById('rooms-unit');
  const toast = document.getElementById('toast');

  function enableProceed() {
    if (!proceedBtn) return;
    proceedBtn.disabled = false;
    proceedBtn.removeAttribute('disabled');
    proceedBtn.setAttribute('aria-disabled', 'false');
  }
  function disableProceed() {
    if (!proceedBtn) return;
    proceedBtn.disabled = true;
    proceedBtn.setAttribute('disabled', 'true');
    proceedBtn.setAttribute('aria-disabled', 'true');
  }

  function isFormValid() {
    try {
      if (!roomsName || !roomsCheckin || !roomsQty) return false;
      const name = roomsName.value && roomsName.value.trim();
      const checkin = roomsCheckin.value;
      const qty = Number(roomsQty.value);
      return Boolean(name && checkin && qty && qty >= 1);
    } catch (e) { return false; }
  }

  function toggleProceedState() {
    const hasSelection = !!grid && !!grid.querySelector('.room-card.selected');
    if (hasSelection && isFormValid()) enableProceed(); else disableProceed();
  }

  if (inlineForm) {
    ['input','change'].forEach(ev => {
      inlineForm.addEventListener(ev, () => toggleProceedState());
    });
  }

  function showToast(msg, ms = 2500) {
    if (!toast) return;
    toast.textContent = msg; toast.hidden = false; toast.classList.add('show');
    setTimeout(() => { toast.hidden = true; toast.classList.remove('show'); }, ms);
  }

  function buildSelectionFromCard(card) {
    if (!card) return null;
    const id = card.dataset.roomId || card.getAttribute('data-room-id');
    const name = card.dataset.roomName || card.getAttribute('data-room-name');
    const ratePerNight = Number(card.dataset.roomRate || card.getAttribute('data-room-rate') || 0);
    // read image src (if present) so booking page can preview it
    const imgEl = card.querySelector('img');
    const image = imgEl ? (imgEl.src || imgEl.getAttribute('src')) : '';
    return {
      id: String(id),
      name: String(name),
      ratePerNight,
      image: image || '',
      ratePerWeek: Math.round(ratePerNight * 6) // 1 week = 6 nights promo
    };
  }

  function applySelectionToCard(card, persist = true) {
    if (!card) return;
    grid.querySelectorAll('.room-card').forEach(c => {
      c.classList.remove('selected');
      c.setAttribute('aria-pressed', 'false');
      const r = c.querySelector('.room-radio'); if (r) r.checked = false;
    });
    card.classList.add('selected');
    card.setAttribute('aria-pressed', 'true');
    const radio = card.querySelector('.room-radio'); if (radio) radio.checked = true;
    if (persist) {
      const sel = buildSelectionFromCard(card);
      try { localStorage.setItem(SELECT_KEY, JSON.stringify(sel)); } catch (e) { console.warn(e); }
    }

    enableProceed();
  }

  function restoreSelection() {
    try {
      const raw = localStorage.getItem(SELECT_KEY);
      if (!raw) { disableProceed(); return; }
      const sel = JSON.parse(raw);
      if (!sel || !sel.id) { localStorage.removeItem(SELECT_KEY); disableProceed(); return; }
      const card = grid.querySelector(`[data-room-id="${sel.id}"]`);
      if (card) {
        applySelectionToCard(card, false);
        enableProceed();
      } else {
        localStorage.removeItem(SELECT_KEY);
        disableProceed();
      }
    } catch (e) { console.warn(e); disableProceed(); }
  }

  function clearSelection() {
    grid.querySelectorAll('.room-card').forEach(c => {
      c.classList.remove('selected'); c.setAttribute('aria-pressed','false');
      const r = c.querySelector('.room-radio'); if (r) r.checked = false;
    });
    localStorage.removeItem(SELECT_KEY);
    disableProceed();
  }

  function findCard(el) { return el && el.closest ? el.closest('.room-card') : null; }


  if (grid) {
    grid.addEventListener('click', (ev) => {
      const card = findCard(ev.target);
      if (!card) return;
      applySelectionToCard(card, true);
    });

    grid.addEventListener('keydown', (ev) => {
      const card = findCard(ev.target);
      if (!card) return;
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        applySelectionToCard(card, true);

        if (proceedBtn) proceedBtn.focus();
      }
    });

    grid.addEventListener('dblclick', (ev) => {
      const card = findCard(ev.target); if (!card) return;
      if (card.classList.contains('selected')) clearSelection();
    });
  }

  if (proceedBtn && inlineForm) {

    inlineForm.addEventListener('submit', (ev) => {
      ev.preventDefault();

      let sel = null;
      try { sel = JSON.parse(localStorage.getItem(SELECT_KEY) || 'null'); } catch (e) { sel = null; }
      if (!sel) {
        const card = grid && (grid.querySelector('.room-card.selected') || grid.querySelector('.room-radio:checked')?.closest('.room-card'));
        sel = buildSelectionFromCard(card);
        if (!sel) { showToast('Please select a room first'); return; }
        try { localStorage.setItem(SELECT_KEY, JSON.stringify(sel)); } catch (e) {}
      }

      if (!isFormValid()) {
        showToast('Please fill name, check-in and quantity');
        // focus first missing field
        if (roomsName && (!roomsName.value || !roomsName.value.trim())) roomsName.focus();
        else if (roomsCheckin && !roomsCheckin.value) roomsCheckin.focus();
        else if (roomsQty && (!roomsQty.value || Number(roomsQty.value) < 1)) roomsQty.focus();
        return;
      }

      const pending = {
        name: roomsName.value.trim(),
        checkin: roomsCheckin.value,
        qty: Number(roomsQty.value),
        unit: roomsUnit.value
      };

      try {
        sel.ratePerWeek = sel.ratePerWeek || Math.round(sel.ratePerNight * 6);
        sel.image = sel.image || (grid && (grid.querySelector(`[data-room-id="${sel.id}"] img`)?.src || '')) || '';
        localStorage.setItem('selectedRoom', JSON.stringify(sel));
        localStorage.setItem('pendingBooking', JSON.stringify(pending));
        showToast('Booking info saved — opening booking', 900);
        setTimeout(()=> window.location.href = 'booking.html', 600);
      } catch (e) { console.error(e); showToast('Could not save booking'); }
    });
  } else if (proceedBtn) {

    proceedBtn.addEventListener('click', () => {
      if (proceedBtn.disabled) { showToast('Please select a room first'); return; }
      let sel = null;
      try { sel = JSON.parse(localStorage.getItem(SELECT_KEY) || 'null'); } catch (e) { sel = null; }
      if (!sel) {
        const card = grid && (grid.querySelector('.room-card.selected') || grid.querySelector('.room-radio:checked')?.closest('.room-card'));
        sel = buildSelectionFromCard(card);
        if (!sel) { showToast('Please select a room first'); return; }
        try { localStorage.setItem(SELECT_KEY, JSON.stringify(sel)); } catch (e) {}
      }
      try {
        sel.ratePerWeek = sel.ratePerWeek || Math.round(sel.ratePerNight * 6);
        sel.image = sel.image || (grid && (grid.querySelector(`[data-room-id="${sel.id}"] img`)?.src || '')) || '';
        localStorage.setItem('selectedRoom', JSON.stringify(sel));
        showToast('Selection saved — opening booking', 1100);
        setTimeout(()=> window.location.href = 'booking.html', 700);
      } catch (e) { console.error(e); showToast('Could not save selection'); }
    });
  }

  (function () { try { const msg=sessionStorage.getItem('rooms_toast'); if(msg){ showToast(msg); sessionStorage.removeItem('rooms_toast'); } } catch(e){} })();
  restoreSelection();
})();