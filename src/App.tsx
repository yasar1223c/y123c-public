import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { CitizenRequest } from './pages/CitizenRequest';
import { PersonnelDashboard } from './pages/PersonnelDashboard';
import { MapProvider } from './context/MapContext';

function App() {
  return (
    <BrowserRouter>
      <MapProvider>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<CitizenRequest />} />
              <Route path="/personnel" element={<PersonnelDashboard />} />
            </Routes>
          </main>
        </div>
      </MapProvider>
    </BrowserRouter>
  );
}

export default App;