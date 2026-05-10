import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { HintPanel } from './HintPanel'

describe('HintPanel', () => {
  it('renders hint text when hint prop is provided', () => {
    render(<HintPanel hint="Use w to jump forward a word" />)
    expect(screen.getByText('Use w to jump forward a word')).toBeInTheDocument()
  })

  it('renders nothing when hint is null', () => {
    const { container } = render(<HintPanel hint={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('applies CRT dim text style class', () => {
    const { container } = render(<HintPanel hint="some hint" />)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('text-crt-dim')
  })

  it('renders different hint text correctly', () => {
    render(<HintPanel hint="Press gg to go to the top" />)
    expect(screen.getByText('Press gg to go to the top')).toBeInTheDocument()
  })
})
