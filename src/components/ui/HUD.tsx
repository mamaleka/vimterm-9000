import { useStore } from '../../store'
import { XPBar } from './XPBar'

export function HUD() {
  const xp = useStore((s) => s.xp)
  const level = useStore((s) => s.level)
  const streak = useStore((s) => s.streak)

  return (
    <div className="flex flex-col gap-1 px-4 py-2 bg-crt-surface border-b border-crt-border text-crt-text font-terminal text-sm">
      <div className="flex items-center justify-between">
        <span>
          LV <span className="text-crt-bright">{level}</span>
          {' '}
          XP <span className="text-crt-bright">{xp}</span>
        </span>
        {streak.current > 0 && (
          <span data-testid="streak-badge" className="text-crt-amber">
            {streak.current}🔥
          </span>
        )}
      </div>
      <XPBar xp={xp} />
    </div>
  )
}
