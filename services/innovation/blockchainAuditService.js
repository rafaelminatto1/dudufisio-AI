import { createHash } from 'crypto';
export class BlockchainAuditService {
    constructor() {
        this.chain = [];
    }
    computeHash(payload, previousHash) {
        const hash = createHash('sha256');
        hash.update(JSON.stringify(payload));
        hash.update(previousHash ?? '');
        return hash.digest('hex');
    }
    append(payload) {
        const previous = this.chain.at(-1);
        const hash = this.computeHash(payload, previous?.hash);
        const record = {
            hash,
            payload,
            previousHash: previous?.hash,
            blockNumber: this.chain.length + 1,
        };
        this.chain.push(record);
        return record;
    }
    verifyIntegrity() {
        return this.chain.every((record, index) => {
            const expectedHash = this.computeHash(record.payload, index === 0 ? undefined : this.chain[index - 1].hash);
            return record.hash === expectedHash;
        });
    }
    exportChain() {
        return [...this.chain];
    }
}
export const blockchainAuditService = new BlockchainAuditService();
