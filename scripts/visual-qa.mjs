import { chromium } from '@playwright/test'
import fs from 'node:fs/promises'

const bookingUrl = process.env.BOOKING_URL || 'http://127.0.0.1:4173/homi-booking/'
const browser = await chromium.launch({ channel: 'chrome', headless: true })
await fs.mkdir('qa', { recursive: true })
const results = {}

for (const [name, viewport, mobile] of [
  ['mobile', { width: 390, height: 844 }, true],
  ['desktop', { width: 1365, height: 900 }, false],
]) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile })
  const errors = []
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto(bookingUrl, { waitUntil: 'networkidle' })
  await page.screenshot({ path: `qa/${name}-service.png`, fullPage: true })

  if (mobile) {
    await page.getByRole('radio', { name: /الغسيل والكوي/ }).click()
    await page.getByRole('button', { name: /كمّل/ }).click()
    await page.getByRole('radio', { name: /^غسيل وكوي/ }).click()
    await page.getByRole('radio', { name: /صغير ١٠ قطع/ }).click()
    await page.screenshot({ path: 'qa/mobile-package.png', fullPage: true })
    await page.getByRole('button', { name: /كمّل/ }).click()
    await page.screenshot({ path: 'qa/mobile-schedule.png', fullPage: true })
    await page.locator('.day-choice').first().evaluate((element) => element.click())
    await page.getByRole('radio', { name: /^الصبح/ }).evaluate((element) => element.click())
    await page.getByPlaceholder('مثلاً: خلدا').fill('عبدون')
    await page.getByRole('button', { name: /كمّل/ }).click()
    await page.screenshot({ path: 'qa/mobile-review.png', fullPage: true })
  }

  const metrics = await page.evaluate(() => ({
    viewport: [innerWidth, innerHeight],
    page: [document.documentElement.scrollWidth, document.documentElement.scrollHeight],
    minTapTarget: Math.min(...[...document.querySelectorAll('button')].map((element) => element.getBoundingClientRect().height).filter(Boolean)),
    selected: [...document.querySelectorAll('[aria-checked="true"]')].length,
  }))
  results[name] = { metrics, errors }
  await page.close()
}

await browser.close()
const ok = Object.values(results).every(({ metrics, errors }) => errors.length === 0 && metrics.page[0] <= metrics.viewport[0] && metrics.minTapTarget >= 44)
console.log(JSON.stringify({ ok, bookingUrl, results }, null, 2))
if (!ok) process.exit(1)
