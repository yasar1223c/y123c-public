import React, { createContext, useContext, useState } from 'react';
import type { AidRequest, AreaReport } from '../types';

interface MapContextType {
  requests: AidRequest[];
  addRequest: (request: AidRequest) => void;
  selectedArea: AreaReport | null;
  setSelectedArea: (report: AreaReport | null) => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export function MapProvider({ children }: { children: React.ReactNode }) {
  const [requests, setRequests] = useState<AidRequest[]>([]);
  const [selectedArea, setSelectedArea] = useState<AreaReport | null>(null);

  const addRequest = (request: AidRequest) => {
    setRequests(prev => [...prev, request]);
  };

  return (
    <MapContext.Provider value={{ requests, addRequest, selectedArea, setSelectedArea }}>
      {children}
    </MapContext.Provider>
  );
}

export function useMap() {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
}