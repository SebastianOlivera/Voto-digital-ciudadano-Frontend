
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Vote, ArrowLeft, Check, AlertCircle, User, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const VotePage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [credential, setCredential] = useState("");
  const [selectedVotes, setSelectedVotes] = useState<Record<string, string>>({});
  const [isVerifying, setIsVerifying] = useState(false);

  // Datos simulados de papeletas
  const ballots = [
    {
      id: "presidente",
      title: "Presidente y Vicepresidente",
      type: "single",
      candidates: [
        { id: "1", name: "Juan Pérez - María González", party: "Partido Azul", color: "blue" },
        { id: "2", name: "Ana Rodríguez - Carlos López", party: "Partido Verde", color: "green" },
        { id: "3", name: "Luis Martín - Sofia Castro", party: "Partido Rojo", color: "red" },
      ]
    },
    {
      id: "senado",
      title: "Senado Nacional",
      type: "single",
      candidates: [
        { id: "4", name: "Lista 1 - Partido Azul", party: "Partido Azul", color: "blue" },
        { id: "5", name: "Lista 2 - Partido Verde", party: "Partido Verde", color: "green" },
        { id: "6", name: "Lista 3 - Partido Rojo", party: "Partido Rojo", color: "red" },
      ]
    }
  ];

  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credential.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu credencial cívica",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    
    // Simulación de verificación
    setTimeout(() => {
      setIsVerifying(false);
      if (credential === "12345678") {
        toast({
          title: "Credencial verificada",
          description: "Acceso autorizado al sistema de votación",
        });
        setStep(2);
      } else {
        toast({
          title: "Credencial no válida",
          description: "Verifica tu número de credencial cívica",
          variant: "destructive",
        });
      }
    }, 2000);
  };

  const handleVoteSelection = (ballotId: string, candidateId: string) => {
    setSelectedVotes(prev => ({
      ...prev,
      [ballotId]: candidateId
    }));
  };

  const handleSubmitVote = () => {
    const allBallots = ballots.length;
    const selectedBallots = Object.keys(selectedVotes).length;

    if (selectedBallots === 0) {
      toast({
        title: "Voto incompleto",
        description: "Debes seleccionar al menos una opción para votar",
        variant: "destructive",
      });
      return;
    }

    setStep(3);
    
    setTimeout(() => {
      toast({
        title: "¡Voto registrado exitosamente!",
        description: "Tu voto ha sido contabilizado de forma segura",
      });
      setTimeout(() => navigate('/'), 3000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => step === 1 ? navigate('/') : setStep(1)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Volver</span>
            </Button>
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 rounded-lg p-2">
                <Vote className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Sistema de Votación</h1>
                <p className="text-sm text-gray-600">Seguro y Confidencial</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {step === 1 && (
          <div className="max-w-md mx-auto">
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">Verificación de Identidad</CardTitle>
                <CardDescription>
                  Ingresa tu credencial cívica para acceder al sistema de votación
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-6">
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Tu voto es secreto y seguro. El sistema no asocia tu identidad con tu elección.
                  </AlertDescription>
                </Alert>

                <form onSubmit={handleCredentialSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="credential">Credencial Cívica</Label>
                    <Input
                      id="credential"
                      type="text"
                      placeholder="Ingresa tu número de credencial"
                      value={credential}
                      onChange={(e) => setCredential(e.target.value)}
                      className="text-center text-lg"
                      maxLength={8}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isVerifying}
                  >
                    {isVerifying ? "Verificando..." : "Verificar y Continuar"}
                  </Button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                  <p>¿Problemas con tu credencial?</p>
                  <p>Contacta a las autoridades de mesa</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Emitir Voto</h2>
              <p className="text-gray-600">Selecciona tus candidatos para cada cargo</p>
              <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800">
                Credencial verificada
              </Badge>
            </div>

            <div className="space-y-8">
              {ballots.map((ballot) => (
                <Card key={ballot.id} className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center space-x-2">
                      <span>{ballot.title}</span>
                      {selectedVotes[ballot.id] && (
                        <Check className="h-5 w-5 text-green-600" />
                      )}
                    </CardTitle>
                    <CardDescription>Selecciona una opción</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {ballot.candidates.map((candidate) => (
                        <div
                          key={candidate.id}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedVotes[ballot.id] === candidate.id
                              ? `border-${candidate.color}-500 bg-${candidate.color}-50`
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() => handleVoteSelection(ballot.id, candidate.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-lg">{candidate.name}</h4>
                              <p className="text-gray-600">{candidate.party}</p>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              selectedVotes[ballot.id] === candidate.id
                                ? `border-${candidate.color}-500 bg-${candidate.color}-500`
                                : 'border-gray-300'
                            }`}>
                              {selectedVotes[ballot.id] === candidate.id && (
                                <Check className="h-4 w-4 text-white" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <div
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedVotes[ballot.id] === 'blank'
                            ? 'border-gray-500 bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => handleVoteSelection(ballot.id, 'blank')}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-lg">Voto en Blanco</h4>
                            <p className="text-gray-600">No seleccionar ningún candidato</p>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedVotes[ballot.id] === 'blank'
                              ? 'border-gray-500 bg-gray-500'
                              : 'border-gray-300'
                          }`}>
                            {selectedVotes[ballot.id] === 'blank' && (
                              <Check className="h-4 w-4 text-white" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <Button
                onClick={handleSubmitVote}
                size="lg"
                className="bg-green-600 hover:bg-green-700 px-8"
              >
                <Vote className="h-5 w-5 mr-2" />
                Confirmar y Emitir Voto
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-md mx-auto text-center">
            <Card className="shadow-lg">
              <CardContent className="pt-8">
                <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-6">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">¡Voto Registrado!</h2>
                <p className="text-gray-600 mb-6">
                  Tu voto ha sido registrado de forma segura y anónima. 
                  Gracias por participar en el proceso democrático.
                </p>
                <div className="text-sm text-gray-500">
                  Serás redirigido automáticamente...
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default VotePage;
