
'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Dog, Star, ExternalLink, Loader2, Coffee, Trees } from 'lucide-react';
import Link from 'next/link';
import parksData from './data/dog_parks.json';
import placesData from './data/pet_friendly.json';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('./components/Map'), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl flex items-center justify-center text-slate-400">Se încarcă harta...</div>
});

interface LocationItem {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  description: string;
  rating: number;
  type?: string;
  distance?: number;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'parks' | 'places'>('parks');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [items, setItems] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data based on tab
  useEffect(() => {
    const data = activeTab === 'parks' ? parksData : placesData;
    if (location) {
      // Re-sort if location exists
      const sorted = data.map((item) => ({
        ...item,
        distance: calculateDistance(location.lat, location.lng, item.lat, item.lng),
      })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
      setItems(sorted);
    } else {
      setItems(data);
    }
  }, [activeTab, location]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  };

  const deg2rad = (deg: number) => deg * (Math.PI / 180);

  const handleGetLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Browserul tău nu suportă geolocația.");
      setLoading(false);
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds timeout
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        setLocation({ lat: userLat, lng: userLng });
        setLoading(false);
      },
      (err) => {
        console.error("Geolocation error:", err);
        let errorMessage = "Nu am putut obține locația.";

        if (err.code === 1) { // PERMISSION_DENIED
          errorMessage = "Accesul la locație a fost refuzat. Te rugăm să permiți accesul din setările browserului.";
        } else if (err.code === 2) { // POSITION_UNAVAILABLE
          errorMessage = "Informațiile despre locație nu sunt disponibile.";
        } else if (err.code === 3) { // TIMEOUT
          errorMessage = "Cererea pentru locație a expirat. Încearcă din nou.";
        }

        setError(errorMessage);
        setLoading(false);
      },
      options
    );
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 font-sans">
      {/* Hero Section */}
      <div className={`text-white p-8 rounded-b-[3rem] shadow-xl relative overflow-hidden transition-colors duration-500 ${activeTab === 'parks' ? 'bg-emerald-600 dark:bg-emerald-800' : 'bg-orange-500 dark:bg-orange-700'}`}>
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
          {activeTab === 'parks' ? <Dog size={240} /> : <Coffee size={240} />}
        </div>
        <div className="max-w-xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl font-extrabold mb-3 tracking-tight">Bark Bucharest 🐾</h1>
          <p className="text-white/90 mb-8 text-lg font-medium">Ghidul tău urban pentru o viață fericită cu patrupedul.</p>

          {/* Toggle Switch */}
          <div className="flex bg-black/20 backdrop-blur-sm p-1.5 rounded-full mb-8 max-w-sm mx-auto">
            <button
              onClick={() => setActiveTab('parks')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'parks' ? 'bg-white text-emerald-700 shadow-md' : 'text-white/80 hover:bg-white/10'}`}
            >
              <Trees size={16} /> Țarcuri & Parcuri
            </button>
            <button
              onClick={() => setActiveTab('places')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'places' ? 'bg-white text-orange-600 shadow-md' : 'text-white/80 hover:bg-white/10'}`}
            >
              <Coffee size={16} /> Pet Friendly
            </button>
          </div>

          <Link href="/submit" className="inline-flex items-center gap-1 text-white/70 hover:text-white text-xs font-bold mb-6 hover:underline transition-all">
            + Adaugă o locație lipsă
          </Link>

          <button
            onClick={handleGetLocation}
            disabled={loading}
            className="bg-white text-slate-800 hover:bg-slate-50 active:scale-95 transition-all px-8 py-4 rounded-full font-bold shadow-lg flex items-center justify-center gap-3 w-full sm:w-auto mx-auto border border-white/20"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Navigation size={20} className={activeTab === 'parks' ? 'text-emerald-500' : 'text-orange-500'} />}
            {loading ? "Se localizează..." : "Găsește Locații Lângă Mine"}
          </button>
          {error && <p className="text-red-200 mt-4 text-sm bg-red-900/40 p-2 rounded-lg backdrop-blur-sm inline-block">{error}</p>}
        </div>
      </div>

      {/* Map Section */}
      <div className="max-w-2xl mx-auto px-4 mt-16 mb-8 relative z-20">
        <div className="shadow-2xl rounded-3xl overflow-hidden border-4 border-white dark:border-slate-800">
          <Map parks={items} userLocation={location} />
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        <div className="flex items-center justify-between px-2 mb-2">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            {activeTab === 'parks' ? <Trees className="text-emerald-500" /> : <Coffee className="text-orange-500" />}
            {activeTab === 'parks' ? 'Parcuri' : 'Locații Pet Friendly'}
          </h2>
          {location && <span className="text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full">Sortat după distanță</span>}
        </div>

        {items.map((item) => (
          <div key={item.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-start gap-3">
                <div className={`mt-1 p-2 rounded-xl text-white ${activeTab === 'parks' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                  {activeTab === 'parks' ? <Dog size={20} /> : <Coffee size={20} />}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 leading-tight">{item.name}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs flex items-center gap-1 mt-1">
                    <MapPin size={12} /> {item.address}
                  </p>
                </div>
              </div>
              {item.distance !== undefined && (
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${activeTab === 'parks' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                  {item.distance} km
                </span>
              )}
            </div>

            <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 pl-[3.25rem]">
              {item.description}
            </p>

            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-3 pl-[3.25rem]">
              <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                <Star size={16} fill="currentColor" />
                {item.rating}
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-sm font-bold flex items-center gap-1 hover:underline ${activeTab === 'parks' ? 'text-emerald-600' : 'text-orange-600'}`}
              >
                Navighează <ExternalLink size={14} />
              </a>
            </div>
          </div>
        ))}

        <div className="h-10"></div>
      </div>
    </main>
  );
}
