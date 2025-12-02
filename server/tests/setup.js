// server/tests/setup.js
// Configuração comum para testes

// Mock do dotenv
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

// Mock do SQL Server
jest.mock('mssql', () => ({
  ConnectionPool: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue({
      request: jest.fn().mockReturnValue({
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({
          recordset: []
        })
      })
    })
  }))
}));

// Variáveis de ambiente para testes
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES = '8h';
process.env.PORT = '3001';
process.env.DB_USER = 'test_user';
process.env.DB_PASS = 'test_pass';
process.env.DB_SERVER = 'localhost';
process.env.DB_NAME = 'test_db';

module.exports = {
  // Dados de teste
  mockUser: {
    id: 1,
    name: 'João Silva',
    email: 'joao@empresa.pt',
    passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz', // hash mock
    role: 'gestor',
    title: 'Gestor de Incidentes'
  },

  mockIncident: {
    id: 1,
    title: 'Servidor offline',
    description: 'O servidor principal está offline desde as 14h',
    category: 'Infraestrutura',
    priority: 'Crítica',
    status: 'Aberto',
    affectedUsers: 150,
    createdBy: 1,
    createdAt: new Date('2025-12-01'),
    resolvedAt: null
  },

  mockComment: {
    id: 1,
    incidentId: 1,
    userId: 1,
    text: 'Aguardando feedback do cliente',
    createdAt: new Date('2025-12-01 14:30:00'),
    userName: 'João Silva'
  }
};
