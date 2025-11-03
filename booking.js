(function () {
  const SEL_KEY = 'selectedRoom';
  const RES_KEY = 'metrovibe_reservations';

  const toast = document.getElementById('toast');
  const selectedRoomEl = document.getElementById('selected-room');

  const nameInput = document.getElementById('name');
  const checkinInput = document.getElementById('checkin');
  const qtyInput = document.getElementById('qty');
  const unitInput = document.getElementById('unit');

  const rateNightEl = document.getElementById('rate-night');
  const ex1 = document.getElementById('example-1');
  const ex3 = document.getElementById('example-3');
  const ex7 = document.getElementById('example-7');

  const totalNightsEl = document.getElementById('total-nights');
  const totalCostEl = document.getElementById('total-cost');

  const bookingForm = document.getElementById('booking-top-form');

  const reservationsBody = document.getElementById('reservations-body');
  const noRes = document.getElementById('no-res');
  const clearAllBtn = document.getElementById('clear-all');

  const bookingInfoEl = document.getElementById('booking-info');
  const payCashRadio = document.getElementById('pay-cash');
  const payCardRadio = document.getElementById('pay-card');
  const cardFields = document.getElementById('card-fields');
  const cardNumberInput = document.getElementById('card-number');
  const cardNameInput = document.getElementById('card-name');
  const cardExpiryInput = document.getElementById('card-expiry');
  const cardCvvInput = document.getElementById('card-cvv');

  function showToast(msg, ms = 2500) {
    if (!toast) return;
    toast.textContent = msg;
    toast.hidden = false;
    toast.classList.add('show');
    setTimeout(() => { toast.hidden = true; toast.classList.remove('show'); }, ms);
  }
  function redirectBackWithMsg(msg) {
    try { sessionStorage.setItem('rooms_toast', msg); } catch (e) {}
    window.location.href = 'rooms.html';
  }

  let selected = null;
  try {
    selected = JSON.parse(localStorage.getItem(SEL_KEY) || 'null');
  } catch (e) { selected = null; }

  if (!selected) {
    redirectBackWithMsg('Please choose a room before booking.');
    return;
  }

  let pendingBooking = null;
  try {
    const pendingRaw = localStorage.getItem('pendingBooking');
    if (pendingRaw) {
      const pending = JSON.parse(pendingRaw);
      if (pending) {
        pendingBooking = pending; // keep copy for rendering
        if (pending.name && nameInput) nameInput.value = pending.name;
        if (pending.checkin && checkinInput) checkinInput.value = pending.checkin;
        if (pending.qty && qtyInput) qtyInput.value = pending.qty;
        if (pending.unit && unitInput) unitInput.value = pending.unit;
      }
      localStorage.removeItem('pendingBooking');
    }
  } catch (e) { /* ignore */ }

  function renderSelected() {

    const img = document.getElementById('selected-room-img');
    const info = document.getElementById('selected-room-info');
    if (selected.image) {
      img.src = selected.image;
      img.style.display = 'block';
      img.alt = `${selected.name} photo`;
    } else {
      img.style.display = 'none';
    }
    info.innerHTML = `
      <p><strong>${escapeHtml(selected.name)}</strong></p>
      <p class="muted">Rate per night: <strong>₱${Number(selected.ratePerNight).toLocaleString()}</strong></p>
    `;
    rateNightEl.textContent = `₱${Number(selected.ratePerNight).toLocaleString()}`;
    ex1.textContent = `₱${(Number(selected.ratePerNight)*1).toLocaleString()}`;
    ex3.textContent = `₱${(Number(selected.ratePerNight)*3).toLocaleString()}`;
    ex7.textContent = `₱${(Number(selected.ratePerWeek || (selected.ratePerNight*6))).toLocaleString()}`;

    const srcName = (pendingBooking && pendingBooking.name) || (nameInput && nameInput.value) || '';
    const srcCheckin = (pendingBooking && pendingBooking.checkin) || (checkinInput && checkinInput.value) || '';
    const srcQty = (pendingBooking && pendingBooking.qty) || (qtyInput && Number(qtyInput.value) || 1);
    const srcUnit = (pendingBooking && pendingBooking.unit) || (unitInput && unitInput.value) || 'days';
    const rate = Number(selected.ratePerNight || 0);
    const nights = srcUnit === 'weeks' ? srcQty * 7 : srcQty;
    const total = nights * rate;
    if (bookingInfoEl) {
      bookingInfoEl.innerHTML = `
        <div><strong>Guest:</strong> ${escapeHtml(srcName || '-')}</div>
        <div><strong>Check-in:</strong> ${escapeHtml(srcCheckin || '-')}</div>
        <div><strong>Stay:</strong> ${srcQty} ${escapeHtml(srcUnit)} (${nights} nights)</div>
        <div><strong>Estimated total:</strong> ₱${Number(total).toLocaleString()}</div>
      `;
    }
  }

  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  function compute() {
    const count = Math.max(1, Number(qtyInput.value || 1));
    const unit = unitInput.value || 'days';
    const nights = unit === 'weeks' ? count * 7 : count;
    const rate = Number(selected.ratePerNight || 0);
    const total = nights * rate;
    totalNightsEl.textContent = String(nights);
    totalCostEl.textContent = `₱${Number(total).toLocaleString()}`;
    return { nights, total, rate };
  }

  function saveReservation(obj) {
    const list = JSON.parse(localStorage.getItem(RES_KEY) || '[]');
    list.push(obj);
    localStorage.setItem(RES_KEY, JSON.stringify(list));
  }

  // render reservations table
  function renderReservations() {
    const list = JSON.parse(localStorage.getItem(RES_KEY) || '[]');
    reservationsBody.innerHTML = '';
    if (!list.length) { noRes.style.display='block'; return; }
    noRes.style.display='none';
    list.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(r.room)}</td>
        <td>${escapeHtml(r.name)}</td>
        <td>${escapeHtml(r.checkin)}</td>
        <td>${r.nights}</td>
        <td>₱${Number(r.ratePerNight).toLocaleString()}</td>
        <td>₱${Number(r.total).toLocaleString()}</td>
      `;
      const tdAction = document.createElement('td');
      const btn = document.createElement('button');
      btn.className = 'cancel-btn';
      btn.textContent = 'Cancel';
      btn.addEventListener('click', () => {
        if (!confirm('Cancel this reservation?')) return;
        const remaining = list.filter(x => x.id !== r.id);
        localStorage.setItem(RES_KEY, JSON.stringify(remaining));
        renderReservations();
        showToast('Reservation cancelled', 1800);
      });
      tdAction.appendChild(btn);
      tr.appendChild(tdAction);
      reservationsBody.appendChild(tr);
    });
  }

  function toggleCardFields() {
    if (!cardFields) return;
    if (payCardRadio && payCardRadio.checked) {
      cardFields.style.display = 'block';
    } else {
      cardFields.style.display = 'none';
    }
  }
  if (payCashRadio) payCashRadio.addEventListener('change', toggleCardFields);
  if (payCardRadio) payCardRadio.addEventListener('change', toggleCardFields);

  function validateCardInputs() {
    const num = (cardNumberInput && cardNumberInput.value.replace(/\s+/g,'')) || '';
    const name = (cardNameInput && cardNameInput.value.trim()) || '';
    const expRaw = (cardExpiryInput && cardExpiryInput.value.trim()) || '';
    let exp = '';
    if (cardExpiryInput && cardExpiryInput.type === 'month') {
      if (/^\d{4}-\d{2}$/.test(expRaw)) {
        const parts = expRaw.split('-'); // [YYYY, MM]
        const yyyy = Number(parts[0]), mm = Number(parts[1]);
        if (mm < 1 || mm > 12) { if (cardExpiryInput) cardExpiryInput.focus(); return {ok:false, msg:'Enter a valid expiry month'}; }
        const now = new Date();
        const curYm = now.getFullYear() * 100 + (now.getMonth() + 1);
        const inputYm = yyyy * 100 + mm;
        if (inputYm < curYm) { if (cardExpiryInput) cardExpiryInput.focus(); return {ok:false, msg:'Card expiry is in the past'}; }
        exp = String(mm).padStart(2,'0') + '/' + String(String(yyyy).slice(-2)).padStart(2,'0'); // MM/YY
      } else {
        if (cardExpiryInput) cardExpiryInput.focus(); return {ok:false, msg:'Enter expiry as YYYY-MM'}; 
      }
    } else {
      exp = expRaw;
    }

    const cvv = (cardCvvInput && cardCvvInput.value.trim()) || '';
    if (!num || num.length < 12) { if (cardNumberInput) cardNumberInput.focus(); return {ok:false, msg:'Enter a valid card number'}; }
    if (!name) { if (cardNameInput) cardNameInput.focus(); return {ok:false, msg:'Enter cardholder name'}; }
    // exp should now be in MM/YY form (either converted from month input or entered directly)
    if (!/^\d{2}\/\d{2}$/.test(exp)) { if (cardExpiryInput) cardExpiryInput.focus(); return {ok:false, msg:'Enter expiry (MM/YY)'}; }
    if (!/^\d{3,4}$/.test(cvv)) { if (cardCvvInput) cardCvvInput.focus(); return {ok:false, msg:'Enter CVV'}; }
    return { ok:true, card:{ number:num, name, expiry:exp, cvv } };
  }
  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // basic checks
    const name = (nameInput && nameInput.value.trim()) || '';
    if (!name) { showToast('Enter guest name'); return; }
    const checkin = (checkinInput && checkinInput.value) || '';
    if (!checkin) { showToast('Enter check-in date'); return; }
    const { nights, total, rate } = compute();
    const reservation = {
      id: Date.now(),
      room: selected.name,
      name,
      checkin,
      nights,
      ratePerNight: rate,
      total,
    };
    saveReservation(reservation);
    try {
      localStorage.setItem('pendingBooking', JSON.stringify({
        name,
        checkin,
        qty: nights,
        unit: (unitInput && unitInput.value) || 'days',
      }));
    } catch (e) { /* ignore */ }
    showToast('Reservation Confirmed', 1800);
    renderReservations();
    bookingForm.reset();
    compute();
  });

  try {
    const today = new Date().toISOString().slice(0,10);
    if (checkinInput) {
      checkinInput.min = today;
      if (!checkinInput.value) checkinInput.value = today;
    }
    if (qtyInput) {
      qtyInput.step = '1';
      if (!qtyInput.value) qtyInput.value = 1;
    }
    try {
      if (cardExpiryInput && cardExpiryInput.type === 'month') {
        const d = new Date();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        cardExpiryInput.min = `${yyyy}-${mm}`;
        if (!cardExpiryInput.value) cardExpiryInput.value = `${yyyy}-${mm}`;
      }
    } catch(e) { /* ignore */ }
  } catch(e) { /* ignore if DOM missing */ }
  renderSelected();
  renderReservations();
})();
