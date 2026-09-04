import { chromium } from "playwright-core";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

const executablePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await chromium.launch({ executablePath, headless: true });
const errors = [];

async function inspect(name, viewport) {
  const context = await browser.newContext({ viewport, isMobile: viewport.width < 600, deviceScaleFactor: viewport.width < 600 ? 2 : 1 });
  const page = await context.newPage();
  page.on("console", (msg) => { if (msg.type() === "error") errors.push(`${name}: ${msg.text()}`); });
  page.on("pageerror", (error) => errors.push(`${name}: ${error.message}`));
  await page.goto("http://127.0.0.1:4173", { waitUntil: "networkidle" });

  const metrics = await page.evaluate(() => ({
    title: document.title,
    dir: document.documentElement.dir,
    innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    ctaHeight: document.querySelector("#submit-booking").getBoundingClientRect().height,
    cardHeights: [...document.querySelectorAll(".service-card")].map((el) => el.getBoundingClientRect().height),
  }));
  assert.equal(metrics.title, "احجز مع هومي");
  assert.equal(metrics.dir, "rtl");
  assert.ok(metrics.scrollWidth <= metrics.innerWidth, `${name} has horizontal overflow`);
  assert.ok(metrics.ctaHeight >= 56, `${name} CTA tap target is too small`);
  assert.ok(metrics.cardHeights.every((height) => height >= 70), `${name} service tap target is too small`);

  if (name === "mobile") {
    await page.click('[data-service="laundry"]');
    await page.click('[data-day="tomorrow"]');
    await page.click('[data-time="morning"]');
    assert.equal(await page.getAttribute('[data-service="laundry"]', "aria-checked"), "true");
    assert.match(await page.textContent("#summary-text"), /غسيل وكوي/);
    assert.match(await page.textContent("#summary-text"), /الصبح/);
    await page.screenshot({ path: `qa/${name}.png`, fullPage: true });

    let whatsappRequest = "";
    await page.route("https://wa.me/**", async (route) => {
      whatsappRequest = route.request().url();
      await route.abort();
    });
    await page.click("#submit-booking");
    await page.waitForTimeout(700);
    assert.match(whatsappRequest, /^https:\/\/wa\.me\/962770980084\?text=/);
    assert.match(decodeURIComponent(whatsappRequest), /غسيل وكوي/);
  }

  if (name !== "mobile") {
    await page.screenshot({ path: `qa/${name}.png`, fullPage: true });
  }
  await context.close();
  return metrics;
}

await fs.mkdir("qa", { recursive: true });
const mobile = await inspect("mobile", { width: 390, height: 844 });
const desktop = await inspect("desktop", { width: 1280, height: 900 });
await browser.close();
assert.deepEqual(errors, []);
console.log(JSON.stringify({ ok: true, mobile, desktop, errors }, null, 2));
