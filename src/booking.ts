export type ServiceId = 'laundry' | 'cleaning' | 'car'
export type TimeId = 'morning' | 'afternoon' | 'evening'

export const WHATSAPP_NUMBER = '962770980084'

export const services = [
  { id: 'laundry' as const, label: 'الغسيل والكوي', short: 'غسيل وكوي', description: 'غسيل، كوي وتنظيف جاف', from: 8, image: 'services/laundry.png' },
  { id: 'cleaning' as const, label: 'تنظيف البيت', short: 'تنظيف البيت', description: 'تنظيف عام أو عميق', from: 20, image: 'services/cleaning.png' },
  { id: 'car' as const, label: 'تنظيف السيارة', short: 'تنظيف السيارة', description: 'غسيل وتنظيف عند موقعك', from: 7.5, image: 'services/car.png' },
]

export const times: { id: TimeId; label: string; detail: string }[] = [
  { id: 'morning', label: 'الصبح', detail: 'قبل ١٢' },
  { id: 'afternoon', label: 'بعد الظهر', detail: 'من ١٢ لـ ٥' },
  { id: 'evening', label: 'المسا', detail: 'بعد ٥' },
]

export const variants = {
  laundry: [
    { id: 'small', label: 'صغير', detail: '١٠ قطع' },
    { id: 'medium', label: 'وسط', detail: '٢٠ قطعة' },
    { id: 'large', label: 'كبير', detail: '٣٠ قطعة' },
  ],
  car: [
    { id: 'small', label: 'سيارة صغيرة', detail: 'سيدان أو هاتشباك' },
    { id: 'medium', label: 'سيارة متوسطة', detail: 'متاح مع VIP' },
    { id: 'large', label: 'سيارة كبيرة', detail: 'SUV أو 7 ركاب' },
  ],
}

export const detailOptions = {
  laundry: [
    { id: 'wash-fold', label: 'غسيل وطي', detail: 'الغسيل برجعلك نظيف ومرتب', prices: { small: 8, medium: 14, large: 18 } },
    { id: 'wash-iron', label: 'غسيل وكوي', detail: 'جاهز للخزانة', prices: { small: 17.5, medium: 30, large: 37.5 } },
    { id: 'iron-only', label: 'كوي فقط', detail: 'للغسيل النظيف', prices: { small: 8, medium: 14, large: 18 } },
  ],
  cleaning: [
    { id: '4h', label: '٤ ساعات', detail: 'عامل/ة واحد/ة', dayPrice: 20, afterPrice: 25 },
    { id: '5h', label: '٥ ساعات', detail: 'عامل/ة واحد/ة', dayPrice: 25, afterPrice: 30 },
    { id: '6h', label: '٦ ساعات', detail: 'عامل/ة واحد/ة', dayPrice: 30, afterPrice: 35 },
  ],
  car: [
    { id: 'normal', label: 'غسيل عادي', detail: 'تنظيف أساسي للسيارة', prices: { small: 7.5, large: 10 } },
    { id: 'standard', label: 'تنظيف جاف Standard', detail: 'تنظيف داخلي أعمق', prices: { small: 29, large: 35 } },
    { id: 'super', label: 'تنظيف جاف Super', detail: 'عناية داخلية موسّعة', prices: { small: 45, large: 55 } },
    { id: 'vip', label: 'تنظيف جاف VIP', detail: 'أعلى باقة تنظيف متاحة', prices: { small: 70, medium: 80, large: 90 } },
  ],
}

export interface BookingDay { id: string; weekday: string; day: string; month: string; full: string }

export function getBookingDays(base = new Date(), count = 7): BookingDay[] {
  const weekday = new Intl.DateTimeFormat('ar-JO', { weekday: 'short', timeZone: 'Asia/Amman' })
  const day = new Intl.DateTimeFormat('ar-JO', { day: 'numeric', timeZone: 'Asia/Amman' })
  const month = new Intl.DateTimeFormat('ar-JO', { month: 'short', timeZone: 'Asia/Amman' })
  const full = new Intl.DateTimeFormat('ar-JO', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Amman' })
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(base)
    date.setHours(12, 0, 0, 0)
    date.setDate(date.getDate() + index + 1)
    return { id: date.toISOString().slice(0, 10), weekday: weekday.format(date), day: day.format(date), month: month.format(date), full: full.format(date) }
  })
}

export interface Quote {
  serviceLabel: string
  optionLabel: string
  variantLabel?: string
  price: number
}

export function getQuote(serviceId: ServiceId, optionId: string, variantId?: string, timeId?: TimeId): Quote | null {
  const service = services.find((item) => item.id === serviceId)
  if (!service) return null

  if (serviceId === 'cleaning') {
    const option = detailOptions.cleaning.find((item) => item.id === optionId)
    if (!option) return null
    const price = timeId && timeId !== 'morning' ? option.afterPrice : option.dayPrice
    return { serviceLabel: service.label, optionLabel: option.label, price }
  }

  if (!variantId) return null
  if (serviceId === 'laundry') {
    const option = detailOptions.laundry.find((item) => item.id === optionId)
    const variant = variants.laundry.find((item) => item.id === variantId)
    const price = option?.prices[variantId as keyof typeof option.prices]
    return option && variant && price !== undefined ? { serviceLabel: service.label, optionLabel: option.label, variantLabel: `${variant.label} — ${variant.detail}`, price } : null
  }

  const option = detailOptions.car.find((item) => item.id === optionId)
  const variant = variants.car.find((item) => item.id === variantId)
  const price = option?.prices[variantId as keyof typeof option.prices]
  return option && variant && price !== undefined ? { serviceLabel: service.label, optionLabel: option.label, variantLabel: variant.label, price } : null
}

export function formatPrice(price: number) {
  return `${Number.isInteger(price) ? price : price.toFixed(1)} د.أ`
}

export function buildWhatsAppMessage(input: { quote: Quote; day: string; time: string; area?: string }) {
  return [
    'مرحبا هومي 👋',
    'بدي أثبّت طلب حجز:',
    `• الخدمة: ${input.quote.serviceLabel}`,
    `• الباقة: ${input.quote.optionLabel}${input.quote.variantLabel ? ` — ${input.quote.variantLabel}` : ''}`,
    `• الموعد المفضّل: ${input.day}، ${input.time}`,
    input.area ? `• المنطقة: ${input.area}` : '• الموقع: رح أبعت اللوكيشن هون 📍',
    `• السعر الظاهر: ${formatPrice(input.quote.price)}`,
    '',
    'ممكن تأكدولي التوفر وتثبيت الحجز؟',
  ].join('\n')
}

export function buildWhatsAppUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
