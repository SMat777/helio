import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './screens/Dashboard'
import Showcase from './screens/Showcase'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/showcase" element={<Showcase />} />
      </Routes>
    </BrowserRouter>
  )
}
