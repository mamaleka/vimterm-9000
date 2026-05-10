interface Props {
  hint: string | null
}

export function HintPanel({ hint }: Props) {
  if (hint === null) {
    return null
  }

  return (
    <div className="text-crt-dim font-mono text-sm px-2 py-1">
      {hint}
    </div>
  )
}
