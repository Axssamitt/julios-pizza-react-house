
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
  tipo?: string; // Adicionado tipo opcional para compatibilidade inicial
}

const allTabs = [
  { value: "dashboard", label: "Dashboard", IconComponent: BarChart3 },
  { value: "home", label: "Home", IconComponent: Home },
  { value: "carousel", label: "Carrossel", IconComponent: Image },
  { value: "pizzas", label: "Pizzas", IconComponent: Pizza },
  { value: "instagram", label: "Instagram", IconComponent: Instagram },
  { value: "config", label: "Config", IconComponent: Settings },
  { value: "formularios", label: "Formulários", IconComponent: Users },
  { value: "contratos", label: "Contratos", IconComponent: FileText },
  { value: "usuarios", label: "Usuários", IconComponent: Shield },
];

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

  const userTipo = adminUser?.tipo;
  const filteredTabs = userTipo === 'restrito'
    ? allTabs.filter(tab => tab.value === 'formularios' || tab.value === 'contratos')
    : allTabs;

  const defaultTabValue = userTipo === 'restrito'
    ? (filteredTabs.length > 0 ? filteredTabs[0].value : '') // Default to first available tab for restrito
    : 'dashboard';


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
        <Tabs defaultValue={defaultTabValue} className="space-y-6">
          <TabsList
  className="bg-gray-800 border-gray-700 flex flex-wrap gap-1 mb-1 z-10"
>
  {filteredTabs.map(tab => (
    <TabsTrigger
      key={tab.value}
      value={tab.value}
      className="data-[state=active]:bg-orange-600 flex-1 min-w-[120px] sm:min-w-[140px]"
    >
      <tab.IconComponent className="mr-2" size={16} />
      {tab.label}
    </TabsTrigger>
  ))}
</TabsList>
          <div className={userTipo === 'restrito'?'pt-4 md:pt-0':'pt-28 md:pt-0'}> 
            {/* conteudo das tabs */}
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
      </div>
  </Tabs>
</main>
    </div>
  );
};

export default Admin;