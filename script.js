const CALL_NUMBER = "9608232914";

// Keep all call controls in one place so the business number can be changed once.
document.querySelectorAll('[data-action="call"]').forEach((button) => {
  button.addEventListener('click', () => {
    window.location.href = `tel:${CALL_NUMBER}`;
  });
});

// Prevent selecting a date in the past.
const dateInput = document.querySelector('input[name="date"]');
if (dateInput) {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  dateInput.min = localDate;
}

// Booking form: works with a future /api/bookings endpoint and remains usable as a demo until that endpoint exists.
const bookingForm = document.getElementById('bookingForm');
const formMsg = document.getElementById('formMsg');
if (bookingForm && formMsg) {
  bookingForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submit = bookingForm.querySelector('button[type="submit"]');
    const data = Object.fromEntries(new FormData(bookingForm));
    if (!data.name || !data.phone) return;
    submit.disabled = true;
    formMsg.textContent = 'Sending request…';
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Booking endpoint unavailable');
      formMsg.textContent = 'Booking request received. We’ll contact you shortly.';
      bookingForm.reset();
    } catch {
      formMsg.textContent = 'Booking form is ready. Connect /api/bookings to your production backend or CRM.';
    } finally {
      submit.disabled = false;
    }
  });
}

// Lightweight scroll reveal; no library or tracking dependency.
const revealItems = document.querySelectorAll('.cards article, .feature-grid > div, .gallery-item, .steps > div, .solution-grid > div');
if ('IntersectionObserver' in window && revealItems.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, {threshold: 0.08});
  revealItems.forEach((item) => {
    item.classList.add('reveal');
    observer.observe(item);
  });
}
