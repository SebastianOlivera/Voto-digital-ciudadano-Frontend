import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";

export const CreateEstablecimientoForm = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    departamento: "",
    ciudad: "",
    zona: "",
    barrio: "",
    direccion: "",
    tipo_establecimiento: "",
    accesible: true
  });
  const [loading, setLoading] = useState(false);

  const departamentos = [
    "Artigas", "Canelones", "Cerro Largo", "Colonia", "Durazno", "Flores",
    "Florida", "Lavalleja", "Maldonado", "Montevideo", "Paysandú", "Río Negro",
    "Rivera", "Rocha", "Salto", "San José", "Soriano", "Tacuarembó", "Treinta y Tres"
  ];

  const tiposEstablecimiento = [
    "escuela", "liceo", "universidad", "instituto", "centro_comunitario", "club", "otro"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.departamento || !formData.ciudad || !formData.direccion || !formData.tipo_establecimiento) {
      toast({
        title: "Error",
        description: "Los campos obligatorios deben completarse",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await apiService.createEstablecimiento(formData);

      toast({
        title: "Establecimiento Creado",
        description: result.mensaje,
        variant: "default",
      });

      // Limpiar formulario
      setFormData({
        nombre: "",
        departamento: "",
        ciudad: "",
        zona: "",
        barrio: "",
        direccion: "",
        tipo_establecimiento: "",
        accesible: true
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error creando establecimiento",
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
          <Label htmlFor="nombre">Nombre *</Label>
          <Input
            id="nombre"
            type="text"
            placeholder="ej: Escuela Nacional No. 1"
            value={formData.nombre}
            onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="departamento">Departamento *</Label>
          <Select value={formData.departamento} onValueChange={(value) => setFormData(prev => ({ ...prev, departamento: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar departamento" />
            </SelectTrigger>
            <SelectContent>
              {departamentos.map((dep) => (
                <SelectItem key={dep} value={dep}>
                  {dep}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ciudad">Ciudad *</Label>
          <Input
            id="ciudad"
            type="text"
            placeholder="ej: Montevideo"
            value={formData.ciudad}
            onChange={(e) => setFormData(prev => ({ ...prev, ciudad: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="zona">Zona</Label>
          <Input
            id="zona"
            type="text"
            placeholder="ej: Centro"
            value={formData.zona}
            onChange={(e) => setFormData(prev => ({ ...prev, zona: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="barrio">Barrio</Label>
          <Input
            id="barrio"
            type="text"
            placeholder="ej: Ciudad Vieja"
            value={formData.barrio}
            onChange={(e) => setFormData(prev => ({ ...prev, barrio: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="direccion">Dirección *</Label>
          <Input
            id="direccion"
            type="text"
            placeholder="ej: Sarandí 674"
            value={formData.direccion}
            onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo de Establecimiento *</Label>
          <Select value={formData.tipo_establecimiento} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_establecimiento: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              {tiposEstablecimiento.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>
                  {tipo.charAt(0).toUpperCase() + tipo.slice(1).replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="accesible"
            checked={formData.accesible}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, accesible: checked as boolean }))}
          />
          <Label htmlFor="accesible">Accesible para personas con discapacidad</Label>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creando..." : "Crear Establecimiento"}
      </Button>
    </form>
  );
};