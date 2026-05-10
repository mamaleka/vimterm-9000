import { useState } from 'react'
import { TerminalWindow } from '../components/ui/TerminalWindow'
import { useStore } from '../store'
import type { ThemeSettings, AudioSettings, GameplaySettings, AccessibilitySettings } from '../store/settingsSlice'

type PhosphorColor = ThemeSettings['phosphorColor']

const PHOSPHOR_CYCLE: PhosphorColor[] = ['green', 'amber', 'blue']
const PHOSPHOR_HEX: Record<PhosphorColor, string> = {
  green: '#4dff4d',
  amber: '#ffb000',
  blue: '#4d9fff',
  white: '#e0e0e0',
}
const FONT_SIZE_CYCLE: ThemeSettings['fontSize'][] = ['sm', 'md', 'lg']

interface SaveDataImport {
  version: number
  state: {
    theme?: Partial<ThemeSettings>
    audio?: Partial<AudioSettings>
    gameplay?: Partial<GameplaySettings>
    accessibility?: Partial<AccessibilitySettings>
  }
}

function isSaveDataImport(value: unknown): value is SaveDataImport {
  if (typeof value !== 'object' || value === null) return false
  const obj = value as Record<string, unknown>
  return typeof obj['version'] === 'number' && typeof obj['state'] === 'object'
}

function ToggleButton({
  label,
  value,
  testId,
  onClick,
}: {
  label: string
  value: string | boolean
  testId: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      data-testid={testId}
      onClick={onClick}
      className="flex items-center justify-between w-full border border-crt-border p-2 text-left hover:border-crt-text transition-colors"
    >
      <span className="text-crt-dim font-mono text-xs uppercase">{label}</span>
      <span className="text-crt-bright font-terminal text-sm">
        {typeof value === 'boolean' ? (value ? 'ON' : 'OFF') : String(value).toUpperCase()}
      </span>
    </button>
  )
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-crt-amber font-terminal text-base tracking-widest mt-6 mb-2 border-b border-crt-border pb-1">
      {children}
    </div>
  )
}

export default function SettingsScreen() {
  const theme = useStore((s) => s.theme)
  const audio = useStore((s) => s.audio)
  const gameplay = useStore((s) => s.gameplay)
  const accessibility = useStore((s) => s.accessibility)
  const updateTheme = useStore((s) => s.updateTheme)
  const updateAudio = useStore((s) => s.updateAudio)
  const updateGameplay = useStore((s) => s.updateGameplay)
  const updateAccessibility = useStore((s) => s.updateAccessibility)

  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState<string | null>(null)

  function cyclePhosphorColor() {
    const currentIndex = PHOSPHOR_CYCLE.indexOf(theme.phosphorColor as PhosphorColor)
    const nextIndex = (currentIndex + 1) % PHOSPHOR_CYCLE.length
    const next = PHOSPHOR_CYCLE[nextIndex]
    document.documentElement.style.setProperty('--color-text', PHOSPHOR_HEX[next])
    updateTheme({ phosphorColor: next })
  }

  function cycleFontSize() {
    const currentIndex = FONT_SIZE_CYCLE.indexOf(theme.fontSize)
    const nextIndex = (currentIndex + 1) % FONT_SIZE_CYCLE.length
    updateTheme({ fontSize: FONT_SIZE_CYCLE[nextIndex] })
  }

  const exportData = {
    version: 1,
    theme,
    audio,
    gameplay,
    accessibility,
  }
  const exportJson = JSON.stringify(exportData, null, 2)

  function applyImport() {
    setImportError(null)
    let parsed: unknown
    try {
      parsed = JSON.parse(importText)
    } catch {
      setImportError('Invalid JSON: could not parse input.')
      return
    }
    if (!isSaveDataImport(parsed)) {
      setImportError('Invalid format: missing version or state fields.')
      return
    }
    if (parsed.version !== 1) {
      setImportError(`Unsupported version: ${parsed.version}. Expected version 1.`)
      return
    }
    const { state } = parsed
    if (state.theme) updateTheme(state.theme)
    if (state.audio) updateAudio(state.audio)
    if (state.gameplay) updateGameplay(state.gameplay)
    if (state.accessibility) updateAccessibility(state.accessibility)
  }

  return (
    <TerminalWindow>
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-crt-bright font-terminal text-3xl tracking-widest mb-6">
          SETTINGS
        </h1>

        <SectionHeader>THEME</SectionHeader>
        <div className="flex flex-col gap-2">
          <ToggleButton
            label="Phosphor Color"
            value={theme.phosphorColor}
            testId="phosphor-toggle"
            onClick={cyclePhosphorColor}
          />
          <ToggleButton
            label="Scanlines"
            value={theme.scanlines}
            testId="scanlines-toggle"
            onClick={() => updateTheme({ scanlines: !theme.scanlines })}
          />
          <ToggleButton
            label="CRT Curvature"
            value={theme.crtCurvature}
            testId="crtcurvature-toggle"
            onClick={() => updateTheme({ crtCurvature: !theme.crtCurvature })}
          />
          <ToggleButton
            label="Flicker Effect"
            value={theme.flickerEffect}
            testId="flicker-toggle"
            onClick={() => updateTheme({ flickerEffect: !theme.flickerEffect })}
          />
          <ToggleButton
            label="Font Size"
            value={theme.fontSize}
            testId="fontsize-toggle"
            onClick={cycleFontSize}
          />
        </div>

        <SectionHeader>AUDIO</SectionHeader>
        <div className="flex flex-col gap-2">
          <ToggleButton
            label="Audio"
            value={audio.enabled}
            testId="audio-toggle"
            onClick={() => updateAudio({ enabled: !audio.enabled })}
          />
          <div className="flex items-center justify-between border border-crt-border p-2">
            <span className="text-crt-dim font-mono text-xs uppercase">Volume</span>
            <span className="text-crt-bright font-terminal text-sm">
              {Math.round(audio.volume * 100)}%
            </span>
          </div>
        </div>

        <SectionHeader>GAMEPLAY</SectionHeader>
        <div className="flex flex-col gap-2">
          <ToggleButton
            label="Show Hints"
            value={gameplay.showHints}
            testId="hints-toggle"
            onClick={() => updateGameplay({ showHints: !gameplay.showHints })}
          />
          <ToggleButton
            label="Arrow Key Warning"
            value={gameplay.arrowKeyWarning}
            testId="arrowkey-toggle"
            onClick={() => updateGameplay({ arrowKeyWarning: !gameplay.arrowKeyWarning })}
          />
          <ToggleButton
            label="Auto Advance"
            value={gameplay.autoAdvance}
            testId="autoadvance-toggle"
            onClick={() => updateGameplay({ autoAdvance: !gameplay.autoAdvance })}
          />
        </div>

        <SectionHeader>ACCESSIBILITY</SectionHeader>
        <div className="flex flex-col gap-2">
          <ToggleButton
            label="Reduced Motion"
            value={accessibility.reducedMotion}
            testId="reduced-motion-toggle"
            onClick={() => updateAccessibility({ reducedMotion: !accessibility.reducedMotion })}
          />
          <ToggleButton
            label="High Contrast"
            value={accessibility.highContrast}
            testId="high-contrast-toggle"
            onClick={() => updateAccessibility({ highContrast: !accessibility.highContrast })}
          />
        </div>

        <SectionHeader>EXPORT SAVE DATA</SectionHeader>
        <textarea
          data-testid="export-textarea"
          readOnly
          value={exportJson}
          className="w-full h-40 bg-crt-surface border border-crt-border text-crt-dim font-mono text-xs p-2 resize-none"
        />

        <SectionHeader>IMPORT SAVE DATA</SectionHeader>
        <textarea
          data-testid="import-textarea"
          value={importText}
          onChange={(e) => {
            setImportText(e.target.value)
            setImportError(null)
          }}
          placeholder='Paste JSON here...'
          className="w-full h-40 bg-crt-surface border border-crt-border text-crt-text font-mono text-xs p-2 resize-none"
        />
        {importError !== null && (
          <div
            data-testid="import-error"
            className="text-crt-red font-mono text-xs mt-1"
          >
            {importError}
          </div>
        )}
        <button
          type="button"
          data-testid="import-apply"
          onClick={applyImport}
          className="mt-2 border border-crt-border px-4 py-2 text-crt-text font-terminal text-sm hover:border-crt-bright hover:text-crt-bright transition-colors"
        >
          APPLY IMPORT
        </button>
      </div>
    </TerminalWindow>
  )
}
