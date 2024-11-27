import React from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCircle } from 'lucide-react';

export function Navigation() {
  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Users className="h-6 w-6" />
            <span className="font-bold text-lg">Afet Yardım Sistemi</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-indigo-700 transition"
            >
              <UserCircle className="h-5 w-5" />
              <span>Vatandaş</span>
            </Link>
            <Link
              to="/personnel"
              className="flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-indigo-700 transition"
            >
              <Users className="h-5 w-5" />
              <span>Personel</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}