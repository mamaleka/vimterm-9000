import { xpToLevel, levelToXPThreshold } from '../../utils/xp'

interface Props {
  xp: number
}

export function XPBar({ xp }: Props) {
  const level = xpToLevel(xp)
  const levelStart = levelToXPThreshold(level)
  const levelEnd = levelToXPThreshold(level + 1)
  const range = levelEnd - levelStart
  const progress = range > 0 ? Math.min(((xp - levelStart) / range) * 100, 100) : 0
  const widthPct = `${Math.floor(progress)}%`

  return (
    <div
      data-testid="xpbar-container"
      className="w-full h-2 bg-crt-border rounded-none overflow-hidden"
    >
      <div
        data-testid="xpbar-fill"
        className="h-full bg-crt-text"
        style={{ width: widthPct }}
      />
    </div>
  )
}
