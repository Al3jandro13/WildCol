import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Mapa from './pages/Mapa';
import Simulador from './pages/Simulador';
import Timeline from './pages/Timeline';
import Extincion from './pages/Extincion';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: '#0a1628' }}>
        <main style={{ flex: 1, overflowY: 'auto', paddingBottom: '60px' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/mapa" replace />} />
            <Route path="/mapa" element={<Mapa />} />
            <Route path="/simulador" element={<Simulador />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/extincion" element={<Extincion />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
