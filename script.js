// TEST CALL NUMBER — replace before production.
const TEST_CALL_NUMBER = "9608232914";

document.querySelectorAll('[data-action="call"]').forEach(btn => {
  btn.addEventListener("click", () => {
    window.location.href = `tel:${TEST_CALL_NUMBER}`;
  });
});

const bookingForm = document.getElementById("bookingForm");
const formMsg = document.getElementById("formMsg");

if (bookingForm && formMsg) {
  bookingForm.addEventListener("submit", async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(bookingForm));
    formMsg.textContent = "Sending request…";
    try {
      const r = await fetch("/api/bookings", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
      });
      if (!r.ok) throw new Error();
      formMsg.textContent = "Booking request received. We’ll contact you shortly.";
      bookingForm.reset();
    } catch {
      formMsg.textContent = "Form is ready. Connect /api/bookings to your booking backend.";
    }
  });
}
