
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface Candidato {
  id: number;
  nombre: string;
}

export interface Partido {
  partido: string;
  candidatos: Candidato[];
}

export interface VotoRequest {
  cedula: string;
  candidato_id: number;
}

export interface VoteEnableRequest {
  credencial?: string;
  circuito: string;
  esEspecial?: boolean;
  cedula_real?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface EleccionRequest {
  tipo: string;
}

export interface CandidatoRequest {
  persona: any; // Ajustar según tu modelo de persona
}

export interface ListaRequest {
  candidato: any;
  // Agregar otros campos según necesites
}

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

export interface LoginResponse {
  access_token: string;
  token_type: string;
  circuito: CircuitoInfo;
  username: string;
  role: string;
}

export interface VotoResponse {
  mensaje: string;
}

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  getToken() {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // Intentar obtener el mensaje de error del backend
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      } catch (parseError) {
        // Si no se puede parsear, mantener mensaje genérico
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await fetch(`${API_BASE_URL}/mesa/login`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Credenciales incorrectas');
    }

    const data = await response.json();
    this.setToken(data.access_token);
    return data;
  }

  async getCandidatos(): Promise<Partido[]> {
    return this.request<Partido[]>('/candidatos');
  }

  async votar(voto: VotoRequest): Promise<VotoResponse> {
    return this.request<VotoResponse>('/votar', {
      method: 'POST',
      body: JSON.stringify(voto),
    });
  }

  async enableVote(data: VoteEnableRequest): Promise<any> {
    return this.request<any>('/vote/enable', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getVotantesPorCircuito(circuito: string): Promise<any> {
    return this.request<any>(`/votantes/${circuito}`);
  }

  async getVotante(circuito: string, votante: string): Promise<any> {
    return this.request<any>(`/vote/${circuito}/${votante}`);
  }

  async getListas(): Promise<any> {
    return this.request<any>('/listas');
  }

  async closeCircuito(circuito: string): Promise<any> {
    return this.request<any>(`/circuito/${circuito}/close`, {
      method: 'PATCH',
    });
  }

  async getResultados(departamento?: string): Promise<any> {
    const params = departamento ? `?departamento=${encodeURIComponent(departamento)}` : '';
    return this.request<any>(`/resultados${params}`);
  }

  async getDepartamentos(): Promise<any> {
    return this.request<any>('/resultados/departamentos');
  }

  async getResultadosCircuito(circuito: string): Promise<any> {
    return this.request<any>(`/resultados/circuito/${encodeURIComponent(circuito)}`);
  }

  async buscarCircuitos(searchTerm: string): Promise<any> {
    return this.request<any>(`/resultados/circuitos/buscar?q=${encodeURIComponent(searchTerm)}`);
  }

  async createCandidato(data: CandidatoRequest): Promise<any> {
    return this.request<any>('/candidato', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createLista(data: ListaRequest): Promise<any> {
    return this.request<any>('/lista', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getEleccion(): Promise<any> {
    return this.request<any>('/eleccion');
  }

  async getVotosObservados(circuito: string): Promise<any> {
    return this.request<any>(`/observados/${circuito}`);
  }

  async validarVotoObservado(data: { voto_id: number; accion: string }): Promise<any> {
    return this.request<any>('/validar-observado', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async cerrarMesa(data: { circuito: string }): Promise<any> {
    return this.request<any>('/circuito/cerrar', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Credenciales
  async uploadCredencialesCSV(credencialesData: any[]): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/credenciales/upload-csv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify(credencialesData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error cargando credenciales');
    }

    return response.json();
  }

  async getMesas(): Promise<any> {
    return this.request<any>('/circuito/estado');
  }

  async getCircuitoByCedula(cedula: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/credenciales/circuito/${cedula}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error consultando cédula');
    }

    return response.json();
  }

  // Admin endpoints
  async createUsuario(data: {
    username: string;
    password: string;
    circuito_id: number;
    role: string;
  }): Promise<any> {
    return this.request<any>('/admin/usuario', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createEstablecimiento(data: {
    nombre: string;
    departamento: string;
    ciudad: string;
    zona?: string;
    barrio?: string;
    direccion: string;
    tipo_establecimiento: string;
    accesible: boolean;
  }): Promise<any> {
    return this.request<any>('/admin/establecimiento', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createEleccion(data: {
    año: number;
    listas: Array<{
      candidato: string;
      vicepresidente: string;
      numero_lista: number;
      partido: string;
    }>;
  }): Promise<any> {
    return this.request<any>('/admin/eleccion', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createCircuito(data: {
    numero_circuito: string;
    numero_mesa: string;
    establecimiento_id: number;
  }): Promise<any> {
    return this.request<any>('/admin/circuito', {
      method: 'POST',  
      body: JSON.stringify(data),
    });
  }

  async getEstablecimientosAdmin(): Promise<any> {
    return this.request<any>('/admin/establecimientos');
  }

  async getCircuitosAdmin(): Promise<any> {
    return this.request<any>('/admin/circuitos');
  }
}

export const apiService = new ApiService();
