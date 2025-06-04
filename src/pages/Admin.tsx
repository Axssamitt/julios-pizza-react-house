
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { LogOut, Pizza, Settings, FileText, Users, BarChart3, Home, Image } from 'lucide-react';
import { PizzaManager } from '@/components/admin/PizzaManager';
import { ConfigManager } from '@/components/admin/ConfigManager';
import { FormularioManager } from '@/components/admin/FormularioManager';
import { ContratoManager } from '@/components/admin/ContratoManager';
import { Dashboard } from '@/components/admin/Dashboard';
import { HomeConfigManager } from '@/components/admin/HomeConfigManager';
import { CarouselManager } from '@/components/admin/CarouselManager';

const Admin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate('/auth');
      }
      setLoading(false);
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate('/auth');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-orange-500">
              <img 
                src="/lovable-uploads/67b1b7fb-0eda-4d5b-bfc2-5c77a6bea10e.png" 
                alt="Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold">Júlio's Pizza House - Admin</h1>
              <p className="text-gray-400 text-sm">{user.email}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <LogOut className="mr-2" size={16} />
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-orange-600">
              <BarChart3 className="mr-2" size={16} />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="home" className="data-[state=active]:bg-orange-600">
              <Home className="mr-2" size={16} />
              Home
            </TabsTrigger>
            <TabsTrigger value="carousel" className="data-[state=active]:bg-orange-600">
              <Image className="mr-2" size={16} />
              Carrossel
            </TabsTrigger>
            <TabsTrigger value="pizzas" className="data-[state=active]:bg-orange-600">
              <Pizza className="mr-2" size={16} />
              Pizzas
            </TabsTrigger>
            <TabsTrigger value="config" className="data-[state=active]:bg-orange-600">
              <Settings className="mr-2" size={16} />
              Configurações
            </TabsTrigger>
            <TabsTrigger value="formularios" className="data-[state=active]:bg-orange-600">
              <Users className="mr-2" size={16} />
              Formulários
            </TabsTrigger>
            <TabsTrigger value="contratos" className="data-[state=active]:bg-orange-600">
              <FileText className="mr-2" size={16} />
              Contratos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="home">
            <HomeConfigManager />
          </TabsContent>

          <TabsContent value="carousel">
            <CarouselManager />
          </TabsContent>

          <TabsContent value="pizzas">
            <PizzaManager />
          </TabsContent>

          <TabsContent value="config">
            <ConfigManager />
          </TabsContent>

          <TabsContent value="formularios">
            <FormularioManager />
          </TabsContent>

          <TabsContent value="contratos">
            <ContratoManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
