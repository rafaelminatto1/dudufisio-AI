// TISS 4.0 integration service for health insurance communication
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';

interface TissGuia {
  id: string;
  tipo: 'SP-SADT' | 'CONSULTA' | 'INTERNACAO' | 'URGENCIA';
  numeroGuia: string;
  numeroCarteira: string;
  validadeCarteira: string;
  nomeBeneficiario: string;
  numeroRegistroANS: string;
  codigoPrestador: string;
  nomeExecutante: string;
  especialidade: string;
  dataAtendimento: string;
  procedimentos: TissProcedimento[];
  valorTotal: number;
  status: 'pendente' | 'enviada' | 'autorizada' | 'negada' | 'processada' | 'cancelada';
  protocoloEnvio?: string;
  dataEnvio?: Date;
  dataRetorno?: Date;
  observacoes?: string;
  arquivoXML?: string;
  codigoRetorno?: string;
  mensagemRetorno?: string;
}

interface TissProcedimento {
  codigo: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  dataRealizacao: string;
  executante?: {
    codigo: string;
    nome: string;
    conselho: string;
    numeroConselho: string;
    uf: string;
  };
  via?: 'A' | 'O'; // Acesso ou Via Oral
  tecnica?: string;
  fatorReducaoAcrescimo?: number;
  valorFator?: number;
}

interface TissRetorno {
  protocoloRecebimento: string;
  situacaoProtocolo: 'PROCESSADA' | 'PROCESSADA_COM_ERRO' | 'REJEITADA';
  descricaoSituacao: string;
  hashComprovante: string;
  dataProcessamento: Date;
  guiasProcessadas: TissGuiaProcessada[];
  erros?: TissErro[];
  alertas?: TissAlerta[];
}

interface TissGuiaProcessada {
  numeroGuiaPrestador: string;
  numeroGuiaOperadora?: string;
  situacaoGuia: 'AUTORIZADA' | 'NEGADA' | 'SOLICITACAO_AUTORIZACAO';
  valorInformado: number;
  valorProcessado: number;
  valorGlosa: number;
  valorLiberado: number;
  procedimentosProcessados: TissProcedimentoProcessado[];
  observacoes?: string;
  justificativaGlosa?: string;
}

interface TissProcedimentoProcessado {
  sequenciaProcedimento: number;
  codigoProcedimento: string;
  quantidadeInformada: number;
  quantidadeProcessada: number;
  valorInformado: number;
  valorProcessado: number;
  valorGlosa: number;
  codigoGlosa?: string;
  justificativaGlosa?: string;
}

interface TissErro {
  codigo: string;
  descricao: string;
  campo?: string;
  linha?: number;
  tipo: 'ERRO' | 'AVISO';
}

interface TissAlerta {
  codigo: string;
  descricao: string;
  campo?: string;
}

interface TissOperadora {
  registroANS: string;
  nomeOperadora: string;
  endpointWS: string;
  certificadoDigital: string;
  usuarioWS: string;
  senhaWS: string;
  versaoTISS: '4.03.02';
  ambiente: 'PRODUCAO' | 'HOMOLOGACAO';
  timeout: number;
  tentativasMaximas: number;
  intervaloTentativas: number;
  ativo: boolean;
}

interface TissConfiguracaoPrestador {
  codigoPrestador: string;
  nomePrestador: string;
  cnpj: string;
  inscricaoMunicipal?: string;
  inscricaoEstadual?: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };
  contato: {
    telefone: string;
    email: string;
  };
  dadosBancarios: {
    banco: string;
    agencia: string;
    conta: string;
    tipoConta: 'CORRENTE' | 'POUPANCA';
  };
  responsavelTecnico: {
    nome: string;
    conselho: string;
    numeroConselho: string;
    uf: string;
  };
}

interface TissTabelaProcedimentos {
  codigo: string;
  descricao: string;
  tipo: 'AMBULATORIAL' | 'HOSPITALAR';
  especialidade: string;
  valor: number;
  cobertura: 'OBRIGATORIA' | 'OPCIONAL';
  ativo: boolean;
  dataVigencia: Date;
  observacoes?: string;
}

interface TissAuditoria {
  id: string;
  tipo: 'ENVIO' | 'RETORNO' | 'ERRO' | 'TIMEOUT';
  protocolo?: string;
  guiaId?: string;
  operadoraRegistro: string;
  timestamp: Date;
  dados: any;
  tamanhoXML?: number;
  tempoResposta?: number;
  statusHTTP?: number;
  mensagemErro?: string;
  tentativa: number;
  sucesso: boolean;
}

class TissIntegrationService {
  private supabase: SupabaseClient;
  private xmlParser: XMLParser;
  private xmlBuilder: XMLBuilder;
  private operadoras: Map<string, TissOperadora> = new Map();
  private configuracaoPrestador: TissConfiguracaoPrestador | null = null;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      parseAttributeValue: true,
      parseTagValue: true,
    });

    this.xmlBuilder = new XMLBuilder({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      format: true,
      suppressEmptyNode: true,
    });

    this.inicializarOperadoras();
    this.carregarConfiguracaoPrestador();
  }

  private async inicializarOperadoras(): Promise<void> {
    // Carregar operadoras configuradas
    const { data: operadoras } = await this.supabase
      .from('tiss_operadoras')
      .select('*')
      .eq('ativo', true);

    operadoras?.forEach(operadora => {
      this.operadoras.set(operadora.registroANS, operadora);
    });

    // Operadoras de exemplo (devem ser configuradas pelo administrador)
    if (this.operadoras.size === 0) {
      this.adicionarOperadorasPadrao();
    }
  }

  private adicionarOperadorasPadrao(): void {
    const operadorasPadrao: TissOperadora[] = [
      {
        registroANS: '12345678',
        nomeOperadora: 'Unimed',
        endpointWS: 'https://webservice.unimed.com.br/tiss/v4',
        certificadoDigital: '',
        usuarioWS: '',
        senhaWS: '',
        versaoTISS: '4.03.02',
        ambiente: 'HOMOLOGACAO',
        timeout: 30000,
        tentativasMaximas: 3,
        intervaloTentativas: 5000,
        ativo: false, // Deve ser ativado após configuração
      },
      {
        registroANS: '87654321',
        nomeOperadora: 'Bradesco Saúde',
        endpointWS: 'https://webservice.bradescosaude.com.br/tiss/v4',
        certificadoDigital: '',
        usuarioWS: '',
        senhaWS: '',
        versaoTISS: '4.03.02',
        ambiente: 'HOMOLOGACAO',
        timeout: 30000,
        tentativasMaximas: 3,
        intervaloTentativas: 5000,
        ativo: false,
      },
    ];

    operadorasPadrao.forEach(operadora => {
      this.operadoras.set(operadora.registroANS, operadora);
    });
  }

  private async carregarConfiguracaoPrestador(): Promise<void> {
    const { data } = await this.supabase
      .from('tiss_prestador_config')
      .select('*')
      .single();

    if (data) {
      this.configuracaoPrestador = data;
    }
  }

  async criarGuiaSPSADT(
    dadosGuia: {
      pacienteId: string;
      numeroCarteira: string;
      validadeCarteira: string;
      registroANS: string;
      procedimentos: {
        codigo: string;
        quantidade: number;
        dataRealizacao: string;
        executante?: {
          codigo: string;
          conselho: string;
          numeroConselho: string;
          uf: string;
        };
      }[];
      observacoes?: string;
    }
  ): Promise<TissGuia> {
    if (!this.configuracaoPrestador) {
      throw new Error('Configuração do prestador não encontrada');
    }

    // Buscar dados do paciente
    const { data: paciente } = await this.supabase
      .from('patients')
      .select('*')
      .eq('id', dadosGuia.pacienteId)
      .single();

    if (!paciente) {
      throw new Error('Paciente não encontrado');
    }

    // Buscar tabela de procedimentos
    const codigosProcedimentos = dadosGuia.procedimentos.map(p => p.codigo);
    const { data: procedimentosTabela } = await this.supabase
      .from('tiss_tabela_procedimentos')
      .select('*')
      .in('codigo', codigosProcedimentos);

    const procedimentosTiss: TissProcedimento[] = dadosGuia.procedimentos.map(proc => {
      const tabela = procedimentosTabela?.find(t => t.codigo === proc.codigo);
      if (!tabela) {
        throw new Error(`Procedimento ${proc.codigo} não encontrado na tabela`);
      }

      const valorUnitario = tabela.valor;
      const valorTotal = valorUnitario * proc.quantidade;

      return {
        codigo: proc.codigo,
        descricao: tabela.descricao,
        quantidade: proc.quantidade,
        valorUnitario,
        valorTotal,
        dataRealizacao: proc.dataRealizacao,
        executante: proc.executante ? {
          codigo: proc.executante.codigo,
          nome: '', // Buscar na tabela de profissionais
          conselho: proc.executante.conselho,
          numeroConselho: proc.executante.numeroConselho,
          uf: proc.executante.uf,
        } : undefined,
      };
    });

    const valorTotal = procedimentosTiss.reduce((sum, proc) => sum + proc.valorTotal, 0);

    const guia: TissGuia = {
      id: crypto.randomUUID(),
      tipo: 'SP-SADT',
      numeroGuia: await this.gerarNumeroGuia(),
      numeroCarteira: dadosGuia.numeroCarteira,
      validadeCarteira: dadosGuia.validadeCarteira,
      nomeBeneficiario: paciente.name,
      numeroRegistroANS: dadosGuia.registroANS,
      codigoPrestador: this.configuracaoPrestador.codigoPrestador,
      nomeExecutante: this.configuracaoPrestador.nomePrestador,
      especialidade: '02', // Fisioterapia
      dataAtendimento: new Date().toISOString().split('T')[0],
      procedimentos: procedimentosTiss,
      valorTotal,
      status: 'pendente',
      observacoes: dadosGuia.observacoes,
    };

    // Salvar guia no banco
    const { error } = await this.supabase
      .from('tiss_guias')
      .insert(guia);

    if (error) {
      throw new Error(`Erro ao salvar guia: ${error.message}`);
    }

    await this.criarAuditoria({
      tipo: 'ENVIO',
      guiaId: guia.id,
      operadoraRegistro: dadosGuia.registroANS,
      timestamp: new Date(),
      dados: guia,
      tentativa: 0,
      sucesso: true,
    });

    return guia;
  }

  async enviarGuia(guiaId: string): Promise<string> {
    // Buscar guia
    const { data: guia, error } = await this.supabase
      .from('tiss_guias')
      .select('*')
      .eq('id', guiaId)
      .single();

    if (error || !guia) {
      throw new Error('Guia não encontrada');
    }

    if (guia.status !== 'pendente') {
      throw new Error(`Guia já foi enviada. Status atual: ${guia.status}`);
    }

    const operadora = this.operadoras.get(guia.numeroRegistroANS);
    if (!operadora || !operadora.ativo) {
      throw new Error('Operadora não configurada ou inativa');
    }

    try {
      // Gerar XML TISS
      const xmlTiss = await this.gerarXMLGuia(guia);

      // Enviar para operadora
      const retorno = await this.enviarParaOperadora(operadora, xmlTiss);

      // Atualizar guia
      await this.supabase
        .from('tiss_guias')
        .update({
          status: 'enviada',
          protocoloEnvio: retorno.protocoloRecebimento,
          dataEnvio: new Date().toISOString(),
          arquivoXML: xmlTiss,
        })
        .eq('id', guiaId);

      await this.criarAuditoria({
        tipo: 'ENVIO',
        protocolo: retorno.protocoloRecebimento,
        guiaId,
        operadoraRegistro: guia.numeroRegistroANS,
        timestamp: new Date(),
        dados: { xmlTiss, retorno },
        tamanhoXML: xmlTiss.length,
        tentativa: 1,
        sucesso: true,
      });

      return retorno.protocoloRecebimento;

    } catch (error) {
      await this.supabase
        .from('tiss_guias')
        .update({ status: 'pendente' })
        .eq('id', guiaId);

      await this.criarAuditoria({
        tipo: 'ERRO',
        guiaId,
        operadoraRegistro: guia.numeroRegistroANS,
        timestamp: new Date(),
        dados: guia,
        mensagemErro: error instanceof Error ? error.message : 'Erro desconhecido',
        tentativa: 1,
        sucesso: false,
      });

      throw error;
    }
  }

  async consultarRetorno(protocolo: string, registroANS: string): Promise<TissRetorno | null> {
    const operadora = this.operadoras.get(registroANS);
    if (!operadora || !operadora.ativo) {
      throw new Error('Operadora não configurada');
    }

    try {
      const retorno = await this.consultarRetornoOperadora(operadora, protocolo);

      if (retorno) {
        // Processar retorno
        await this.processarRetorno(retorno);

        await this.criarAuditoria({
          tipo: 'RETORNO',
          protocolo,
          operadoraRegistro: registroANS,
          timestamp: new Date(),
          dados: retorno,
          tentativa: 1,
          sucesso: true,
        });
      }

      return retorno;

    } catch (error) {
      await this.criarAuditoria({
        tipo: 'ERRO',
        protocolo,
        operadoraRegistro: registroANS,
        timestamp: new Date(),
        dados: { protocolo },
        mensagemErro: error instanceof Error ? error.message : 'Erro desconhecido',
        tentativa: 1,
        sucesso: false,
      });

      throw error;
    }
  }

  private async gerarXMLGuia(guia: TissGuia): Promise<string> {
    if (!this.configuracaoPrestador) {
      throw new Error('Configuração do prestador não encontrada');
    }

    const xmlData = {
      'tiss:tissMessage': {
        '@_xmlns:tiss': 'http://www.ans.gov.br/tiss/schemas',
        '@_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        '@_xsi:schemaLocation': 'http://www.ans.gov.br/tiss/schemas tissV4_03_02.xsd',
        'tiss:header': {
          'tiss:messageId': crypto.randomUUID(),
          'tiss:timestamp': new Date().toISOString(),
          'tiss:version': '4.03.02',
          'tiss:sender': {
            'tiss:id': this.configuracaoPrestador.codigoPrestador,
            'tiss:name': this.configuracaoPrestador.nomePrestador,
          },
          'tiss:receiver': {
            'tiss:id': guia.numeroRegistroANS,
          },
        },
        'tiss:body': {
          'tiss:loteGuias': {
            'tiss:numeroLote': await this.gerarNumeroLote(),
            'tiss:guiasSP-SADT': {
              'tiss:guiaSP-SADT': {
                'tiss:cabecalhoGuia': {
                  'tiss:registroANS': guia.numeroRegistroANS,
                  'tiss:numeroGuiaPrestador': guia.numeroGuia,
                },
                'tiss:dadosBeneficiario': {
                  'tiss:numeroCarteira': guia.numeroCarteira,
                  'tiss:validadeCarteira': guia.validadeCarteira,
                  'tiss:nomeBeneficiario': guia.nomeBeneficiario,
                },
                'tiss:dadosSolicitante': {
                  'tiss:codigoPrestadorNaOperadora': guia.codigoPrestador,
                  'tiss:nomeContratado': this.configuracaoPrestador.nomePrestador,
                },
                'tiss:dadosExecutante': {
                  'tiss:codigoPrestadorNaOperadora': guia.codigoPrestador,
                  'tiss:nomeContratado': guia.nomeExecutante,
                },
                'tiss:dadosAtendimento': {
                  'tiss:dataAtendimento': guia.dataAtendimento,
                  'tiss:tipoConsulta': '1', // Primeira consulta
                  'tiss:procedimentos': {
                    'tiss:procedimentoExecutado': guia.procedimentos.map((proc, index) => ({
                      'tiss:sequencialItem': index + 1,
                      'tiss:procedimento': {
                        'tiss:codigoTabela': '22', // TUSS
                        'tiss:codigoProcedimento': proc.codigo,
                        'tiss:descricaoProcedimento': proc.descricao,
                      },
                      'tiss:quantidadeExecutada': proc.quantidade,
                      'tiss:valorUnitario': proc.valorUnitario.toFixed(2),
                      'tiss:valorTotal': proc.valorTotal.toFixed(2),
                      'tiss:dataExecucao': proc.dataRealizacao,
                      ...(proc.executante && {
                        'tiss:grauPart': '12', // Responsável
                        'tiss:codConselho': proc.executante.conselho,
                        'tiss:numeroConselho': proc.executante.numeroConselho,
                        'tiss:UF': proc.executante.uf,
                      }),
                    })),
                  },
                },
                'tiss:valorTotal': {
                  'tiss:valorTotalGeral': guia.valorTotal.toFixed(2),
                },
                ...(guia.observacoes && {
                  'tiss:observacoes': guia.observacoes,
                }),
              },
            },
          },
        },
      },
    };

    return this.xmlBuilder.build(xmlData);
  }

  private async enviarParaOperadora(operadora: TissOperadora, xmlData: string): Promise<TissRetorno> {
    const startTime = Date.now();

    try {
      const response = await fetch(operadora.endpointWS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
          'SOAPAction': '"enviarLoteGuias"',
          'Authorization': `Basic ${btoa(`${operadora.usuarioWS}:${operadora.senhaWS}`)}`,
        },
        body: this.construirSOAPEnvelope(xmlData),
        signal: AbortSignal.timeout(operadora.timeout),
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseXML = await response.text();
      const parsedResponse = this.xmlParser.parse(responseXML);

      return this.parseRetornoXML(parsedResponse, responseTime, response.status);

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Timeout na comunicação com a operadora');
      }
      throw error;
    }
  }

  private construirSOAPEnvelope(xmlData: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
  <soap:Header/>
  <soap:Body>
    <tiss:enviarLoteGuias xmlns:tiss="http://www.ans.gov.br/tiss/schemas">
      <tiss:loteGuias>
        ${xmlData}
      </tiss:loteGuias>
    </tiss:enviarLoteGuias>
  </soap:Body>
</soap:Envelope>`;
  }

  private parseRetornoXML(_responseXML: any, _responseTime: number, _statusHTTP: number): TissRetorno {
    // Extrair dados do retorno TISS (simplificado)
    // Em produção, seria necessário parsing completo do XML de retorno

    return {
      protocoloRecebimento: `PROT_${Date.now()}`,
      situacaoProtocolo: 'PROCESSADA',
      descricaoSituacao: 'Lote processado com sucesso',
      hashComprovante: crypto.randomUUID(),
      dataProcessamento: new Date(),
      guiasProcessadas: [],
    };
  }

  private async consultarRetornoOperadora(
    operadora: TissOperadora,
    protocolo: string
  ): Promise<TissRetorno | null> {
    try {
      const soapBody = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
  <soap:Body>
    <tiss:consultarLoteGuias xmlns:tiss="http://www.ans.gov.br/tiss/schemas">
      <tiss:protocolo>${protocolo}</tiss:protocolo>
    </tiss:consultarLoteGuias>
  </soap:Body>
</soap:Envelope>`;

      const response = await fetch(operadora.endpointWS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
          'SOAPAction': '"consultarLoteGuias"',
          'Authorization': `Basic ${btoa(`${operadora.usuarioWS}:${operadora.senhaWS}`)}`,
        },
        body: soapBody,
        signal: AbortSignal.timeout(operadora.timeout),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseXML = await response.text();
      const parsedResponse = this.xmlParser.parse(responseXML);

      return this.parseRetornoConsulta(parsedResponse);

    } catch (error) {
      console.error('Erro ao consultar retorno:', error);
      return null;
    }
  }

  private parseRetornoConsulta(_responseXML: any): TissRetorno {
    // Parse simplificado - em produção seria completo
    return {
      protocoloRecebimento: 'CONSULTA_123',
      situacaoProtocolo: 'PROCESSADA',
      descricaoSituacao: 'Consulta processada',
      hashComprovante: crypto.randomUUID(),
      dataProcessamento: new Date(),
      guiasProcessadas: [],
    };
  }

  private async processarRetorno(retorno: TissRetorno): Promise<void> {
    // Processar cada guia do retorno
    for (const guiaProcessada of retorno.guiasProcessadas) {
      await this.supabase
        .from('tiss_guias')
        .update({
          status: guiaProcessada.situacaoGuia.toLowerCase(),
          dataRetorno: new Date().toISOString(),
          codigoRetorno: guiaProcessada.situacaoGuia,
          mensagemRetorno: guiaProcessada.observacoes,
        })
        .eq('numeroGuia', guiaProcessada.numeroGuiaPrestador);

      // Criar registro de processamento
      await this.supabase
        .from('tiss_processamento')
        .insert({
          protocoloRetorno: retorno.protocoloRecebimento,
          numeroGuiaPrestador: guiaProcessada.numeroGuiaPrestador,
          numeroGuiaOperadora: guiaProcessada.numeroGuiaOperadora,
          situacao: guiaProcessada.situacaoGuia,
          valorInformado: guiaProcessada.valorInformado,
          valorProcessado: guiaProcessada.valorProcessado,
          valorGlosa: guiaProcessada.valorGlosa,
          valorLiberado: guiaProcessada.valorLiberado,
          dataProcessamento: retorno.dataProcessamento.toISOString(),
          observacoes: guiaProcessada.observacoes,
          justificativaGlosa: guiaProcessada.justificativaGlosa,
        });
    }
  }

  private async gerarNumeroGuia(): Promise<string> {
    // Gerar número sequencial de guia
    const ano = new Date().getFullYear();
    const { data } = await this.supabase
      .from('tiss_controle_numeracao')
      .select('ultimo_numero')
      .eq('tipo', 'guia')
      .eq('ano', ano)
      .single();

    const proximoNumero = (data?.ultimo_numero || 0) + 1;

    await this.supabase
      .from('tiss_controle_numeracao')
      .upsert({
        tipo: 'guia',
        ano,
        ultimo_numero: proximoNumero,
      });

    return `${ano}${proximoNumero.toString().padStart(6, '0')}`;
  }

  private async gerarNumeroLote(): Promise<string> {
    // Gerar número de lote
    const hoje = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const { data } = await this.supabase
      .from('tiss_controle_numeracao')
      .select('ultimo_numero')
      .eq('tipo', 'lote')
      .eq('data', hoje)
      .single();

    const proximoNumero = (data?.ultimo_numero || 0) + 1;

    await this.supabase
      .from('tiss_controle_numeracao')
      .upsert({
        tipo: 'lote',
        data: hoje,
        ultimo_numero: proximoNumero,
      });

    return `${hoje}${proximoNumero.toString().padStart(3, '0')}`;
  }

  private async criarAuditoria(auditoria: Omit<TissAuditoria, 'id'>): Promise<void> {
    await this.supabase
      .from('tiss_auditoria')
      .insert({
        id: crypto.randomUUID(),
        ...auditoria,
      });
  }

  // Métodos públicos para configuração

  async configurarOperadora(operadora: TissOperadora): Promise<void> {
    this.operadoras.set(operadora.registroANS, operadora);

    await this.supabase
      .from('tiss_operadoras')
      .upsert(operadora);
  }

  async configurarPrestador(config: TissConfiguracaoPrestador): Promise<void> {
    this.configuracaoPrestador = config;

    await this.supabase
      .from('tiss_prestador_config')
      .upsert(config);
  }

  async importarTabelaProcedimentos(procedimentos: TissTabelaProcedimentos[]): Promise<void> {
    await this.supabase
      .from('tiss_tabela_procedimentos')
      .upsert(procedimentos);
  }

  // Métodos de consulta

  async getGuias(filtros?: {
    status?: string;
    dataInicio?: string;
    dataFim?: string;
    registroANS?: string;
  }): Promise<TissGuia[]> {
    let query = this.supabase.from('tiss_guias').select('*');

    if (filtros?.status) {
      query = query.eq('status', filtros.status);
    }

    if (filtros?.dataInicio) {
      query = query.gte('dataAtendimento', filtros.dataInicio);
    }

    if (filtros?.dataFim) {
      query = query.lte('dataAtendimento', filtros.dataFim);
    }

    if (filtros?.registroANS) {
      query = query.eq('numeroRegistroANS', filtros.registroANS);
    }

    const { data, error } = await query.order('dataAtendimento', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar guias: ${error.message}`);
    }

    return data || [];
  }

  async getAuditorias(filtros?: {
    tipo?: string;
    dataInicio?: string;
    dataFim?: string;
    sucesso?: boolean;
  }): Promise<TissAuditoria[]> {
    let query = this.supabase.from('tiss_auditoria').select('*');

    if (filtros?.tipo) {
      query = query.eq('tipo', filtros.tipo);
    }

    if (filtros?.dataInicio) {
      query = query.gte('timestamp', filtros.dataInicio);
    }

    if (filtros?.dataFim) {
      query = query.lte('timestamp', filtros.dataFim);
    }

    if (filtros?.sucesso !== undefined) {
      query = query.eq('sucesso', filtros.sucesso);
    }

    const { data, error } = await query.order('timestamp', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar auditorias: ${error.message}`);
    }

    return data || [];
  }

  async getRelatorioFinanceiro(periodo: { inicio: string; fim: string }): Promise<{
    totalGuias: number;
    totalAutorizadas: number;
    totalNegadas: number;
    valorTotal: number;
    valorAutorizado: number;
    valorGlosado: number;
    valorLiberado: number;
    taxaAutorizacao: number;
    procedimentosMaisUtilizados: Array<{
      codigo: string;
      descricao: string;
      quantidade: number;
      valor: number;
    }>;
    operadorasRanking: Array<{
      registroANS: string;
      nome: string;
      guias: number;
      valor: number;
      taxaAutorizacao: number;
    }>;
  }> {
    const { data: guias } = await this.supabase
      .from('tiss_guias')
      .select('*')
      .gte('dataAtendimento', periodo.inicio)
      .lte('dataAtendimento', periodo.fim);

    const { data: processamentos } = await this.supabase
      .from('tiss_processamento')
      .select('*')
      .gte('dataProcessamento', periodo.inicio)
      .lte('dataProcessamento', periodo.fim);

    const totalGuias = guias?.length || 0;
    const totalAutorizadas = guias?.filter(g => g.status === 'autorizada').length || 0;
    const totalNegadas = guias?.filter(g => g.status === 'negada').length || 0;
    const valorTotal = guias?.reduce((sum, g) => sum + g.valorTotal, 0) || 0;

    const valorAutorizado = processamentos?.reduce((sum, p) => sum + p.valorProcessado, 0) || 0;
    const valorGlosado = processamentos?.reduce((sum, p) => sum + p.valorGlosa, 0) || 0;
    const valorLiberado = processamentos?.reduce((sum, p) => sum + p.valorLiberado, 0) || 0;

    const taxaAutorizacao = totalGuias > 0 ? (totalAutorizadas / totalGuias) * 100 : 0;

    // Análise de procedimentos mais utilizados
    const procedimentosCount = new Map<string, { codigo: string; descricao: string; quantidade: number; valor: number }>();

    guias?.forEach(guia => {
      guia.procedimentos?.forEach((proc: TissProcedimento) => {
        const key = proc.codigo;
        const existing = procedimentosCount.get(key) || {
          codigo: proc.codigo,
          descricao: proc.descricao,
          quantidade: 0,
          valor: 0,
        };

        existing.quantidade += proc.quantidade;
        existing.valor += proc.valorTotal;
        procedimentosCount.set(key, existing);
      });
    });

    const procedimentosMaisUtilizados = Array.from(procedimentosCount.values())
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10);

    // Ranking de operadoras
    const operadorasStats = new Map();

    guias?.forEach(guia => {
      const key = guia.numeroRegistroANS;
      const existing = operadorasStats.get(key) || {
        registroANS: guia.numeroRegistroANS,
        nome: this.operadoras.get(guia.numeroRegistroANS)?.nomeOperadora || 'Desconhecida',
        guias: 0,
        valor: 0,
        autorizadas: 0,
      };

      existing.guias += 1;
      existing.valor += guia.valorTotal;
      if (guia.status === 'autorizada') existing.autorizadas += 1;

      operadorasStats.set(key, existing);
    });

    const operadorasRanking = Array.from(operadorasStats.values())
      .map(op => ({
        ...op,
        taxaAutorizacao: op.guias > 0 ? (op.autorizadas / op.guias) * 100 : 0,
      }))
      .sort((a, b) => b.valor - a.valor);

    return {
      totalGuias,
      totalAutorizadas,
      totalNegadas,
      valorTotal,
      valorAutorizado,
      valorGlosado,
      valorLiberado,
      taxaAutorizacao,
      procedimentosMaisUtilizados,
      operadorasRanking,
    };
  }

  // Métodos utilitários

  async validarCarteirinha(_numeroCarteira: string, registroANS: string): Promise<{
    valida: boolean;
    nomeBeneficiario?: string;
    validadeCarteira?: string;
    ativa?: boolean;
    observacoes?: string;
  }> {
    const operadora = this.operadoras.get(registroANS);
    if (!operadora) {
      return { valida: false, observacoes: 'Operadora não configurada' };
    }

    try {
      // Simular validação (em produção seria via webservice da operadora)
      return {
        valida: true,
        nomeBeneficiario: 'João da Silva',
        validadeCarteira: '2024-12-31',
        ativa: true,
      };
    } catch (error) {
      return {
        valida: false,
        observacoes: 'Erro na validação da carteirinha',
      };
    }
  }

  async sincronizarTabelas(): Promise<void> {
    // Sincronizar tabelas da ANS (TUSS, etc.)
    console.log('Sincronizando tabelas da ANS...');

    // Em produção, faria download das tabelas oficiais da ANS
    // e atualizaria a base local
  }

  async processarRetornosAutomatico(): Promise<void> {
    // Buscar guias enviadas há mais de 1 hora
    const { data: guiasEnviadas } = await this.supabase
      .from('tiss_guias')
      .select('*')
      .eq('status', 'enviada')
      .lt('dataEnvio', new Date(Date.now() - 60 * 60 * 1000).toISOString());

    for (const guia of guiasEnviadas || []) {
      if (guia.protocoloEnvio) {
        try {
          await this.consultarRetorno(guia.protocoloEnvio, guia.numeroRegistroANS);
        } catch (error) {
          console.error(`Erro ao consultar retorno da guia ${guia.numeroGuia}:`, error);
        }
      }
    }
  }
}

export const tissIntegrationService = new TissIntegrationService();
export type {
  TissGuia,
  TissProcedimento,
  TissRetorno,
  TissOperadora,
  TissConfiguracaoPrestador,
  TissTabelaProcedimentos,
  TissAuditoria
};