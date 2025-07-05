import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { Plus } from "lucide-react";

export const CreatePartidoForm = () => {
  const [nombre, setNombre] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nombre.trim()) {
      toast({
        title: "Error",
        description: "El nombre del partido es obligatorio",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await apiService.createPartido({
        nombre: nombre.trim(),
        color: color
      });
      
      toast({
        title: "Partido creado",
        description: response.mensaje,
        variant: "default",
      });
      
      // Limpiar formulario
      setNombre("");
      setColor("#3B82F6");
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el partido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Crear Partido
        </CardTitle>
        <CardDescription>
          Crea un nuevo partido político para las elecciones
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nombre">Nombre del Partido</Label>
            <Input
              id="nombre"
              type="text"
              placeholder="Ej: Partido Nacional"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="mt-1"
              disabled={loading}
            />
          </div>
          
          <div>
            <Label htmlFor="color">Color del Partido</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-16 h-10 p-1"
                disabled={loading}
              />
              <Input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#3B82F6"
                className="flex-1"
                disabled={loading}
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Selecciona el color que representará al partido
            </p>
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creando..." : "Crear Partido"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};