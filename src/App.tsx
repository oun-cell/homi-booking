import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  MessageCircle,
} from 'lucide-react'
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  detailOptions,
  formatPrice,
  getBookingDays,
  getQuote,
  services,
  times,
  variants,
  type ServiceId,
  type TimeId,
} from './booking'

const stepLabels = ['الخدمة', 'التفاصيل', 'الموعد', 'التأكيد']

export default function App() {
  const requestedService = new URLSearchParams(window.location.search).get('service') as ServiceId | null
  const initialService = services.some((item) => item.id === requestedService) ? requestedService : null
  const [step, setStep] = useState(initialService ? 1 : 0)
  const [service, setService] = useState<ServiceId | null>(initialService)
  const [option, setOption] = useState('')
  const [variant, setVariant] = useState('')
  const [day, setDay] = useState('')
  const [time, setTime] = useState<TimeId | ''>('')
  const [area, setArea] = useState('')
  const [showErrors, setShowErrors] = useState(false)
  const days = useMemo(() => getBookingDays(), [])
  const quote = service && option ? getQuote(service, option, variant || undefined, time || undefined) : null

  const selectedDay = days.find((item) => item.id === day)
  const selectedTime = times.find((item) => item.id === time)

  function chooseService(nextService: ServiceId) {
    setService(nextService)
    setOption('')
    setVariant('')
  }

  function continueFlow() {
    const valid = step === 0
      ? Boolean(service)
      : step === 1
        ? Boolean(quote)
        : Boolean(day && time && area.trim())
    if (!valid) {
      setShowErrors(true)
      window.setTimeout(() => document.querySelector<HTMLElement>('[data-missing="true"]')?.focus(), 0)
      return
    }
    setShowErrors(false)
    setStep((current) => Math.min(3, current + 1))
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  function submit() {
    if (!quote || !selectedDay || !selectedTime || !area.trim()) return
    const message = buildWhatsAppMessage({ quote, day: selectedDay.full, time: selectedTime.label, area: area.trim() })
    window.location.href = buildWhatsAppUrl(message)
  }

  const serviceOptions = service ? detailOptions[service] : []
  const serviceVariants = service === 'laundry' ? variants.laundry : service === 'car' ? variants.car : []

  return (
    <main className="page-shell">
      <section className="booking-card" aria-labelledby="page-title">
        <header className="brand-header">
          <img src={`${import.meta.env.BASE_URL}homi-logo.jpeg`} alt="هومي Homi" width="391" height="183" />
          <span><MapPin aria-hidden="true" size={14} /> عمّان</span>
        </header>

        <div className="progress" aria-label={`الخطوة ${step + 1} من 4`}>
          <div className="progress-copy"><strong>{stepLabels[step]}</strong><span>{step + 1} / 4</span></div>
          <div className="progress-track"><i style={{ width: `${((step + 1) / 4) * 100}%` }} /></div>
        </div>

        {step === 0 && <section className="flow-step" aria-labelledby="page-title">
          <div className="intro">
            <p className="eyebrow">احجز خدمتك بسهولة</p>
            <h1 id="page-title">شو بدك نساعدك فيه؟</h1>
            <p>اختار الخدمة، وشوف السعر قبل ما تبعت طلبك.</p>
          </div>
          <div className="service-grid" role="radiogroup" aria-label="الخدمة">
            {services.map((item) => {
              const selected = service === item.id
              return <button key={item.id} type="button" role="radio" aria-checked={selected} className={`choice service-choice ${selected ? 'selected' : ''}`} onClick={() => chooseService(item.id)} data-missing={showErrors && !service || undefined}>
                <span className="icon-box"><img src={`${import.meta.env.BASE_URL}${item.image}`} alt="" /></span>
                <span className="choice-copy"><strong>{item.label}</strong><small>{item.description}</small><b>ابتداءً من {formatPrice(item.from)}</b></span>
                <span className="select-mark"><Check aria-hidden="true" size={16} strokeWidth={3} /></span>
              </button>
            })}
          </div>
          {showErrors && !service && <p className="error" role="alert">اختار خدمة عشان نكمّل</p>}
        </section>}

        {step === 1 && service && <section className="flow-step" aria-labelledby="details-title">
          <div className="intro compact-intro">
            <p className="eyebrow">{services.find((item) => item.id === service)?.label}</p>
            <h1 id="details-title">اختار تفاصيل الخدمة</h1>
            <p>السعر بتحدّث مباشرة حسب اختيارك.</p>
          </div>
          <div className="field-group">
            <h2>نوع الخدمة</h2>
            <div className="stacked-options" role="radiogroup" aria-label="نوع الخدمة">
              {serviceOptions.map((item) => <button key={item.id} type="button" role="radio" aria-checked={option === item.id} className={`choice detail-choice ${option === item.id ? 'selected' : ''}`} onClick={() => { setOption(item.id); setVariant('') }} data-missing={showErrors && !option || undefined}>
                <span><strong>{item.label}</strong><small>{item.detail}</small></span>
                <span className="radio-dot" />
              </button>)}
            </div>
          </div>
          {serviceVariants.length > 0 && <div className="field-group">
            <h2>{service === 'laundry' ? 'حجم الكيس' : 'حجم السيارة'}</h2>
            <div className="variant-grid" role="radiogroup" aria-label={service === 'laundry' ? 'حجم الكيس' : 'حجم السيارة'}>
              {serviceVariants.map((item) => {
                const unavailable = service === 'car' && item.id === 'medium' && option !== 'vip'
                return <button key={item.id} type="button" role="radio" aria-checked={variant === item.id} disabled={unavailable} className={`choice variant-choice ${variant === item.id ? 'selected' : ''}`} onClick={() => setVariant(item.id)} data-missing={showErrors && !variant || undefined}>
                  <strong>{item.label}</strong><small>{unavailable ? 'متاح مع VIP' : item.detail}</small>
                </button>
              })}
            </div>
          </div>}
          {showErrors && !quote && <p className="error" role="alert">كمّل اختيارات الخدمة عشان يظهر السعر</p>}
          <div className={`price-panel ${quote ? 'ready' : ''}`} aria-live="polite">
            <span>{quote ? 'سعر خدمتك' : 'السعر بظهر هون'}</span>
            <strong>{quote ? formatPrice(quote.price) : '—'}</strong>
            <small>{quote ? 'يشمل الباقة والحجم اللي اخترتهم' : 'كمّل الاختيارات ليظهر السعر النهائي'}</small>
          </div>
        </section>}

        {step === 2 && <section className="flow-step" aria-labelledby="schedule-title">
          <div className="intro compact-intro">
            <p className="eyebrow">الموعد والمكان</p>
            <h1 id="schedule-title">متى ووين بناسبك؟</h1>
            <p>اختيارك طلب مفضّل، وبنأكد التوفر معك على واتساب.</p>
          </div>
          <div className="field-group">
            <h2><CalendarDays aria-hidden="true" size={19} /> اليوم المفضّل</h2>
            <div className="day-scroller" role="radiogroup" aria-label="اليوم المفضّل">
              {days.map((item) => <button key={item.id} type="button" role="radio" aria-checked={day === item.id} className={`choice day-choice ${day === item.id ? 'selected' : ''}`} onClick={() => setDay(item.id)} data-missing={showErrors && !day || undefined}>
                <small>{item.weekday}</small><strong>{item.day}</strong><small>{item.month}</small>
              </button>)}
            </div>
          </div>
          <div className="field-group">
            <h2><Clock3 aria-hidden="true" size={19} /> الوقت المفضّل</h2>
            <div className="variant-grid" role="radiogroup" aria-label="الوقت المفضّل">
              {times.map((item) => <button key={item.id} type="button" role="radio" aria-checked={time === item.id} className={`choice variant-choice ${time === item.id ? 'selected' : ''}`} onClick={() => setTime(item.id)} data-missing={showErrors && !time || undefined}>
                <strong>{item.label}</strong><small>{item.detail}</small>
              </button>)}
            </div>
          </div>
          <label className="area-field">
            <span><MapPin aria-hidden="true" size={19} /> منطقتك بعمّان</span>
            <input value={area} onChange={(event) => setArea(event.target.value)} placeholder="مثلاً: خلدا" autoComplete="address-level2" data-missing={showErrors && !area.trim() || undefined} />
            <small>بعد ما تفتح واتساب، ابعتلنا اللوكيشن الدقيق 📍</small>
          </label>
          {showErrors && (!day || !time || !area.trim()) && <p className="error" role="alert">اختار اليوم والوقت، واكتب منطقتك</p>}
        </section>}

        {step === 3 && quote && selectedDay && selectedTime && <section className="flow-step" aria-labelledby="review-title">
          <div className="intro compact-intro">
            <p className="eyebrow">راجع طلبك</p>
            <h1 id="review-title">كل التفاصيل جاهزة</h1>
            <p>راجعها، وبعدها ابعت الطلب لهومي على واتساب.</p>
          </div>
          <div className="review-card">
            <div><span>الخدمة</span><strong>{quote.serviceLabel}</strong></div>
            <div><span>التفاصيل</span><strong>{quote.optionLabel}{quote.variantLabel ? ` — ${quote.variantLabel}` : ''}</strong></div>
            <div><span>الموعد المفضّل</span><strong>{selectedDay.full}، {selectedTime.label}</strong></div>
            <div><span>المنطقة</span><strong>{area.trim()}</strong></div>
            <div className="review-price"><span>السعر</span><strong>{formatPrice(quote.price)}</strong></div>
          </div>
          <div className="honesty-note"><Check aria-hidden="true" size={19} /><p><strong>لسا ما ثبتنا الموعد.</strong> بنأكدلك التوفر على واتساب أول، وبعدها بنثبت الحجز.</p></div>
          <button type="button" className="whatsapp-button" onClick={submit}>
            <MessageCircle aria-hidden="true" size={23} fill="currentColor" />
            <span>ابعت الطلب على واتساب</span>
          </button>
          <p className="helper">بتفتحلك رسالة جاهزة فيها كل التفاصيل</p>
        </section>}

        <footer className="flow-footer">
          {step > 0 && <button type="button" className="back-button" onClick={() => { setStep((current) => current - 1); setShowErrors(false) }}><ArrowRight aria-hidden="true" size={19} /> رجوع</button>}
          {step < 3 && <button type="button" className="continue-button" onClick={continueFlow}>كمّل <ArrowLeft aria-hidden="true" size={20} /></button>}

        </footer>
      </section>
    </main>
  )
}