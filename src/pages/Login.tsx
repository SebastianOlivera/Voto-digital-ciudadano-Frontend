
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Shield, User, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.username || !credentials.password) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const role = await login(credentials.username, credentials.password);

      toast({
        title: "Acceso autorizado",
        description: role === 'superadmin' ? "Bienvenido Administrador" : "Bienvenido Presidente de Mesa",
      });
      
      // Redirigir según el rol
      if (role === 'superadmin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error de login:', error);
      toast({
        title: "Credenciales incorrectas",
        description: "Usuario o contraseña inválidos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al Inicio</span>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Acceso Autorizado</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder al panel de administración
              <br />
              <small className="text-muted-foreground">Usuario: presidente001 / Contraseña: password123</small>
            </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Alert className="mb-6">
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  Este acceso está restringido solo para autoridades de mesa
                </AlertDescription>
              </Alert>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="username">Usuario</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Ingresa tu usuario"
                      value={credentials.username}
                      onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Ingresa tu contraseña"
                      value={credentials.password}
                      onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Verificando..." : "Iniciar Sesión"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Información de Seguridad */}
        <Card className="max-w-2xl mx-auto mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Sistema de Autoridades de Mesa</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <h4 className="font-semibold mb-2">Funciones de la Autoridad de Mesa</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Supervisar el proceso electoral</li>
                <li>• Validar votos observados</li>
                <li>• Cerrar mesa de votación</li>
                <li>• Generar reportes del proceso</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default LoginPage;
