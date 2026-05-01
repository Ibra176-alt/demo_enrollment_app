import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Farmers from './pages/Farmers'
import OfflineFarmers from './pages/OfflineFarmers'
import { useFarmers } from './hooks/useFarmers'

export default function App() {
  const {
    farmers,
    offlineFarmers,
    syncedFarmers,
    addFarmer,
    syncFarmer,
    syncAll,
    deleteFarmer,
  } = useFarmers()

  return (
    <div className="layout">
      <Navbar offlineCount={offlineFarmers.length} />
      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                farmers={farmers}
                offlineFarmers={offlineFarmers}
                syncedFarmers={syncedFarmers}
              />
            }
          />
          <Route
            path="/farmers"
            element={
              <Farmers
                farmers={farmers}
                addFarmer={addFarmer}
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
        </Routes>
      </main>
    </div>
  )
}
