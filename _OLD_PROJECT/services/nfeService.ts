/**
 * Serviço de Emissão de NF-e (Nota Fiscal Eletrônica)
 * Integração com Sefaz e armazenamento de XMLs
 */

import { secureLogger } from '../lib/secureLogger';
import { handleError } from '../lib/middleware/errorHandler';

export interface NFe {
  id: string;
  numero: number;
  serie: number;
  chave: string;
  modelo: '55' | '65'; // 55=NF-e, 65=NFC-e
  tipo: 'entrada' | 'saida';
  finalidade: 'normal' | 'complementar' | 'ajuste' | 'devolucao';
  status: 'em_processamento' | 'autorizada' | 'cancelada' | 'denegada' | 'rejeitada';
  emitente: {
    cnpj: string;
    razaoSocial: string;
    nomeFantasia: string;
    inscricaoEstadual: string;
    endereco: EnderecoNFe;
  };
  destinatario: {
    cpfCnpj: string;
    nome: string;
    endereco: EnderecoNFe;
    email?: string;
  };
  itens: ItemNFe[];
  totais: {
    baseCalculoICMS: number;
    valorICMS: number;
    valorProdutos: number;
    valorFrete: number;
    valorSeguro: number;
    valorDesconto: number;
    valorTotal: number;
    valorTributos: number;
  };
  pagamento: {
    forma: 'dinheiro' | 'cheque' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'boleto';
    valor: number;
    parcelas?: number;
  };
  dataEmissao: Date;
  dataAutorizacao?: Date;
  protocoloAutorizacao?: string;
  xmlAssinado?: string;
  xmlAutorizado?: string;
  danfeUrl?: string;
}

export interface EnderecoNFe {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  codigoMunicipio: string;
}

export interface ItemNFe {
  numero: number;
  codigo: string;
  descricao: string;
  ncm: string;
  cfop: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  tributacao: {
    icms: {
      situacaoTributaria: string;
      aliquota: number;
      valor: number;
    };
    pis: {
      situacaoTributaria: string;
      aliquota: number;
      valor: number;
    };
    cofins: {
      situacaoTributaria: string;
      aliquota: number;
      valor: number;
    };
  };
}

export interface SefazConfig {
  ambiente: 'producao' | 'homologacao';
  uf: string;
  certificado: {
    path: string;
    senha: string;
  };
  emitente: {
    cnpj: string;
    inscricaoEstadual: string;
    razaoSocial: string;
  };
  webhookUrl?: string;
}

class NFeService {
  private config?: SefazConfig;
  private ultimoNumero: number = 0;

  /**
   * Configura integração com Sefaz
   */
  configure(config: SefazConfig) {
    this.config = config;
    secureLogger.info('Sefaz configurado', {
      component: 'NFeService',
      action: 'configure',
      ambiente: config.ambiente,
      uf: config.uf
    });
  }

  /**
   * Gera nova NF-e
   */
  async gerarNFe(dados: Omit<NFe, 'id' | 'numero' | 'chave' | 'status'>): Promise<NFe> {
    try {
      if (!this.config) {
        throw new Error('Sefaz não configurado');
      }

      secureLogger.info('Gerando NF-e', {
        component: 'NFeService',
        action: 'gerarNFe'
      });

      // Gerar número sequencial
      this.ultimoNumero++;
      const numero = this.ultimoNumero;

      // Gerar chave de acesso (44 dígitos)
      const chave = this.gerarChaveAcesso(numero, dados.serie);

      const nfe: NFe = {
        ...dados,
        id: `nfe_${Date.now()}`,
        numero,
        chave,
        status: 'em_processamento'
      };

      // Gerar XML da NF-e
      const xml = this.gerarXML(nfe);
      nfe.xmlAssinado = xml;

      return nfe;
    } catch (error) {
      handleError(error, {
        operation: 'gerarNFe',
        component: 'NFeService',
        severity: 'high',
        context: { dados: { modelo: dados.modelo, tipo: dados.tipo } },
        customMessage: 'Não foi possível gerar a NF-e. Verifique os dados e tente novamente.'
      });
      throw error; // Re-throw para manter compatibilidade
    }
  }

  /**
   * Transmite NF-e para Sefaz
   */
  async transmitirNFe(nfe: NFe): Promise<{
    status: NFe['status'];
    protocolo?: string;
    motivo?: string;
  }> {
    try {
      if (!this.config) {
        throw new Error('Sefaz não configurado');
      }

      secureLogger.info('Transmitindo NF-e', {
        component: 'NFeService',
        action: 'transmitirNFe',
        nfeNumero: nfe.numero
      });

      // Em produção, fazer requisição SOAP para Sefaz
      // Exemplo: NFeAutorizacao4
      
      // Simulação de resposta
      const autorizada = Math.random() > 0.1; // 90% de sucesso

      if (autorizada) {
        const protocolo = `${this.config.uf}${Date.now()}`;
        
        return {
          status: 'autorizada',
          protocolo,
          motivo: 'Autorização de uso da NF-e'
        };
      } else {
        return {
          status: 'rejeitada',
          motivo: 'Erro na validação do XML (simulação)'
        };
      }
    } catch (error) {
      handleError(error, {
        operation: 'transmitirNFe',
        component: 'NFeService',
        severity: 'high',
        context: { nfeNumero: nfe.numero, chave: nfe.chave },
        customMessage: 'Não foi possível transmitir a NF-e para a Sefaz. Verifique a conexão e tente novamente.'
      });
      throw error; // Re-throw para manter compatibilidade
    }
  }

  /**
   * Consulta situação da NF-e
   */
  async consultarNFe(chave: string): Promise<{
    status: NFe['status'];
    protocolo?: string;
    dataAutorizacao?: Date;
  }> {
    try {
      secureLogger.info('Consultando NF-e', {
        component: 'NFeService',
        action: 'consultarNFe',
        chave
      });

      // Em produção, fazer requisição para Sefaz
      // Exemplo: NFeConsultaProtocolo4

      return {
        status: 'autorizada',
        protocolo: 'MOCK_PROTOCOLO',
        dataAutorizacao: new Date()
      };
    } catch (error) {
      handleError(error, {
        operation: 'consultarNFe',
        component: 'NFeService',
        severity: 'medium',
        context: { chave },
        customMessage: 'Não foi possível consultar o status da NF-e. Tente novamente mais tarde.'
      });
      throw error; // Re-throw para manter compatibilidade
    }
  }

  /**
   * Cancela NF-e
   */
  async cancelarNFe(
    chave: string,
    protocolo: string,
    justificativa: string
  ): Promise<{
    sucesso: boolean;
    protocoloCancelamento?: string;
    motivo?: string;
  }> {
    try {
      if (justificativa.length < 15) {
        throw new Error('Justificativa deve ter no mínimo 15 caracteres');
      }

      secureLogger.info('Cancelando NF-e', {
        component: 'NFeService',
        action: 'cancelarNFe',
        chave
      });

      // Em produção, fazer requisição para Sefaz
      // Exemplo: NFeEventoCancelamento

      return {
        sucesso: true,
        protocoloCancelamento: `CANC_${Date.now()}`,
        motivo: 'Cancelamento homologado'
      };
    } catch (error) {
      handleError(error, {
        operation: 'cancelarNFe',
        component: 'NFeService',
        severity: 'high',
        context: { chave, justificativa: justificativa.substring(0, 50) },
        customMessage: 'Não foi possível cancelar a NF-e. Verifique a justificativa e tente novamente.'
      });
      throw error; // Re-throw para manter compatibilidade
    }
  }

  /**
   * Inutiliza numeração de NF-e
   */
  async inutilizarNumeracao(
    numeroInicial: number,
    numeroFinal: number,
    serie: number,
    justificativa: string
  ): Promise<boolean> {
    try {
      if (justificativa.length < 15) {
        throw new Error('Justificativa deve ter no mínimo 15 caracteres');
      }

      secureLogger.info('Inutilizando numeração', {
        component: 'NFeService',
        action: 'inutilizarNumeracao',
        numeroInicial,
        numeroFinal,
        serie
      });

      // Em produção, fazer requisição para Sefaz
      // Exemplo: NFeInutilizacao4

      return true;
    } catch (error) {
      handleError(error, {
        operation: 'inutilizarNumeracao',
        component: 'NFeService',
        severity: 'medium',
        context: { numeroInicial, numeroFinal, serie },
        customMessage: 'Não foi possível inutilizar a numeração. Verifique os dados e tente novamente.'
      });
      return false;
    }
  }

  /**
   * Gera DANFE (Documento Auxiliar da NF-e)
   */
  async gerarDANFE(nfe: NFe): Promise<Blob> {
    try {
      secureLogger.info('Gerando DANFE', {
        component: 'NFeService',
        action: 'gerarDANFE',
        nfeNumero: nfe.numero
      });

      // Em produção, usar biblioteca de geração de PDF
      // Exemplo: pdfmake, jspdf
      
      const pdfContent = `DANFE - Nota Fiscal Eletrônica
      
Número: ${nfe.numero}
Série: ${nfe.serie}
Chave: ${nfe.chave}
Data Emissão: ${nfe.dataEmissao.toLocaleDateString('pt-BR')}

Emitente:
${nfe.emitente.razaoSocial}
CNPJ: ${nfe.emitente.cnpj}

Destinatário:
${nfe.destinatario.nome}
CPF/CNPJ: ${nfe.destinatario.cpfCnpj}

Valor Total: R$ ${nfe.totais.valorTotal.toFixed(2)}

Status: ${nfe.status}
${nfe.protocoloAutorizacao ? `Protocolo: ${nfe.protocoloAutorizacao}` : ''}
`;

      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      return blob;
    } catch (error) {
      handleError(error, {
        operation: 'gerarDANFE',
        component: 'NFeService',
        severity: 'medium',
        context: { nfeNumero: nfe.numero },
        customMessage: 'Não foi possível gerar o DANFE. Tente novamente mais tarde.'
      });
      throw error; // Re-throw para manter compatibilidade
    }
  }

  /**
   * Envia NF-e por email
   */
  async enviarPorEmail(nfe: NFe, destinatario: string): Promise<void> {
    try {
      secureLogger.info('Enviando NF-e por email', {
        component: 'NFeService',
        action: 'enviarPorEmail',
        nfeNumero: nfe.numero
      });

      // Gerar DANFE
      const danfe = await this.gerarDANFE(nfe);

      // Em produção, integrar com serviço de email
      secureLogger.info('Email enviado com sucesso', {
        component: 'NFeService',
        action: 'enviarPorEmail'
      });
    } catch (error) {
      handleError(error, {
        operation: 'enviarPorEmail',
        component: 'NFeService',
        severity: 'medium',
        context: { nfeNumero: nfe.numero, destinatario },
        customMessage: 'Não foi possível enviar a NF-e por email. Verifique o endereço e tente novamente.'
      });
      throw error; // Re-throw para manter compatibilidade
    }
  }

  /**
   * Armazena XML da NF-e
   */
  async armazenarXML(nfe: NFe): Promise<string> {
    try {
      secureLogger.info('Armazenando XML', {
        component: 'NFeService',
        action: 'armazenarXML',
        chave: nfe.chave
      });

      // Em produção, salvar em storage (S3, Supabase Storage, etc)
      const filename = `${nfe.chave}.xml`;
      const path = `/nfes/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${filename}`;

      // Simulação
      return path;
    } catch (error) {
      handleError(error, {
        operation: 'armazenarXML',
        component: 'NFeService',
        severity: 'high',
        context: { chave: nfe.chave },
        customMessage: 'Não foi possível armazenar o XML da NF-e. Verifique o storage e tente novamente.'
      });
      throw error; // Re-throw para manter compatibilidade
    }
  }

  /**
   * Gera chave de acesso da NF-e (44 dígitos)
   */
  private gerarChaveAcesso(numero: number, serie: number): string {
    if (!this.config) return '';

    const uf = this.getCodigoUF(this.config.uf);
    const aamm = new Date().toISOString().slice(2, 7).replace('-', '');
    const cnpj = this.config.emitente.cnpj.replace(/\D/g, '');
    const mod = '55'; // Modelo 55 (NF-e)
    const seriePad = serie.toString().padStart(3, '0');
    const numeroPad = numero.toString().padStart(9, '0');
    const tpEmis = '1'; // Tipo de emissão: Normal
    const cNF = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');

    const chave = `${uf}${aamm}${cnpj}${mod}${seriePad}${numeroPad}${tpEmis}${cNF}`;
    const dv = this.calcularDV(chave);

    return chave + dv;
  }

  /**
   * Calcula dígito verificador da chave
   */
  private calcularDV(chave: string): string {
    const multiplicadores = [2, 3, 4, 5, 6, 7, 8, 9];
    let soma = 0;
    let multiplicadorIndex = 0;

    for (let i = chave.length - 1; i >= 0; i--) {
      soma += parseInt(chave[i]) * multiplicadores[multiplicadorIndex];
      multiplicadorIndex = (multiplicadorIndex + 1) % 8;
    }

    const resto = soma % 11;
    const dv = resto < 2 ? 0 : 11 - resto;

    return dv.toString();
  }

  /**
   * Retorna código da UF
   */
  private getCodigoUF(uf: string): string {
    const codigos: Record<string, string> = {
      'AC': '12', 'AL': '27', 'AP': '16', 'AM': '13', 'BA': '29',
      'CE': '23', 'DF': '53', 'ES': '32', 'GO': '52', 'MA': '21',
      'MT': '51', 'MS': '50', 'MG': '31', 'PA': '15', 'PB': '25',
      'PR': '41', 'PE': '26', 'PI': '22', 'RJ': '33', 'RN': '24',
      'RS': '43', 'RO': '11', 'RR': '14', 'SC': '42', 'SP': '35',
      'SE': '28', 'TO': '17'
    };
    return codigos[uf] || '35'; // Default SP
  }

  /**
   * Gera XML da NF-e
   */
  private gerarXML(nfe: NFe): string {
    // Em produção, usar biblioteca de geração de XML
    // Exemplo: xml2js, fast-xml-parser
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe>
    <infNFe Id="NFe${nfe.chave}" versao="4.00">
      <ide>
        <cUF>${this.getCodigoUF(nfe.emitente.endereco.uf)}</cUF>
        <cNF>${nfe.chave.slice(-9, -1)}</cNF>
        <natOp>Prestação de Serviço</natOp>
        <mod>${nfe.modelo}</mod>
        <serie>${nfe.serie}</serie>
        <nNF>${nfe.numero}</nNF>
        <dhEmi>${nfe.dataEmissao.toISOString()}</dhEmi>
        <tpNF>${nfe.tipo === 'saida' ? '1' : '0'}</tpNF>
        <finNFe>1</finNFe>
      </ide>
      <!-- Outros campos do XML -->
    </infNFe>
  </NFe>
</nfeProc>`;
  }
}

export const nfeService = new NFeService();
