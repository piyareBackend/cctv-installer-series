# Security Vision

Professional, responsive CCTV installation and surveillance service website.

## Included
- Premium desktop layout with compact dark mobile experience
- CCTV installation, remote monitoring, DVR/NVR, repair and AMC service sections
- Installation gallery section with replaceable demo visuals
- Home, shop/office and business/site solution cards
- Service process and FAQ sections
- Responsive booking form prepared for `POST /api/bookings`
- Direct call controls using the configured business number
- Mobile sticky Call / Book actions
- Lightweight scroll-reveal animation with reduced-motion support
- No frontend framework, build step or package dependency

## Production notes
The booking form is intentionally frontend-only until a backend endpoint is connected. Do not put API secrets, private credentials or service-account keys in this repository.

The current direct-call number is configured in `script.js`. A direct `tel:` link makes that number visible to visitors. If the number must remain private, replace direct calling with a server-side/proxy telephony provider.

## Transfer to another GitHub account
This project avoids hardcoded GitHub owner/repository paths in the website. It can be transferred or copied to another GitHub account without changing the frontend code. After transfer, configure the new account's deployment provider/domain and any backend secrets separately.

## Customizing the gallery
Replace the four `.gallery-art` demo blocks in `index.html` with real installation photos when available. Keep descriptive `alt` text if `<img>` elements are used.
