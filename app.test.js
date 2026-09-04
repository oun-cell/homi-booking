import test from "node:test";
import assert from "node:assert/strict";
import { HOMI_WHATSAPP, SERVICES, TIMES, buildBookingMessage, buildWhatsAppUrl, createDayOptions, toISODate } from "./app.js";

test("uses Homi's required WhatsApp destination", () => {
  assert.equal(HOMI_WHATSAPP, "962770980084");
});

test("builds a natural Arabic booking request with no fake confirmation", () => {
  const message = buildBookingMessage({ service: "laundry", day: "الأحد ٦ أيلول", time: "morning" });
  assert.match(message, /مرحبا هومي/);
  assert.match(message, new RegExp(SERVICES.laundry));
  assert.match(message, new RegExp(TIMES.morning));
  assert.match(message, /تأكدولي الموعد والسعر/);
  assert.doesNotMatch(message, /تم تأكيد|مؤكد/);
});

test("encodes the booking correctly into wa.me", () => {
  const url = buildWhatsAppUrl({ service: "car", day: "أقرب موعد متاح", time: "flexible" });
  const parsed = new URL(url);
  assert.equal(parsed.hostname, "wa.me");
  assert.equal(parsed.pathname, `/${HOMI_WHATSAPP}`);
  const text = parsed.searchParams.get("text");
  assert.match(text, new RegExp(SERVICES.car));
  assert.match(text, /اللوكيشن/);
});

test("rejects an unknown service", () => {
  assert.throws(() => buildBookingMessage({ service: "unknown" }), /valid service/);
});

test("produces tomorrow, following day and custom choices", () => {
  const now = new Date("2026-09-04T12:00:00+03:00");
  const choices = createDayOptions(now);
  assert.deepEqual(choices.map(({ key }) => key), ["tomorrow", "after-tomorrow", "custom"]);
  assert.match(choices[0].value, /السبت/);
});

test("formats ISO dates without UTC day drift", () => {
  assert.equal(toISODate(new Date(2026, 8, 4, 23, 30)), "2026-09-04");
});
