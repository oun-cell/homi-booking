import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

describe('professional booking flow', () => {
  beforeEach(() => window.history.replaceState({}, '', '/'))

  it('requires a service before continuing', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /كمّل/ }))
    expect(screen.getByText('اختار خدمة عشان نكمّل')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('radio', { name: /الغسيل والكوي/ }))
    expect(screen.getByRole('radio', { name: /الغسيل والكوي/ })).toHaveAttribute('aria-checked', 'true')
  })

  it('shows verified package pricing and a strong selected state', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('radio', { name: /الغسيل والكوي/ }))
    fireEvent.click(screen.getByRole('button', { name: /كمّل/ }))
    const packageChoice = screen.getByRole('radio', { name: /غسيل وكوي/ })
    fireEvent.click(packageChoice)
    fireEvent.click(screen.getByRole('radio', { name: /صغير ١٠ قطع/ }))
    expect(packageChoice).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByText('17.5 د.أ')).toBeInTheDocument()
    expect(screen.getByText('حجم الكيس')).toBeInTheDocument()
  })

  it('preselects campaign service links and starts at package details', () => {
    window.history.replaceState({}, '', '/?service=car')
    render(<App />)
    expect(screen.getByText('اختار تفاصيل الخدمة')).toBeInTheDocument()
    expect(screen.getByText('تنظيف جاف VIP')).toBeInTheDocument()
  })
})
