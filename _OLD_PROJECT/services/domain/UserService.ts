/**
 * UserService - Lógica de negócio para usuários
 * Usa UserRepository para acesso ao banco
 * Contém validações, transformações e regras de negócio
 */

import { userRepository, type UserFilters } from '../repositories/UserRepository';
import type { User } from '@/types';
import { Role } from '@/types/enums';
import type { Database } from '@/types/supabase';
import { eventService } from '../eventService';
import { secureLogger } from '@/lib/secureLogger';
import { withSupabaseQuery, withSupabaseMutation } from '@/lib/supabase/errorHandler';

type UserRow = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];

export class UserService {
  /**
   * Busca todos os usuários com filtros opcionais
   */
  async getUsers(filters?: UserFilters): Promise<User[]> {
    return withSupabaseQuery(
      async () => {
        const users = await userRepository.findMany(filters);
        return users.map(u => this.transformToUser(u));
      },
      {
        operation: 'getUsers',
        fallbackMessage: 'Erro ao buscar usuários',
      }
    );
  }

  /**
   * Busca apenas terapeutas
   */
  async getTherapists(): Promise<User[]> {
    return withSupabaseQuery(
      async () => {
        const therapists = await userRepository.findTherapists();
        return therapists.map(u => this.transformToUser(u));
      },
      {
        operation: 'getTherapists',
        fallbackMessage: 'Erro ao buscar terapeutas',
      }
    );
  }

  /**
   * Busca terapeutas ativos
   */
  async getActiveTherapists(): Promise<User[]> {
    return withSupabaseQuery(
      async () => {
        const therapists = await userRepository.findActiveTherapists();
        return therapists.map(u => this.transformToUser(u));
      },
      {
        operation: 'getActiveTherapists',
        fallbackMessage: 'Erro ao buscar terapeutas ativos',
      }
    );
  }

  /**
   * Busca usuário por ID
   */
  async getById(id: string): Promise<User | null> {
    return withSupabaseQuery(
      async () => {
        const user = await userRepository.findById(id);
        return user ? this.transformToUser(user) : null;
      },
      {
        operation: 'getById',
        fallbackMessage: 'Erro ao buscar usuário',
      }
    );
  }

  /**
   * Busca usuário por email
   */
  async getByEmail(email: string): Promise<User | null> {
    return withSupabaseQuery(
      async () => {
        const user = await userRepository.findByEmail(email);
        return user ? this.transformToUser(user) : null;
      },
      {
        operation: 'getByEmail',
        fallbackMessage: 'Erro ao buscar usuário por email',
      }
    );
  }

  /**
   * Cria ou atualiza um usuário
   */
  async save(userData: User): Promise<User> {
    return withSupabaseMutation(
      async () => {
        // Validações de negócio
        this.validateUser(userData);

        // Verificar duplicação de email
        if (userData.email) {
          const emailExists = await userRepository.emailExists(
            userData.email,
            userData.id
          );
          if (emailExists) {
            throw new Error('Email já cadastrado');
          }
        }

        // Transformar para formato do DB
        const dbData = this.transformToDbFormat(userData);

        let savedUser: UserRow;

        if (userData.id) {
          // Update
          savedUser = await userRepository.update(userData.id, dbData);
          secureLogger.info('Usuário atualizado', { userId: userData.id });
        } else {
          // Create
          savedUser = await userRepository.create(dbData);
          secureLogger.info('Usuário criado', { userId: savedUser.id });
        }

        // Emitir evento para invalidar cache
        eventService.emit('users:changed');

        return this.transformToUser(savedUser);
      },
      {
        operation: 'save',
        fallbackMessage: 'Erro ao salvar usuário',
      }
    );
  }

  /**
   * Atualiza role do usuário
   */
  async updateRole(id: string, role: Role): Promise<User> {
    return withSupabaseMutation(
      async () => {
        // Validar role
        if (!this.isValidRole(role)) {
          throw new Error(`Role inválida: ${role}`);
        }

        const user = await userRepository.updateRole(id, role);
        secureLogger.info('Role atualizada', { userId: id, role });
        eventService.emit('users:changed');
        
        return this.transformToUser(user);
      },
      {
        operation: 'updateRole',
        fallbackMessage: 'Erro ao atualizar role do usuário',
      }
    );
  }

  /**
   * Deleta um usuário
   */
  async delete(id: string): Promise<void> {
    return withSupabaseMutation(
      async () => {
        await userRepository.delete(id);
        secureLogger.info('Usuário deletado', { userId: id });
        eventService.emit('users:changed');
      },
      {
        operation: 'delete',
        fallbackMessage: 'Erro ao deletar usuário',
      }
    );
  }

  /**
   * Valida dados do usuário
   */
  private validateUser(user: User): void {
    if (!user.fullName || user.fullName.trim().length < 3) {
      throw new Error('Nome completo é obrigatório (mínimo 3 caracteres)');
    }

    if (!user.email || !this.isValidEmail(user.email)) {
      throw new Error('Email válido é obrigatório');
    }

    if (!user.role || !this.isValidRole(user.role)) {
      throw new Error('Role válida é obrigatória');
    }

    if (user.phone && user.phone.trim().length > 0 && user.phone.trim().length < 10) {
      throw new Error('Telefone inválido (mínimo 10 dígitos)');
    }
  }

  /**
   * Valida email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida role
   */
  private isValidRole(role: Role): boolean {
    const validRoles: Role[] = [
      'admin' as Role,
      'therapist' as Role,
      'patient' as Role,
      'educator' as Role,
      'partner' as Role,
      'manager' as Role,
      'receptionist' as Role,
    ];
    return validRoles.includes(role);
  }

  /**
   * Transforma UserRow do DB para User da aplicação
   */
  private transformToUser(row: UserRow): User {
    return {
      id: row.id,
      fullName: row.name || row.full_name || '',
      email: row.email || '',
      role: (row.role as Role) || ('patient' as Role),
      avatarUrl: row.avatar_url || '',
      phone: row.phone || undefined,
      patientId: row.patient_id || undefined,
      emailVerified: row.email_verified || false,
      createdAt: row.created_at || new Date().toISOString(),
      lastSignIn: row.last_sign_in_at || undefined,
      mfaEnabled: row.mfa_enabled || false,
    };
  }

  /**
   * Transforma User da aplicação para formato do DB
   */
  private transformToDbFormat(user: User): Partial<UserInsert> {
    return {
      name: user.fullName,
      full_name: user.fullName,
      email: user.email,
      role: user.role,
      avatar_url: user.avatarUrl || null,
      phone: user.phone || null,
      patient_id: user.patientId || null,
      email_verified: user.emailVerified || false,
      mfa_enabled: user.mfaEnabled || false,
    };
  }
}

// Singleton instance
export const userService = new UserService();

