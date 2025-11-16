import { Resource, ResourceAllocation, defaultResources } from '../types/resources';

class ResourceService {
  private resources: Resource[] = [];
  private allocations: ResourceAllocation[] = [];
  private initialized = false;

  private initialize() {
    if (this.initialized) return;
    
    // Load from localStorage or use defaults
    const stored = localStorage.getItem('fisioflow-resources');
    if (stored) {
      try {
        this.resources = JSON.parse(stored);
      } catch {
        this.resources = this.createDefaultResources();
      }
    } else {
      this.resources = this.createDefaultResources();
    }

    const storedAllocations = localStorage.getItem('fisioflow-resource-allocations');
    if (storedAllocations) {
      try {
        const parsed = JSON.parse(storedAllocations);
        this.allocations = parsed.map((a: any) => ({
          ...a,
          startTime: new Date(a.startTime),
          endTime: new Date(a.endTime),
          createdAt: new Date(a.createdAt)
        }));
      } catch {
        this.allocations = [];
      }
    }

    this.initialized = true;
  }

  private createDefaultResources(): Resource[] {
    return defaultResources.map((res, index) => ({
      ...res,
      id: `res-${index + 1}`,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  }

  private save() {
    localStorage.setItem('fisioflow-resources', JSON.stringify(this.resources));
  }

  private saveAllocations() {
    localStorage.setItem('fisioflow-resource-allocations', JSON.stringify(this.allocations));
  }

  async listResources(type?: string): Promise<Resource[]> {
    this.initialize();
    return new Promise(resolve => {
      setTimeout(() => {
        if (type) {
          resolve(this.resources.filter(r => r.type === type));
        } else {
          resolve([...this.resources]);
        }
      }, 100);
    });
  }

  async getResource(id: string): Promise<Resource | undefined> {
    this.initialize();
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(this.resources.find(r => r.id === id));
      }, 50);
    });
  }

  async createResource(data: Omit<Resource, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): Promise<Resource> {
    this.initialize();
    return new Promise(resolve => {
      setTimeout(() => {
        const newResource: Resource = {
          ...data,
          id: `res-${Date.now()}`,
          usageCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        this.resources.push(newResource);
        this.save();
        resolve(newResource);
      }, 200);
    });
  }

  async updateResource(id: string, data: Partial<Resource>): Promise<Resource> {
    this.initialize();
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.resources.findIndex(r => r.id === id);
        if (index === -1) {
          reject(new Error('Resource not found'));
          return;
        }

        this.resources[index] = {
          ...this.resources[index],
          ...data,
          updatedAt: new Date()
        };
        this.save();
        resolve(this.resources[index]);
      }, 200);
    });
  }

  async deleteResource(id: string): Promise<void> {
    this.initialize();
    return new Promise(resolve => {
      setTimeout(() => {
        this.resources = this.resources.filter(r => r.id !== id);
        this.allocations = this.allocations.filter(a => a.resourceId !== id);
        this.save();
        this.saveAllocations();
        resolve();
      }, 150);
    });
  }

  async allocateResource(data: Omit<ResourceAllocation, 'id' | 'createdAt'>): Promise<ResourceAllocation> {
    this.initialize();
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check if resource exists
        const resource = this.resources.find(r => r.id === data.resourceId);
        if (!resource) {
          reject(new Error('Resource not found'));
          return;
        }

        // Check for conflicts
        const hasConflict = this.allocations.some(a =>
          a.resourceId === data.resourceId &&
          ((data.startTime >= a.startTime && data.startTime < a.endTime) ||
           (data.endTime > a.startTime && data.endTime <= a.endTime) ||
           (data.startTime <= a.startTime && data.endTime >= a.endTime))
        );

        if (hasConflict) {
          reject(new Error('Resource already allocated for this time period'));
          return;
        }

        const allocation: ResourceAllocation = {
          ...data,
          id: `alloc-${Date.now()}`,
          createdAt: new Date()
        };

        this.allocations.push(allocation);
        
        // Update resource usage count
        const resourceIndex = this.resources.findIndex(r => r.id === data.resourceId);
        if (resourceIndex !== -1) {
          this.resources[resourceIndex].usageCount = (this.resources[resourceIndex].usageCount || 0) + 1;
          this.resources[resourceIndex].status = 'in-use';
        }

        this.save();
        this.saveAllocations();
        resolve(allocation);
      }, 200);
    });
  }

  async getResourceAllocations(resourceId: string, startDate?: Date, endDate?: Date): Promise<ResourceAllocation[]> {
    this.initialize();
    return new Promise(resolve => {
      setTimeout(() => {
        let filtered = this.allocations.filter(a => a.resourceId === resourceId);
        
        if (startDate && endDate) {
          filtered = filtered.filter(a => 
            a.startTime >= startDate && a.endTime <= endDate
          );
        }

        resolve(filtered);
      }, 100);
    });
  }

  async getAvailableResources(startTime: Date, endTime: Date, type?: string): Promise<Resource[]> {
    this.initialize();
    return new Promise(resolve => {
      setTimeout(() => {
        let available = this.resources.filter(r => r.status !== 'unavailable' && r.status !== 'maintenance');
        
        if (type) {
          available = available.filter(r => r.type === type);
        }

        // Filter out resources with conflicting allocations
        available = available.filter(resource => {
          const conflicts = this.allocations.filter(a =>
            a.resourceId === resource.id &&
            ((startTime >= a.startTime && startTime < a.endTime) ||
             (endTime > a.startTime && endTime <= a.endTime) ||
             (startTime <= a.startTime && endTime >= a.endTime))
          );
          return conflicts.length === 0;
        });

        resolve(available);
      }, 150);
    });
  }

  async releaseResource(allocationId: string): Promise<void> {
    this.initialize();
    return new Promise(resolve => {
      setTimeout(() => {
        const allocation = this.allocations.find(a => a.id === allocationId);
        if (allocation) {
          this.allocations = this.allocations.filter(a => a.id !== allocationId);
          
          // Update resource status to available if no more allocations
          const resource = this.resources.find(r => r.id === allocation.resourceId);
          if (resource) {
            const remainingAllocations = this.allocations.filter(a => 
              a.resourceId === allocation.resourceId &&
              a.endTime > new Date()
            );
            
            if (remainingAllocations.length === 0) {
              const index = this.resources.findIndex(r => r.id === allocation.resourceId);
              if (index !== -1) {
                this.resources[index].status = 'available';
              }
            }
          }

          this.save();
          this.saveAllocations();
        }
        resolve();
      }, 150);
    });
  }

  async getResourceStats(): Promise<{
    total: number;
    available: number;
    inUse: number;
    maintenance: number;
    byType: { type: string; count: number }[];
    topUsed: { resource: Resource; usageCount: number }[];
  }> {
    this.initialize();
    return new Promise(resolve => {
      setTimeout(() => {
        const stats = {
          total: this.resources.length,
          available: this.resources.filter(r => r.status === 'available').length,
          inUse: this.resources.filter(r => r.status === 'in-use').length,
          maintenance: this.resources.filter(r => r.status === 'maintenance').length,
          byType: Object.entries(
            this.resources.reduce((acc, r) => {
              acc[r.type] = (acc[r.type] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          ).map(([type, count]) => ({ type, count })),
          topUsed: this.resources
            .filter(r => r.usageCount && r.usageCount > 0)
            .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
            .slice(0, 5)
            .map(r => ({ resource: r, usageCount: r.usageCount || 0 }))
        };
        resolve(stats);
      }, 100);
    });
  }
}

export const resourceService = new ResourceService();

