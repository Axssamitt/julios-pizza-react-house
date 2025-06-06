
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Verificar se já está logado via localStorage
    const adminData = localStorage.getItem('admin_user');
    if (adminData) {
      navigate('/admin');
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('Tentando fazer login com:', { email, password });

    try {
      // Buscar usuário na tabela usuarios
      const { data: usuarios, error: queryError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .eq('senha', password)
        .eq('ativo', true);

      console.log('Resultado da consulta:', { usuarios, queryError });

      if (queryError) {
        console.error('Erro na consulta:', queryError);
        throw new Error('Erro ao verificar credenciais: ' + queryError.message);
      }

      if (!usuarios || usuarios.length === 0) {
        console.log('Nenhum usuário encontrado com essas credenciais');
        throw new Error('Email ou senha incorretos');
      }

      const usuario = usuarios[0];
      console.log('Usuário encontrado:', usuario);

      // Salvar dados do usuário no localStorage
      const adminUserData = {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome
      };

      localStorage.setItem('admin_user', JSON.stringify(adminUserData));
      console.log('Dados salvos no localStorage:', adminUserData);

      toast({
        title: "Sucesso",
        description: "Login realizado com sucesso!",
      });

      navigate('/admin');
    } catch (error: any) {
      console.error('Erro no login:', error);
      setError(error.message);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-orange-500 mx-auto mb-4">
            <img 
              src="https://storage.googleapis.com/wzukusers/user-34847409/images/5cf9a50e698b6eDiLZd7/logoo_d200.png" 
              alt="Júlio's Pizza House Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Júlio's Pizza House
          </CardTitle>
          <CardDescription className="text-gray-400">
            Acesso Administrativo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-gray-400">
            Usuário padrão: admin@juliopizza.com / admin123
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
