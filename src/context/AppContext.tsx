import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { CheckinRecord, StatsData } from '../storage/checkinStore'
import * as checkinStore from '../storage/checkinStore'
import { getToday } from '../utils/dateUtils'

interface AppState {
  stats: StatsData | null
  todayCheckin: CheckinRecord | null
  loading: boolean
}

interface AppContextType extends AppState {
  checkin: (record: CheckinRecord) => Promise<void>
  refreshStats: () => Promise<void>
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [todayCheckin, setTodayCheckin] = useState<CheckinRecord | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const [statsData, todayData] = await Promise.all([
        checkinStore.getStats(),
        checkinStore.getCheckin(getToday())
      ])
      setStats(statsData)
      setTodayCheckin(todayData)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const checkin = useCallback(async (record: CheckinRecord) => {
    await checkinStore.saveCheckin(record)
    const newStats = await checkinStore.getStats()
    setStats(newStats)
    setTodayCheckin(record)
  }, [])

  const refreshStats = useCallback(async () => {
    const newStats = await checkinStore.updateStats()
    setStats(newStats)
    const todayData = await checkinStore.getCheckin(getToday())
    setTodayCheckin(todayData)
  }, [])

  return (
    <AppContext.Provider value={{ stats, todayCheckin, loading, checkin, refreshStats }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext(): AppContextType {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used within AppProvider')
  return ctx
}
