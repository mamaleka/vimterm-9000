import { useEffect } from 'react'

interface Options {
  onKey: (key: string) => void
  onArrowKey: () => void
}

const ARROW_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'])

export function useKeyCapture({ onKey, onArrowKey }: Options): void {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      const { key, ctrlKey, altKey, metaKey } = e

      if (ARROW_KEYS.has(key)) {
        onArrowKey()
        return
      }

      if (altKey || metaKey) return

      if (ctrlKey) {
        if (key === 'o') { onKey('<C-o>'); return }
        if (key === 'i') { onKey('<C-i>'); return }
        return
      }

      onKey(key)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onKey, onArrowKey])
}
