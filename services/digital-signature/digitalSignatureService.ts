// Digital signature service for medical reports with ICP-Brasil integration
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface DigitalCertificate {
  id: string;
  type: 'A1' | 'A3'; // ICP-Brasil certificate types
  serialNumber: string;
  issuer: string;
  subject: string;
  validFrom: Date;
  validTo: Date;
  keyUsage: string[];
  certificateData: string; // Base64 encoded certificate
  privateKeyData?: string; // For A1 certificates only
  status: 'active' | 'expired' | 'revoked' | 'suspended';
  userId: string;
  createdAt: Date;
  lastUsed?: Date;
}

interface SignatureRequest {
  id: string;
  documentId: string;
  documentType: 'medical_report' | 'prescription' | 'treatment_plan' | 'invoice' | 'consent_form';
  documentUrl: string;
  certificateId: string;
  signerId: string;
  signerName: string;
  signerRole: string;
  signatureType: 'simple' | 'advanced' | 'qualified';
  status: 'pending' | 'signed' | 'failed' | 'expired';
  requestedAt: Date;
  signedAt?: Date;
  expiresAt: Date;
  reason?: string;
  location?: string;
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    timestamp?: string;
    hashAlgorithm: 'SHA-256' | 'SHA-512';
    documentHash: string;
  };
}

interface SignedDocument {
  id: string;
  originalDocumentId: string;
  signedDocumentUrl: string;
  signatureData: {
    certificate: string;
    signature: string;
    timestamp: string;
    hashAlgorithm: string;
    documentHash: string;
    signerInfo: {
      name: string;
      cpf?: string;
      role: string;
      organization?: string;
    };
  };
  validationStatus: 'valid' | 'invalid' | 'unknown' | 'expired';
  lastValidated: Date;
  signedAt: Date;
  expiresAt?: Date;
}

interface TimeStamp {
  tsa: string; // Time Stamp Authority
  timestamp: string;
  signature: string;
  certificate: string;
  hashAlgorithm: string;
  accuracy?: string;
  ordering?: boolean;
  nonce?: string;
}

interface ValidationResult {
  valid: boolean;
  certificateValid: boolean;
  signatureValid: boolean;
  timestampValid: boolean;
  chainValid: boolean;
  revocationStatus: 'valid' | 'revoked' | 'unknown';
  errors: string[];
  warnings: string[];
  signedAt: Date;
  validatedAt: Date;
  certificate: {
    subject: string;
    issuer: string;
    serialNumber: string;
    validFrom: Date;
    validTo: Date;
  };
}

interface AuditTrail {
  id: string;
  documentId: string;
  action: 'created' | 'signed' | 'validated' | 'accessed' | 'modified';
  userId: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  details: Record<string, any>;
  previousHash?: string;
  currentHash: string;
}

class DigitalSignatureService {
  private supabase: SupabaseClient;
  private tsaUrl: string;
  private icpBrasilRoots: string[];

  constructor() {
    this.supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL!,
      import.meta.env.VITE_SUPABASE_ANON_KEY!
    );

    this.tsaUrl = import.meta.env.TSA_URL || 'http://timestamp.iti.gov.br';
    this.icpBrasilRoots = [
      // ICP-Brasil root certificates (simplified)
      'DigitalSignatureCertificate:ICP-BRASIL',
      'DigitalSignatureCertificate:AC-RAIZ',
    ];
  }

  async uploadCertificate(
    certificateFile: File,
    privateKeyFile?: File,
    password?: string,
    userId?: string
  ): Promise<DigitalCertificate> {
    try {
      // Read certificate file
      const certBuffer = await certificateFile.arrayBuffer();
      const certData = new Uint8Array(certBuffer);

      // Parse certificate (simplified - would use actual crypto library)
      const certificate = await this.parseCertificate(certData);

      // Validate certificate
      await this.validateCertificate(certificate);

      // Store private key securely if provided (A1 certificates)
      let privateKeyData: string | undefined;
      if (privateKeyFile && password) {
        privateKeyData = await this.securelyStorePrivateKey(privateKeyFile, password);
      }

      const digitalCert: DigitalCertificate = {
        id: crypto.randomUUID(),
        type: privateKeyFile ? 'A1' : 'A3',
        serialNumber: certificate.serialNumber,
        issuer: certificate.issuer,
        subject: certificate.subject,
        validFrom: certificate.validFrom,
        validTo: certificate.validTo,
        keyUsage: certificate.keyUsage,
        certificateData: btoa(String.fromCharCode(...certData)),
        privateKeyData,
        status: 'active',
        userId: userId || 'current-user',
        createdAt: new Date(),
      };

      // Save to database
      const { error } = await this.supabase
        .from('digital_certificates')
        .insert(digitalCert);

      if (error) {
        throw new Error(`Failed to save certificate: ${error.message}`);
      }

      // Log certificate upload
      await this.createAuditTrail({
        documentId: digitalCert.id,
        action: 'created',
        userId: digitalCert.userId,
        timestamp: new Date(),
        ipAddress: '',
        userAgent: '',
        details: {
          certificateType: digitalCert.type,
          serialNumber: digitalCert.serialNumber,
          issuer: digitalCert.issuer,
        },
        currentHash: await this.calculateDocumentHash(JSON.stringify(digitalCert)),
      });

      return digitalCert;

    } catch (error) {
      throw new Error(`Certificate upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createSignatureRequest(
    documentId: string,
    documentType: SignatureRequest['documentType'],
    certificateId: string,
    signerInfo: {
      name: string;
      role: string;
      reason?: string;
      location?: string;
    },
    expiresInHours: number = 72
  ): Promise<SignatureRequest> {
    // Get document URL
    const { data: documentUrl } = await this.supabase.storage
      .from('documents')
      .createSignedUrl(`${documentId}.pdf`, 3600);

    if (!documentUrl) {
      throw new Error('Document not found');
    }

    // Calculate document hash
    const documentHash = await this.calculateDocumentHashFromUrl(documentUrl.signedUrl);

    const request: SignatureRequest = {
      id: crypto.randomUUID(),
      documentId,
      documentType,
      documentUrl: documentUrl.signedUrl,
      certificateId,
      signerId: 'current-user',
      signerName: signerInfo.name,
      signerRole: signerInfo.role,
      signatureType: 'qualified', // ICP-Brasil is qualified
      status: 'pending',
      requestedAt: new Date(),
      expiresAt: new Date(Date.now() + expiresInHours * 60 * 60 * 1000),
      reason: signerInfo.reason,
      location: signerInfo.location,
      metadata: {
        hashAlgorithm: 'SHA-256',
        documentHash,
      },
    };

    // Save signature request
    const { error } = await this.supabase
      .from('signature_requests')
      .insert(request);

    if (error) {
      throw new Error(`Failed to create signature request: ${error.message}`);
    }

    // Create audit trail
    await this.createAuditTrail({
      documentId,
      action: 'created',
      userId: request.signerId,
      timestamp: new Date(),
      ipAddress: '',
      userAgent: '',
      details: {
        requestId: request.id,
        documentType,
        signerName: signerInfo.name,
      },
      currentHash: await this.calculateDocumentHash(JSON.stringify(request)),
    });

    return request;
  }

  async signDocument(
    requestId: string,
    pin?: string // For A3 certificates
  ): Promise<SignedDocument> {
    // Get signature request
    const { data: request, error: requestError } = await this.supabase
      .from('signature_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (requestError || !request) {
      throw new Error('Signature request not found');
    }

    if (request.status !== 'pending') {
      throw new Error(`Cannot sign document with status: ${request.status}`);
    }

    if (new Date() > new Date(request.expiresAt)) {
      throw new Error('Signature request has expired');
    }

    // Get certificate
    const { data: certificate, error: certError } = await this.supabase
      .from('digital_certificates')
      .select('*')
      .eq('id', request.certificateId)
      .single();

    if (certError || !certificate) {
      throw new Error('Certificate not found');
    }

    try {
      // Download document
      const documentBlob = await this.downloadDocument(request.documentUrl);
      const documentBuffer = await documentBlob.arrayBuffer();

      // Calculate document hash for integrity verification
      const currentHash = await this.calculateDocumentHash(new Uint8Array(documentBuffer));
      if (currentHash !== request.metadata.documentHash) {
        throw new Error('Document integrity verification failed');
      }

      // Create digital signature
      const signatureData = await this.createDigitalSignature(
        documentBuffer,
        certificate,
        pin
      );

      // Get timestamp from TSA
      const timestamp = await this.getTimeStamp(signatureData.signature);

      // Create signed PDF with embedded signature
      const signedDocumentBuffer = await this.embedSignatureInPDF(
        documentBuffer,
        signatureData,
        timestamp,
        certificate
      );

      // Upload signed document
      const signedDocumentUrl = await this.uploadSignedDocument(
        request.documentId,
        signedDocumentBuffer
      );

      const signedDocument: SignedDocument = {
        id: crypto.randomUUID(),
        originalDocumentId: request.documentId,
        signedDocumentUrl,
        signatureData: {
          certificate: certificate.certificateData,
          signature: signatureData.signature,
          timestamp: timestamp.timestamp,
          hashAlgorithm: request.metadata.hashAlgorithm,
          documentHash: currentHash,
          signerInfo: {
            name: request.signerName,
            role: request.signerRole,
            cpf: this.extractCPFFromCertificate(certificate),
            organization: this.extractOrganizationFromCertificate(certificate),
          },
        },
        validationStatus: 'valid',
        lastValidated: new Date(),
        signedAt: new Date(),
      };

      // Save signed document
      const { error: saveError } = await this.supabase
        .from('signed_documents')
        .insert(signedDocument);

      if (saveError) {
        throw new Error(`Failed to save signed document: ${saveError.message}`);
      }

      // Update signature request status
      await this.supabase
        .from('signature_requests')
        .update({
          status: 'signed',
          signedAt: new Date().toISOString(),
          metadata: {
            ...request.metadata,
            timestamp: new Date().toISOString(),
          },
        })
        .eq('id', requestId);

      // Update certificate last used
      await this.supabase
        .from('digital_certificates')
        .update({ lastUsed: new Date().toISOString() })
        .eq('id', certificate.id);

      // Create audit trail
      await this.createAuditTrail({
        documentId: request.documentId,
        action: 'signed',
        userId: request.signerId,
        timestamp: new Date(),
        ipAddress: '',
        userAgent: '',
        details: {
          requestId,
          signedDocumentId: signedDocument.id,
          certificateSerialNumber: certificate.serialNumber,
        },
        previousHash: request.metadata.documentHash,
        currentHash: await this.calculateDocumentHash(new Uint8Array(signedDocumentBuffer)),
      });

      return signedDocument;

    } catch (error) {
      // Update request status to failed
      await this.supabase
        .from('signature_requests')
        .update({ status: 'failed' })
        .eq('id', requestId);

      throw new Error(`Document signing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async validateSignature(signedDocumentId: string): Promise<ValidationResult> {
    // Get signed document
    const { data: signedDoc, error } = await this.supabase
      .from('signed_documents')
      .select('*')
      .eq('id', signedDocumentId)
      .single();

    if (error || !signedDoc) {
      throw new Error('Signed document not found');
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Download signed document
      const signedDocBlob = await this.downloadDocument(signedDoc.signedDocumentUrl);
      const signedDocBuffer = await signedDocBlob.arrayBuffer();

      // Extract signature data from PDF
      const extractedSignature = await this.extractSignatureFromPDF(signedDocBuffer);

      // Validate certificate
      const certificateValid = await this.validateCertificateChain(
        extractedSignature.certificate
      );

      if (!certificateValid) {
        errors.push('Certificate validation failed');
      }

      // Validate signature
      const signatureValid = await this.validateDigitalSignature(
        extractedSignature.signature,
        extractedSignature.documentHash,
        extractedSignature.certificate
      );

      if (!signatureValid) {
        errors.push('Digital signature validation failed');
      }

      // Validate timestamp
      const timestampValid = await this.validateTimeStamp(
        extractedSignature.timestamp
      );

      if (!timestampValid) {
        warnings.push('Timestamp validation failed');
      }

      // Check certificate revocation status
      const revocationStatus = await this.checkRevocationStatus(
        extractedSignature.certificate
      );

      if (revocationStatus === 'revoked') {
        errors.push('Certificate has been revoked');
      }

      // Validate document integrity
      const currentDocHash = await this.calculateDocumentHash(new Uint8Array(signedDocBuffer));
      const integrityValid = currentDocHash === extractedSignature.documentHash;

      if (!integrityValid) {
        errors.push('Document integrity check failed');
      }

      const validationResult: ValidationResult = {
        valid: errors.length === 0,
        certificateValid,
        signatureValid,
        timestampValid,
        chainValid: certificateValid,
        revocationStatus,
        errors,
        warnings,
        signedAt: new Date(signedDoc.signedAt),
        validatedAt: new Date(),
        certificate: {
          subject: extractedSignature.certificate.subject,
          issuer: extractedSignature.certificate.issuer,
          serialNumber: extractedSignature.certificate.serialNumber,
          validFrom: new Date(extractedSignature.certificate.validFrom),
          validTo: new Date(extractedSignature.certificate.validTo),
        },
      };

      // Update validation status
      await this.supabase
        .from('signed_documents')
        .update({
          validationStatus: validationResult.valid ? 'valid' : 'invalid',
          lastValidated: new Date().toISOString(),
        })
        .eq('id', signedDocumentId);

      // Create audit trail
      await this.createAuditTrail({
        documentId: signedDoc.originalDocumentId,
        action: 'validated',
        userId: 'system',
        timestamp: new Date(),
        ipAddress: '',
        userAgent: '',
        details: {
          signedDocumentId,
          validationResult: validationResult.valid,
          errors: validationResult.errors,
          warnings: validationResult.warnings,
        },
        currentHash: currentDocHash,
      });

      return validationResult;

    } catch (error) {
      errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);

      return {
        valid: false,
        certificateValid: false,
        signatureValid: false,
        timestampValid: false,
        chainValid: false,
        revocationStatus: 'unknown',
        errors,
        warnings,
        signedAt: new Date(signedDoc.signedAt),
        validatedAt: new Date(),
        certificate: {
          subject: '',
          issuer: '',
          serialNumber: '',
          validFrom: new Date(),
          validTo: new Date(),
        },
      };
    }
  }

  // Private helper methods
  private async parseCertificate(certData: Uint8Array): Promise<any> {
    // Simplified certificate parsing - would use actual crypto library
    return {
      serialNumber: '123456789',
      issuer: 'CN=AC Certisign RFB G5, OU=Secretaria da Receita Federal do Brasil - RFB, O=ICP-Brasil, C=BR',
      subject: 'CN=JOAO DA SILVA:12345678901, OU=RFB e-CPF A1, OU=Secretaria da Receita Federal do Brasil - RFB, O=ICP-Brasil, C=BR',
      validFrom: new Date(),
      validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      keyUsage: ['digitalSignature', 'nonRepudiation'],
    };
  }

  private async validateCertificate(certificate: any): Promise<void> {
    // Validate certificate against ICP-Brasil requirements
    if (!certificate.keyUsage.includes('digitalSignature')) {
      throw new Error('Certificate does not support digital signatures');
    }

    if (new Date() > certificate.validTo) {
      throw new Error('Certificate has expired');
    }

    if (new Date() < certificate.validFrom) {
      throw new Error('Certificate is not yet valid');
    }
  }

  private async securelyStorePrivateKey(privateKeyFile: File, password: string): Promise<string> {
    // Encrypt and store private key securely
    const keyBuffer = await privateKeyFile.arrayBuffer();
    // In production, this would use proper key encryption
    return btoa(String.fromCharCode(...new Uint8Array(keyBuffer)));
  }

  private async calculateDocumentHash(data: Uint8Array | string): Promise<string> {
    const encoder = new TextEncoder();
    const dataArray = typeof data === 'string' ? encoder.encode(data) : data;
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataArray);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private async calculateDocumentHashFromUrl(url: string): Promise<string> {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    return this.calculateDocumentHash(new Uint8Array(buffer));
  }

  private async downloadDocument(url: string): Promise<Blob> {
    const response = await fetch(url);
    return response.blob();
  }

  private async createDigitalSignature(
    documentBuffer: ArrayBuffer,
    certificate: DigitalCertificate,
    pin?: string
  ): Promise<{ signature: string; algorithm: string }> {
    // Create digital signature using certificate
    // This is simplified - would use actual cryptographic libraries
    const documentHash = await this.calculateDocumentHash(new Uint8Array(documentBuffer));

    return {
      signature: `SIGNATURE_${documentHash.substring(0, 16)}`,
      algorithm: 'SHA256withRSA',
    };
  }

  private async getTimeStamp(signature: string): Promise<TimeStamp> {
    // Get timestamp from TSA
    // This is simplified - would make actual TSA request
    return {
      tsa: this.tsaUrl,
      timestamp: new Date().toISOString(),
      signature: `TSA_SIGNATURE_${signature.substring(0, 16)}`,
      certificate: 'TSA_CERTIFICATE',
      hashAlgorithm: 'SHA-256',
    };
  }

  private async embedSignatureInPDF(
    documentBuffer: ArrayBuffer,
    signatureData: any,
    timestamp: TimeStamp,
    certificate: DigitalCertificate
  ): Promise<ArrayBuffer> {
    // Embed signature into PDF document
    // This is simplified - would use actual PDF library like PDF-lib
    const originalDoc = new Uint8Array(documentBuffer);
    const signature = new TextEncoder().encode(JSON.stringify({
      signature: signatureData,
      timestamp,
      certificate: certificate.certificateData,
    }));

    // Combine original document with signature data
    const result = new Uint8Array(originalDoc.length + signature.length);
    result.set(originalDoc);
    result.set(signature, originalDoc.length);

    return result.buffer;
  }

  private async uploadSignedDocument(
    originalDocumentId: string,
    signedDocumentBuffer: ArrayBuffer
  ): Promise<string> {
    const fileName = `signed_${originalDocumentId}_${Date.now()}.pdf`;

    const { error } = await this.supabase.storage
      .from('signed-documents')
      .upload(fileName, signedDocumentBuffer, {
        contentType: 'application/pdf',
      });

    if (error) {
      throw new Error(`Failed to upload signed document: ${error.message}`);
    }

    const { data } = await this.supabase.storage
      .from('signed-documents')
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  private extractCPFFromCertificate(certificate: DigitalCertificate): string | undefined {
    // Extract CPF from certificate subject
    const subjectMatch = certificate.subject.match(/CN=.*:(\d{11})/);
    return subjectMatch ? subjectMatch[1] : undefined;
  }

  private extractOrganizationFromCertificate(certificate: DigitalCertificate): string | undefined {
    // Extract organization from certificate subject
    const orgMatch = certificate.subject.match(/O=([^,]+)/);
    return orgMatch ? orgMatch[1] : undefined;
  }

  private async extractSignatureFromPDF(pdfBuffer: ArrayBuffer): Promise<any> {
    // Extract signature data from PDF
    // This is simplified - would use actual PDF parsing
    return {
      signature: 'EXTRACTED_SIGNATURE',
      certificate: {
        subject: '',
        issuer: '',
        serialNumber: '',
        validFrom: '',
        validTo: '',
      },
      timestamp: '',
      documentHash: '',
    };
  }

  private async validateCertificateChain(certificate: any): Promise<boolean> {
    // Validate certificate chain against ICP-Brasil roots
    return true; // Simplified
  }

  private async validateDigitalSignature(
    signature: string,
    documentHash: string,
    certificate: any
  ): Promise<boolean> {
    // Validate digital signature
    return true; // Simplified
  }

  private async validateTimeStamp(timestamp: any): Promise<boolean> {
    // Validate timestamp
    return true; // Simplified
  }

  private async checkRevocationStatus(certificate: any): Promise<'valid' | 'revoked' | 'unknown'> {
    // Check certificate revocation status
    return 'valid'; // Simplified
  }

  private async createAuditTrail(trail: Omit<AuditTrail, 'id'>): Promise<void> {
    const auditTrail: AuditTrail = {
      id: crypto.randomUUID(),
      ...trail,
    };

    await this.supabase.from('signature_audit_trail').insert(auditTrail);
  }

  // Public API methods
  async getCertificates(userId?: string): Promise<DigitalCertificate[]> {
    const query = this.supabase
      .from('digital_certificates')
      .select('*')
      .eq('status', 'active');

    if (userId) {
      query.eq('userId', userId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get certificates: ${error.message}`);
    }

    return data || [];
  }

  async getSignatureRequests(status?: SignatureRequest['status']): Promise<SignatureRequest[]> {
    const query = this.supabase.from('signature_requests').select('*');

    if (status) {
      query.eq('status', status);
    }

    const { data, error } = await query.order('requestedAt', { ascending: false });

    if (error) {
      throw new Error(`Failed to get signature requests: ${error.message}`);
    }

    return data || [];
  }

  async getSignedDocuments(): Promise<SignedDocument[]> {
    const { data, error } = await this.supabase
      .from('signed_documents')
      .select('*')
      .order('signedAt', { ascending: false });

    if (error) {
      throw new Error(`Failed to get signed documents: ${error.message}`);
    }

    return data || [];
  }

  async getAuditTrail(documentId?: string): Promise<AuditTrail[]> {
    const query = this.supabase.from('signature_audit_trail').select('*');

    if (documentId) {
      query.eq('documentId', documentId);
    }

    const { data, error } = await query.order('timestamp', { ascending: false });

    if (error) {
      throw new Error(`Failed to get audit trail: ${error.message}`);
    }

    return data || [];
  }

  async generateSignatureReport(fromDate: Date, toDate: Date): Promise<{
    totalSignatures: number;
    successfulSignatures: number;
    failedSignatures: number;
    certificatesUsed: number;
    averageSigningTime: number;
    documentTypes: Record<string, number>;
    dailyStats: Array<{ date: string; count: number }>;
  }> {
    const { data: signatures } = await this.supabase
      .from('signature_requests')
      .select('*')
      .gte('requestedAt', fromDate.toISOString())
      .lte('requestedAt', toDate.toISOString());

    const total = signatures?.length || 0;
    const successful = signatures?.filter(s => s.status === 'signed').length || 0;
    const failed = signatures?.filter(s => s.status === 'failed').length || 0;

    const certificatesUsed = new Set(signatures?.map(s => s.certificateId)).size;

    const documentTypes: Record<string, number> = {};
    signatures?.forEach(s => {
      documentTypes[s.documentType] = (documentTypes[s.documentType] || 0) + 1;
    });

    // Calculate daily statistics
    const dailyStats: Array<{ date: string; count: number }> = [];
    const currentDate = new Date(fromDate);
    while (currentDate <= toDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const count = signatures?.filter(s =>
        s.requestedAt && s.requestedAt.startsWith(dateStr)
      ).length || 0;

      dailyStats.push({ date: dateStr || '', count });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      totalSignatures: total,
      successfulSignatures: successful,
      failedSignatures: failed,
      certificatesUsed,
      averageSigningTime: 0, // Would calculate from actual timing data
      documentTypes,
      dailyStats,
    };
  }
}

export const digitalSignatureService = new DigitalSignatureService();
export type {
  DigitalCertificate,
  SignatureRequest,
  SignedDocument,
  ValidationResult,
  AuditTrail
};