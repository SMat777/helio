import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Showcase from './screens/Showcase'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/showcase" replace />} />
        <Route path="/showcase" element={<Showcase />} />
      </Routes>
    </BrowserRouter>
  )
}
