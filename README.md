# Homi Quick Booking

Arabic-first mobile booking link for Homi in Amman. A customer chooses a service, preferred day, and preferred time, then continues to Homi WhatsApp with a ready-to-send structured request.

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
