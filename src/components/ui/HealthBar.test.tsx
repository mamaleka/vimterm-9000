import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { HealthBar } from './HealthBar'

describe('HealthBar', () => {
  it('renders with correct width percentage', () => {
    render(<HealthBar current={50} max={100} />)
    const fill = screen.getByTestId('health-bar-fill')
    expect(fill.style.width).toBe('50%')
  })

  it('renders container with data-testid', () => {
    render(<HealthBar current={100} max={100} />)
    expect(screen.getByTestId('health-bar')).toBeInTheDocument()
  })

  it('full health shows green (bg-crt-text)', () => {
    render(<HealthBar current={100} max={100} />)
    const fill = screen.getByTestId('health-bar-fill')
    expect(fill).toHaveClass('bg-crt-text')
    expect(fill).not.toHaveClass('bg-crt-red')
  })

  it('turns red below 30%', () => {
    render(<HealthBar current={29} max={100} />)
    const fill = screen.getByTestId('health-bar-fill')
    expect(fill).toHaveClass('bg-crt-red')
    expect(fill).not.toHaveClass('bg-crt-text')
  })

  it('exactly 30% is red', () => {
    render(<HealthBar current={30} max={100} />)
    const fill = screen.getByTestId('health-bar-fill')
    expect(fill).toHaveClass('bg-crt-red')
  })

  it('above 30% shows green', () => {
    render(<HealthBar current={31} max={100} />)
    const fill = screen.getByTestId('health-bar-fill')
    expect(fill).toHaveClass('bg-crt-text')
  })

  it('renders optional label', () => {
    render(<HealthBar current={50} max={100} label="BOSS HP" />)
    expect(screen.getByText('BOSS HP')).toBeInTheDocument()
  })

  it('handles zero current', () => {
    render(<HealthBar current={0} max={100} />)
    const fill = screen.getByTestId('health-bar-fill')
    expect(fill.style.width).toBe('0%')
    expect(fill).toHaveClass('bg-crt-red')
  })
})
