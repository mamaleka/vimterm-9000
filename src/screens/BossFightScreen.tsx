import { useState, useCallback, useRef } from 'react'
import { TerminalWindow } from '../components/ui/TerminalWindow'
import { HealthBar } from '../components/ui/HealthBar'
import { BossStage } from '../components/challenge/BossStage'
import { bosses } from '../data/bossData'
import { useStore } from '../store'

type GameState = 'fighting' | 'victory' | 'defeat'

function zoneToNumber(zone: string): number {
  const match = /zone(\d+)/.exec(zone)
  return match ? parseInt(match[1], 10) : 1
}

export function BossFightScreen() {
  const currentZone = useStore((s) => s.currentZone)
  const navigateTo = useStore((s) => s.navigateTo)
  const defeatBoss = useStore((s) => s.defeatBoss)

  const zoneNum = zoneToNumber(currentZone)
  const boss = bosses.find((b) => b.zone === zoneNum) ?? bosses[0]
  const totalStages = boss.stages.length

  const [currentStageIdx, setCurrentStageIdx] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [gameState, setGameState] = useState<GameState>('fighting')

  const handleStageCleared = useCallback(() => {
    setCurrentStageIdx((idx) => {
      const nextIdx = idx + 1
      if (nextIdx >= totalStages) {
        setGameState('victory')
        return idx
      }
      return nextIdx
    })
  }, [totalStages])

  // Fire defeatBoss exactly once when victory is reached
  const victoryFiredRef = useRef(false)
  if (gameState === 'victory' && !victoryFiredRef.current) {
    victoryFiredRef.current = true
    defeatBoss(boss.id, {
      defeatedAt: new Date().toISOString(),
      heartsRemaining: hearts,
    })
  }

  const handleHeartLost = useCallback(() => {
    setHearts((h) => {
      const next = Math.max(0, h - 1)
      if (next === 0) {
        setGameState('defeat')
      }
      return next
    })
  }, [])

  const handleReset = useCallback(() => {
    setCurrentStageIdx(0)
    setHearts(3)
    setGameState('fighting')
  }, [])

  if (gameState === 'victory') {
    return (
      <TerminalWindow>
        <div
          data-testid="boss-fight-victory"
          className="flex flex-col items-center justify-center min-h-screen gap-8 p-8"
        >
          <div className="text-crt-bright text-4xl font-mono text-center">
            *** BOSS DEFEATED ***
          </div>
          <div className="text-crt-amber font-mono text-center text-xl">
            {boss.name} has been vanquished!
          </div>
          <button
            className="border border-crt-border text-crt-text px-8 py-3 font-mono hover:bg-crt-surface"
            onClick={() => navigateTo('worldMap')}
          >
            CONTINUE
          </button>
        </div>
      </TerminalWindow>
    )
  }

  if (gameState === 'defeat') {
    const taunt =
      boss.dialogue.defeat[Math.floor(Math.random() * boss.dialogue.defeat.length)]
    return (
      <TerminalWindow>
        <div
          data-testid="boss-fight-defeat"
          className="flex flex-col items-center justify-center min-h-screen gap-8 p-8"
        >
          <div className="text-crt-red text-4xl font-mono text-center">
            *** DEFEATED ***
          </div>
          <div className="text-crt-text-dim font-mono text-center text-lg italic">
            &ldquo;{taunt}&rdquo;
          </div>
          <div className="flex gap-4">
            <button
              className="border border-crt-border text-crt-text px-6 py-3 font-mono hover:bg-crt-surface"
              onClick={handleReset}
            >
              TRY AGAIN
            </button>
            <button
              className="border border-crt-border text-crt-text px-6 py-3 font-mono hover:bg-crt-surface"
              onClick={() => navigateTo('worldMap')}
            >
              RETREAT
            </button>
          </div>
        </div>
      </TerminalWindow>
    )
  }

  const bossHealthCurrent = totalStages - currentStageIdx
  const currentChallenge = boss.stages[currentStageIdx]

  return (
    <TerminalWindow>
      <div className="flex flex-col gap-4 p-4">
        {/* Boss header */}
        <div className="flex flex-col items-center gap-2 border-b border-crt-border pb-4">
          <pre
            data-testid="boss-ascii-art"
            className="text-crt-text font-mono text-xs leading-tight"
          >
            {boss.asciiArt}
          </pre>
          <div
            data-testid="boss-name"
            className="text-crt-bright font-mono text-2xl tracking-widest uppercase"
          >
            {boss.name}
          </div>
        </div>

        {/* Forfeit button */}
        <div className="flex justify-end">
          <button
            data-testid="forfeit-button"
            onClick={() => navigateTo('worldMap')}
            className="border border-crt-border text-crt-red px-4 py-2 font-mono hover:bg-crt-surface transition-colors"
          >
            FORFEIT
          </button>
        </div>

        {/* Boss health bar */}
        <HealthBar current={bossHealthCurrent} max={totalStages} label="BOSS HP" />

        {/* Player hearts */}
        <div className="flex items-center gap-2">
          <span className="text-crt-text-dim font-mono text-sm uppercase tracking-widest">
            HEARTS:
          </span>
          <div data-testid="player-hearts" className="flex gap-1 font-mono text-xl">
            {Array.from({ length: 3 }).map((_, i) => (
              <span
                key={i}
                className={i < hearts ? 'text-crt-red' : 'text-crt-text-dim'}
              >
                {i < hearts ? '♥' : '♡'}
              </span>
            ))}
          </div>
        </div>

        {/* Current stage */}
        <BossStage
          key={currentStageIdx}
          challenge={currentChallenge}
          timeLimit={currentChallenge.parTime}
          onStageCleared={handleStageCleared}
          onHeartLost={handleHeartLost}
          onArrowKeyPress={() => {}}
        />
      </div>
    </TerminalWindow>
  )
}
