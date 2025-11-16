/**
 * Serviço Mock para Pacientes
 * Simula dados de pacientes para demonstração
 */

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: 'M' | 'F' | 'O';
  cpf: string;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  medicalInfo: {
    allergies: string[];
    medications: string[];
    conditions: string[];
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

// Dados mock de pacientes
const MOCK_PATIENTS: Patient[] = [
  {
    id: 'patient-1',
    name: 'João Silva Santos',
    email: 'joao.silva@email.com',
    phone: '(11) 99999-1111',
    birthDate: '1985-03-15',
    gender: 'M',
    cpf: '123.456.789-00',
    address: {
      street: 'Rua das Flores',
      number: '123',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
    },
    medicalInfo: {
      allergies: ['Penicilina'],
      medications: ['Losartana 50mg'],
      conditions: ['Hipertensão'],
      emergencyContact: {
        name: 'Maria Silva Santos',
        phone: '(11) 99999-2222',
        relationship: 'Esposa',
      },
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'patient-2',
    name: 'Maria Oliveira Costa',
    email: 'maria.oliveira@email.com',
    phone: '(11) 99999-3333',
    birthDate: '1990-07-22',
    gender: 'F',
    cpf: '987.654.321-00',
    address: {
      street: 'Avenida Paulista',
      number: '456',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
    },
    medicalInfo: {
      allergies: [],
      medications: [],
      conditions: ['Dor lombar crônica'],
      emergencyContact: {
        name: 'Carlos Costa',
        phone: '(11) 99999-4444',
        relationship: 'Marido',
      },
    },
    createdAt: '2024-01-20T14:30:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
  },
  {
    id: 'patient-3',
    name: 'Pedro Henrique Lima',
    email: 'pedro.lima@email.com',
    phone: '(11) 99999-5555',
    birthDate: '1978-12-08',
    gender: 'M',
    cpf: '456.789.123-00',
    address: {
      street: 'Rua da Consolação',
      number: '789',
      neighborhood: 'Consolação',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01302-000',
    },
    medicalInfo: {
      allergies: ['Ibuprofeno'],
      medications: ['Metformina 500mg'],
      conditions: ['Diabetes tipo 2', 'Artrose no joelho'],
      emergencyContact: {
        name: 'Ana Lima',
        phone: '(11) 99999-6666',
        relationship: 'Filha',
      },
    },
    createdAt: '2024-02-01T09:15:00Z',
    updatedAt: '2024-02-01T09:15:00Z',
  },
  {
    id: 'patient-4',
    name: 'Ana Carolina Ferreira',
    email: 'ana.ferreira@email.com',
    phone: '(11) 99999-7777',
    birthDate: '1995-05-30',
    gender: 'F',
    cpf: '789.123.456-00',
    address: {
      street: 'Rua Augusta',
      number: '321',
      neighborhood: 'Consolação',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01305-000',
    },
    medicalInfo: {
      allergies: [],
      medications: [],
      conditions: ['Lesão no ombro', 'Tendinite'],
      emergencyContact: {
        name: 'Roberto Ferreira',
        phone: '(11) 99999-8888',
        relationship: 'Pai',
      },
    },
    createdAt: '2024-02-10T16:45:00Z',
    updatedAt: '2024-02-10T16:45:00Z',
  },
  {
    id: 'patient-5',
    name: 'Carlos Eduardo Souza',
    email: 'carlos.souza@email.com',
    phone: '(11) 99999-9999',
    birthDate: '1982-09-12',
    gender: 'M',
    cpf: '321.654.987-00',
    address: {
      street: 'Rua Oscar Freire',
      number: '654',
      neighborhood: 'Jardins',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01426-000',
    },
    medicalInfo: {
      allergies: ['Diclofenaco'],
      medications: ['Omeprazol 20mg'],
      conditions: ['Gastrite', 'Hérnia de disco'],
      emergencyContact: {
        name: 'Patricia Souza',
        phone: '(11) 99999-0000',
        relationship: 'Esposa',
      },
    },
    createdAt: '2024-02-15T11:20:00Z',
    updatedAt: '2024-02-15T11:20:00Z',
  },
  {
    id: 'patient-6',
    name: 'Fernanda Rodrigues',
    email: 'fernanda.rodrigues@email.com',
    phone: '(11) 99999-1112',
    birthDate: '1988-11-25',
    gender: 'F',
    cpf: '654.321.789-00',
    address: {
      street: 'Rua Haddock Lobo',
      number: '987',
      neighborhood: 'Cerqueira César',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01414-000',
    },
    medicalInfo: {
      allergies: [],
      medications: ['Vitamina D3'],
      conditions: ['Osteoporose', 'Escoliose'],
      emergencyContact: {
        name: 'Marcos Rodrigues',
        phone: '(11) 99999-1113',
        relationship: 'Irmão',
      },
    },
    createdAt: '2024-02-20T13:10:00Z',
    updatedAt: '2024-02-20T13:10:00Z',
  },
  {
    id: 'patient-7',
    name: 'Rafael Mendes',
    email: 'rafael.mendes@email.com',
    phone: '(11) 99999-1114',
    birthDate: '1992-04-18',
    gender: 'M',
    cpf: '147.258.369-00',
    address: {
      street: 'Rua Bela Cintra',
      number: '147',
      neighborhood: 'Jardins',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01415-000',
    },
    medicalInfo: {
      allergies: ['Aspirina'],
      medications: [],
      conditions: ['Lesão no tornozelo', 'Fratura mal consolidada'],
      emergencyContact: {
        name: 'Juliana Mendes',
        phone: '(11) 99999-1115',
        relationship: 'Namorada',
      },
    },
    createdAt: '2024-02-25T15:30:00Z',
    updatedAt: '2024-02-25T15:30:00Z',
  },
  {
    id: 'patient-8',
    name: 'Lucia Helena Alves',
    email: 'lucia.alves@email.com',
    phone: '(11) 99999-1116',
    birthDate: '1965-08-03',
    gender: 'F',
    cpf: '369.258.147-00',
    address: {
      street: 'Rua Teodoro Sampaio',
      number: '258',
      neighborhood: 'Pinheiros',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '05406-000',
    },
    medicalInfo: {
      allergies: ['Penicilina', 'Sulfa'],
      medications: ['Enalapril 10mg', 'Sinvastatina 20mg'],
      conditions: ['Hipertensão', 'Colesterol alto', 'Artrose generalizada'],
      emergencyContact: {
        name: 'Paulo Alves',
        phone: '(11) 99999-1117',
        relationship: 'Filho',
      },
    },
    createdAt: '2024-03-01T08:45:00Z',
    updatedAt: '2024-03-01T08:45:00Z',
  },
];

export class MockPatientService {
  private patients: Patient[];

  constructor() {
    this.patients = MOCK_PATIENTS;
  }

  getAll(): Patient[] {
    return [...this.patients];
  }

  getById(id: string): Patient | undefined {
    return this.patients.find(p => p.id === id);
  }

  search(query: string): Patient[] {
    const lowerQuery = query.toLowerCase();
    return this.patients.filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.email.toLowerCase().includes(lowerQuery) ||
      p.phone.includes(query) ||
      p.cpf.includes(query)
    );
  }

  searchByName(query: string): Patient[] {
    const lowerQuery = query.toLowerCase();
    return this.patients.filter(p =>
      p.name.toLowerCase().includes(lowerQuery)
    );
  }

  getByGender(gender: 'M' | 'F' | 'O'): Patient[] {
    return this.patients.filter(p => p.gender === gender);
  }

  getByAgeRange(minAge: number, maxAge: number): Patient[] {
    const currentYear = new Date().getFullYear();
    return this.patients.filter(p => {
      const birthYear = new Date(p.birthDate).getFullYear();
      const age = currentYear - birthYear;
      return age >= minAge && age <= maxAge;
    });
  }

  getStatistics() {
    const total = this.patients.length;
    const byGender = {
      M: this.patients.filter(p => p.gender === 'M').length,
      F: this.patients.filter(p => p.gender === 'F').length,
      O: this.patients.filter(p => p.gender === 'O').length,
    };

    const currentYear = new Date().getFullYear();
    const byAgeRange = {
      '0-18': this.patients.filter(p => {
        const age = currentYear - new Date(p.birthDate).getFullYear();
        return age >= 0 && age <= 18;
      }).length,
      '19-35': this.patients.filter(p => {
        const age = currentYear - new Date(p.birthDate).getFullYear();
        return age >= 19 && age <= 35;
      }).length,
      '36-55': this.patients.filter(p => {
        const age = currentYear - new Date(p.birthDate).getFullYear();
        return age >= 36 && age <= 55;
      }).length,
      '56+': this.patients.filter(p => {
        const age = currentYear - new Date(p.birthDate).getFullYear();
        return age >= 56;
      }).length,
    };

    return {
      total,
      byGender,
      byAgeRange,
    };
  }
}

// Export singleton instance
export const mockPatientService = new MockPatientService();

export default mockPatientService;
