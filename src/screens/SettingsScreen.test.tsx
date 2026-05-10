import { render, screen, fireEvent } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useStore } from '../store'
import SettingsScreen from './SettingsScreen'

const PHOSPHOR_COLORS: Record<string, string> = {
  green: '#4dff4d',
  amber: '#ffb000',
  blue: '#4d9fff',
}

function renderSettings() {
  return render(<SettingsScreen />)
}

beforeEach(() => {
  useStore.setState({
    theme: {
      phosphorColor: 'green',
      scanlines: true,
      crtCurvature: false,
      flickerEffect: false,
      fontSize: 'md',
    },
    audio: { enabled: false, volume: 0.5 },
    gameplay: { showHints: true, arrowKeyWarning: true, autoAdvance: false },
    accessibility: { reducedMotion: false, highContrast: false },
  })
  document.documentElement.style.removeProperty('--color-text')
})

// ─── Theme section ───────────────────────────────────────────────────────────

describe('Theme section', () => {
  it('renders a phosphor color toggle', () => {
    renderSettings()
    expect(screen.getByTestId('phosphor-toggle')).toBeInTheDocument()
  })

  it('cycles phosphor color and sets --color-text CSS variable to amber', () => {
    renderSettings()
    const toggle = screen.getByTestId('phosphor-toggle')
    // initial state is green → click once → amber
    fireEvent.click(toggle)
    expect(document.documentElement.style.getPropertyValue('--color-text')).toBe(
      PHOSPHOR_COLORS['amber'],
    )
    expect(useStore.getState().theme.phosphorColor).toBe('amber')
  })

  it('cycles phosphor color from amber to blue on second click', () => {
    renderSettings()
    const toggle = screen.getByTestId('phosphor-toggle')
    fireEvent.click(toggle) // green → amber
    fireEvent.click(toggle) // amber → blue
    expect(document.documentElement.style.getPropertyValue('--color-text')).toBe(
      PHOSPHOR_COLORS['blue'],
    )
    expect(useStore.getState().theme.phosphorColor).toBe('blue')
  })

  it('cycles phosphor color from blue back to green on third click', () => {
    renderSettings()
    const toggle = screen.getByTestId('phosphor-toggle')
    fireEvent.click(toggle) // green → amber
    fireEvent.click(toggle) // amber → blue
    fireEvent.click(toggle) // blue → green
    expect(document.documentElement.style.getPropertyValue('--color-text')).toBe(
      PHOSPHOR_COLORS['green'],
    )
    expect(useStore.getState().theme.phosphorColor).toBe('green')
  })

  it('renders scanlines toggle', () => {
    renderSettings()
    expect(screen.getByTestId('scanlines-toggle')).toBeInTheDocument()
  })

  it('scanlines toggle updates store scanlines flag to false when clicked', () => {
    renderSettings()
    const toggle = screen.getByTestId('scanlines-toggle')
    fireEvent.click(toggle)
    expect(useStore.getState().theme.scanlines).toBe(false)
  })

  it('scanlines toggle updates store scanlines flag back to true when clicked again', () => {
    renderSettings()
    const toggle = screen.getByTestId('scanlines-toggle')
    fireEvent.click(toggle) // off
    fireEvent.click(toggle) // on
    expect(useStore.getState().theme.scanlines).toBe(true)
  })

  it('renders font size toggle', () => {
    renderSettings()
    expect(screen.getByTestId('fontsize-toggle')).toBeInTheDocument()
  })

  it('font size toggle cycles from md to lg and updates store', () => {
    renderSettings()
    const toggle = screen.getByTestId('fontsize-toggle')
    fireEvent.click(toggle) // md → lg
    expect(useStore.getState().theme.fontSize).toBe('lg')
  })

  it('font size toggle cycles from lg to sm', () => {
    useStore.setState({ theme: { ...useStore.getState().theme, fontSize: 'lg' } })
    renderSettings()
    const toggle = screen.getByTestId('fontsize-toggle')
    fireEvent.click(toggle) // lg → sm
    expect(useStore.getState().theme.fontSize).toBe('sm')
  })

  it('font size toggle cycles from sm back to md', () => {
    useStore.setState({ theme: { ...useStore.getState().theme, fontSize: 'sm' } })
    renderSettings()
    const toggle = screen.getByTestId('fontsize-toggle')
    fireEvent.click(toggle) // sm → md
    expect(useStore.getState().theme.fontSize).toBe('md')
  })
})

// ─── Audio section ────────────────────────────────────────────────────────────

describe('Audio section', () => {
  it('renders audio toggle', () => {
    renderSettings()
    expect(screen.getByTestId('audio-toggle')).toBeInTheDocument()
  })

  it('audio toggle enables audio in store', () => {
    renderSettings()
    const toggle = screen.getByTestId('audio-toggle')
    fireEvent.click(toggle)
    expect(useStore.getState().audio.enabled).toBe(true)
  })

  it('audio toggle disables audio when clicked again', () => {
    useStore.setState({ audio: { ...useStore.getState().audio, enabled: true } })
    renderSettings()
    const toggle = screen.getByTestId('audio-toggle')
    fireEvent.click(toggle)
    expect(useStore.getState().audio.enabled).toBe(false)
  })
})

// ─── Gameplay section ─────────────────────────────────────────────────────────

describe('Gameplay section', () => {
  it('renders show hints toggle', () => {
    renderSettings()
    expect(screen.getByTestId('hints-toggle')).toBeInTheDocument()
  })

  it('hints toggle updates store', () => {
    renderSettings()
    fireEvent.click(screen.getByTestId('hints-toggle'))
    expect(useStore.getState().gameplay.showHints).toBe(false)
  })

  it('renders arrow key warning toggle', () => {
    renderSettings()
    expect(screen.getByTestId('arrowkey-toggle')).toBeInTheDocument()
  })

  it('auto advance toggle updates store', () => {
    renderSettings()
    fireEvent.click(screen.getByTestId('autoadvance-toggle'))
    expect(useStore.getState().gameplay.autoAdvance).toBe(true)
  })
})

// ─── Accessibility section ────────────────────────────────────────────────────

describe('Accessibility section', () => {
  it('renders reduced motion toggle', () => {
    renderSettings()
    expect(screen.getByTestId('reduced-motion-toggle')).toBeInTheDocument()
  })

  it('reduced motion toggle updates store', () => {
    renderSettings()
    fireEvent.click(screen.getByTestId('reduced-motion-toggle'))
    expect(useStore.getState().accessibility.reducedMotion).toBe(true)
  })

  it('high contrast toggle updates store', () => {
    renderSettings()
    fireEvent.click(screen.getByTestId('high-contrast-toggle'))
    expect(useStore.getState().accessibility.highContrast).toBe(true)
  })
})

// ─── Navigation ───────────────────────────────────────────────────────────────

describe('Navigation', () => {
  it('renders BACK button', () => {
    renderSettings()
    expect(screen.getByTestId('back-button')).toBeInTheDocument()
  })

  it('clicking BACK button calls navigateTo("home")', () => {
    renderSettings()
    const navigateTo = vi.fn()
    useStore.setState({ navigateTo })
    render(<SettingsScreen />)
    fireEvent.click(screen.getByTestId('back-button'))
    expect(navigateTo).toHaveBeenCalledWith('home')
  })
})

// ─── Export / Save ────────────────────────────────────────────────────────────

describe('Export section', () => {
  it('renders export textarea', () => {
    renderSettings()
    expect(screen.getByTestId('export-textarea')).toBeInTheDocument()
  })

  it('export textarea contains valid JSON', () => {
    renderSettings()
    const textarea = screen.getByTestId('export-textarea') as HTMLTextAreaElement
    const parsed: unknown = JSON.parse(textarea.value)
    expect(parsed).toBeTruthy()
  })

  it('exported JSON has version field equal to 1', () => {
    renderSettings()
    const textarea = screen.getByTestId('export-textarea') as HTMLTextAreaElement
    const parsed = JSON.parse(textarea.value) as { version: unknown }
    expect(parsed.version).toBe(1)
  })

  it('exported JSON contains theme, audio, gameplay, accessibility fields', () => {
    renderSettings()
    const textarea = screen.getByTestId('export-textarea') as HTMLTextAreaElement
    const parsed = JSON.parse(textarea.value) as Record<string, unknown>
    expect(parsed).toHaveProperty('theme')
    expect(parsed).toHaveProperty('audio')
    expect(parsed).toHaveProperty('gameplay')
    expect(parsed).toHaveProperty('accessibility')
  })
})

// ─── Import ───────────────────────────────────────────────────────────────────

describe('Import section', () => {
  it('renders import textarea', () => {
    renderSettings()
    expect(screen.getByTestId('import-textarea')).toBeInTheDocument()
  })

  it('renders apply import button', () => {
    renderSettings()
    expect(screen.getByTestId('import-apply')).toBeInTheDocument()
  })

  it('applying valid JSON with version 1 updates store theme', () => {
    renderSettings()
    const importData = {
      version: 1,
      state: {
        theme: {
          phosphorColor: 'amber',
          scanlines: false,
          crtCurvature: false,
          flickerEffect: false,
          fontSize: 'lg',
        },
        audio: { enabled: true, volume: 0.8 },
        gameplay: { showHints: false, arrowKeyWarning: false, autoAdvance: true },
        accessibility: { reducedMotion: true, highContrast: false },
      },
    }
    const textarea = screen.getByTestId('import-textarea') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: JSON.stringify(importData) } })
    fireEvent.click(screen.getByTestId('import-apply'))
    expect(useStore.getState().theme.phosphorColor).toBe('amber')
    expect(useStore.getState().theme.fontSize).toBe('lg')
    expect(useStore.getState().audio.enabled).toBe(true)
    expect(useStore.getState().gameplay.showHints).toBe(false)
    expect(useStore.getState().accessibility.reducedMotion).toBe(true)
  })

  it('rejects import JSON with version !== 1 and shows error', () => {
    renderSettings()
    const importData = { version: 2, state: { theme: { phosphorColor: 'amber' } } }
    const textarea = screen.getByTestId('import-textarea') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: JSON.stringify(importData) } })
    fireEvent.click(screen.getByTestId('import-apply'))
    expect(useStore.getState().theme.phosphorColor).toBe('green') // unchanged
    expect(screen.getByTestId('import-error')).toBeInTheDocument()
  })

  it('rejects invalid JSON and shows error', () => {
    renderSettings()
    const textarea = screen.getByTestId('import-textarea') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'not valid json {{' } })
    fireEvent.click(screen.getByTestId('import-apply'))
    expect(screen.getByTestId('import-error')).toBeInTheDocument()
  })
})
