import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";

interface CreatePartidoFormProps {
  onPartidoCreated?: () => void;
}

export const CreatePartidoForm = ({ onPartidoCreated }: CreatePartidoFormProps) => {
  const [nombre, setNombre] = useState("");
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
        nombre: nombre.trim()
      });
      
      toast({
        title: "Partido creado",
        description: response.mensaje,
        variant: "default",
      });
      
      // Limpiar formulario
      setNombre("");
      
      // Llamar callback si existe
      onPartidoCreated?.();
      
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
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creando..." : "Crear Partido"}
      </Button>
    </form>
  );
};