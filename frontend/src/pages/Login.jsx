// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../components/ui/card';
import { PartyPopper, Mail, Lock, User } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;

      if (isLogin) {
        // LOGIN
        result = await login(formData.email, formData.password);
      } else {
        // CADASTRO
        result = await register(
          formData.name,
          formData.email,
          formData.password
        );
      }

      console.log('AUTH RESULT ->', result);

      if (!result.success) {
        toast({
          title: 'Erro',
          description: result.message || 'Ocorreu um erro. Tente novamente.',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Sucesso!',
        description: isLogin
          ? 'Login realizado com sucesso!'
          : 'Conta criada com sucesso!'
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Erro no handleSubmit:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro inesperado.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const toggleMode = () => {
    setIsLogin((prev) => !prev);
    // limpa o formulário ao alternar
    setFormData({ name: '', email: '', password: '' });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          'linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FDC830 100%)'
      }}
    >
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full">
              <PartyPopper className="w-10 h-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">
            {isLogin ? 'Bem-vindo!' : 'Criar Conta'}
          </CardTitle>
          <CardDescription className="text-base">
            {isLogin
              ? 'Entre para gerenciar seus eventos'
              : 'Crie sua conta e comece a organizar eventos incríveis'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* autoComplete desligado no form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
            autoComplete="off"
          >
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nome
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                  className="h-11"
                  autoComplete="off"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="h-11"
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Senha
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="h-11"
                autoComplete="new-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-all duration-300 shadow-lg hover:shadow-xl"
              disabled={loading}
            >
              {loading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Criar Conta'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              {isLogin ? 'Não tem uma conta? ' : 'Já tem uma conta? '}
              <span className="font-semibold text-orange-600 hover:text-orange-700">
                {isLogin ? 'Cadastre-se' : 'Faça login'}
              </span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
