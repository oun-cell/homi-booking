export type ServiceId = 'laundry' | 'cleaning' | 'car'
export type DayId = 'today' | 'tomorrow' | 'afterTomorrow'
export type TimeId = 'morning' | 'afternoon' | 'evening'

export const WHATSAPP_NUMBER = '962770980084'

export const services: { id: ServiceId; label: string; detail: string }[] = [
  { id: 'laundry', label: 'غسيل وكوي', detail: 'غسيل، كوي أو تنظيف جاف' },
  { id: 'cleaning', label: 'تنظيف البيت', detail: 'تنظيف عام أو عميق' },
  { id: 'car', label: 'تنظيف السيارة', detail: 'تنظيف عند موقعك' },
]

export const times: { id: TimeId; label: string; detail: string }[] = [
  { id: 'morning', label: 'الصبح', detail: 'قبل ١٢' },
  { id: 'afternoon', label: 'بعد الظهر', detail: 'من ١٢ لـ ٥' },
  { id: 'evening', label: 'المسا', detail: 'بعد ٥' },
]

export function getDays(base = new Date()): { id: DayId; label: string; date: string }[] {
  const labels: { id: DayId; label: string; offset: number }[] = [
    { id: 'today', label: 'اليوم', offset: 0 },
    { id: 'tomorrow', label: 'بكرا', offset: 1 },
    { id: 'afterTomorrow', label: 'بعد بكرا', offset: 2 },
  ]
  const formatter = new Intl.DateTimeFormat('ar-JO', { weekday: 'short', day: 'numeric', month: 'short' })
  return labels.map(({ id, label, offset }) => {
    const date = new Date(base)
    date.setHours(12, 0, 0, 0)
    date.setDate(date.getDate() + offset)
    return { id, label, date: formatter.format(date) }
  })
}

export function buildWhatsAppMessage(service: string, day: string, date: string, time: string) {
  return [
    'مرحبا هومي 👋',
    'بدي أحجز خدمة:',
    `• الخدمة: ${service}`,
    `• اليوم المفضّل: ${day} (${date})`,
    `• الوقت المفضّل: ${time}`,
    '',
    'ممكن تأكدولي الموعد والسعر النهائي؟',
    'رح أبعتلكم اللوكيشن هون 📍',
  ].join('\n')
}

export function buildWhatsAppUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
