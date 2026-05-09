import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useVimEngine } from './useVimEngine'

describe('useVimEngine', () => {
  it('initializes with the given buffer', () => {
    const { result } = renderHook(() => useVimEngine(['hello', 'world']))
    expect(result.current.vimState.buffer).toEqual(['hello', 'world'])
    expect(result.current.vimState.cursor).toEqual({ row: 0, col: 0 })
  })

  it('returns arrowKeyCount starting at 0', () => {
    const { result } = renderHook(() => useVimEngine(['hello']))
    expect(result.current.arrowKeyCount).toBe(0)
  })

  it('reset reinitializes state with new buffer', () => {
    const { result } = renderHook(() => useVimEngine(['hello']))
    act(() => {
      result.current.reset(['new', 'buffer'])
    })
    expect(result.current.vimState.buffer).toEqual(['new', 'buffer'])
    expect(result.current.vimState.cursor).toEqual({ row: 0, col: 0 })
  })

  it('exposes vimState, arrowKeyCount, reset', () => {
    const { result } = renderHook(() => useVimEngine(['hello']))
    expect(result.current).toHaveProperty('vimState')
    expect(result.current).toHaveProperty('arrowKeyCount')
    expect(result.current).toHaveProperty('reset')
    expect(typeof result.current.reset).toBe('function')
  })
})
