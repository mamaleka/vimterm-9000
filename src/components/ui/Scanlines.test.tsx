import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Scanlines } from './Scanlines'

describe('Scanlines', () => {
  it('renders a div element', () => {
    const { container } = render(<Scanlines />)
    expect(container.firstChild).not.toBeNull()
    expect((container.firstChild as HTMLElement).tagName).toBe('DIV')
  })

  it('applies pointer-events-none so it does not block clicks', () => {
    const { container } = render(<Scanlines />)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('pointer-events-none')
  })

  it('matches snapshot', () => {
    const { container } = render(<Scanlines />)
    expect(container.firstChild).toMatchSnapshot()
  })
})
