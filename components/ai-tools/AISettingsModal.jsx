import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Save, RefreshCw, TestTube, Brain, Zap, Shield, Globe, Key, Download, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
const AISettingsModal = ({ isOpen, onClose }) => {
    const { showToast } = useToast();
    const [settings, setSettings] = useState({
        autoSave: true,
        defaultLanguage: 'pt-BR',
        theme: 'light',
        notifications: true,
        aiProvider: 'gemini',
        apiKey: '',
        model: 'gemini-pro',
        temperature: 0.7,
        maxTokens: 1024,
        cacheEnabled: true,
        preloadModels: false,
        responseTimeout: 30,
        dataEncryption: true,
        auditLog: true,
        accessControl: true
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);
    useEffect(() => {
        if (isOpen) {
            loadSettings();
        }
    }, [isOpen]);
    const loadSettings = async () => {
        try {
            // Simular carregamento de configurações salvas
            const savedSettings = localStorage.getItem('ai-settings');
            if (savedSettings) {
                setSettings(JSON.parse(savedSettings));
            }
        }
        catch (error) {
            console.error('Erro ao carregar configurações:', error);
        }
    };
    const saveSettings = async () => {
        setIsSaving(true);
        try {
            // Simular salvamento
            await new Promise(resolve => setTimeout(resolve, 1000));
            localStorage.setItem('ai-settings', JSON.stringify(settings));
            showToast('Configurações salvas com sucesso!', 'success');
        }
        catch (error) {
            console.error('Erro ao salvar configurações:', error);
            showToast('Erro ao salvar configurações.', 'error');
        }
        finally {
            setIsSaving(false);
        }
    };
    const testConnection = async () => {
        setIsTesting(true);
        setTestResult(null);
        try {
            // Simular teste de conexão
            await new Promise(resolve => setTimeout(resolve, 2000));
            if (settings.apiKey) {
                setTestResult('success');
                showToast('Conexão com IA testada com sucesso!', 'success');
            }
            else {
                setTestResult('error');
                showToast('API Key não configurada.', 'error');
            }
        }
        catch (error) {
            setTestResult('error');
            showToast('Erro ao testar conexão.', 'error');
        }
        finally {
            setIsTesting(false);
        }
    };
    const handleSettingChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };
    const resetToDefaults = () => {
        setSettings({
            autoSave: true,
            defaultLanguage: 'pt-BR',
            theme: 'light',
            notifications: true,
            aiProvider: 'gemini',
            apiKey: '',
            model: 'gemini-pro',
            temperature: 0.7,
            maxTokens: 1024,
            cacheEnabled: true,
            preloadModels: false,
            responseTimeout: 30,
            dataEncryption: true,
            auditLog: true,
            accessControl: true
        });
        showToast('Configurações resetadas para padrão!', 'success');
    };
    const exportSettings = () => {
        const dataStr = JSON.stringify(settings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ai-settings-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast('Configurações exportadas com sucesso!', 'success');
    };
    return (<Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-500"/>
            Configurações das Ferramentas de IA
          </DialogTitle>
          <DialogDescription>
            Configure as preferências e parâmetros das ferramentas de Inteligência Artificial
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Settings className="w-4 h-4"/>
                Geral
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Brain className="w-4 h-4"/>
                IA
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <Zap className="w-4 h-4"/>
                Performance
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="w-4 h-4"/>
                Segurança
              </TabsTrigger>
            </TabsList>

            {/* Configurações Gerais */}
            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="w-5 h-5"/>
                    Configurações Gerais
                  </CardTitle>
                  <CardDescription>Preferências básicas do sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoSave">Salvamento Automático</Label>
                      <p className="text-sm text-gray-500">Salvar automaticamente documentos gerados</p>
                    </div>
                    <Switch id="autoSave" checked={settings.autoSave} onCheckedChange={(checked) => handleSettingChange('autoSave', checked)}/>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notifications">Notificações</Label>
                      <p className="text-sm text-gray-500">Receber notificações de status das ferramentas</p>
                    </div>
                    <Switch id="notifications" checked={settings.notifications} onCheckedChange={(checked) => handleSettingChange('notifications', checked)}/>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Idioma Padrão</Label>
                    <Select value={settings.defaultLanguage} onValueChange={(value) => handleSettingChange('defaultLanguage', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o idioma"/>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="es-ES">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="theme">Tema</Label>
                    <Select value={settings.theme} onValueChange={(value) => handleSettingChange('theme', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tema"/>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Claro</SelectItem>
                        <SelectItem value="dark">Escuro</SelectItem>
                        <SelectItem value="auto">Automático</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Configurações de IA */}
            <TabsContent value="ai" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="w-5 h-5"/>
                    Configurações de IA
                  </CardTitle>
                  <CardDescription>Parâmetros dos modelos de Inteligência Artificial</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="provider">Provedor de IA</Label>
                    <Select value={settings.aiProvider} onValueChange={(value) => handleSettingChange('aiProvider', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o provedor"/>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gemini">Google Gemini</SelectItem>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="claude">Anthropic Claude</SelectItem>
                        <SelectItem value="groq">Groq</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <div className="relative">
                      <Input id="apiKey" type="password" value={settings.apiKey} onChange={(e) => handleSettingChange('apiKey', e.target.value)} placeholder="Digite sua API Key" className="pr-10"/>
                      <Key className="absolute right-3 top-3 h-4 w-4 text-gray-400"/>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={testConnection} disabled={isTesting} className="flex items-center gap-2">
                        {isTesting ? (<RefreshCw className="w-4 h-4 animate-spin"/>) : (<TestTube className="w-4 h-4"/>)}
                        {isTesting ? 'Testando...' : 'Testar Conexão'}
                      </Button>
                      {testResult && (<div className="flex items-center gap-1">
                          {testResult === 'success' ? (<CheckCircle className="w-4 h-4 text-green-500"/>) : (<AlertCircle className="w-4 h-4 text-red-500"/>)}
                          <span className="text-sm">
                            {testResult === 'success' ? 'Conectado' : 'Erro'}
                          </span>
                        </div>)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="model">Modelo</Label>
                      <Select value={settings.model} onValueChange={(value) => handleSettingChange('model', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o modelo"/>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                          <SelectItem value="gemini-pro-vision">Gemini Pro Vision</SelectItem>
                          <SelectItem value="gpt-4">GPT-4</SelectItem>
                          <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="temperature">Temperatura: {settings.temperature}</Label>
                      <Input id="temperature" type="range" min="0" max="1" step="0.1" value={settings.temperature} onChange={(e) => handleSettingChange('temperature', parseFloat(e.target.value))} className="w-full"/>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Conservador</span>
                        <span>Criativo</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxTokens">Máximo de Tokens</Label>
                    <Input id="maxTokens" type="number" value={settings.maxTokens} onChange={(e) => handleSettingChange('maxTokens', parseInt(e.target.value))} placeholder="1024"/>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Configurações de Performance */}
            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5"/>
                    Configurações de Performance
                  </CardTitle>
                  <CardDescription>Otimizações de velocidade e eficiência</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="cache">Cache Habilitado</Label>
                      <p className="text-sm text-gray-500">Armazenar respostas para consultas similares</p>
                    </div>
                    <Switch id="cache" checked={settings.cacheEnabled} onCheckedChange={(checked) => handleSettingChange('cacheEnabled', checked)}/>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="preload">Pré-carregar Modelos</Label>
                      <p className="text-sm text-gray-500">Carregar modelos na inicialização (consome mais memória)</p>
                    </div>
                    <Switch id="preload" checked={settings.preloadModels} onCheckedChange={(checked) => handleSettingChange('preloadModels', checked)}/>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeout">Timeout de Resposta (segundos)</Label>
                    <Input id="timeout" type="number" value={settings.responseTimeout} onChange={(e) => handleSettingChange('responseTimeout', parseInt(e.target.value))} placeholder="30"/>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Configurações de Segurança */}
            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5"/>
                    Configurações de Segurança
                  </CardTitle>
                  <CardDescription>Proteção de dados e controle de acesso</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="encryption">Criptografia de Dados</Label>
                      <p className="text-sm text-gray-500">Criptografar dados sensíveis armazenados</p>
                    </div>
                    <Switch id="encryption" checked={settings.dataEncryption} onCheckedChange={(checked) => handleSettingChange('dataEncryption', checked)}/>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="audit">Log de Auditoria</Label>
                      <p className="text-sm text-gray-500">Registrar todas as ações do sistema</p>
                    </div>
                    <Switch id="audit" checked={settings.auditLog} onCheckedChange={(checked) => handleSettingChange('auditLog', checked)}/>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="access">Controle de Acesso</Label>
                      <p className="text-sm text-gray-500">Restringir acesso baseado em permissões</p>
                    </div>
                    <Switch id="access" checked={settings.accessControl} onCheckedChange={(checked) => handleSettingChange('accessControl', checked)}/>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <Info className="w-5 h-5 text-yellow-600 mt-0.5"/>
                      <div>
                        <h4 className="font-medium text-yellow-800">Importante</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          As configurações de segurança afetam a proteção de dados dos pacientes. 
                          Certifique-se de que todas as medidas estão adequadas às normas de proteção de dados.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Ações */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportSettings} className="flex items-center gap-2">
                <Download className="w-4 h-4"/>
                Exportar
              </Button>
              <Button variant="outline" onClick={resetToDefaults} className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4"/>
                Resetar
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={saveSettings} disabled={isSaving} className="flex items-center gap-2">
                {isSaving ? (<RefreshCw className="w-4 h-4 animate-spin"/>) : (<Save className="w-4 h-4"/>)}
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>);
};
export default AISettingsModal;
