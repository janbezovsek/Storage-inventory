import { AdminProvider } from './context/AdminProvider'
import Navbar from './components/Navbar'
import InventoryList from './components/InventoryList'

function App() {
  return (
    <AdminProvider>
      <Navbar />
      <InventoryList />
    </AdminProvider>
  )
}

export default App