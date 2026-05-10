interface HealthBarProps {
  current: number
  max: number
  label?: string
}

export function HealthBar({ current, max, label }: HealthBarProps) {
  const pct = max > 0 ? Math.round((current / max) * 100) : 0
  const isLow = pct <= 30

  return (
    <div data-testid="health-bar" className="w-full">
      {label && (
        <span className="text-xs text-crt-text-dim uppercase tracking-widest">{label}</span>
      )}
      <div className="w-full h-3 bg-crt-surface border border-crt-border overflow-hidden">
        <div
          data-testid="health-bar-fill"
          className={isLow ? 'h-full bg-crt-red' : 'h-full bg-crt-text'}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
