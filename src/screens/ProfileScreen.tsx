import { useStore } from '../store'
import { TerminalWindow } from '../components/ui/TerminalWindow'
import { achievements } from '../data/achievements'

function formatTime(seconds: number): string {
  if (seconds >= 3600) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }
  if (seconds >= 60) {
    const m = Math.floor(seconds / 60)
    return `${m}m`
  }
  return `${seconds}s`
}

function getOpacityClass(count: number): string {
  if (count === 0) return 'opacity-20'
  if (count <= 5) return 'opacity-40'
  if (count <= 15) return 'opacity-60'
  if (count <= 30) return 'opacity-80'
  return 'opacity-100'
}

function getLast30Days(): string[] {
  const days: string[] = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setUTCDate(d.getUTCDate() - i)
    const yyyy = d.getUTCFullYear()
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
    const dd = String(d.getUTCDate()).padStart(2, '0')
    days.push(`${yyyy}-${mm}-${dd}`)
  }
  return days
}

export function ProfileScreen() {
  const navigateTo = useStore((s) => s.navigateTo)
  const displayName = useStore((s) => s.displayName)
  const level = useStore((s) => s.level)
  const title = useStore((s) => s.title)
  const unlockedAchievements = useStore((s) => s.unlockedAchievements)
  const statistics = useStore((s) => s.statistics)
  const streak = useStore((s) => s.streak)

  const days = getLast30Days()

  return (
    <TerminalWindow>
      <div className="flex flex-col gap-6 p-6 text-crt-text font-terminal">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-crt-bright font-terminal text-2xl tracking-widest">PROFILE</h1>
          <button
            data-testid="back-button"
            onClick={() => navigateTo('home')}
            className="text-crt-text font-mono border border-crt-border px-3 py-1 hover:text-crt-bright"
          >
            ← BACK
          </button>
        </div>
        <div className="border border-crt-border p-4" data-testid="player-card">
          <div className="text-crt-bright text-3xl" data-testid="player-name">
            {displayName}
          </div>
          <div className="text-crt-dim text-sm">LVL {level}</div>
          <div className="text-crt-amber text-sm">{title}</div>
          <div className="text-crt-dim text-xs mt-1">
            STREAK: {streak.current} / BEST: {streak.longest}
          </div>
        </div>

        <div className="border border-crt-border p-4" data-testid="stats-section">
          <div className="text-crt-dim text-xs mb-2">TOTAL STATS</div>
          <div className="flex gap-8">
            <div>
              <div className="text-crt-bright text-2xl" data-testid="total-keystrokes">
                {statistics.totalKeystrokesRecorded}
              </div>
              <div className="text-crt-dim text-xs">KEYSTROKES</div>
            </div>
            <div>
              <div className="text-crt-bright text-2xl" data-testid="total-time">
                {formatTime(statistics.totalTimeSpent)}
              </div>
              <div className="text-crt-dim text-xs">TIME SPENT</div>
            </div>
          </div>
        </div>

        <div className="border border-crt-border p-4" data-testid="heatmap-section">
          <div className="text-crt-dim text-xs mb-2">30-DAY ACTIVITY</div>
          <div className="flex flex-wrap gap-1">
            {days.map((day) => {
              const count = statistics.dailyActivity[day] ?? 0
              return (
                <div
                  key={day}
                  data-testid="heatmap-cell"
                  title={`${day}: ${count}`}
                  className={`w-4 h-4 bg-crt-text ${getOpacityClass(count)}`}
                />
              )
            })}
          </div>
        </div>

        <div className="border border-crt-border p-4" data-testid="achievement-gallery">
          <div className="text-crt-dim text-xs mb-2">ACHIEVEMENTS</div>
          <div className="flex flex-col gap-2">
            {achievements.map((ach) => {
              const unlock = unlockedAchievements[ach.id]
              if (unlock) {
                return (
                  <div key={ach.id} className="flex flex-col" data-testid={`achievement-${ach.id}`}>
                    <span className="text-crt-bright text-sm">{ach.name}</span>
                    <span className="text-crt-dim text-xs">{unlock.unlockedAt.slice(0, 10)}</span>
                  </div>
                )
              }
              return (
                <div key={ach.id} className="flex flex-col" data-testid={`achievement-${ach.id}-locked`}>
                  <span className="text-crt-dim text-sm">???</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </TerminalWindow>
  )
}
