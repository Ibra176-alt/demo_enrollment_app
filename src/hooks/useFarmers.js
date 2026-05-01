import { useState, useCallback } from 'react'

const STORAGE_KEY = 'herveg_farmers'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function save(farmers) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(farmers))
}

export function useFarmers() {
  const [farmers, setFarmers] = useState(load)

  const addFarmer = useCallback((data) => {
    const farmer = {
      id: crypto.randomUUID(),
      ...data,
      synced: false,
      enrolledAt: new Date().toISOString(),
    }
    setFarmers(prev => {
      const updated = [farmer, ...prev]
      save(updated)
      return updated
    })
    return farmer
  }, [])

  const syncFarmer = useCallback((id) => {
    setFarmers(prev => {
      const updated = prev.map(f =>
        f.id === id ? { ...f, synced: true, syncedAt: new Date().toISOString() } : f
      )
      save(updated)
      return updated
    })
  }, [])

  const syncAll = useCallback(() => {
    setFarmers(prev => {
      const updated = prev.map(f =>
        f.synced ? f : { ...f, synced: true, syncedAt: new Date().toISOString() }
      )
      save(updated)
      return updated
    })
  }, [])

  const deleteFarmer = useCallback((id) => {
    setFarmers(prev => {
      const updated = prev.filter(f => f.id !== id)
      save(updated)
      return updated
    })
  }, [])

  const offlineFarmers = farmers.filter(f => !f.synced)
  const syncedFarmers  = farmers.filter(f => f.synced)

  return { farmers, offlineFarmers, syncedFarmers, addFarmer, syncFarmer, syncAll, deleteFarmer }
}
