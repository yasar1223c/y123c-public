import React, { useState } from 'react';
import { useMap } from '../context/MapContext';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import type { LatLngTuple } from 'leaflet';

function LocationPicker({ onLocationSelect }: { onLocationSelect: (coords: LatLngTuple) => void }) {
  const map = useMapEvents({
    click(e) {
      onLocationSelect([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export function CitizenRequest() {
  const { addRequest } = useMap();
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    tc: '',
    address: '',
    coordinates: null as LatLngTuple | null,
    items: {
      blankets: 0,
      diapers: 0,
      foodBoxes: 0,
      waterBottles: 0,
      hygieneKits: 0
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('items.')) {
      const itemName = name.split('.')[1];
      const numValue = Math.max(0, parseInt(value) || 0); // Ensure non-negative numbers
      setFormData(prev => ({
        ...prev,
        items: {
          ...prev.items,
          [itemName]: numValue
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleLocationSelect = (coords: LatLngTuple) => {
    setFormData(prev => ({
      ...prev,
      coordinates: coords
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.coordinates) {
      alert('Lütfen haritadan konum seçiniz');
      return;
    }
    addRequest({
      id: Date.now().toString(),
      ...formData,
      coordinates: formData.coordinates
    });
    alert('Talebiniz başarıyla kaydedildi');
    // Reset form
    setFormData({
      name: '',
      surname: '',
      tc: '',
      address: '',
      coordinates: null,
      items: {
        blankets: 0,
        diapers: 0,
        foodBoxes: 0,
        waterBottles: 0,
        hygieneKits: 0
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Yardım Talebi Formu</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Ad</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Soyad</label>
              <input
                type="text"
                name="surname"
                value={formData.surname}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">TC Kimlik No</label>
            <input
              type="text"
              name="tc"
              value={formData.tc}
              onChange={handleInputChange}
              pattern="[0-9]{11}"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Adres</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Konum</label>
            <div className="h-[400px] rounded-lg overflow-hidden">
              <MapContainer
                center={[39.9334, 32.8597]}
                zoom={13}
                className="h-full w-full"
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationPicker onLocationSelect={handleLocationSelect} />
                {formData.coordinates && (
                  <Marker position={formData.coordinates} />
                )}
              </MapContainer>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Haritada konumunuzu işaretlemek için tıklayın
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">İhtiyaç Listesi</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Battaniye (Adet)</label>
                <input
                  type="number"
                  name="items.blankets"
                  value={formData.items.blankets}
                  onChange={handleInputChange}
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Bebek Bezi (Paket)</label>
                <input
                  type="number"
                  name="items.diapers"
                  value={formData.items.diapers}
                  onChange={handleInputChange}
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Gıda Kolisi</label>
                <input
                  type="number"
                  name="items.foodBoxes"
                  value={formData.items.foodBoxes}
                  onChange={handleInputChange}
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Su (Adet)</label>
                <input
                  type="number"
                  name="items.waterBottles"
                  value={formData.items.waterBottles}
                  onChange={handleInputChange}
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Hijyen Paketi</label>
                <input
                  type="number"
                  name="items.hygieneKits"
                  value={formData.items.hygieneKits}
                  onChange={handleInputChange}
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Talep Oluştur
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}