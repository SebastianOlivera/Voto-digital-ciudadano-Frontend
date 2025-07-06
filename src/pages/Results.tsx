
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, ArrowLeft, TrendingUp, Users, MapPin, RefreshCw, Search, PieChart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiService } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { ResultsChart } from "@/components/ResultsChart";
import { ResultsTable } from "@/components/ResultsTable";

const ResultsPage = () => {
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [selectedDepartamento, setSelectedDepartamento] = useState<string>("");
  const [searchCircuito, setSearchCircuito] = useState<string>("");
  const [circuitResults, setCircuitResults] = useState<any>(null);
  const [circuitSuggestions, setCircuitSuggestions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("nacional");

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
  }, []);

  useEffect(() => {
    loadResults(selectedDepartamento === "todos" ? undefined : selectedDepartamento);
  }, [selectedDepartamento]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadResults(selectedDepartamento === "todos" ? undefined : selectedDepartamento);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const searchCircuits = async (term: string) => {
    if (term.length >= 1) {
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
              <h1 className="text-xl font-bold text-gray-900">Cargando Resultados...</h1>
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
              <div className="bg-green-600 rounded-lg p-2">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Resultados Electorales</h1>
                <p className="text-sm text-gray-600">Actualización en tiempo real</p>
              </div>
            </div>
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
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
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
          </TabsList>

          {/* Slide 1: Resultados Nacionales */}
          <TabsContent value="nacional" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Resultados Nacionales</h2>
              <p className="text-gray-600 mb-4">Elecciones Presidenciales {results?.año_eleccion || 2024}</p>
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
                      height={400}
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

          {/* Slide 2: Resultados por Departamento */}
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
                      height={400}
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

          {/* Slide 3: Búsqueda por Circuito */}
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
                        height={400}
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
                <p className="text-gray-500">Circuito no encontrado</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ResultsPage;
