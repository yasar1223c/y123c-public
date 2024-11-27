import React, { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Rectangle, useMapEvents, useMap } from 'react-leaflet';
import { useMap as useMapContext } from '../context/MapContext';
import type { LatLngBounds, LatLngTuple } from 'leaflet';
import * as turf from '@turf/turf';
import 'leaflet/dist/leaflet.css';

function AreaSelector({ onAreaSelect }: { onAreaSelect: (bounds: LatLngBounds) => void }) {
  const [startPoint, setStartPoint] = useState<LatLngTuple | null>(null);
  const [endPoint, setEndPoint] = useState<LatLngTuple | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const map = useMap();

  useMapEvents({
    mousedown(e) {
      if (e.originalEvent.shiftKey) {
        setIsDrawing(true);
        setStartPoint([e.latlng.lat, e.latlng.lng]);
        setEndPoint(null);
        map.dragging.disable();
      }
    },
    mousemove(e) {
      if (isDrawing && startPoint) {
        setEndPoint([e.latlng.lat, e.latlng.lng]);
      }
    },
    mouseup(e) {
      if (isDrawing && startPoint) {
        const endPoint: LatLngTuple = [e.latlng.lat, e.latlng.lng];
        const bounds = new L.LatLngBounds(startPoint, endPoint);
        onAreaSelect(bounds);
        setIsDrawing(false);
        setStartPoint(null);
        setEndPoint(null);
        map.dragging.enable();
      }
    },
  });

  return (
    <>
      {startPoint && endPoint && (
        <Rectangle
          bounds={new L.LatLngBounds(startPoint, endPoint)}
          pathOptions={{ color: 'blue', weight: 1, fillOpacity: 0.2 }}
        />
      )}
    </>
  );
}

function SelectionInstructions() {
  return (
    <div className="absolute top-4 left-4 z-[1000] bg-white p-3 rounded-lg shadow-md">
      <p className="text-sm text-gray-700">
        <span className="font-semibold">Alan Seçimi:</span> SHIFT tuşuna basılı tutarak fare ile sürükleyin
      </p>
    </div>
  );
}

export function PersonnelDashboard() {
  const { requests, selectedArea, setSelectedArea } = useMapContext();
  const [bounds, setBounds] = useState<LatLngBounds | null>(null);
  const [contactInfo, setContactInfo] = useState({
    phone: '',
    email: ''
  });

  const handleAreaSelect = useCallback((bounds: LatLngBounds) => {
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    
    // Seçilen alanı polygon olarak oluştur
    const bbox = [
      sw.lng, // minX
      sw.lat, // minY
      ne.lng, // maxX
      ne.lat  // maxY
    ];
    const selectedArea = turf.bboxPolygon(bbox);

    // Talepleri filtrele
    const selectedRequests = requests.filter(request => {
      // [longitude, latitude] formatında point oluştur
      const point = turf.point([request.coordinates[1], request.coordinates[0]]);
      return turf.booleanPointInPolygon(point, selectedArea);
    });

    const report = {
      totalRequests: selectedRequests.length,
      items: selectedRequests.reduce((acc, curr) => ({
        blankets: acc.blankets + curr.items.blankets,
        diapers: acc.diapers + curr.items.diapers,
        foodBoxes: acc.foodBoxes + curr.items.foodBoxes,
        waterBottles: acc.waterBottles + curr.items.waterBottles,
        hygieneKits: acc.hygieneKits + curr.items.hygieneKits,
      }), {
        blankets: 0,
        diapers: 0,
        foodBoxes: 0,
        waterBottles: 0,
        hygieneKits: 0,
      }),
      coordinates: selectedRequests.map(r => r.coordinates),
    };

    setSelectedArea(report);
    setBounds(bounds);
  }, [requests, setSelectedArea]);

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const sendRoute = () => {
    if (!selectedArea || !bounds) return;
    if (!contactInfo.phone && !contactInfo.email) {
      alert('Lütfen en az bir iletişim bilgisi giriniz (telefon veya e-posta)');
      return;
    }
    
    const center = bounds.getCenter();
    const routeInfo = `
      Seçili Alan Merkezi: ${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}
      Toplam Talep: ${selectedArea.totalRequests}
      Malzemeler:
      - Battaniye: ${selectedArea.items.blankets}
      - Bebek Bezi: ${selectedArea.items.diapers}
      - Gıda Kolisi: ${selectedArea.items.foodBoxes}
      - Su: ${selectedArea.items.waterBottles}
      - Hijyen Paketi: ${selectedArea.items.hygieneKits}
    `;
    
    const contactMethods = [];
    if (contactInfo.phone) contactMethods.push('SMS');
    if (contactInfo.email) contactMethods.push('e-posta');
    
    alert(`Rota bilgisi ${contactMethods.join(' ve ')} ile gönderildi!\n\n${routeInfo}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Personel Kontrol Paneli</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="h-[600px] rounded-lg overflow-hidden relative">
              <MapContainer
                center={[39.9334, 32.8597]}
                zoom={13}
                className="h-full w-full"
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <SelectionInstructions />
                <AreaSelector onAreaSelect={handleAreaSelect} />
                {requests.map(request => (
                  <Marker
                    key={request.id}
                    position={request.coordinates as LatLngTuple}
                  />
                ))}
                {bounds && (
                  <Rectangle
                    bounds={bounds}
                    pathOptions={{ color: 'blue', weight: 2, fillOpacity: 0.1 }}
                  />
                )}
              </MapContainer>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Seçili Alan Raporu</h2>
              {selectedArea ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Toplam Talep: <span className="font-semibold">{selectedArea.totalRequests}</span>
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Battaniye: <span className="font-semibold">{selectedArea.items.blankets}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Bebek Bezi: <span className="font-semibold">{selectedArea.items.diapers}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Gıda Kolisi: <span className="font-semibold">{selectedArea.items.foodBoxes}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Su: <span className="font-semibold">{selectedArea.items.waterBottles}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Hijyen Paketi: <span className="font-semibold">{selectedArea.items.hygieneKits}</span>
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Telefon Numarası
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={contactInfo.phone}
                        onChange={handleContactChange}
                        placeholder="05XX XXX XX XX"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        E-posta Adresi
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={contactInfo.email}
                        onChange={handleContactChange}
                        placeholder="ornek@email.com"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <button
                    onClick={sendRoute}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-150"
                  >
                    Rotayı Gönder
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  SHIFT tuşuna basılı tutarak haritada bir alan seçin
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}