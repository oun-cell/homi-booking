import { expect, test } from '@playwright/test'

test('completes the preference flow and creates the correct WhatsApp handoff', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
  await page.goto('/')
  await expect(page).toHaveTitle(/احجز مع هومي/)
  await page.getByRole('radio', { name: /غسيل وكوي/ }).click()
  await page.getByRole('radio', { name: /^بكرا / }).click()
  await page.getByRole('radio', { name: /^الصبح/ }).click()
  await page.route('https://wa.me/**', (route) => route.abort())
  const [request] = await Promise.all([
    page.waitForRequest(/wa\.me\/962770980084/),
    page.getByRole('button', { name: /كمّل الحجز/ }).click(),
  ])
  expect(request.url()).toContain('962770980084')
  expect(decodeURIComponent(request.url())).toContain('تأكدولي الموعد والسعر النهائي')
  expect(consoleErrors).toEqual([])
})

test('mobile layout has no horizontal overflow and touch targets are large', async ({ page }) => {
  await page.goto('/')
  const metrics = await page.evaluate(() => ({ innerWidth, scrollWidth: document.documentElement.scrollWidth }))
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.innerWidth)
  const boxes = await page.getByRole('radio').evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height))
  expect(Math.min(...boxes)).toBeGreaterThanOrEqual(44)
  await expect(page.getByText('هالطلب مبدئي.')).toBeVisible()
})
