import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { TerminalWindow } from './TerminalWindow'

describe('TerminalWindow', () => {
  it('renders children', () => {
    render(<TerminalWindow><p>hello terminal</p></TerminalWindow>)
    expect(screen.getByText('hello terminal')).toBeInTheDocument()
  })

  it('applies CRT border class', () => {
    const { container } = render(<TerminalWindow><span>x</span></TerminalWindow>)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('border')
  })

  it('accepts optional className prop', () => {
    const { container } = render(
      <TerminalWindow className="custom-class"><span>x</span></TerminalWindow>
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('custom-class')
  })

  it('matches snapshot', () => {
    const { container } = render(<TerminalWindow><span>snap</span></TerminalWindow>)
    expect(container.firstChild).toMatchSnapshot()
  })
})
