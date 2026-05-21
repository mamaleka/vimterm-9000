import { useEffect, useRef } from 'react'
import { TerminalWindow } from '../components/ui/TerminalWindow'

interface Props {
  xpEarned: number
  stars: 1 | 2 | 3
  keystrokes: number
  timeMs: number
  parTime: number
  firstCompletion: boolean
  streakDays: number
  onContinue: () => void
}

export default function ChallengeCompleteScreen({
  xpEarned,
  stars,
  keystrokes,
  timeMs,
  parTime,
  firstCompletion,
  streakDays,
  onContinue,
}: Props) {
  const seconds = (timeMs / 1000).toFixed(2)
  const parSeconds = (parTime / 1000).toFixed(2)

  const continueRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    continueRef.current?.focus()
  }, [])

  return (
    <TerminalWindow>
      <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-8">
        <div className="text-crt-bright font-terminal text-3xl tracking-widest">
          MISSION COMPLETE
        </div>

        <div className="flex gap-4">
          {([1, 2, 3] as const).map((n) => (
            <span
              key={n}
              data-testid="star"
              data-filled={n <= stars ? 'true' : 'false'}
              className={
                n <= stars
                  ? 'text-crt-amber font-terminal text-4xl'
                  : 'text-crt-dim font-terminal text-4xl'
              }
            >
              ★
            </span>
          ))}
        </div>

        {firstCompletion && (
          <div className="border border-crt-amber px-4 py-1 text-crt-amber font-terminal text-sm tracking-widest">
            FIRST COMPLETION
          </div>
        )}

        {streakDays > 0 && (
          <div className="text-crt-text font-mono text-sm">
            STREAK x{streakDays} — {Math.min(streakDays * 5, 50)}% bonus
          </div>
        )}

        <div className="border border-crt-border p-6 w-full max-w-md flex flex-col gap-4">
          <div className="flex justify-between text-crt-dim font-mono text-xs">
            <span>XP EARNED</span>
            <span className="text-crt-bright font-terminal text-xl">{xpEarned}</span>
          </div>

          <div>
            <div className="text-crt-dim font-mono text-xs mb-1">XP BAR</div>
            <div className="border border-crt-border h-4 w-full overflow-hidden">
              <div
                data-testid="xp-bar-fill"
                className="h-full bg-crt-text transition-[width] duration-[600ms] ease-out"
                style={{ width: `${Math.min(100, xpEarned / 5)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-crt-dim font-mono text-xs">
            <div>
              <div>KEYSTROKES</div>
              <div className="text-crt-text">{keystrokes}</div>
            </div>
            <div>
              <div>TIME</div>
              <div className="text-crt-text">{seconds}s</div>
            </div>
            <div>
              <div>PAR TIME</div>
              <div className="text-crt-text">{parSeconds}s</div>
            </div>
          </div>
        </div>

        <button
          ref={continueRef}
          type="button"
          onClick={onContinue}
          className="border border-crt-text text-crt-text font-terminal px-8 py-2 tracking-widest hover:bg-crt-text hover:text-crt-bg transition-colors"
        >
          CONTINUE
        </button>
      </div>
    </TerminalWindow>
  )
}
