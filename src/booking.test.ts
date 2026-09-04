import { describe, expect, it } from 'vitest'
import { buildWhatsAppMessage, buildWhatsAppUrl, getDays, WHATSAPP_NUMBER } from './booking'

describe('WhatsApp booking handoff', () => {
  it('routes to the verified Homi WhatsApp number', () => {
    expect(WHATSAPP_NUMBER).toBe('962770980084')
    expect(buildWhatsAppUrl('طلب')).toBe(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('طلب')}`)
  })

  it('builds an honest structured Arabic request', () => {
    const message = buildWhatsAppMessage('غسيل وكوي', 'بكرا', 'السبت، ٥ أيلول', 'الصبح')
    expect(message).toContain('• الخدمة: غسيل وكوي')
    expect(message).toContain('• اليوم المفضّل: بكرا (السبت، ٥ أيلول)')
    expect(message).toContain('• الوقت المفضّل: الصبح')
    expect(message).toContain('تأكدولي الموعد والسعر النهائي')
    expect(message).toContain('اللوكيشن')
  })

  it('offers exactly three honest preference days', () => {
    const days = getDays(new Date('2026-09-04T12:00:00+03:00'))
    expect(days.map((day) => day.label)).toEqual(['اليوم', 'بكرا', 'بعد بكرا'])
    expect(new Set(days.map((day) => day.date)).size).toBe(3)
  })
})
