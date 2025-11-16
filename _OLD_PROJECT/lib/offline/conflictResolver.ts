/**
 * Conflict Resolver
 * Resolve conflitos de sincronização entre dados locais e servidor
 */

export type ConflictResolutionStrategy =
  | 'local-wins'
  | 'server-wins'
  | 'newest-wins'
  | 'manual';

export interface DataConflict<T> {
  id: string;
  field: string;
  localValue: T;
  serverValue: T;
  localTimestamp: Date;
  serverTimestamp: Date;
}

export interface ConflictResolution {
  strategy: ConflictResolutionStrategy;
  resolvedValue: any;
  appliedAt: Date;
}

class ConflictResolver {
  /**
   * Detecta conflitos entre dados local e servidor
   */
  detectConflicts<T extends Record<string, any>>(
    localData: T,
    serverData: T,
    localTimestamp: Date,
    serverTimestamp: Date
  ): DataConflict<any>[] {
    const conflicts: DataConflict<any>[] = [];

    // Compare each field
    for (const key in localData) {
      if (localData[key] !== serverData[key]) {
        conflicts.push({
          id: `${localData.id}-${key}`,
          field: key,
          localValue: localData[key],
          serverValue: serverData[key],
          localTimestamp,
          serverTimestamp
        });
      }
    }

    return conflicts;
  }

  /**
   * Resolve conflito baseado na estratégia
   */
  resolve<T>(
    conflict: DataConflict<T>,
    strategy: ConflictResolutionStrategy = 'newest-wins'
  ): ConflictResolution {
    let resolvedValue: T;

    switch (strategy) {
      case 'local-wins':
        resolvedValue = conflict.localValue;
        break;

      case 'server-wins':
        resolvedValue = conflict.serverValue;
        break;

      case 'newest-wins':
        resolvedValue = conflict.localTimestamp > conflict.serverTimestamp
          ? conflict.localValue
          : conflict.serverValue;
        break;

      case 'manual':
        // Will require user input
        throw new Error('Manual resolution required');

      default:
        resolvedValue = conflict.serverValue;
    }

    return {
      strategy,
      resolvedValue,
      appliedAt: new Date()
    };
  }

  /**
   * Resolve múltiplos conflitos
   */
  resolveMany<T>(
    conflicts: DataConflict<T>[],
    strategy: ConflictResolutionStrategy = 'newest-wins'
  ): Map<string, any> {
    const resolutions = new Map<string, any>();

    for (const conflict of conflicts) {
      try {
        const resolution = this.resolve(conflict, strategy);
        resolutions.set(conflict.field, resolution.resolvedValue);
      } catch (error) {
        // Skip manual conflicts for now
        console.warn(`Conflict requires manual resolution: ${conflict.field}`);
      }
    }

    return resolutions;
  }

  /**
   * Merge dados resolvendo conflitos
   */
  merge<T extends Record<string, any>>(
    localData: T,
    serverData: T,
    localTimestamp: Date,
    serverTimestamp: Date,
    strategy: ConflictResolutionStrategy = 'newest-wins'
  ): T {
    const conflicts = this.detectConflicts(localData, serverData, localTimestamp, serverTimestamp);

    if (conflicts.length === 0) {
      // No conflicts, use newest data
      return localTimestamp > serverTimestamp ? localData : serverData;
    }

    const resolutions = this.resolveMany(conflicts, strategy);
    const merged = { ...serverData };

    // Apply resolutions
    resolutions.forEach((value, field) => {
      merged[field] = value;
    });

    return merged;
  }

  /**
   * Verifica se dois objetos têm conflitos
   */
  hasConflicts<T extends Record<string, any>>(
    localData: T,
    serverData: T
  ): boolean {
    for (const key in localData) {
      if (localData[key] !== serverData[key]) {
        return true;
      }
    }
    return false;
  }
}

export const conflictResolver = new ConflictResolver();

