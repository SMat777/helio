import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import Dashboard from './screens/Dashboard'
import Suppliers from './screens/Suppliers'
import SupplierDetail from './screens/SupplierDetail'
import NewNcr from './screens/NewNcr'
import Ncrs from './screens/Ncrs'
import Placeholder from './screens/Placeholder'
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
        <Route path="/suppliers/:id" element={<SupplierDetail />} />
        <Route path="/ncr/new" element={<NewNcr />} />
        <Route path="/ncrs" element={<Ncrs />} />
        <Route path="/categories" element={<Placeholder title="Categories" />} />
        <Route path="/contracts" element={<Placeholder title="Contracts" />} />
        <Route path="/insights" element={<Placeholder title="Insights" />} />
        <Route path="/scorecards" element={<Placeholder title="Scorecards" />} />
        <Route path="/esg" element={<Placeholder title="ESG" />} />
        <Route path="/spend" element={<Placeholder title="Spend" />} />
        <Route path="/showcase" element={<Showcase />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
