import { expect, test } from '@playwright/test'

test('completes a priced laundry booking and creates the exact WhatsApp handoff', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()) })
  await page.goto('/')
  await page.getByRole('radio', { name: /الغسيل والكوي/ }).click()
  await page.getByRole('button', { name: /كمّل/ }).click()
  await page.getByRole('radio', { name: /^غسيل وكوي/ }).click()
  await page.getByRole('radio', { name: /صغير ١٠ قطع/ }).click()
  await page.getByRole('button', { name: /كمّل/ }).click()
  await page.locator('.day-choice').first().evaluate((element) => (element as HTMLElement).click())
  await page.getByRole('radio', { name: /^الصبح/ }).evaluate((element) => (element as HTMLElement).click())
  await page.getByPlaceholder('مثلاً: خلدا').fill('عبدون')
  await page.getByRole('button', { name: /كمّل/ }).click()
  await expect(page.getByText('17.5 د.أ')).toBeVisible()
  await page.route('https://wa.me/**', (route) => route.abort())
  const [request] = await Promise.all([
    page.waitForRequest(/wa\.me\/962770980084/),
    page.getByRole('button', { name: /ابعت طلب الحجز/ }).click(),
  ])
  const decoded = decodeURIComponent(request.url())
  expect(decoded).toContain('غسيل وكوي — صغير — ١٠ قطع')
  expect(decoded).toContain('السعر الظاهر: 17.5 د.أ')
  expect(decoded).toContain('المنطقة: عبدون')
  expect(consoleErrors).toEqual([])
})

test('mobile layout stays inside the viewport with accessible tap targets', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('mobile'), 'mobile-only metrics')
  await page.goto('/')
  const initial = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth }))
  expect(initial.scrollWidth).toBeLessThanOrEqual(initial.width)
  const serviceTargets = await page.getByRole('radio').evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().height))
  expect(Math.min(...serviceTargets)).toBeGreaterThanOrEqual(44)
  await page.getByRole('radio', { name: /تنظيف السيارة/ }).click()
  await page.getByRole('button', { name: /كمّل/ }).click()
  await expect(page.getByText('اختار تفاصيل الخدمة')).toBeVisible()
})

test('desktop presents the full booking card without horizontal overflow', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('desktop'), 'desktop-only')
  await page.goto('/')
  const metrics = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth }))
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.width)
  await page.getByRole('radio', { name: /تنظيف البيت/ }).click()
  await expect(page.getByRole('radio', { name: /تنظيف البيت/ })).toHaveAttribute('aria-checked', 'true')
})
