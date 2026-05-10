import { useState } from 'react'
import { TerminalWindow } from '../components/ui/TerminalWindow'
import { useStore } from '../store'

const MOTION_GROUPS = [
  { phase: 1, label: 'Basic Movement', zone: 'zone1', motions: ['h', 'j', 'k', 'l', 'w', 'b', 'e', '0', '^', '$', 'gg', 'G'] },
  { phase: 2, label: 'Find & Search', zone: 'zone2', motions: ['f', 'F', 't', 'T', ';', ',', '/', '?', 'n', 'N'] },
  { phase: 3, label: 'Operators', zone: 'zone3', motions: ['d', 'c', 'y', 'p', '.', 'dd', 'dw', 'cw', 'yy'] },
  { phase: 4, label: 'Text Objects', zone: 'zone4', motions: ['iw', 'aw', 'i"', "i'", 'i(', 'i[', 'i{', 'ip', 'ap'] },
  { phase: 5, label: 'Marks & Jumps', zone: 'zone5', motions: ['m', "'", '`', '%', '{', '}', '*', '#'] },
]

interface Tooltip {
  motion: string
  count: number
}

export function SkillTreeScreen() {
  const unlockedZones = useStore((s) => s.unlockedZones)
  const navigateTo = useStore((s) => s.navigateTo)
  const motionUseCounts = useStore((s) => s.statistics.motionUseCounts)
  const [tooltip, setTooltip] = useState<Tooltip | null>(null)

  function handleMotionClick(motion: string) {
    setTooltip({ motion, count: motionUseCounts[motion] ?? 0 })
  }

  return (
    <TerminalWindow>
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-crt-bright text-xl font-mono">SKILL TREE</h1>
          <button
            data-testid="back-button"
            onClick={() => navigateTo('worldMap')}
            className="text-crt-text font-mono border border-crt-border px-3 py-1 hover:text-crt-bright"
          >
            ← BACK
          </button>
        </div>

        {tooltip && (
          <div data-testid="motion-tooltip" className="mb-4 border border-crt-border bg-crt-surface p-3 font-mono">
            <span className="text-crt-amber">{tooltip.motion}</span>
            <span className="text-crt-text ml-2">uses: </span>
            <span className="text-crt-bright">{tooltip.count}</span>
          </div>
        )}

        <div className="space-y-6">
          {MOTION_GROUPS.map(({ phase, label, zone, motions }) => {
            const isUnlocked = unlockedZones.includes(zone)
            return (
              <div key={phase} data-testid={`phase-${phase}`} className="border border-crt-border p-3">
                <h2 className={`font-mono mb-3 ${isUnlocked ? 'text-crt-text' : 'text-crt-dim'}`}>
                  Phase {phase}: {label}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {motions.map((motion) => (
                    <button
                      key={motion}
                      data-testid={`motion-${motion}`}
                      onClick={() => handleMotionClick(motion)}
                      className={`font-mono border px-2 py-1 text-sm ${
                        isUnlocked
                          ? 'text-crt-bright border-crt-border hover:bg-crt-surface'
                          : 'text-crt-dim border-crt-border opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {motion}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </TerminalWindow>
  )
}
