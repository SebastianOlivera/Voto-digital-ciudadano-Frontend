import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, UserCheck, AlertCircle, Users, ArrowLeft, Eye, Lock, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

interface VotoObservado {
  id: number;
  credencial: string;
  fecha_hora: string;
  candidato_id: number;
}

const Mesa = () => {
  const navigate = useNavigate();
  const { circuito, username, role } = useAuth();
  const [credencial, setCredencial] = useState("");
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [authorizedCount, setAuthorizedCount] = useState(0);
  const [votosObservados, setVotosObservados] = useState<VotoObservado[]>([]);
  const [isClosingMesa, setIsClosingMesa] = useState(false);
  const [mesaEstado, setMesaEstado] = useState("abierta");
  const [showVotoObservado, setShowVotoObservado] = useState(false);
  const [votoObservadoData, setVotoObservadoData] = useState({
    credencial: "",
    circuitoOrigen: ""
  });
  const [isProcessingObservado, setIsProcessingObservado] = useState(false);
  
  const isPresidente = role === "presidente";

  const handleAuthorizeVoter = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credencial.trim()) {
      toast({
        title: "Error",
        description: "Por favor completa la credencial",
        variant: "destructive",
      });
      return;
    }

    if (!circuito) {
      toast({
        title: "Error",
        description: "No se ha detectado el circuito de la mesa",
        variant: "destructive",
      });
      return;
    }

    setIsAuthorizing(true);

    try {
      await apiService.enableVote({
        credencial: credencial,
        circuito: circuito?.numero_circuito || "001"
      });

      toast({
        title: "Votante autorizado",
        description: `Credencial ${credencial} habilitada para votar`,
      });

      setAuthorizedCount(prev => prev + 1);
      setCredencial("");
    } catch (error: any) {
      console.error('Error autorizando votante:', error);
      toast({
        title: "Error de autorización",
        description: error.message || "No se pudo autorizar al votante. Puede que ya esté habilitado.",
        variant: "destructive",
      });
    } finally {
      setIsAuthorizing(false);
    }
  };

  const handleVotoObservado = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!votoObservadoData.credencial.trim() || !votoObservadoData.circuitoOrigen.trim()) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    if (!circuito) {
      toast({
        title: "Error",
        description: "No se ha detectado el circuito de la mesa",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingObservado(true);

    try {
      await apiService.enableVote({
        credencial: votoObservadoData.credencial,
        circuito: votoObservadoData.circuitoOrigen,
        esEspecial: true,
        credencial_civica: votoObservadoData.credencial
      });

      toast({
        title: "Voto observado autorizado",
        description: `Votante autorizado para voto observado desde circuito ${votoObservadoData.circuitoOrigen}`,
        variant: "default",
      });

      setVotoObservadoData({ credencial: "", circuitoOrigen: "" });
      setShowVotoObservado(false);
    } catch (error) {
      console.error('Error autorizando voto observado:', error);
      toast({
        title: "Error de autorización",
        description: "No se pudo autorizar el voto observado.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingObservado(false);
    }
  };

  // Cargar votos observados si es presidente
  useEffect(() => {
    if (isPresidente && circuito) {
      loadVotosObservados();
    }
  }, [isPresidente, circuito]);

  const loadVotosObservados = async () => {
    try {
      const response = await apiService.getVotosObservados(circuito?.numero_circuito || "001");
      setVotosObservados(response);
    } catch (error) {
      console.error('Error cargando votos observados:', error);
    }
  };

  const handleValidarVotoObservado = async (votoId: number, accion: string) => {
    try {
      await apiService.validarVotoObservado({ voto_id: votoId, accion });
      toast({
        title: accion === "validar" ? "Voto validado" : "Voto rechazado",
        description: `El voto observado ha sido ${accion === "validar" ? "validado" : "rechazado"} exitosamente`,
      });
      loadVotosObservados(); // Recargar lista
    } catch (error) {
      console.error('Error validando voto:', error);
      toast({
        title: "Error",
        description: "No se pudo procesar el voto observado",
        variant: "destructive",
      });
    }
  };

  const handleCerrarMesa = async () => {
    if (!circuito) return;
    
    setIsClosingMesa(true);
    try {
      await apiService.cerrarMesa({ circuito: circuito?.numero_circuito || "001" });
      setMesaEstado("cerrada");
      toast({
        title: "Mesa cerrada",
        description: "La mesa ha sido cerrada exitosamente",
      });
    } catch (error) {
      console.error('Error cerrando mesa:', error);
      toast({
        title: "Error",
        description: "No se pudo cerrar la mesa",
        variant: "destructive",
      });
    } finally {
      setIsClosingMesa(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Volver</span>
            </Button>
            <div className="flex items-center space-x-3">
              <div className="bg-green-600 rounded-lg p-2">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Mesa Electoral - {username} {isPresidente && "(Presidente)"}
                </h1>
                <p className="text-sm text-gray-600">Circuito: {circuito?.numero_circuito}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Autorizados: {authorizedCount}
              </Badge>
              <Badge 
                variant={mesaEstado === "abierta" ? "default" : "destructive"}
                className={mesaEstado === "abierta" ? "bg-green-100 text-green-800" : ""}
              >
                {mesaEstado === "abierta" ? "Abierta" : "Cerrada"}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {isPresidente ? (
            <Tabs defaultValue="autorizar" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="autorizar">Autorizar Votantes</TabsTrigger>
                <TabsTrigger value="observados">Votos Observados ({votosObservados.length})</TabsTrigger>
                <TabsTrigger value="gestion">Gestión de Mesa</TabsTrigger>
              </TabsList>
              
              <TabsContent value="autorizar">
                <Card className="shadow-xl">
                  <CardHeader className="text-center">
                    <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                      <UserCheck className="h-8 w-8 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl">Autorización de Votantes</CardTitle>
                    <CardDescription>
                      Verifica la identidad del votante y autoriza su acceso a la cabina
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <Alert className="bg-blue-50 border-blue-200">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        <strong>Proceso:</strong> Verifica la credencial del votante, confirma su identidad y autoriza su ingreso a la cabina de votación.
                      </AlertDescription>
                    </Alert>

                    <form onSubmit={handleAuthorizeVoter} className="space-y-4">
                      <div>
                         <Label htmlFor="credencial">Credencial</Label>
                        <Input
                          id="credencial"
                          type="text"
                          placeholder="ABC123456"
                          value={credencial}
                          onChange={(e) => setCredencial(e.target.value)}
                          className="text-lg"
                          disabled={mesaEstado === "cerrada"}
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        size="lg"
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={isAuthorizing || mesaEstado === "cerrada"}
                      >
                        <CheckCircle className="h-5 w-5 mr-2" />
                        {isAuthorizing ? "Autorizando..." : "Autorizar Votante"}
                      </Button>
                    </form>

                    {/* Botón Voto Observado */}
                    <div className="mt-4">
                      <Button 
                        onClick={() => setShowVotoObservado(true)}
                        size="lg"
                        variant="outline"
                        className="w-full border-orange-500 text-orange-600 hover:bg-orange-50 hover:border-orange-600"
                        disabled={mesaEstado === "cerrada"}
                      >
                        <Eye className="h-5 w-5 mr-2" />
                        Voto Observado
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="observados">
                <Card className="shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Eye className="h-6 w-6 mr-2" />
                      Votos Observados
                    </CardTitle>
                    <CardDescription>
                      Votos que requieren validación presidencial
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    {votosObservados.length === 0 ? (
                      <div className="text-center py-8">
                        <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600">No hay votos observados pendientes</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {votosObservados.map((voto) => (
                          <div key={voto.id} className="border rounded-lg p-4 bg-yellow-50">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">Credencial: {voto.credencial}</p>
                                <p className="text-sm text-gray-600">
                                  Fecha: {new Date(voto.fecha_hora).toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Candidato ID: {voto.candidato_id || "Voto en blanco"}
                                </p>
                              </div>
                              <div className="space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleValidarVotoObservado(voto.id, "validar")}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Validar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleValidarVotoObservado(voto.id, "rechazar")}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Rechazar
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="gestion">
                <Card className="shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Lock className="h-6 w-6 mr-2" />
                      Gestión de Mesa
                    </CardTitle>
                    <CardDescription>
                      Funciones exclusivas del presidente de mesa
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <Alert className="bg-red-50 border-red-200">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        <strong>Atención:</strong> El cierre de mesa es irreversible y bloquea todas las operaciones de votación.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">Estado de la Mesa</h3>
                        <div className="flex items-center justify-between">
                          <span>Estado actual:</span>
                          <Badge 
                            variant={mesaEstado === "abierta" ? "default" : "destructive"}
                            className={mesaEstado === "abierta" ? "bg-green-100 text-green-800" : ""}
                          >
                            {mesaEstado === "abierta" ? "Abierta" : "Cerrada"}
                          </Badge>
                        </div>
                      </div>

                      {mesaEstado === "abierta" && (
                        <Button
                          onClick={handleCerrarMesa}
                          disabled={isClosingMesa}
                          variant="destructive"
                          size="lg"
                          className="w-full"
                        >
                          <Lock className="h-5 w-5 mr-2" />
                          {isClosingMesa ? "Cerrando Mesa..." : "Cerrar Mesa"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            // Vista para secretario/vocal (solo autorización)
            <Card className="shadow-xl">
              <CardHeader className="text-center">
                <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Autorización de Votantes</CardTitle>
                <CardDescription>
                  Verifica la identidad del votante y autoriza su acceso a la cabina
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Proceso:</strong> Verifica la credencial del votante, confirma su identidad y autoriza su ingreso a la cabina de votación.
                  </AlertDescription>
                </Alert>

                <form onSubmit={handleAuthorizeVoter} className="space-y-4">
                  <div>
                    <Label htmlFor="credencial">Credencial</Label>
                    <Input
                      id="credencial"
                      type="text"
                      placeholder="ABC123456"
                      value={credencial}
                      onChange={(e) => setCredencial(e.target.value)}
                      className="text-lg"
                      disabled={mesaEstado === "cerrada"}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    size="lg"
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isAuthorizing || mesaEstado === "cerrada"}
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    {isAuthorizing ? "Autorizando..." : "Autorizar Votante"}
                  </Button>
                </form>

                {/* Botón Voto Observado para no presidentes */}
                <div className="mt-4">
                  <Button 
                    onClick={() => setShowVotoObservado(true)}
                    size="lg"
                    variant="outline"
                    className="w-full border-orange-500 text-orange-600 hover:bg-orange-50 hover:border-orange-600"
                    disabled={mesaEstado === "cerrada"}
                  >
                    <Eye className="h-5 w-5 mr-2" />
                    Voto Observado
                  </Button>
                </div>

                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Instrucciones:</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                    <li>Solicita al votante su credencial</li>
                    <li>Verifica que la credencial corresponde a la persona</li>
                    <li>Ingresa el número de credencial</li>
                    <li>Autoriza al votante para que ingrese a la cabina</li>
                    <li>El votante puede proceder a votar en la cabina</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Modal para Voto Observado */}
      {showVotoObservado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Voto Observado</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowVotoObservado(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>

              <Alert className="mb-6 bg-orange-50 border-orange-200">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>Voto Observado:</strong> Para personas que votan fuera de su circuito de origen.
                </AlertDescription>
              </Alert>

              <form onSubmit={handleVotoObservado} className="space-y-4">
                <div>
                  <Label htmlFor="credencial">Credencial</Label>
                  <Input
                    id="credencial"
                    type="text"
                    placeholder="ABC123456"
                    value={votoObservadoData.credencial}
                    onChange={(e) => setVotoObservadoData(prev => ({ ...prev, credencial: e.target.value }))}
                    className="mt-1"
                    disabled={isProcessingObservado}
                  />
                </div>

                <div>
                  <Label htmlFor="circuitoOrigen">ID del Circuito de Origen</Label>
                  <Input
                    id="circuitoOrigen"
                    type="text"
                    placeholder="001"
                    value={votoObservadoData.circuitoOrigen}
                    onChange={(e) => setVotoObservadoData(prev => ({ ...prev, circuitoOrigen: e.target.value }))}
                    className="mt-1"
                    disabled={isProcessingObservado}
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowVotoObservado(false)}
                    disabled={isProcessingObservado}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                    disabled={isProcessingObservado}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {isProcessingObservado ? "Procesando..." : "Autorizar Voto Observado"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mesa;