import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";

export const CreateUserForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    circuito_id: "",
    role: ""
  });
  const [circuitos, setCircuitos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCircuitos();
  }, []);

  const loadCircuitos = async () => {
    try {
      const data = await apiService.getCircuitosAdmin(); // Usar endpoint específico para circuitos
      setCircuitos(data);
    } catch (error) {
      console.error('Error cargando circuitos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password || !formData.circuito_id || !formData.role) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await apiService.createUsuario({
        username: formData.username,
        password: formData.password,
        circuito_id: parseInt(formData.circuito_id),
        role: formData.role
      });

      toast({
        title: "Usuario Creado",
        description: result.mensaje,
        variant: "default",
      });

      // Limpiar formulario
      setFormData({
        username: "",
        password: "",
        circuito_id: "",
        role: ""
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error creando usuario",
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
          <Label htmlFor="username">Usuario</Label>
          <Input
            id="username"
            type="text"
            placeholder="ej: mesa001"
            value={formData.username}
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Rol</Label>
          <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mesa">Usuario de Mesa</SelectItem>
              <SelectItem value="presidente">Presidente de Mesa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="circuito">Circuito</Label>
          <Select value={formData.circuito_id} onValueChange={(value) => setFormData(prev => ({ ...prev, circuito_id: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar circuito" />
            </SelectTrigger>
            <SelectContent>
              {circuitos.map((circuito) => (
                <SelectItem key={circuito.id} value={circuito.id.toString()}>
                  {circuito.numero_circuito} - {circuito.establecimiento}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creando..." : "Crear Usuario"}
      </Button>
    </form>
  );
};