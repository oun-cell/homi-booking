import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('quick booking flow', () => {
  it('requires every preference before opening WhatsApp', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /كمّل الحجز/ }))
    expect(screen.getByText('اختار الخدمة عشان نكمّل')).toBeInTheDocument()
  })

  it('exposes large semantic selection controls', () => {
    render(<App />)
    const laundry = screen.getByRole('radio', { name: /غسيل وكوي/ })
    fireEvent.click(laundry)
    expect(laundry).toHaveAttribute('aria-checked', 'true')
    expect(screen.getAllByRole('radio')).toHaveLength(9)
  })
})
