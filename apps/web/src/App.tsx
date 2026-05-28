import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import Dashboard from './screens/Dashboard'
import Suppliers from './screens/Suppliers'
import NewSupplier from './screens/NewSupplier'
import SupplierDetail from './screens/SupplierDetail'
import NewNcr from './screens/NewNcr'
import Ncrs from './screens/Ncrs'
import Categories from './screens/Categories'
import CategoryDetail from './screens/CategoryDetail'
import Scorecards from './screens/Scorecards'
import Contracts from './screens/Contracts'
import Spend from './screens/Spend'
import Esg from './screens/Esg'
import Insights from './screens/Insights'
import Showcase from './screens/Showcase'

const Landing = lazy(() => import('./screens/Landing'))

// Esc → return to root of current context.
// /app/* → /app · / and /app → no-op (already at root).
function KeyboardNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement | null
      const typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
      if (e.key !== 'Escape' || typing) return
      if (pathname === '/' || pathname === '/app') return
      if (pathname.startsWith('/app')) navigate('/app')
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
        <Route path="/" element={
          <Suspense fallback={null}>
            <Landing />
          </Suspense>
        } />
        <Route path="/app" element={<Dashboard />} />
        <Route path="/app/suppliers" element={<Suppliers />} />
        <Route path="/app/suppliers/new" element={<NewSupplier />} />
        <Route path="/app/suppliers/:id" element={<SupplierDetail />} />
        <Route path="/app/ncr/new" element={<NewNcr />} />
        <Route path="/app/ncrs" element={<Ncrs />} />
        <Route path="/app/categories" element={<Categories />} />
        <Route path="/app/categories/:key" element={<CategoryDetail />} />
        <Route path="/app/contracts" element={<Contracts />} />
        <Route path="/app/insights" element={<Insights />} />
        <Route path="/app/scorecards" element={<Scorecards />} />
        <Route path="/app/esg" element={<Esg />} />
        <Route path="/app/spend" element={<Spend />} />
        <Route path="/app/showcase" element={<Showcase />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
