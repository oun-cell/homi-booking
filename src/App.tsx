import { useMemo, useState } from 'react'
import { CalendarDays, CarFront, Check, Clock3, MessageCircle, Shirt, Sparkles } from 'lucide-react'
import { buildWhatsAppMessage, buildWhatsAppUrl, getDays, services, times, type DayId, type ServiceId, type TimeId } from './booking'

const serviceIcons = { laundry: Shirt, cleaning: Sparkles, car: CarFront }

export default function App() {
  const requestedService = new URLSearchParams(window.location.search).get('service') as ServiceId | null
  const initialService = services.some((item) => item.id === requestedService) ? requestedService : null
  const [service, setService] = useState<ServiceId | null>(initialService)
  const [day, setDay] = useState<DayId | null>(null)
  const [time, setTime] = useState<TimeId | null>(null)
  const [showErrors, setShowErrors] = useState(false)
  const days = useMemo(() => getDays(), [])
  const complete = Boolean(service && day && time)

  function submit() {
    if (!complete) {
      setShowErrors(true)
      window.setTimeout(() => document.querySelector<HTMLElement>('[data-missing="true"]')?.focus(), 0)
      return
    }
    const selectedService = services.find((item) => item.id === service)!
    const selectedDay = days.find((item) => item.id === day)!
    const selectedTime = times.find((item) => item.id === time)!
    const message = buildWhatsAppMessage(selectedService.label, selectedDay.label, selectedDay.date, selectedTime.label)
    window.location.href = buildWhatsAppUrl(message)
  }

  return (
    <main className="page-shell">
      <section className="booking-card" aria-labelledby="page-title">
        <header className="brand-header">
          <img src={`${import.meta.env.BASE_URL}homi-logo.jpeg`} alt="هومي Homi" width="391" height="183" />
          <span>عمّان</span>
        </header>

        <div className="intro">
          <p className="eyebrow">حجز سريع على واتساب</p>
          <h1 id="page-title">شو الخدمة اللي بدك ياها؟</h1>
          <p>اختار الخدمة والوقت المناسب إلك، وبنكمّل معك على واتساب.</p>
        </div>

        <section className="step" aria-labelledby="service-title">
          <div className="step-title"><span>١</span><h2 id="service-title">اختار الخدمة</h2></div>
          <div className="service-grid" role="radiogroup" aria-labelledby="service-title">
            {services.map((item) => {
              const Icon = serviceIcons[item.id]
              const selected = service === item.id
              return <button key={item.id} type="button" role="radio" aria-checked={selected} className={`choice service-choice ${selected ? 'selected' : ''}`} onClick={() => setService(item.id)} data-missing={showErrors && !service || undefined}>
                <span className="icon-box"><Icon aria-hidden="true" size={24} strokeWidth={2} /></span>
                <span className="choice-copy"><strong>{item.label}</strong><small>{item.detail}</small></span>
                <span className="check"><Check aria-hidden="true" size={17} strokeWidth={3} /></span>
              </button>
            })}
          </div>
          {showErrors && !service && <p className="error" role="alert">اختار الخدمة عشان نكمّل</p>}
        </section>

        <section className="step" aria-labelledby="day-title">
          <div className="step-title"><span>٢</span><CalendarDays aria-hidden="true" size={20}/><h2 id="day-title">أي يوم بناسبك؟</h2></div>
          <div className="option-grid" role="radiogroup" aria-labelledby="day-title">
            {days.map((item) => <button key={item.id} type="button" role="radio" aria-checked={day === item.id} className={`choice compact ${day === item.id ? 'selected' : ''}`} onClick={() => setDay(item.id)} data-missing={showErrors && Boolean(service) && !day || undefined}>
              <strong>{item.label}</strong><small>{item.date}</small><span className="check"><Check aria-hidden="true" size={16} strokeWidth={3}/></span>
            </button>)}
          </div>
          {showErrors && !day && <p className="error" role="alert">اختار اليوم المفضّل</p>}
        </section>

        <section className="step" aria-labelledby="time-title">
          <div className="step-title"><span>٣</span><Clock3 aria-hidden="true" size={20}/><h2 id="time-title">أي وقت بناسبك؟</h2></div>
          <div className="option-grid" role="radiogroup" aria-labelledby="time-title">
            {times.map((item) => <button key={item.id} type="button" role="radio" aria-checked={time === item.id} className={`choice compact ${time === item.id ? 'selected' : ''}`} onClick={() => setTime(item.id)} data-missing={showErrors && Boolean(service && day) && !time || undefined}>
              <strong>{item.label}</strong><small>{item.detail}</small><span className="check"><Check aria-hidden="true" size={16} strokeWidth={3}/></span>
            </button>)}
          </div>
          {showErrors && !time && <p className="error" role="alert">اختار الوقت المفضّل</p>}
        </section>

        <div className="honesty-note">
          <Check aria-hidden="true" size={20}/>
          <p><strong>هالطلب مبدئي.</strong> بنأكدلك الموعد والسعر النهائي على واتساب حسب تفاصيل الخدمة.</p>
        </div>

        <button type="button" className="whatsapp-button" onClick={submit} aria-describedby="booking-helper">
          <MessageCircle aria-hidden="true" size={24} fill="currentColor" />
          <span>كمّل الحجز على واتساب</span>
        </button>
        <p id="booking-helper" className="helper">رح يفتح واتساب برسالة جاهزة — بس ابعتلنا اللوكيشن 📍</p>
        <a className="instagram" href="https://www.instagram.com/homi.jordan/" target="_blank" rel="noreferrer">@homi.jordan</a>
      </section>
    </main>
  )
}
