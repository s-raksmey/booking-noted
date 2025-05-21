'use client';

import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoginModal from './LoginModal';
import { useState } from 'react';

export default function Header() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <nav className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-2">
          <Calendar className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-blue-600">BookingNoted</span>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" className="text-gray-600 hover:text-blue-600">
            Features
          </Button>
          <Button variant="ghost" className="text-gray-600 hover:text-blue-600">
            Pricing
          </Button>
          <Button variant="ghost" className="text-gray-600 hover:text-blue-600">
            Contact
          </Button>
          <Button
            onClick={() => setShowLogin(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Sign In
          </Button>
        </div>
      </nav>
      <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}