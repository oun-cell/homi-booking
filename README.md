# Homi Quick Booking

Arabic-first, mobile-first booking experience for Homi in Amman. A customer chooses a service and its package, sees the verified price, selects a preferred day/time and area, reviews the request, then continues to Homi WhatsApp with a structured message.

The selected slot is explicitly a preference. Homi confirms availability, scope, and final price in WhatsApp before the booking is fixed.

## Local verification

```bash
npm ci
npm test
npm run build
npm run test:smoke
```

## Campaign links

Preselect a service to reduce the path by one tap:

- `/homi-booking/?service=laundry`
- `/homi-booking/?service=cleaning`
- `/homi-booking/?service=car`
