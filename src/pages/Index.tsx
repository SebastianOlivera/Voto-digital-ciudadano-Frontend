
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Vote, Users, BarChart3, Settings, LogIn, UserCheck, AlertTriangle, Monitor } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, username, circuito, logout } = useAuth();
  const [eleccionInfo, setEleccionInfo] = useState<any>(null);
  const [stats, setStats] = useState({
    totalVotes: 0,
    totalVoters: 0,
    participation: 0,
    observedVotes: 0,
    closedTables: 0,
    totalTables: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEleccionInfo = async () => {
      try {
        const info = await apiService.getEleccionActiva();
        setEleccionInfo(info);
      } catch (error) {
        console.error('Error cargando información de la elección:', error);
      }
    };
    loadEleccionInfo();
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Intentar obtener resultados reales del backend
        const resultados = await apiService.getResultados();
        
        // Actualizar estadísticas con datos reales
        setStats({
          totalVotes: resultados.total_votos || 0,
          totalVoters: resultados.total_votantes || 0,
          participation: resultados.participacion || 0,
          observedVotes: resultados.votos_observados || 0,
          closedTables: resultados.mesas_cerradas || 0,
          totalTables: resultados.total_mesas || 0
        });
      } catch (error) {
        console.error('Error cargando estadísticas:', error);
        // Mantener valores en 0 si no hay datos
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 rounded-lg p-2">
                <Vote className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sistema Electoral</h1>
                <p className="text-sm text-gray-600">Elecciones Presidenciales {eleccionInfo?.año || 2024}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">Mesa: {username}</p>
                    {circuito && (
                      <>
                        <p className="text-xs text-gray-600">Circuito: {circuito.numero_circuito}</p>
                        <p className="text-xs text-gray-600">{circuito.establecimiento.nombre}</p>
                        <p className="text-xs text-gray-500">{circuito.establecimiento.ciudad}, {circuito.establecimiento.departamento}</p>
                      </>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="flex items-center space-x-2"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/')}
                  className="flex items-center space-x-2"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Iniciar Sesión</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Estado de la Elección */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
            <span>Votación en Curso</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Elecciones Presidenciales {eleccionInfo?.año || 2024}
          </h2>
        </div>


        {/* Acciones Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Mesa Electoral */}
          <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white hover:shadow-xl transition-all duration-300 cursor-pointer" onClick={() => navigate('/mesa')}>
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 p-6 rounded-lg">
                  <UserCheck className="h-12 w-12" />
                </div>
                <div>
                  <CardTitle className="text-2xl mb-2">Mesa Electoral</CardTitle>
                  <CardDescription className="text-green-100 text-base">Autorización de votantes</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <p className="text-green-100 mb-6 text-base leading-relaxed">
                Verifica identidad y autoriza el acceso a la cabina de votación
              </p>
              <Button className="w-full bg-white text-green-600 hover:bg-green-50 font-semibold py-3 text-lg">
                <UserCheck className="h-5 w-5 mr-3" />
                Autorizar Votantes
              </Button>
            </CardContent>
          </Card>

          {/* Cabina de Votación */}
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:shadow-xl transition-all duration-300 cursor-pointer" onClick={() => navigate('/cabina')}>
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 p-6 rounded-lg">
                  <Monitor className="h-12 w-12" />
                </div>
                <div>
                  <CardTitle className="text-2xl mb-2">Cabina de Votación</CardTitle>
                  <CardDescription className="text-blue-100 text-base">Para ciudadanos votantes</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <p className="text-blue-100 mb-6 text-base leading-relaxed">
                Acceso directo para emitir voto (requiere autorización previa)
              </p>
              <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 font-semibold py-3 text-lg">
                <Vote className="h-5 w-5 mr-3" />
                Acceder a Votar
              </Button>
            </CardContent>
          </Card>

        </div>

      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 Sistema Electoral Nacional. Todos los derechos reservados.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Versión 1.0 | Contacto: soporte@electoral.gov
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
