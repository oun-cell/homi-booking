import { chromium } from '@playwright/test'
import fs from 'node:fs/promises'

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true })
const errors = []
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
page.on('pageerror', (error) => errors.push(error.message))
await page.goto('http://127.0.0.1:4173/homi-booking/', { waitUntil: 'networkidle' })
await page.getByRole('radio', { name: /غسيل وكوي/ }).click()
await page.getByRole('radio', { name: /^بكرا / }).click()
await page.getByRole('radio', { name: /^الصبح/ }).click()
const metrics = await page.evaluate(() => ({
  viewport: [innerWidth, innerHeight],
  page: [document.documentElement.scrollWidth, document.documentElement.scrollHeight],
  minTapTarget: Math.min(...[...document.querySelectorAll('[role="radio"]')].map((element) => element.getBoundingClientRect().height)),
  selected: [...document.querySelectorAll('[aria-checked="true"]')].length,
}))
await fs.mkdir('qa', { recursive: true })
await page.screenshot({ path: 'qa/mobile-react.png', fullPage: true })
await browser.close()
console.log(JSON.stringify({ ok: errors.length === 0 && metrics.page[0] <= metrics.viewport[0], metrics, errors }, null, 2))
if (errors.length || metrics.page[0] > metrics.viewport[0]) process.exit(1)
