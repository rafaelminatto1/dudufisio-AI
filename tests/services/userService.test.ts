/**
 * 🧪 TESTES - USER SERVICE
 *
 * Testes de integração para o serviço de usuários
 * corrigido conforme RELATORIO_IMPLEMENTACAO_PLANO_ERROS.md
 *
 * Execute com: npm test tests/services/userService.test.ts
 */

import { supabase } from '../../lib/supabase';
import { userService, UserProfile, CreateUserRequest, UpdateUserRequest } from '../../services/userService';

describe('UserService Integration Tests', () => {
  let testUserId: string | null = null;
  let testEmail: string;

  beforeAll(async () => {
    // Verify Supabase connection
    const { error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.error('Failed to connect to Supabase:', error);
      throw new Error('Supabase connection failed. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    }
  });

  beforeEach(() => {
    // Generate unique email for each test
    testEmail = `test-user-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
  });

  afterEach(async () => {
    // Cleanup test user
    if (testUserId) {
      try {
        await supabase.from('users').delete().eq('id', testUserId);
        testUserId = null;
      } catch (error) {
        console.warn('Failed to cleanup test user:', error);
      }
    }
  });

  describe('createUser', () => {
    it('should create a new user with all fields', async () => {
      const userData: CreateUserRequest = {
        email: testEmail,
        full_name: 'Test User',
        role: 'patient',
        permissions: ['read:appointments'],
        profile_settings: { theme: 'light' },
      };

      const user = await userService.createUser(userData);
      testUserId = user.id;

      expect(user).toBeDefined();
      expect(user.email).toBe(testEmail);
      expect(user.full_name).toBe('Test User');
      expect(user.role).toBe('patient');
      expect(user.is_active).toBe(true);
    });

    it('should create user with minimal fields', async () => {
      const userData: CreateUserRequest = {
        email: testEmail,
        full_name: 'Minimal User',
        role: 'patient',
      };

      const user = await userService.createUser(userData);
      testUserId = user.id;

      expect(user).toBeDefined();
      expect(user.email).toBe(testEmail);
      expect(user.full_name).toBe('Minimal User');
    });

    it('should handle default full_name when missing', async () => {
      const userData: CreateUserRequest = {
        email: testEmail,
        full_name: '',
        role: 'patient',
      };

      const user = await userService.createUser(userData);
      testUserId = user.id;

      expect(user.full_name).toBe('Nome não informado');
    });
  });

  describe('getUserById', () => {
    beforeEach(async () => {
      const userData: CreateUserRequest = {
        email: testEmail,
        full_name: 'Test User',
        role: 'patient',
      };
      const user = await userService.createUser(userData);
      testUserId = user.id;
    });

    it('should retrieve user by ID', async () => {
      const user = await userService.getUserById(testUserId!);

      expect(user).not.toBeNull();
      expect(user?.id).toBe(testUserId);
      expect(user?.email).toBe(testEmail);
      expect(user?.full_name).toBe('Test User');
    });

    it('should return null for non-existent user', async () => {
      const user = await userService.getUserById('00000000-0000-0000-0000-000000000000');
      expect(user).toBeNull();
    });
  });

  describe('getAllUsers', () => {
    beforeEach(async () => {
      // Create 2 test users
      const user1: CreateUserRequest = {
        email: `user1-${testEmail}`,
        full_name: 'User One',
        role: 'patient',
      };
      const user2: CreateUserRequest = {
        email: `user2-${testEmail}`,
        full_name: 'User Two',
        role: 'therapist',
      };

      const created1 = await userService.createUser(user1);
      const created2 = await userService.createUser(user2);

      // Store for cleanup
      testUserId = created2.id; // Will cleanup in afterEach
    });

    it('should retrieve all users', async () => {
      const users = await userService.getAllUsers();

      expect(users).toBeDefined();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0);
    });

    it('should include full_name for all users', async () => {
      const users = await userService.getAllUsers();

      users.forEach(user => {
        expect(user.full_name).toBeDefined();
        expect(typeof user.full_name).toBe('string');
      });
    });
  });

  describe('getUsersByRole', () => {
    beforeEach(async () => {
      // Create users with different roles
      const therapist: CreateUserRequest = {
        email: `therapist-${testEmail}`,
        full_name: 'Test Therapist',
        role: 'therapist',
      };
      const patient: CreateUserRequest = {
        email: `patient-${testEmail}`,
        full_name: 'Test Patient',
        role: 'patient',
      };

      await userService.createUser(therapist);
      const createdPatient = await userService.createUser(patient);
      testUserId = createdPatient.id;
    });

    it('should retrieve users by role', async () => {
      const therapists = await userService.getUsersByRole('therapist');

      expect(therapists).toBeDefined();
      expect(Array.isArray(therapists)).toBe(true);
      expect(therapists.every(u => u.role === 'therapist')).toBe(true);
    });

    it('should only return active users', async () => {
      const users = await userService.getUsersByRole('patient');

      expect(users.every(u => u.is_active === true)).toBe(true);
    });
  });

  describe('updateUser', () => {
    beforeEach(async () => {
      const userData: CreateUserRequest = {
        email: testEmail,
        full_name: 'Original Name',
        role: 'patient',
      };
      const user = await userService.createUser(userData);
      testUserId = user.id;
    });

    it('should update user full_name', async () => {
      const updateData: UpdateUserRequest = {
        full_name: 'Updated Name',
      };

      const updated = await userService.updateUser(testUserId!, updateData);

      expect(updated.full_name).toBe('Updated Name');
    });

    it('should update user role', async () => {
      const updateData: UpdateUserRequest = {
        role: 'therapist',
      };

      const updated = await userService.updateUser(testUserId!, updateData);

      expect(updated.role).toBe('therapist');
    });

    it('should update permissions', async () => {
      const updateData: UpdateUserRequest = {
        permissions: ['read:appointments', 'write:appointments'],
      };

      const updated = await userService.updateUser(testUserId!, updateData);

      expect(Array.isArray(updated.permissions)).toBe(true);
    });

    it('should update updated_at timestamp', async () => {
      const before = new Date();

      await new Promise(resolve => setTimeout(resolve, 100));

      const updateData: UpdateUserRequest = {
        full_name: 'New Name',
      };

      const updated = await userService.updateUser(testUserId!, updateData);

      expect(new Date(updated.updated_at!)).toBeInstanceOf(Date);
      expect(new Date(updated.updated_at!) > before).toBe(true);
    });
  });

  describe('deactivateUser / activateUser', () => {
    beforeEach(async () => {
      const userData: CreateUserRequest = {
        email: testEmail,
        full_name: 'Test User',
        role: 'patient',
      };
      const user = await userService.createUser(userData);
      testUserId = user.id;
    });

    it('should deactivate user', async () => {
      await userService.deactivateUser(testUserId!);

      const user = await userService.getUserById(testUserId!);
      expect(user?.is_active).toBe(false);
    });

    it('should activate user', async () => {
      await userService.deactivateUser(testUserId!);
      await userService.activateUser(testUserId!);

      const user = await userService.getUserById(testUserId!);
      expect(user?.is_active).toBe(true);
    });
  });

  describe('updateLastLogin', () => {
    beforeEach(async () => {
      const userData: CreateUserRequest = {
        email: testEmail,
        full_name: 'Test User',
        role: 'patient',
      };
      const user = await userService.createUser(userData);
      testUserId = user.id;
    });

    it('should update last login timestamp', async () => {
      const before = new Date();

      await new Promise(resolve => setTimeout(resolve, 100));

      await userService.updateLastLogin(testUserId!);

      const user = await userService.getUserById(testUserId!);

      expect(user?.last_login_at).toBeDefined();
      if (user?.last_login_at) {
        expect(new Date(user.last_login_at) > before).toBe(true);
      }
    });
  });

  describe('getUserPermissions', () => {
    beforeEach(async () => {
      const userData: CreateUserRequest = {
        email: testEmail,
        full_name: 'Test User',
        role: 'patient',
        permissions: ['read:appointments', 'write:notes'],
      };
      const user = await userService.createUser(userData);
      testUserId = user.id;
    });

    it('should retrieve user permissions', async () => {
      const permissions = await userService.getUserPermissions(testUserId!);

      expect(Array.isArray(permissions)).toBe(true);
      expect(permissions).toContain('read:appointments');
      expect(permissions).toContain('write:notes');
    });

    it('should return empty array for user without permissions', async () => {
      const userData: CreateUserRequest = {
        email: `no-perms-${testEmail}`,
        full_name: 'No Permissions',
        role: 'patient',
      };
      const user = await userService.createUser(userData);

      const permissions = await userService.getUserPermissions(user.id);

      expect(Array.isArray(permissions)).toBe(true);
      expect(permissions.length).toBe(0);

      // Cleanup
      await supabase.from('users').delete().eq('id', user.id);
    });
  });

  describe('updatePermissions', () => {
    beforeEach(async () => {
      const userData: CreateUserRequest = {
        email: testEmail,
        full_name: 'Test User',
        role: 'therapist',
        permissions: ['read:appointments'],
      };
      const user = await userService.createUser(userData);
      testUserId = user.id;
    });

    it('should update user permissions', async () => {
      const newPermissions = ['read:appointments', 'write:appointments', 'delete:appointments'];

      await userService.updatePermissions(testUserId!, newPermissions);

      const permissions = await userService.getUserPermissions(testUserId!);
      expect(permissions).toEqual(newPermissions);
    });

    it('should replace existing permissions', async () => {
      await userService.updatePermissions(testUserId!, ['new:permission']);

      const permissions = await userService.getUserPermissions(testUserId!);
      expect(permissions).toEqual(['new:permission']);
      expect(permissions).not.toContain('read:appointments');
    });
  });

  describe('getTherapists', () => {
    beforeEach(async () => {
      const therapist: CreateUserRequest = {
        email: `therapist-${testEmail}`,
        full_name: 'Test Therapist',
        role: 'therapist',
      };
      const user = await userService.createUser(therapist);
      testUserId = user.id;
    });

    it('should retrieve all therapists', async () => {
      const therapists = await userService.getTherapists();

      expect(Array.isArray(therapists)).toBe(true);
      expect(therapists.length).toBeGreaterThan(0);
      expect(therapists.every(t => t.role === 'therapist')).toBe(true);
    });

    it('should only return active therapists', async () => {
      const therapists = await userService.getTherapists();

      expect(therapists.every(t => t.is_active === true)).toBe(true);
    });
  });

  describe('Type Safety', () => {
    it('UserProfile should match database schema', async () => {
      const userData: CreateUserRequest = {
        email: testEmail,
        full_name: 'Type Test User',
        role: 'patient',
      };
      const user = await userService.createUser(userData);
      testUserId = user.id;

      // Type assertions - will fail at compile time if types are wrong
      const profile: UserProfile = user;

      expect(typeof profile.id).toBe('string');
      expect(typeof profile.email).toBe('string');
      expect(typeof profile.full_name).toBe('string');
      expect(typeof profile.role).toBe('string');
      expect(typeof profile.is_active).toBe('boolean');
    });

    it('CreateUserRequest should have correct types', () => {
      const request: CreateUserRequest = {
        email: 'test@example.com',
        full_name: 'Test',
        role: 'patient',
        permissions: ['read'],
        profile_settings: { key: 'value' },
      };

      expect(typeof request.email).toBe('string');
      expect(typeof request.full_name).toBe('string');
      expect(typeof request.role).toBe('string');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid user ID gracefully', async () => {
      await expect(
        userService.getUserById('invalid-id')
      ).rejects.toThrow();
    });

    it('should handle duplicate email', async () => {
      const userData: CreateUserRequest = {
        email: testEmail,
        full_name: 'First User',
        role: 'patient',
      };

      const user1 = await userService.createUser(userData);
      testUserId = user1.id;

      // Try to create another user with same email
      await expect(
        userService.createUser(userData)
      ).rejects.toThrow();
    });
  });
});
