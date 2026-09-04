import { describe, expect, it } from 'vitest'
import { buildWhatsAppMessage, buildWhatsAppUrl, formatPrice, getBookingDays, getQuote, WHATSAPP_NUMBER } from './booking'

describe('verified Homi pricing', () => {
  it('quotes exact laundry package prices', () => {
    expect(getQuote('laundry', 'wash-fold', 'small')?.price).toBe(8)
    expect(getQuote('laundry', 'wash-iron', 'medium')?.price).toBe(30)
    expect(getQuote('laundry', 'wash-iron', 'large')?.price).toBe(37.5)
  })

  it('quotes cleaning prices based on time', () => {
    expect(getQuote('cleaning', '4h', undefined, 'morning')?.price).toBe(20)
    expect(getQuote('cleaning', '4h', undefined, 'afternoon')?.price).toBe(25)
    expect(getQuote('cleaning', '6h', undefined, 'evening')?.price).toBe(35)
  })

  it('quotes valid car packages and rejects invalid sizes', () => {
    expect(getQuote('car', 'normal', 'small')?.price).toBe(7.5)
    expect(getQuote('car', 'standard', 'large')?.price).toBe(35)
    expect(getQuote('car', 'vip', 'medium')?.price).toBe(80)
    expect(getQuote('car', 'normal', 'medium')).toBeNull()
  })
})

describe('booking schedule and WhatsApp handoff', () => {
  it('offers seven future calendar days', () => {
    const days = getBookingDays(new Date('2026-09-04T12:00:00+03:00'))
    expect(days).toHaveLength(7)
    expect(days[0].id).toBe('2026-09-05')
    expect(new Set(days.map((day) => day.id)).size).toBe(7)
  })

  it('builds a structured request with exact visible price', () => {
    const quote = getQuote('laundry', 'wash-iron', 'small')!
    const message = buildWhatsAppMessage({ quote, day: 'السبت ٥ أيلول', time: 'الصبح (قبل ١٢)', area: 'عبدون' })
    expect(message).toContain('• الخدمة: الغسيل والكوي')
    expect(message).toContain('غسيل وكوي — صغير — ١٠ قطع')
    expect(message).toContain('• المنطقة: عبدون')
    expect(message).toContain(`• السعر الظاهر: ${formatPrice(17.5)}`)
    expect(message).toContain('تأكدولي التوفر وتثبيت الحجز')
  })

  it('routes only to the required Homi WhatsApp number', () => {
    const url = buildWhatsAppUrl('طلب حجز')
    expect(WHATSAPP_NUMBER).toBe('962770980084')
    expect(url).toBe(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('طلب حجز')}`)
  })
})
