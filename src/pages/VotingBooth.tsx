
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Vote, Check, Shield, User, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiService, Partido, Candidato } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

const VotingBooth = () => {
  const { circuito, isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [cedula, setCedula] = useState("");
  const [cedulaLimpia, setCedulaLimpia] = useState("");
  const [selectedVote, setSelectedVote] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [comprobante, setComprobante] = useState("");

  useEffect(() => {
    // Cargar candidatos al montar el componente
    const loadCandidatos = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.getCandidatos();
        setPartidos(data);
      } catch (error) {
        console.error('Error cargando candidatos:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los candidatos",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCandidatos();
  }, []);

  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cedulaNormalizada = cedula.replace(/[.-\s]/g, ''); // Remover puntos, guiones y espacios
    if (!cedulaNormalizada.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu cédula de identidad",
        variant: "destructive",
      });
      return;
    }

    setCedulaLimpia(cedulaNormalizada); // Guardar la cédula normalizada
    setIsVerifying(true);
    
    try {
      // Verificar si el votante está autorizado por la mesa
      // Usar el circuito del contexto de autenticación
      const currentCircuito = circuito?.numero_circuito || "1"; // Fallback a "1" si no hay circuito
      const votanteData = await apiService.getVotante(currentCircuito, cedulaNormalizada);
      
      if (votanteData && votanteData.estado === 'HABILITADA') {
        toast({
          title: "Votante autorizado",
          description: "Procede a emitir tu voto",
        });
        setStep(2);
      } else {
        toast({
          title: "No autorizado",
          description: "Debes ser autorizado por la mesa electoral antes de votar",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error verificando autorización:', error);
      toast({
        title: "Error de verificación",
        description: "No se pudo verificar tu autorización. Consulta con la mesa electoral.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVoteSelection = (voteValue: string) => {
    setSelectedVote(voteValue);
  };

  const handleSubmitVote = async () => {
    if (!selectedVote) {
      toast({
        title: "Selección requerida",
        description: "Debes seleccionar una opción: candidato, voto en blanco o voto anulado",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Determinar el candidato_id basado en la selección
      let candidatoId: number;
      
      if (selectedVote === 'blank') {
        candidatoId = 0; // Asumiendo que 0 es voto en blanco
      } else if (selectedVote === 'annulled') {
        candidatoId = -1; // Asumiendo que -1 es voto anulado
      } else {
        candidatoId = parseInt(selectedVote);
      }

      const response = await apiService.votar({
        cedula: cedulaLimpia,
        candidato_id: candidatoId
      });

      // Extraer el comprobante del mensaje de respuesta
      const comprobanteMatch = response.mensaje.match(/Comprobante: (C\d{3}-\d{5})/);
      if (comprobanteMatch) {
        setComprobante(comprobanteMatch[1]);
      }

      setStep(3);
      
      toast({
        title: "¡Voto registrado exitosamente!",
        description: response.mensaje,
      });
      
        setTimeout(() => {
          // Reiniciar la aplicación para el próximo votante
          setStep(1);
          setCedula("");
          setCedulaLimpia("");
          setSelectedVote("");
          setComprobante("");
        }, 3000);

    } catch (error) {
      console.error('Error al votar:', error);
      toast({
        title: "Error al votar",
        description: "Hubo un problema al registrar tu voto. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener el nombre del candidato seleccionado para mostrar
  const getSelectedCandidateName = () => {
    if (selectedVote === 'blank') return 'Voto en Blanco';
    if (selectedVote === 'annulled') return 'Voto Anulado';
    
    for (const partido of partidos) {
      const candidato = partido.candidatos.find(c => c.id.toString() === selectedVote);
      if (candidato) {
        return `${candidato.nombre} (${partido.partido})`;
      }
    }
    return '';
  };

  // Verificar que hay una mesa autenticada
  if (!isAuthenticated || !circuito) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <Card className="shadow-xl max-w-md">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="bg-red-100 rounded-full p-6 w-20 h-20 mx-auto mb-8">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Mesa No Autenticada</h2>
            <p className="text-lg text-gray-600 mb-4">
              La cabina de votación requiere que una mesa electoral esté autenticada.
            </p>
            <p className="text-md text-gray-500">
              Por favor, contacta al personal electoral para activar la cabina.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header Minimalista */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 rounded-lg p-3">
                <Vote className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Cabina de Votación</h1>
                <p className="text-lg text-gray-600">Elecciones Presidenciales 2024</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {step === 1 && (
          <div className="max-w-lg mx-auto">
            <Card className="shadow-xl">
              <CardHeader className="text-center pb-8">
                <div className="bg-blue-100 rounded-full p-6 w-20 h-20 mx-auto mb-6">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-3xl mb-4">Identificación del Votante</CardTitle>
                <CardDescription className="text-lg">
                  Ingresa tu cédula de identidad para proceder a votar
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <Alert className="mb-8 bg-green-50 border-green-200">
                  <Shield className="h-5 w-5 text-green-600" />
                  <AlertDescription className="text-green-800 font-medium">
                    Tu voto es secreto y seguro. El sistema garantiza el anonimato.
                  </AlertDescription>
                </Alert>

                <form onSubmit={handleCredentialSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="cedula" className="text-lg font-semibold">Cédula de Identidad</Label>
                    <Input
                      id="cedula"
                      type="text"
                      placeholder="Ej: 12345678"
                      value={cedula}
                      onChange={(e) => setCedula(e.target.value)}
                      className="text-center text-2xl py-4 mt-2"
                    />
                    <p className="text-sm text-gray-500 mt-2">Ingresa solo números, sin puntos ni guiones</p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    size="lg"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-4"
                    disabled={isVerifying}
                  >
                    {isVerifying ? "Verificando..." : "Proceder a Votar"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Papeleta Presidencial</h2>
              <p className="text-xl text-gray-600">Selecciona tu candidato preferido o el tipo de voto</p>
            </div>

            {isLoading ? (
              <div className="text-center">
                <p>Cargando candidatos...</p>
              </div>
            ) : (
              <Card className="shadow-xl">
                <CardHeader className="bg-blue-50">
                  <CardTitle className="text-2xl text-center">
                    Presidente y Vicepresidente de la República
                  </CardTitle>
                  <CardDescription className="text-center text-lg">
                    Selecciona UNA opción
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid gap-6">
                    {/* Candidatos por partido */}
                    {partidos.map((partido) => (
                      partido.candidatos.map((candidato) => (
                        <div
                          key={candidato.id}
                          className={`p-6 border-3 rounded-xl cursor-pointer transition-all duration-300 ${
                            selectedVote === candidato.id.toString()
                              ? 'border-blue-500 bg-blue-50 shadow-lg'
                              : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                          }`}
                          onClick={() => handleVoteSelection(candidato.id.toString())}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-2xl font-bold mb-2">{candidato.nombre}</h3>
                              <p className="text-lg text-gray-600">{partido.partido}</p>
                            </div>
                            <div className={`w-8 h-8 rounded-full border-3 flex items-center justify-center ${
                              selectedVote === candidato.id.toString()
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-400'
                            }`}>
                              {selectedVote === candidato.id.toString() && (
                                <Check className="h-5 w-5 text-white" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ))}
                    
                    {/* Voto en Blanco */}
                    <div
                      className={`p-6 border-3 rounded-xl cursor-pointer transition-all duration-300 ${
                        selectedVote === 'blank'
                          ? 'border-gray-500 bg-gray-100 shadow-lg'
                          : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                      onClick={() => handleVoteSelection('blank')}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-2xl font-bold mb-2">Voto en Blanco</h3>
                          <p className="text-lg text-gray-600">No seleccionar ningún candidato</p>
                        </div>
                        <div className={`w-8 h-8 rounded-full border-3 flex items-center justify-center ${
                          selectedVote === 'blank'
                            ? 'border-gray-500 bg-gray-500'
                            : 'border-gray-400'
                        }`}>
                          {selectedVote === 'blank' && (
                            <Check className="h-5 w-5 text-white" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Voto Anulado */}
                    <div
                      className={`p-6 border-3 rounded-xl cursor-pointer transition-all duration-300 ${
                        selectedVote === 'annulled'
                          ? 'border-red-500 bg-red-50 shadow-lg'
                          : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                      onClick={() => handleVoteSelection('annulled')}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-2xl font-bold mb-2">Voto Anulado</h3>
                          <p className="text-lg text-gray-600">Anular la papeleta electoral</p>
                        </div>
                        <div className={`w-8 h-8 rounded-full border-3 flex items-center justify-center ${
                          selectedVote === 'annulled'
                            ? 'border-red-500 bg-red-500'
                            : 'border-gray-400'
                        }`}>
                          {selectedVote === 'annulled' && (
                            <X className="h-5 w-5 text-white" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 flex justify-center">
                    <Button
                      onClick={handleSubmitVote}
                      size="lg"
                      className="bg-green-600 hover:bg-green-700 px-12 py-4 text-xl"
                      disabled={isLoading}
                    >
                      <Vote className="h-6 w-6 mr-3" />
                      {isLoading ? "Registrando..." : "Confirmar Voto"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="max-w-lg mx-auto text-center">
            <Card className="shadow-xl">
              <CardContent className="pt-12 pb-12">
                <div className="bg-green-100 rounded-full p-6 w-20 h-20 mx-auto mb-8">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">¡Voto Registrado!</h2>
                <p className="text-xl text-gray-600 mb-4">
                  Tu voto ha sido registrado de forma segura y anónima.
                </p>
                {comprobante && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">Número de Comprobante:</h3>
                    <p className="text-3xl font-bold text-blue-900 font-mono tracking-wider">
                      {comprobante}
                    </p>
                    <p className="text-sm text-blue-600 mt-2">
                      Guarda este número como comprobante de tu voto
                    </p>
                  </div>
                )}
                <p className="text-lg text-gray-500 mb-8">
                  Selección: <strong>{getSelectedCandidateName()}</strong>
                </p>
                <p className="text-lg text-gray-600 mb-8">
                  Gracias por participar en la democracia.
                </p>
                <div className="text-lg text-gray-500">
                  La cabina se reiniciará automáticamente para el próximo votante...
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default VotingBooth;
