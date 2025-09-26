/**
 * Sistema de Assinatura Digital para Documentos Clínicos
 * Implementa assinatura digital certificada seguindo padrões de segurança
 */

import {
  DigitalSignature,
  SignatureVerificationResult,
  SignatureDetails,
  SignatureAlgorithm,
  Timestamp,
  CertificateId,
  TherapistId,
  DocumentId,
  DomainError,
  SignatureError
} from '../../../types/medical-records';

export class DigitalSignatureService {
  private readonly certificateStore: CertificateStore;
  private readonly timestampService: TimestampService;

  constructor(
    certificateStore: CertificateStore,
    timestampService: TimestampService
  ) {
    this.certificateStore = certificateStore;
    this.timestampService = timestampService;
  }

  /**
   * Assina um documento digitalmente
   */
  async signDocument(
    documentId: DocumentId,
    therapistId: TherapistId,
    certificateId: CertificateId,
    documentContent: string
  ): Promise<DigitalSignature> {
    try {
      // Validar certificado
      const certificate = await this.certificateStore.getCertificate(certificateId);
      if (!certificate.isValid()) {
        throw new SignatureError(
          'Certificate is not valid or has expired',
          'certificate'
        );
      }

      // Verificar se o certificado pertence ao terapeuta
      if (certificate.userId !== therapistId) {
        throw new SignatureError(
          'Certificate does not belong to the therapist',
          'certificate'
        );
      }

      // Gerar hash do documento
      const documentHash = this.generateDocumentHash(documentContent);

      // Assinar com certificado digital
      const signature = await certificate.sign(documentHash);

      // Obter timestamp confiável
      const timestamp = await this.timestampService.getTimestamp(signature);

      return new DigitalSignature(
        signature,
        certificate.getPublicKey(),
        timestamp,
        documentHash,
        SignatureAlgorithm.RSA_SHA256
      );
    } catch (error) {
      if (error instanceof SignatureError) {
        throw error;
      }
      throw new SignatureError(
        `Failed to sign document: ${error.message}`,
        'signature'
      );
    }
  }

  /**
   * Verifica a assinatura de um documento
   */
  async verifySignature(
    documentId: DocumentId,
    signature: DigitalSignature,
    documentContent: string
  ): Promise<SignatureVerificationResult> {
    try {
      // Verificar integridade do documento
      const currentHash = this.generateDocumentHash(documentContent);
      if (currentHash !== signature.documentHash) {
        return SignatureVerificationResult.invalid('Document has been modified');
      }

      // Verificar assinatura criptográfica
      const isValidSignature = await this.verifyCryptographicSignature(
        signature.signature,
        signature.publicKey,
        currentHash
      );

      if (!isValidSignature) {
        return SignatureVerificationResult.invalid('Invalid signature');
      }

      // Verificar timestamp
      const isValidTimestamp = await this.timestampService.verifyTimestamp(
        signature.timestamp
      );

      if (!isValidTimestamp) {
        return SignatureVerificationResult.invalid('Invalid timestamp');
      }

      // Verificar se o certificado ainda é válido
      const certificate = await this.certificateStore.getCertificateByPublicKey(
        signature.publicKey
      );

      if (!certificate?.isValid()) {
        return SignatureVerificationResult.invalid('Certificate is not valid');
      }

      return SignatureVerificationResult.valid({
        signedAt: signature.timestamp.time,
        certificate: signature.publicKey,
        algorithm: signature.algorithm
      });
    } catch (error) {
      return SignatureVerificationResult.invalid(
        `Verification failed: ${error.message}`
      );
    }
  }

  /**
   * Gera hash SHA-256 do documento
   */
  private generateDocumentHash(content: string): string {
    const crypto = require('crypto-js');
    return crypto.SHA256(content).toString();
  }

  /**
   * Verifica assinatura criptográfica
   */
  private async verifyCryptographicSignature(
    signature: string,
    publicKey: string,
    hash: string
  ): Promise<boolean> {
    try {
      const forge = require('node-forge');
      
      // Converter chave pública
      const publicKeyPem = forge.pki.publicKeyFromPem(publicKey);
      
      // Converter assinatura de hex para bytes
      const signatureBytes = forge.util.hexToBytes(signature);
      
      // Verificar assinatura
      const md = forge.md.sha256.create();
      md.update(hash, 'utf8');
      
      return publicKeyPem.verify(md.digest().bytes(), signatureBytes);
    } catch (error) {
      console.error('Error verifying cryptographic signature:', error);
      return false;
    }
  }
}

/**
 * Resultado de verificação de assinatura
 */
export class SignatureVerificationResult {
  private constructor(
    public readonly isValid: boolean,
    public readonly details?: SignatureDetails,
    public readonly error?: string
  ) {}

  static valid(details: SignatureDetails): SignatureVerificationResult {
    return new SignatureVerificationResult(true, details);
  }

  static invalid(error: string): SignatureVerificationResult {
    return new SignatureVerificationResult(false, undefined, error);
  }
}

/**
 * Armazenamento de certificados digitais
 */
export class CertificateStore {
  private certificates = new Map<CertificateId, DigitalCertificate>();

  /**
   * Obtém um certificado por ID
   */
  async getCertificate(certificateId: CertificateId): Promise<DigitalCertificate> {
    const certificate = this.certificates.get(certificateId);
    if (!certificate) {
      throw new SignatureError(
        'Certificate not found',
        'certificateId'
      );
    }
    return certificate;
  }

  /**
   * Obtém um certificado por chave pública
   */
  async getCertificateByPublicKey(publicKey: string): Promise<DigitalCertificate | null> {
    for (const certificate of this.certificates.values()) {
      if (certificate.getPublicKey() === publicKey) {
        return certificate;
      }
    }
    return null;
  }

  /**
   * Adiciona um novo certificado
   */
  async addCertificate(certificate: DigitalCertificate): Promise<void> {
    this.certificates.set(certificate.id, certificate);
  }

  /**
   * Remove um certificado
   */
  async removeCertificate(certificateId: CertificateId): Promise<void> {
    this.certificates.delete(certificateId);
  }
}

/**
 * Certificado digital
 */
export class DigitalCertificate {
  private readonly forge = require('node-forge');

  constructor(
    public readonly id: CertificateId,
    public readonly userId: TherapistId,
    private readonly privateKey: any,
    private readonly publicKey: any,
    public readonly validFrom: Date,
    public readonly validUntil: Date,
    public readonly algorithm: SignatureAlgorithm = SignatureAlgorithm.RSA_SHA256
  ) {}

  /**
   * Verifica se o certificado é válido
   */
  isValid(): boolean {
    const now = new Date();
    return now >= this.validFrom && now <= this.validUntil;
  }

  /**
   * Obtém a chave pública em formato PEM
   */
  getPublicKey(): string {
    return this.forge.pki.publicKeyToPem(this.publicKey);
  }

  /**
   * Assina um hash com a chave privada
   */
  async sign(hash: string): Promise<string> {
    try {
      const md = this.forge.md.sha256.create();
      md.update(hash, 'utf8');
      
      const signature = this.privateKey.sign(md);
      return this.forge.util.bytesToHex(signature);
    } catch (error) {
      throw new SignatureError(
        `Failed to sign: ${error.message}`,
        'signature'
      );
    }
  }

  /**
   * Cria um novo certificado
   */
  static create(
    userId: TherapistId,
    validYears: number = 2
  ): DigitalCertificate {
    const forge = require('node-forge');
    
    // Gerar par de chaves RSA
    const keypair = forge.pki.rsa.generateKeyPair(2048);
    
    const now = new Date();
    const validUntil = new Date(now.getTime() + (validYears * 365 * 24 * 60 * 60 * 1000));
    
    const id = require('crypto').randomUUID();
    
    return new DigitalCertificate(
      id,
      userId,
      keypair.privateKey,
      keypair.publicKey,
      now,
      validUntil
    );
  }
}

/**
 * Serviço de timestamp confiável
 */
export class TimestampService {
  /**
   * Obtém um timestamp confiável
   */
  async getTimestamp(data: string): Promise<Timestamp> {
    try {
      // Em uma implementação real, isso seria integrado com um TSA (Time Stamping Authority)
      // Por enquanto, usamos um timestamp local com hash para integridade
      const crypto = require('crypto-js');
      const hash = crypto.SHA256(data + Date.now().toString()).toString();
      
      return {
        time: new Date(),
        authority: 'LOCAL_TSA',
        token: hash
      };
    } catch (error) {
      throw new SignatureError(
        `Failed to get timestamp: ${error.message}`,
        'timestamp'
      );
    }
  }

  /**
   * Verifica um timestamp
   */
  async verifyTimestamp(timestamp: Timestamp): Promise<boolean> {
    try {
      // Verificar se o timestamp não é muito antigo (ex: mais de 1 ano)
      const oneYearAgo = new Date(Date.now() - (365 * 24 * 60 * 60 * 1000));
      if (timestamp.time < oneYearAgo) {
        return false;
      }

      // Verificar se o timestamp não é no futuro
      const now = new Date();
      if (timestamp.time > now) {
        return false;
      }

      // Em uma implementação real, verificaríamos o token com o TSA
      return true;
    } catch (error) {
      console.error('Error verifying timestamp:', error);
      return false;
    }
  }
}

/**
 * Utilitários para assinatura digital
 */
export class SignatureUtils {
  /**
   * Gera um par de chaves RSA
   */
  static generateKeyPair(): { privateKey: string; publicKey: string } {
    const forge = require('node-forge');
    const keypair = forge.pki.rsa.generateKeyPair(2048);
    
    return {
      privateKey: forge.pki.privateKeyToPem(keypair.privateKey),
      publicKey: forge.pki.publicKeyToPem(keypair.publicKey)
    };
  }

  /**
   * Valida formato de chave pública
   */
  static validatePublicKey(publicKey: string): boolean {
    try {
      const forge = require('node-forge');
      forge.pki.publicKeyFromPem(publicKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Valida formato de chave privada
   */
  static validatePrivateKey(privateKey: string): boolean {
    try {
      const forge = require('node-forge');
      forge.pki.privateKeyFromPem(privateKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Extrai informações do certificado
   */
  static extractCertificateInfo(certificatePem: string): {
    subject: string;
    issuer: string;
    validFrom: Date;
    validUntil: Date;
  } | null {
    try {
      const forge = require('node-forge');
      const cert = forge.pki.certificateFromPem(certificatePem);
      
      return {
        subject: cert.subject.getField('CN').value,
        issuer: cert.issuer.getField('CN').value,
        validFrom: cert.validity.notBefore,
        validUntil: cert.validity.notAfter
      };
    } catch {
      return null;
    }
  }
}
