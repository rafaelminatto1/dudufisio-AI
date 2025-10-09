// pages/EnhancedAssessmentsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { ClipboardCheck, Search, Eye, FileText, Lightbulb, CheckCircle, Activity, Brain, Heart, Dumbbell, Sparkles, X, Zap, Clock } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { integratedAssessmentService } from '../services/integratedAssessmentService';
import { integratedProtocolsService } from '../services/integratedProtocolsService';
import { useToast } from '../contexts/ToastContext';
import { Skeleton } from '../components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
const EnhancedAssessmentsPage = () => {
    // State management
    const [activeTab, setActiveTab] = useState('assessments');
    const [assessments, setAssessments] = useState([]);
    const [filteredAssessments, setFilteredAssessments] = useState([]);
    const [assessmentResults, setAssessmentResults] = useState([]);
    const [assessmentStats, setAssessmentStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();
    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [specialtyFilter, setSpecialtyFilter] = useState('');
    const [selectedAssessment, setSelectedAssessment] = useState(null);
    const [selectedResult, setSelectedResult] = useState(null);
    const [recommendedProtocols, setRecommendedProtocols] = useState([]);
    // Mock assessment result for demo
    const [demoScores, setDemoScores] = useState([]);
    const [demoPatientId] = useState('patient-demo-001');
    // Data fetching
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [assessmentsData, statsData, resultsData] = await Promise.all([
                integratedAssessmentService.getAllAssessments(),
                integratedAssessmentService.getAssessmentStats(),
                integratedAssessmentService.getPatientAssessmentResults(demoPatientId)
            ]);
            setAssessments(assessmentsData);
            setFilteredAssessments(assessmentsData);
            setAssessmentStats(statsData);
            setAssessmentResults(resultsData);
        }
        catch (error) {
            showToast('Erro ao carregar avaliações.', 'error');
        }
        finally {
            setIsLoading(false);
        }
    }, [demoPatientId, showToast]);
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    // Filter assessments
    useEffect(() => {
        let filtered = [...assessments];
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(a => a.title.toLowerCase().includes(searchLower) ||
                a.description.toLowerCase().includes(searchLower) ||
                a.tags.some(tag => tag.toLowerCase().includes(searchLower)));
        }
        if (specialtyFilter) {
            filtered = filtered.filter(a => a.specialty === specialtyFilter);
        }
        setFilteredAssessments(filtered);
    }, [searchTerm, specialtyFilter, assessments]);
    // Handle assessment click
    const handleAssessmentClick = async (assessment) => {
        setSelectedAssessment(assessment);
        // Initialize demo scores based on scoring criteria
        if (assessment.scoringCriteria.length > 0) {
            const initialScores = assessment.scoringCriteria.map((criteria, index) => ({
                criteriaId: `criteria-${index}`,
                criteriaName: criteria.parameter || `Critério ${index + 1}`,
                score: 0,
                maxScore: typeof criteria.maxScore === 'number' ? criteria.maxScore : 10,
                interpretation: ''
            }));
            setDemoScores(initialScores);
        }
    };
    // Handle score change
    const handleScoreChange = (index, score) => {
        const newScores = [...demoScores];
        newScores[index].score = score;
        setDemoScores(newScores);
    };
    // Submit assessment
    const handleSubmitAssessment = async () => {
        if (!selectedAssessment || demoScores.length === 0) {
            showToast('Configure as pontuações antes de submeter.', 'warning');
            return;
        }
        try {
            const { totalScore, percentage, severity } = integratedAssessmentService.calculateAssessmentScore(demoScores);
            const result = await integratedAssessmentService.createAssessmentResult({
                assessmentId: selectedAssessment.id,
                patientId: demoPatientId,
                assessedBy: 'current-user',
                assessedAt: new Date().toISOString(),
                scores: demoScores,
                totalScore: percentage,
                interpretation: `Avaliação ${selectedAssessment.title} resultou em ${percentage.toFixed(1)}% (${severity}).`,
                severity,
                notes: ''
            });
            // Buscar protocolos recomendados
            const protocols = await integratedProtocolsService.getAllProtocols();
            const recommended = protocols.filter(p => result.recommendedProtocols.includes(p.id));
            setRecommendedProtocols(recommended);
            setSelectedResult(result);
            showToast(`Avaliação concluída! ${recommended.length} protocolos recomendados.`, 'success');
            fetchData();
        }
        catch (error) {
            showToast('Erro ao submeter avaliação.', 'error');
        }
    };
    // Get specialty icon
    const getSpecialtyIcon = (specialty) => {
        switch (specialty) {
            case 'esportiva':
                return Dumbbell;
            case 'pos-operatoria':
                return Activity;
            case 'geriatrica':
                return Heart;
            default:
                return Brain;
        }
    };
    // Get specialty color
    const getSpecialtyColor = (specialty) => {
        switch (specialty) {
            case 'esportiva':
                return 'bg-blue-100 text-blue-800';
            case 'pos-operatoria':
                return 'bg-green-100 text-green-800';
            case 'geriatrica':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    // Get severity color
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'normal':
                return 'bg-green-100 text-green-800';
            case 'mild':
                return 'bg-yellow-100 text-yellow-800';
            case 'moderate':
                return 'bg-orange-100 text-orange-800';
            case 'severe':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    // Render methods
    const renderAssessments = () => (<div className="space-y-6">
      {/* Stats Cards */}
      {assessmentStats && (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Avaliações</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assessmentStats.totalAssessments}</div>
              <p className="text-xs text-muted-foreground">
                {assessmentStats.totalResults} resultados registrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Esportiva</CardTitle>
              <Dumbbell className="h-4 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assessmentStats.bySpecialty.esportiva || 0}</div>
              <p className="text-xs text-muted-foreground">avaliações especializadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pós-Operatória</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assessmentStats.bySpecialty['pos-operatoria'] || 0}</div>
              <p className="text-xs text-muted-foreground">avaliações especializadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Média de Recomendações</CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assessmentStats.averageRecommendations}</div>
              <p className="text-xs text-muted-foreground">protocolos por avaliação</p>
            </CardContent>
          </Card>
        </div>)}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="specialty-filter">Especialidade</Label>
              <select id="specialty-filter" title="Filtrar por especialidade" className="w-full mt-1 p-2 border rounded-md" value={specialtyFilter} onChange={e => setSpecialtyFilter(e.target.value)}>
                <option value="">Todas as especialidades</option>
                <option value="esportiva">Fisioterapia Esportiva</option>
                <option value="pos-operatoria">Fisioterapia Pós-Operatória</option>
                <option value="geriatrica">Fisioterapia Gerontológica</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="search-assessment">Buscar</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"/>
                <Input id="search-assessment" type="text" placeholder="Buscar avaliações..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssessments.map(assessment => {
            const IconComponent = getSpecialtyIcon(assessment.specialty);
            return (<Card key={assessment.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <IconComponent className="w-5 h-5 text-blue-600"/>
                    <Badge className={getSpecialtyColor(assessment.specialty)}>
                      {assessment.specialty}
                    </Badge>
                  </div>
                  <Clock className="w-4 h-4 text-muted-foreground"/>
                </div>
                <CardTitle className="text-lg">{assessment.title}</CardTitle>
                <CardDescription>{assessment.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    <strong>Duração:</strong> {assessment.duration}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <strong>População:</strong> {assessment.targetPopulation}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {assessment.tags.slice(0, 3).map(tag => (<Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>))}
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <Button variant="outline" size="sm" onClick={() => handleAssessmentClick(assessment)}>
                      <Eye className="w-4 h-4 mr-1"/>
                      Ver Detalhes
                    </Button>
                    <Button size="sm" onClick={() => handleAssessmentClick(assessment)}>
                      <Zap className="w-4 h-4 mr-1"/>
                      Avaliar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>);
        })}
      </div>
    </div>);
    const renderResults = () => (<div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Resultados de Avaliações</h2>
        <p className="text-muted-foreground">Histórico de avaliações realizadas</p>
      </div>

      {assessmentResults.length === 0 ? (<Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <ClipboardCheck className="w-12 h-12 mx-auto mb-4 opacity-50"/>
            <p>Nenhuma avaliação realizada ainda.</p>
            <p className="text-sm mt-2">Realize uma avaliação para ver os resultados aqui.</p>
          </CardContent>
        </Card>) : (<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assessmentResults.map((result, index) => {
                const assessment = assessments.find(a => a.id === result.assessmentId);
                return (<Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge className={getSeverityColor(result.severity)}>
                      {result.severity}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(result.assessedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{assessment?.title || 'Avaliação'}</CardTitle>
                  <CardDescription>{result.interpretation}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Pontuação Total</span>
                        <span className="font-medium">{result.totalScore?.toFixed(1)}%</span>
                      </div>
                      <Progress value={result.totalScore || 0}/>
                    </div>

                    {result.recommendedProtocols.length > 0 && (<div>
                        <div className="text-sm font-medium mb-2 flex items-center">
                          <Lightbulb className="w-4 h-4 mr-1 text-yellow-500"/>
                          Protocolos Recomendados ({result.recommendedProtocols.length})
                        </div>
                        <div className="space-y-1">
                          {result.recommendedProtocols.slice(0, 2).map((protocolId, idx) => {
                            const protocol = recommendedProtocols.find(p => p.id === protocolId);
                            return (<div key={idx} className="text-xs text-muted-foreground flex items-center">
                                <CheckCircle className="w-3 h-3 mr-1 text-green-500"/>
                                {protocol?.name || protocolId}
                              </div>);
                        })}
                        </div>
                      </div>)}

                    <Button variant="outline" size="sm" className="w-full" onClick={() => setSelectedResult(result)}>
                      <FileText className="w-4 h-4 mr-1"/>
                      Ver Relatório Completo
                    </Button>
                  </div>
                </CardContent>
              </Card>);
            })}
        </div>)}
    </div>);
    if (isLoading) {
        return (<div className="space-y-6">
        <PageHeader title="Avaliações Especializadas" subtitle="Carregando..."/>
        <Skeleton className="h-96 w-full"/>
      </div>);
    }
    return (<div className="space-y-6">
      <PageHeader title="Avaliações Especializadas Integradas" subtitle="Sistema inteligente de avaliação com recomendação automática de protocolos"/>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assessments">Avaliações</TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
        </TabsList>

        <TabsContent value="assessments" className="mt-6">
          {renderAssessments()}
        </TabsContent>

        <TabsContent value="results" className="mt-6">
          {renderResults()}
        </TabsContent>
      </Tabs>

      {/* Assessment Modal */}
      {selectedAssessment && (<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-bold">{selectedAssessment.title}</h2>
                <Badge className={getSpecialtyColor(selectedAssessment.specialty)}>
                  {selectedAssessment.specialty}
                </Badge>
              </div>
              <Button variant="ghost" onClick={() => setSelectedAssessment(null)}>
                <X className="w-5 h-5"/>
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Descrição</h3>
                  <p className="text-muted-foreground">{selectedAssessment.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Objetivo</h3>
                  <p className="text-muted-foreground">{selectedAssessment.purpose}</p>
                </div>

                {demoScores.length > 0 && (<div>
                    <h3 className="text-lg font-semibold mb-4">Pontuação</h3>
                    <div className="space-y-4">
                      {demoScores.map((score, index) => (<div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{score.criteriaName}</span>
                            <span className="text-sm text-muted-foreground">
                              {score.score}/{score.maxScore}
                            </span>
                          </div>
                          <Input type="number" min="0" max={score.maxScore} value={score.score} onChange={e => handleScoreChange(index, parseInt(e.target.value) || 0)} className="w-full"/>
                        </div>))}
                    </div>
                  </div>)}

                {recommendedProtocols.length > 0 && (<div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Lightbulb className="w-5 h-5 mr-2 text-yellow-500"/>
                      Protocolos Recomendados
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {recommendedProtocols.map(protocol => (<div key={protocol.id} className="border rounded-lg p-3">
                          <h4 className="font-medium">{protocol.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{protocol.description}</p>
                          <div className="flex items-center mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {protocol.category}
                            </Badge>
                          </div>
                        </div>))}
                    </div>
                  </div>)}
              </div>
            </div>
            <div className="border-t p-6 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setSelectedAssessment(null)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmitAssessment}>
                <CheckCircle className="w-4 h-4 mr-2"/>
                Submeter Avaliação
              </Button>
            </div>
          </div>
        </div>)}
    </div>);
};
export default EnhancedAssessmentsPage;
