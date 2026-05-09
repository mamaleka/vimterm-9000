import { useState, useCallback } from 'react'
import type { VimState } from '../types/vim'
import { processKey, createInitialState } from '../engine/vimEngine'
import { useKeyCapture } from './useKeyCapture'

export function useVimEngine(initialBuffer: string[]) {
  const [vimState, setVimState] = useState<VimState>(() => createInitialState(initialBuffer))
  const [arrowKeyCount, setArrowKeyCount] = useState(0)

  const handleKey = useCallback((key: string) => {
    setVimState(prev => processKey(prev, key))
  }, [])

  const handleArrowKey = useCallback(() => {
    setArrowKeyCount(prev => prev + 1)
  }, [])

  useKeyCapture({ onKey: handleKey, onArrowKey: handleArrowKey })

  const reset = useCallback((newBuffer: string[]) => {
    setVimState(createInitialState(newBuffer))
    setArrowKeyCount(0)
  }, [])

  return { vimState, arrowKeyCount, reset }
}
