
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ArrowLeft, 
  Settings, 
  Users, 
  Vote, 
  CheckCircle, 
  Lock,
  Plus,
  BarChart3,
  TrendingUp,
  MapPin,
  RefreshCw,
  Search,
  PieChart,
  Upload,
  FileText
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { ResultsChart } from "@/components/ResultsChart";
import { ResultsTable } from "@/components/ResultsTable";

const AdminPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [selectedDepartamento, setSelectedDepartamento] = useState<string>("");
  const [searchCircuito, setSearchCircuito] = useState<string>("");
  const [circuitResults, setCircuitResults] = useState<any>(null);
  const [circuitSuggestions, setCircuitSuggestions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("nacional");
  const [mesas, setMesas] = useState<any[]>([]);

  const loadResults = async (departamento?: string) => {
    try {
      setIsLoading(true);
      const data = await apiService.getResultados(departamento || undefined);
      setResults(data);
    } catch (error) {
      console.error('Error cargando resultados:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los resultados",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadDepartamentos = async () => {
    try {
      const data = await apiService.getDepartamentos();
      setDepartamentos(data);
    } catch (error) {
      console.error('Error cargando departamentos:', error);
    }
  };

  useEffect(() => {
    loadResults();
    loadDepartamentos();
    loadMesas();
  }, []);

  useEffect(() => {
    loadResults(selectedDepartamento === "todos" ? undefined : selectedDepartamento);
    if (activeTab === "mesas") {
      loadMesas();
    }
  }, [selectedDepartamento, activeTab]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadResults(selectedDepartamento === "todos" ? undefined : selectedDepartamento);
    await loadMesas(); // También recargar las mesas
    setTimeout(() => setRefreshing(false), 1500);
  };

  const searchCircuits = async (term: string) => {
    if (term.length >= 2) {
      try {
        const suggestions = await apiService.buscarCircuitos(term);
        setCircuitSuggestions(suggestions);
      } catch (error) {
        console.error('Error buscando circuitos:', error);
      }
    } else {
      setCircuitSuggestions([]);
    }
  };

  const loadCircuitResults = async (circuito: string) => {
    try {
      setIsLoading(true);
      const data = await apiService.getResultadosCircuito(circuito);
      setCircuitResults(data);
    } catch (error) {
      console.error('Error cargando resultados del circuito:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los resultados del circuito",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMesas = async () => {
    try {
      const data = await apiService.getMesas();
      setMesas(data);
    } catch (error) {
      console.error('Error cargando mesas:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las mesas",
        variant: "destructive",
      });
    }
  };

  const getPartyColors = () => {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
    ];
    return colors;
  };

  const formatChartData = (resultados: any[], votosBlanco: number, votosAnulados: number) => {
    const colors = getPartyColors();
    const data = resultados.map((item, index) => ({
      name: item.partido,
      value: item.votos,
      color: colors[index % colors.length]
    }));

    if (votosBlanco > 0) {
      data.push({ name: 'Votos en Blanco', value: votosBlanco, color: '#9CA3AF' });
    }
    
    if (votosAnulados > 0) {
      data.push({ name: 'Votos Anulados', value: votosAnulados, color: '#F87171' });
    }

    return data;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo CSV válido",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      processCsvData(text);
    };
    reader.readAsText(file);
  };

  const processCsvData = async (csvText: string) => {
    try {
      const lines = csvText.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      // Validar headers esperados
      const expectedHeaders = ['circuito_numero', 'establecimiento_nombre', 'departamento', 'ciudad', 'direccion', 'mesa_letra', 'cedula_autorizada'];
      const hasValidHeaders = expectedHeaders.every(header => headers.includes(header));
      
      if (!hasValidHeaders) {
        toast({
          title: "Error en CSV",
          description: "El archivo CSV no tiene las columnas esperadas. Verifica el formato.",
          variant: "destructive",
        });
        return;
      }

      const dataRows = lines.slice(1).filter(line => line.trim());
      const processedData = dataRows.map(line => {
        const values = line.split(',').map(v => v.trim());
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        return row;
      });

      // Aquí enviar al backend
      try {
        // Llamar al endpoint para cargar credenciales
        const response = await apiService.uploadCredencialesCSV(processedData);
        
        toast({
          title: "CSV Cargado",
          description: response.mensaje || `Se procesaron ${processedData.length} registros exitosamente.`,
          variant: "default",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Error enviando datos al servidor",
          variant: "destructive",
        });
      }
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Error procesando el archivo CSV",
        variant: "destructive",
      });
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const formatTableData = (resultados: any[], votosBlanco: number, votosAnulados: number, totalVotos: number) => {
    const colors = getPartyColors();
    const data = resultados.map((item, index) => ({
      partido: item.partido,
      candidato: item.candidato,
      votos: item.votos,
      porcentaje: totalVotos > 0 ? ((item.votos / totalVotos) * 100).toFixed(1) : '0.0',
      color: colors[index % colors.length]
    }));

    if (votosBlanco > 0) {
      data.push({
        partido: 'Votos en Blanco',
        candidato: '',
        votos: votosBlanco,
        porcentaje: totalVotos > 0 ? ((votosBlanco / totalVotos) * 100).toFixed(1) : '0.0',
        color: '#9CA3AF'
      });
    }

    if (votosAnulados > 0) {
      data.push({
        partido: 'Votos Anulados',
        candidato: '',
        votos: votosAnulados,
        porcentaje: totalVotos > 0 ? ((votosAnulados / totalVotos) * 100).toFixed(1) : '0.0',
        color: '#F87171'
      });
    }

    return data;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-center">
              <h1 className="text-xl font-bold text-gray-900">Cargando Panel de Administración...</h1>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p>Obteniendo datos del servidor...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Volver al Inicio</span>
            </Button>
            <div className="flex items-center space-x-3">
              <div className="bg-purple-600 rounded-lg p-2">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Panel de Administración</h1>
                <p className="text-sm text-gray-600">Sistema Electoral</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Actualizar</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/login')}
                className="flex items-center space-x-2"
              >
                <Lock className="h-4 w-4" />
                <span>Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="nacional" className="flex items-center space-x-2">
              <PieChart className="h-4 w-4" />
              <span>Nacional</span>
            </TabsTrigger>
            <TabsTrigger value="departamento" className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Departamento</span>
            </TabsTrigger>
            <TabsTrigger value="circuito" className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Circuito</span>
            </TabsTrigger>
            <TabsTrigger value="mesas" className="flex items-center space-x-2">
              <Vote className="h-4 w-4" />
              <span>Mesas</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Sistema</span>
            </TabsTrigger>
          </TabsList>

          {/* Resultados Nacionales */}
          <TabsContent value="nacional" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Resultados Nacionales</h2>
              <p className="text-gray-600 mb-4">Elecciones Presidenciales 2024</p>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Última actualización: {new Date().toLocaleTimeString()}
              </Badge>
            </div>

            {results && (
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <PieChart className="h-5 w-5" />
                      <span>Distribución de Votos</span>
                    </CardTitle>
                    <CardDescription>
                      Total de votos: {results.total_votos?.toLocaleString() || 0}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResultsChart 
                      data={formatChartData(results.resultados || [], results.votos_blanco || 0, results.votos_anulados || 0)}
                      height={500}
                    />
                  </CardContent>
                </Card>

                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>Detalle por Partido</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResultsTable 
                      data={formatTableData(results.resultados || [], results.votos_blanco || 0, results.votos_anulados || 0, results.total_votos || 0)}
                      totalVotos={results.total_votos || 0}
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Resultados por Departamento */}
          <TabsContent value="departamento" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Resultados por Departamento</h2>
              <div className="flex justify-center items-center space-x-4 mb-4">
                <Select value={selectedDepartamento} onValueChange={setSelectedDepartamento}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Seleccionar departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los departamentos</SelectItem>
                    {departamentos.map((dep) => (
                      <SelectItem key={dep.nombre} value={dep.nombre}>
                        {dep.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {selectedDepartamento && selectedDepartamento !== "todos" ? `Departamento: ${selectedDepartamento}` : 'Todos los departamentos'}
              </Badge>
            </div>

            {results && (
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <PieChart className="h-5 w-5" />
                      <span>Distribución de Votos</span>
                    </CardTitle>
                    <CardDescription>
                      Total de votos: {results.total_votos?.toLocaleString() || 0}
                      {selectedDepartamento && ` en ${selectedDepartamento}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResultsChart 
                      data={formatChartData(results.resultados || [], results.votos_blanco || 0, results.votos_anulados || 0)}
                      height={500}
                    />
                  </CardContent>
                </Card>

                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>Detalle por Partido</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResultsTable 
                      data={formatTableData(results.resultados || [], results.votos_blanco || 0, results.votos_anulados || 0, results.total_votos || 0)}
                      totalVotos={results.total_votos || 0}
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Búsqueda por Circuito */}
          <TabsContent value="circuito" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Búsqueda por Circuito</h2>
              <div className="max-w-md mx-auto">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Ingrese número de circuito..."
                    value={searchCircuito}
                    onChange={(e) => {
                      setSearchCircuito(e.target.value);
                      searchCircuits(e.target.value);
                    }}
                    className="pl-10"
                  />
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                
                {circuitSuggestions.length > 0 && (
                  <div className="mt-2 border rounded-lg bg-white shadow-lg max-h-48 overflow-y-auto">
                    {circuitSuggestions.map((circuit, index) => (
                      <div
                        key={index}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => {
                          setSearchCircuito(circuit.numero_circuito);
                          setCircuitSuggestions([]);
                          loadCircuitResults(circuit.numero_circuito);
                        }}
                      >
                        <div className="font-medium">{circuit.numero_circuito}</div>
                        <div className="text-sm text-gray-600">
                          {circuit.establecimiento} - {circuit.departamento}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {circuitResults && !circuitResults.error && (
              <div>
                <div className="text-center mb-6">
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    Circuito: {circuitResults.circuito?.numero_circuito}
                  </Badge>
                  <p className="text-gray-600 mt-2">
                    {circuitResults.circuito?.establecimiento} - {circuitResults.circuito?.departamento}
                  </p>
                  <p className="text-sm text-gray-500">
                    {circuitResults.circuito?.direccion}
                  </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <PieChart className="h-5 w-5" />
                        <span>Distribución de Votos</span>
                      </CardTitle>
                      <CardDescription>
                        Total de votos: {circuitResults.total_votos?.toLocaleString() || 0}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResultsChart 
                        data={formatChartData(circuitResults.resultados || [], circuitResults.votos_blanco || 0, circuitResults.votos_anulados || 0)}
                        height={500}
                      />
                    </CardContent>
                  </Card>

                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5" />
                        <span>Detalle por Partido</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResultsTable 
                        data={formatTableData(circuitResults.resultados || [], circuitResults.votos_blanco || 0, circuitResults.votos_anulados || 0, circuitResults.total_votos || 0)}
                        totalVotos={circuitResults.total_votos || 0}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {circuitResults && circuitResults.error && (
              <div className="text-center py-8">
                <p className="text-gray-500">No se encontraron resultados para el circuito especificado</p>
              </div>
            )}
          </TabsContent>

          {/* Mesas Electorales */}
          <TabsContent value="mesas" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Estado de las Mesas Electorales</h2>
              <p className="text-gray-600 mb-4">Seguimiento en tiempo real del estado de las mesas</p>
              <div className="flex justify-center space-x-4">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Mesas Abiertas: {mesas.filter(m => m.estado === 'abierta').length}
                </Badge>
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  Mesas Cerradas: {mesas.filter(m => m.estado === 'cerrada').length}
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Total: {mesas.length}
                </Badge>
              </div>
            </div>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Vote className="h-5 w-5" />
                  <span>Lista de Mesas Electorales</span>
                </CardTitle>
                <CardDescription>
                  Estado actual de todas las mesas del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Circuito</TableHead>
                        <TableHead>Establecimiento</TableHead>
                        <TableHead>Departamento</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Votantes Autorizados</TableHead>
                        <TableHead>Última Actividad</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mesas.length > 0 ? (
                        mesas.map((mesa, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{mesa.circuito}</TableCell>
                            <TableCell>{mesa.establecimiento}</TableCell>
                            <TableCell>{mesa.departamento}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={mesa.estado === 'abierta' ? 'default' : 'secondary'}
                                className={mesa.estado === 'abierta' ? 'bg-green-500' : 'bg-red-500'}
                              >
                                {mesa.estado === 'abierta' ? 'Abierta' : 'Cerrada'}
                              </Badge>
                            </TableCell>
                            <TableCell>{mesa.votantes_autorizados || 0}</TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {mesa.ultima_actividad ? new Date(mesa.ultima_actividad).toLocaleString() : 'Sin actividad'}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            No hay datos de mesas disponibles
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sistema */}
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-purple-500" />
                  <span>Configuración del Sistema</span>
                </CardTitle>
                <CardDescription>
                  Administración general y configuraciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Base de Datos</h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <Users className="h-4 w-4 mr-2" />
                        Gestionar Usuarios
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Vote className="h-4 w-4 mr-2" />
                        Cargar Candidatos
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Settings className="h-4 w-4 mr-2" />
                        Configurar Circuitos
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={handleUploadClick}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Cargar CSV de Credenciales
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Mantenimiento</h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        Backup de Datos
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Logs del Sistema
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Estadísticas
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Settings className="h-4 w-4 mr-2" />
                        Configuración Avanzada
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPage;