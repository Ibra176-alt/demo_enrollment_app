import { useState, useCallback } from 'react'

const FARMERS_KEY  = 'herveg_farmers_v2'
const ACTIVITY_KEY = 'herveg_activity_v2'

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function saveJSON(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

function logActivity(logs, action, farmerName, details = '') {
  const entry = {
    id: crypto.randomUUID(),
    action,
    farmerName,
    details,
    timestamp: new Date().toISOString(),
  }
  const updated = [entry, ...logs].slice(0, 200)
  saveJSON(ACTIVITY_KEY, updated)
  return updated
}

export function useFarmers() {
  const [farmers,  setFarmers]  = useState(() => loadJSON(FARMERS_KEY,  []))
  const [activity, setActivity] = useState(() => loadJSON(ACTIVITY_KEY, []))

  const addFarmer = useCallback((data) => {
    const farmer = {
      id: crypto.randomUUID(),
      ...data,
      plotSize: Number(data.plotSize),
      synced: false,
      syncedAt: null,
      enrolledAt: new Date().toISOString(),
      updatedAt:  new Date().toISOString(),
    }
    setFarmers(prev => {
      const updated = [farmer, ...prev]
      saveJSON(FARMERS_KEY, updated)
      return updated
    })
    setActivity(prev => logActivity(prev, 'enrolled', `${data.firstName} ${data.lastName}`, `Region: ${data.region}`))
    return farmer
  }, [])

  const updateFarmer = useCallback((id, data) => {
    setFarmers(prev => {
      const updated = prev.map(f =>
        f.id === id
          ? { ...f, ...data, plotSize: Number(data.plotSize), updatedAt: new Date().toISOString() }
          : f
      )
      saveJSON(FARMERS_KEY, updated)
      return updated
    })
    setActivity(prev => logActivity(prev, 'updated', `${data.firstName} ${data.lastName}`, 'Profile updated'))
  }, [])

  const deleteFarmer = useCallback((id) => {
    setFarmers(prev => {
      const farmer = prev.find(f => f.id === id)
      const updated = prev.filter(f => f.id !== id)
      saveJSON(FARMERS_KEY, updated)
      if (farmer) {
        setActivity(a => logActivity(a, 'deleted', `${farmer.firstName} ${farmer.lastName}`, 'Record removed'))
      }
      return updated
    })
  }, [])

  const syncFarmer = useCallback((id) => {
    setFarmers(prev => {
      const farmer = prev.find(f => f.id === id)
      const updated = prev.map(f =>
        f.id === id ? { ...f, synced: true, syncedAt: new Date().toISOString() } : f
      )
      saveJSON(FARMERS_KEY, updated)
      if (farmer) {
        setActivity(a => logActivity(a, 'synced', `${farmer.firstName} ${farmer.lastName}`, 'Synced with server'))
      }
      return updated
    })
  }, [])

  const syncAll = useCallback(() => {
    const now = new Date().toISOString()
    setFarmers(prev => {
      const unsynced = prev.filter(f => !f.synced)
      const updated  = prev.map(f => f.synced ? f : { ...f, synced: true, syncedAt: now })
      saveJSON(FARMERS_KEY, updated)
      if (unsynced.length) {
        setActivity(a => logActivity(a, 'sync_all', `${unsynced.length} farmers`, `Batch sync completed`))
      }
      return updated
    })
  }, [])

  const clearActivity = useCallback(() => {
    setActivity([])
    saveJSON(ACTIVITY_KEY, [])
  }, [])

  const offlineFarmers = farmers.filter(f => !f.synced)
  const syncedFarmers  = farmers.filter(f =>  f.synced)

  return {
    farmers,
    offlineFarmers,
    syncedFarmers,
    activity,
    addFarmer,
    updateFarmer,
    deleteFarmer,
    syncFarmer,
    syncAll,
    clearActivity,
  }
}
