import React, { createContext, useContext, useState, ReactNode } from 'react';
import { apiService } from '@/services/api';

export interface EstablecimientoInfo {
  id: number;
  nombre: string;
  departamento: string;
  ciudad: string;
  zona?: string;
  barrio?: string;
  direccion: string;
  tipo_establecimiento: string;
  accesible: boolean;
}

export interface CircuitoInfo {
  id: number;
  numero_circuito: string;
  establecimiento: EstablecimientoInfo;
}

interface AuthContextType {
  isAuthenticated: boolean;
  circuito: CircuitoInfo | null;
  username: string | null;
  role: string | null;
  isSuperAdmin: boolean;
  mesaCerrada: boolean;
  login: (username: string, password: string) => Promise<string>;
  logout: () => void;
  updateMesaCerrada: (cerrada: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [circuito, setCircuito] = useState<CircuitoInfo | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [mesaCerrada, setMesaCerrada] = useState(false);

  const isSuperAdmin = role === 'superadmin';

  const login = async (username: string, password: string) => {
    const response = await apiService.login({ username, password });
    apiService.setToken(response.access_token);
    setIsAuthenticated(true);
    setCircuito(response.circuito);
    setUsername(response.username);
    setRole(response.role);
    setMesaCerrada(response.mesa_cerrada || false);
    
    // Retorna el role para que el componente pueda hacer la navegación
    return response.role;
  };

  const logout = () => {
    apiService.setToken('');
    setIsAuthenticated(false);
    setCircuito(null);
    setUsername(null);
    setRole(null);
    setMesaCerrada(false);
  };

  const updateMesaCerrada = (cerrada: boolean) => {
    setMesaCerrada(cerrada);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      circuito,
      username,
      role,
      isSuperAdmin,
      mesaCerrada,
      login,
      logout,
      updateMesaCerrada
    }}>
      {children}
    </AuthContext.Provider>
  );
};