import { createHash } from 'crypto';

export interface AuditPayload {
  entityId: string;
  entityType: 'patient' | 'session' | 'invoice' | 'document';
  action: 'created' | 'updated' | 'deleted';
  performedBy: string;
  timestamp: string;
  dataSnapshot: Record<string, unknown>;
}

export interface AuditRecord {
  hash: string;
  payload: AuditPayload;
  previousHash?: string;
  blockNumber: number;
}

export class BlockchainAuditService {
  private chain: AuditRecord[] = [];

  private computeHash(payload: AuditPayload, previousHash?: string): string {
    const hash = createHash('sha256');
    hash.update(JSON.stringify(payload));
    hash.update(previousHash ?? '');
    return hash.digest('hex');
  }

  append(payload: AuditPayload): AuditRecord {
    const previous = this.chain.at(-1);
    const hash = this.computeHash(payload, previous?.hash);
    const record: AuditRecord = {
      hash,
      payload,
      previousHash: previous?.hash,
      blockNumber: this.chain.length + 1,
    };
    this.chain.push(record);
    return record;
  }

  verifyIntegrity(): boolean {
    return this.chain.every((record, index) => {
      const expectedHash = this.computeHash(record.payload, index === 0 ? undefined : this.chain[index - 1]!.hash);
      return record.hash === expectedHash;
    });
  }

  exportChain(): AuditRecord[] {
    return [...this.chain];
  }
}

export const blockchainAuditService = new BlockchainAuditService();
