import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import Dashboard from './screens/Dashboard'
import Suppliers from './screens/Suppliers'
import NewSupplier from './screens/NewSupplier'
import SupplierDetail from './screens/SupplierDetail'
import NewNcr from './screens/NewNcr'
import Ncrs from './screens/Ncrs'
import Categories from './screens/Categories'
import Scorecards from './screens/Scorecards'
import Contracts from './screens/Contracts'
import Spend from './screens/Spend'
import Esg from './screens/Esg'
import Insights from './screens/Insights'
import Showcase from './screens/Showcase'

// Esc → back to dashboard from any non-root screen (HANDOFF §7), ignoring text fields.
function KeyboardNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement | null
      const typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
      if (e.key === 'Escape' && !typing && pathname !== '/') navigate('/')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate, pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <KeyboardNav />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/suppliers/new" element={<NewSupplier />} />
        <Route path="/suppliers/:id" element={<SupplierDetail />} />
        <Route path="/ncr/new" element={<NewNcr />} />
        <Route path="/ncrs" element={<Ncrs />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/contracts" element={<Contracts />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/scorecards" element={<Scorecards />} />
        <Route path="/esg" element={<Esg />} />
        <Route path="/spend" element={<Spend />} />
        <Route path="/showcase" element={<Showcase />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
