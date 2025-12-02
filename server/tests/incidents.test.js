// server/tests/incidents.test.js
require('./setup');
const { mockIncident } = require('./setup');

describe('Incidentes', () => {
  // Testes de validação de criação
  describe('Validação de Criação', () => {
    const validateIncident = (data) => {
      const errors = [];
      
      if (!data.title || data.title.trim().length === 0) {
        errors.push('Título obrigatório');
      }
      
      if (data.title && data.title.length < 5) {
        errors.push('Título deve ter pelo menos 5 caracteres');
      }
      
      if (data.title && data.title.length > 200) {
        errors.push('Título não pode ter mais de 200 caracteres');
      }
      
      if (!data.description || data.description.trim().length === 0) {
        errors.push('Descrição obrigatória');
      }
      
      if (data.description && data.description.length < 10) {
        errors.push('Descrição deve ter pelo menos 10 caracteres');
      }
      
      if (data.description && data.description.length > 5000) {
        errors.push('Descrição não pode ter mais de 5000 caracteres');
      }
      
      if (!data.category) {
        errors.push('Categoria obrigatória');
      }
      
      if (!data.priority) {
        errors.push('Prioridade obrigatória');
      }
      
      if (!Number.isInteger(data.affectedUsers) || data.affectedUsers < 1) {
        errors.push('Utilizadores afetados deve ser número >= 1');
      }
      
      if (data.affectedUsers > 100000) {
        errors.push('Utilizadores afetados não pode exceder 100000');
      }
      
      return {
        isValid: errors.length === 0,
        errors
      };
    };

    test('deve criar incidente com dados válidos', () => {
      const validData = {
        title: 'Servidor offline',
        description: 'O servidor principal está offline desde as 14h',
        category: 'Infraestrutura',
        priority: 'Crítica',
        affectedUsers: 150
      };
      
      const result = validateIncident(validData);
      expect(result.isValid).toBe(true);
    });

    test('deve rejeitar incidente sem título', () => {
      const invalidData = {
        title: '',
        description: 'O servidor principal está offline',
        category: 'Infraestrutura',
        priority: 'Crítica',
        affectedUsers: 150
      };
      
      const result = validateIncident(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Título obrigatório');
    });

    test('deve rejeitar título muito curto', () => {
      const invalidData = {
        title: 'Bug',
        description: 'O servidor principal está offline',
        category: 'Infraestrutura',
        priority: 'Crítica',
        affectedUsers: 150
      };
      
      const result = validateIncident(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Título deve ter pelo menos 5 caracteres');
    });

    test('deve rejeitar título muito longo', () => {
      const longTitle = 'A'.repeat(201);
      const invalidData = {
        title: longTitle,
        description: 'O servidor principal está offline',
        category: 'Infraestrutura',
        priority: 'Crítica',
        affectedUsers: 150
      };
      
      const result = validateIncident(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Título não pode ter mais de 200 caracteres');
    });

    test('deve rejeitar descrição muito curta', () => {
      const invalidData = {
        title: 'Servidor offline',
        description: 'Offline',
        category: 'Infraestrutura',
        priority: 'Crítica',
        affectedUsers: 150
      };
      
      const result = validateIncident(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Descrição deve ter pelo menos 10 caracteres');
    });

    test('deve rejeitar utilizadores afetados negativo', () => {
      const invalidData = {
        title: 'Servidor offline',
        description: 'O servidor principal está offline',
        category: 'Infraestrutura',
        priority: 'Crítica',
        affectedUsers: -5
      };
      
      const result = validateIncident(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Utilizadores afetados deve ser número >= 1');
    });

    test('deve rejeitar utilizadores afetados acima do limite', () => {
      const invalidData = {
        title: 'Servidor offline',
        description: 'O servidor principal está offline',
        category: 'Infraestrutura',
        priority: 'Crítica',
        affectedUsers: 999999999
      };
      
      const result = validateIncident(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Utilizadores afetados não pode exceder 100000');
    });
  });

  // Testes de dados de incidente
  describe('Dados de Incidente', () => {
    test('mock incident deve ter estrutura correcta', () => {
      expect(mockIncident).toHaveProperty('id');
      expect(mockIncident).toHaveProperty('title');
      expect(mockIncident).toHaveProperty('description');
      expect(mockIncident).toHaveProperty('category');
      expect(mockIncident).toHaveProperty('priority');
      expect(mockIncident).toHaveProperty('status');
    });

    test('mock incident deve ter status válido', () => {
      const validStatus = ['Aberto', 'Em Progresso', 'Escalado', 'Resolvido', 'Fechado'];
      expect(validStatus).toContain(mockIncident.status);
    });

    test('mock incident deve ter prioridade válida', () => {
      const validPriorities = ['Baixa', 'Média', 'Alta', 'Crítica'];
      expect(validPriorities).toContain(mockIncident.priority);
    });
  });

  // Testes de lógica de incidentes
  describe('Lógica de Incidentes', () => {
    const calculateMTTR = (createdAt, resolvedAt) => {
      if (!resolvedAt) return null;
      const diffMs = new Date(resolvedAt) - new Date(createdAt);
      return Math.round(diffMs / (1000 * 60 * 60)); // em horas
    };

    test('deve calcular MTTR correctamente', () => {
      const created = new Date('2025-12-01 10:00:00');
      const resolved = new Date('2025-12-01 12:00:00');
      const mttr = calculateMTTR(created, resolved);
      
      expect(mttr).toBe(2); // 2 horas
    });

    test('deve retornar null para incidente não resolvido', () => {
      const mttr = calculateMTTR(new Date(), null);
      expect(mttr).toBeNull();
    });

    test('deve agrupar incidentes por prioridade', () => {
      const incidents = [
        { priority: 'Alta', id: 1 },
        { priority: 'Crítica', id: 2 },
        { priority: 'Alta', id: 3 },
        { priority: 'Baixa', id: 4 }
      ];
      
      const grouped = {};
      incidents.forEach(inc => {
        grouped[inc.priority] = (grouped[inc.priority] || 0) + 1;
      });
      
      expect(grouped['Alta']).toBe(2);
      expect(grouped['Crítica']).toBe(1);
      expect(grouped['Baixa']).toBe(1);
    });

    test('deve calcular taxa de resolução', () => {
      const incidents = [
        { status: 'Resolvido' },
        { status: 'Fechado' },
        { status: 'Aberto' },
        { status: 'Em Progresso' }
      ];
      
      const resolved = incidents.filter(i => i.status === 'Resolvido' || i.status === 'Fechado').length;
      const taxa = Math.round((resolved / incidents.length) * 100);
      
      expect(taxa).toBe(50);
    });
  });
});
