import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { Plus, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreatePartidoForm } from "./CreatePartidoForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Lista {
  candidato: string;
  vicepresidente: string;
  numero_lista: number;
  partido_id: number;
}

interface Partido {
  id: number;
  nombre: string;
  color?: string;
}

interface CreateEleccionFormProps {
  onElectionCreated?: () => void;
}

export const CreateEleccionForm = ({ onElectionCreated }: CreateEleccionFormProps) => {
  const [año, setAño] = useState<number>(new Date().getFullYear());
  const [listas, setListas] = useState<Lista[]>([
    { candidato: "", vicepresidente: "", numero_lista: 0, partido_id: 0 }
  ]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreatePartido, setShowCreatePartido] = useState(false);

  // Cargar partidos al montar el componente
  const fetchPartidos = async () => {
    try {
      const partidosData = await apiService.getPartidos();
      setPartidos(partidosData);
    } catch (error) {
      console.error("Error cargando partidos:", error);
    }
  };

  useEffect(() => {
    fetchPartidos();
  }, []);

  const addLista = () => {
    setListas([...listas, { candidato: "", vicepresidente: "", numero_lista: 0, partido_id: 0 }]);
  };

  const removeLista = (index: number) => {
    if (listas.length > 1) {
      setListas(listas.filter((_, i) => i !== index));
    }
  };

  const updateLista = (index: number, field: keyof Lista, value: string | number) => {
    const newListas = [...listas];
    newListas[index] = { ...newListas[index], [field]: value };
    setListas(newListas);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!año || año < 2000 || año > 2100) {
      toast({
        title: "Error",
        description: "Ingrese un año válido",
        variant: "destructive",
      });
      return;
    }

    // Validar listas
    const listasValidas = listas.filter(lista => 
      lista.candidato && lista.vicepresidente && lista.numero_lista > 0 && lista.partido_id > 0
    );

    if (listasValidas.length === 0) {
      toast({
        title: "Error",
        description: "Debe agregar al menos una lista completa",
        variant: "destructive",
      });
      return;
    }

    // Verificar números de lista únicos
    const numerosLista = listasValidas.map(l => l.numero_lista);
    const numerosUnicos = new Set(numerosLista);
    if (numerosLista.length !== numerosUnicos.size) {
      toast({
        title: "Error",
        description: "Los números de lista deben ser únicos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await apiService.createEleccion({
        año,
        listas: listasValidas
      });

      toast({
        title: "Elección Creada",
        description: result.mensaje,
        variant: "default",
      });

      // Limpiar formulario
      setAño(new Date().getFullYear());
      setListas([{ candidato: "", vicepresidente: "", numero_lista: 0, partido_id: 0 }]);
      
      // Llamar callback si existe
      onElectionCreated?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error creando elección",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="año">Año de la Elección</Label>
        <Input
          id="año"
          type="number"
          min="2000"
          max="2100"
          value={año}
          onChange={(e) => setAño(parseInt(e.target.value))}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">Listas Electorales</h4>
          <Button type="button" onClick={addLista} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Lista
          </Button>
        </div>

        {listas.map((lista, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                Lista {index + 1}
                {listas.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeLista(index)}
                    variant="ghost"
                    size="sm"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Candidato a Presidente</Label>
                  <Input
                    type="text"
                    placeholder="Nombre del candidato"
                    value={lista.candidato}
                    onChange={(e) => updateLista(index, 'candidato', e.target.value)}
                  />
                </div>
                
                <div className="space-y-1">
                  <Label>Candidato a Vicepresidente</Label>
                  <Input
                    type="text"
                    placeholder="Nombre del vicepresidente"
                    value={lista.vicepresidente}
                    onChange={(e) => updateLista(index, 'vicepresidente', e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <Label>Número de Lista</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="ej: 404"
                    value={lista.numero_lista || ''}
                    onChange={(e) => updateLista(index, 'numero_lista', parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label>Partido</Label>
                    <Dialog open={showCreatePartido} onOpenChange={setShowCreatePartido}>
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline" size="sm">
                          <Plus className="h-3 w-3 mr-1" />
                          Nuevo
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Crear Nuevo Partido</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                          <CreatePartidoForm onPartidoCreated={() => {
                            setShowCreatePartido(false);
                            fetchPartidos(); // Recargar lista de partidos
                          }} />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Select 
                    value={lista.partido_id.toString()} 
                    onValueChange={(value) => updateLista(index, 'partido_id', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar partido" />
                    </SelectTrigger>
                    <SelectContent>
                      {partidos.map((partido) => (
                        <SelectItem key={partido.id} value={partido.id.toString()}>
                          {partido.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creando..." : "Crear Elección"}
      </Button>
    </form>
  );
};