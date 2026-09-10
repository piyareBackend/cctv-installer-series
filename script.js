const form = document.getElementById('bookingForm');
const message = document.getElementById('formMessage');
const secureCall = document.getElementById('secureCall');

secureCall.addEventListener('click', () => {
  message.textContent = 'Secure call request: connect your private telephony provider endpoint here. The business number is intentionally never shipped to the browser.';
  document.getElementById('booking').scrollIntoView({behavior:'smooth', block:'center'});
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  if (!data.name || !data.phone) return;
  message.textContent = 'Request captured locally for this demo. Connect the form to your secure backend/CRM to send the callback request.';
  form.reset();
});
