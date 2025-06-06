
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { LogOut, Pizza, Settings, FileText, Users, BarChart3, Home, Image, Instagram, Shield } from 'lucide-react';
import { PizzaManager } from '@/components/admin/PizzaManager';
import { ConfigManager } from '@/components/admin/ConfigManager';
import { FormularioManager } from '@/components/admin/FormularioManager';
import { ContratoManager } from '@/components/admin/ContratoManager';
import { Dashboard } from '@/components/admin/Dashboard';
import { HomeConfigManager } from '@/components/admin/HomeConfigManager';
import { CarouselManager } from '@/components/admin/CarouselManager';
import { UserManager } from '@/components/admin/UserManager';
import { InstagramManager } from '@/components/admin/InstagramManager';

interface AdminUser {
  id: string;
  email: string;
  nome: string;
}

const Admin = () => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se existe um usuário admin logado
    const adminData = localStorage.getItem('admin_user');
    if (adminData) {
      try {
        const user = JSON.parse(adminData);
        setAdminUser(user);
      } catch (error) {
        console.error('Erro ao recuperar dados do admin:', error);
        localStorage.removeItem('admin_user');
        navigate('/auth');
      }
    } else {
      navigate('/auth');
    }
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin_user');
    setAdminUser(null);
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (!adminUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-orange-500">
              <img 
                src="https://storage.googleapis.com/wzukusers/user-34847409/images/5cf9a50e698b6eDiLZd7/logoo_d200.png" 
                alt="Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold">Júlio's Pizza House - Admin</h1>
              <p className="text-gray-400 text-sm">{adminUser.email}</p>
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
          <TabsList className="bg-gray-800 border-gray-700 grid grid-cols-4 lg:grid-cols-9 gap-1">
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
            <TabsTrigger value="instagram" className="data-[state=active]:bg-orange-600">
              <Instagram className="mr-2" size={16} />
              Instagram
            </TabsTrigger>
            <TabsTrigger value="config" className="data-[state=active]:bg-orange-600">
              <Settings className="mr-2" size={16} />
              Config
            </TabsTrigger>
            <TabsTrigger value="formularios" className="data-[state=active]:bg-orange-600">
              <Users className="mr-2" size={16} />
              Formulários
            </TabsTrigger>
            <TabsTrigger value="contratos" className="data-[state=active]:bg-orange-600">
              <FileText className="mr-2" size={16} />
              Contratos
            </TabsTrigger>
            <TabsTrigger value="usuarios" className="data-[state=active]:bg-orange-600">
              <Shield className="mr-2" size={16} />
              Usuários
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

          <TabsContent value="instagram">
            <InstagramManager />
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

          <TabsContent value="usuarios">
            <UserManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
