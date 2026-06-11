/**
 * useAutoSync
 * 
 * Polls /portfolio/sync/prices every `intervalMs` milliseconds.
 * Stops polling when the tab is hidden or market is closed.
 * Returns the last sync time and a manual trigger function.
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { portfolioService } from '../services/apiServices'

const MARKET_OPEN_HOUR_IST  = 9    // 09:15
const MARKET_CLOSE_HOUR_IST = 15   // 15:30

function isMarketHours() {
  // Rough check in local time — backend does the precise check
  const now = new Date()
  const day = now.getDay()           // 0=Sun, 6=Sat
  if (day === 0 || day === 6) return false
  const h = now.getHours()
  return h >= MARKET_OPEN_HOUR_IST && h <= MARKET_CLOSE_HOUR_IST
}

export const useAutoSync = (onPriceUpdate, intervalMs = 60_000) => {
  const [lastSync, setLastSync] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const timerRef = useRef(null)

  const syncPrices = useCallback(async (quiet = false) => {
    if (!quiet) setSyncing(true)
    try {
      const res = await portfolioService.syncPrices()
      setLastSync(new Date())
      if (onPriceUpdate) onPriceUpdate(res.data)
    } catch {
      // silently ignore — prices just won't update
    } finally {
      if (!quiet) setSyncing(false)
    }
  }, [onPriceUpdate])

  const syncBrokers = useCallback(async () => {
    setSyncing(true)
    try {
      await portfolioService.syncPortfolio()
      setLastSync(new Date())
      if (onPriceUpdate) onPriceUpdate()
    } catch {
    } finally {
      setSyncing(false)
    }
  }, [onPriceUpdate])

  useEffect(() => {
    const schedule = () => {
      timerRef.current = setInterval(() => {
        if (!document.hidden && isMarketHours()) {
          syncPrices(true)
        }
      }, intervalMs)
    }
    schedule()
    return () => clearInterval(timerRef.current)
  }, [syncPrices, intervalMs])

  const lastSyncStr = lastSync
    ? lastSync.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null

  return { syncing, lastSyncStr, syncPrices, syncBrokers }
}
