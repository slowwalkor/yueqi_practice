import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import { AudioContextManager } from '../audio/AudioContextManager'

interface AudioState {
  initialized: boolean
  initialize: () => Promise<void>
  getManager: () => AudioContextManager
}

const AudioCtx = createContext<AudioState | null>(null)

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false)
  const managerRef = useRef(AudioContextManager.getInstance())

  const initialize = useCallback(async () => {
    if (initialized) return
    await managerRef.current.initialize()
    setInitialized(true)
  }, [initialized])

  const getManager = useCallback(() => managerRef.current, [])

  return (
    <AudioCtx.Provider value={{ initialized, initialize, getManager }}>
      {children}
    </AudioCtx.Provider>
  )
}

export function useAudio(): AudioState {
  const ctx = useContext(AudioCtx)
  if (!ctx) {
    throw new Error('useAudio must be used within AudioProvider')
  }
  return ctx
}
