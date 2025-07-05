import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";

export const CreateCircuitoForm = () => {
  const [formData, setFormData] = useState({
    numero_circuito: "",
    numero_mesa: "",
    establecimiento_id: ""
  });
  const [establecimientos, setEstablecimientos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEstablecimientos();
  }, []);

  const loadEstablecimientos = async () => {
    try {
      const data = await apiService.getEstablecimientosAdmin();
      setEstablecimientos(data);
    } catch (error) {
      console.error('Error cargando establecimientos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.numero_circuito || !formData.numero_mesa || !formData.establecimiento_id) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await apiService.createCircuito({
        numero_circuito: formData.numero_circuito,
        numero_mesa: formData.numero_mesa,
        establecimiento_id: parseInt(formData.establecimiento_id)
      });

      toast({
        title: "Circuito Creado",
        description: result.mensaje,
        variant: "default",
      });

      // Limpiar formulario
      setFormData({
        numero_circuito: "",
        numero_mesa: "",
        establecimiento_id: ""
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error creando circuito",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="numero_circuito">Número de Circuito</Label>
          <Input
            id="numero_circuito"
            type="text"
            placeholder="ej: 001"
            value={formData.numero_circuito}
            onChange={(e) => setFormData(prev => ({ ...prev, numero_circuito: e.target.value }))}
          />
          <p className="text-sm text-gray-500">Formato: 001, 054, etc.</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="numero_mesa">Número de Mesa</Label>
          <Input
            id="numero_mesa"
            type="text"
            placeholder="ej: A"
            value={formData.numero_mesa}
            onChange={(e) => setFormData(prev => ({ ...prev, numero_mesa: e.target.value }))}
          />
          <p className="text-sm text-gray-500">Letra o número identificatorio de la mesa</p>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="establecimiento">Establecimiento</Label>
          <Select value={formData.establecimiento_id} onValueChange={(value) => setFormData(prev => ({ ...prev, establecimiento_id: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar establecimiento" />
            </SelectTrigger>
            <SelectContent>
              {establecimientos.map((establecimiento) => (
                <SelectItem key={establecimiento.id} value={establecimiento.id.toString()}>
                  {establecimiento.nombre} - {establecimiento.departamento}, {establecimiento.ciudad}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creando..." : "Crear Circuito"}
      </Button>
    </form>
  );
};