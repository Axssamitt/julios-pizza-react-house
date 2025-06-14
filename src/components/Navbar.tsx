
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('userType');
    navigate('/auth');
  };

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-orange-400 text-xl font-bold">
              Júlio's Pizza House
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/cardapio" className="text-white hover:text-orange-400">
              Cardápio
            </Link>
            <Link to="/admin" className="text-white hover:text-orange-400">
              Admin
            </Link>
            <Button onClick={handleLogout} variant="outline" size="sm">
              Sair
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
