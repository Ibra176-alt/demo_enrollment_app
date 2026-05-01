import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Farmers from './pages/Farmers'
import OfflineFarmers from './pages/OfflineFarmers'
import Reports from './pages/Reports'
import { useFarmers } from './hooks/useFarmers'

export default function App() {
  const {
    farmers, offlineFarmers, syncedFarmers,
    activity, addFarmer, updateFarmer, deleteFarmer,
    syncFarmer, syncAll,
  } = useFarmers()

  return (
    <div className="layout">
      <Navbar offlineCount={offlineFarmers.length} />

      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                farmers={farmers}
                offlineFarmers={offlineFarmers}
                syncedFarmers={syncedFarmers}
                activity={activity}
              />
            }
          />
          <Route
            path="/farmers"
            element={
              <Farmers
                farmers={farmers}
                addFarmer={addFarmer}
                updateFarmer={updateFarmer}
                deleteFarmer={deleteFarmer}
              />
            }
          />
          <Route
            path="/offline"
            element={
              <OfflineFarmers
                offlineFarmers={offlineFarmers}
                syncFarmer={syncFarmer}
                syncAll={syncAll}
              />
            }
          />
          <Route
            path="/reports"
            element={
              <Reports
                farmers={farmers}
                activity={activity}
              />
            }
          />
        </Routes>
      </main>
    </div>
  )
}
