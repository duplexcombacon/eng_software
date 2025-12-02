// server/tests/metrics.test.js
require('./setup');

describe('Métricas', () => {
  // Testes de cálculo MTTR
  describe('MTTR (Mean Time To Resolution)', () => {
    const calculateMTTR = (incidents) => {
      if (incidents.length === 0) return 0;
      
      const totalTime = incidents.reduce((sum, inc) => {
        if (!inc.resolvedAt) return sum;
        const diffMs = new Date(inc.resolvedAt) - new Date(inc.createdAt);
        return sum + (diffMs / (1000 * 60 * 60)); // em horas
      }, 0);
      
      const resolvedCount = incidents.filter(i => i.resolvedAt).length;
      return resolvedCount > 0 ? Math.round(totalTime / resolvedCount) : 0;
    };

    test('deve calcular MTTR com múltiplos incidentes', () => {
      const incidents = [
        {
          createdAt: new Date('2025-12-01 10:00:00'),
          resolvedAt: new Date('2025-12-01 12:00:00')
        },
        {
          createdAt: new Date('2025-12-01 08:00:00'),
          resolvedAt: new Date('2025-12-01 10:00:00')
        }
      ];
      
      const mttr = calculateMTTR(incidents);
      expect(mttr).toBe(2); // (2 + 2) / 2 = 2 horas
    });

    test('deve ignorar incidentes não resolvidos no MTTR', () => {
      const incidents = [
        {
          createdAt: new Date('2025-12-01 10:00:00'),
          resolvedAt: new Date('2025-12-01 14:00:00')
        },
        {
          createdAt: new Date('2025-12-01 08:00:00'),
          resolvedAt: null
        }
      ];
      
      const mttr = calculateMTTR(incidents);
      expect(mttr).toBe(4); // apenas o primeiro (4 horas)
    });

    test('deve retornar 0 quando nenhum incidente está resolvido', () => {
      const incidents = [
        { createdAt: new Date(), resolvedAt: null },
        { createdAt: new Date(), resolvedAt: null }
      ];
      
      const mttr = calculateMTTR(incidents);
      expect(mttr).toBe(0);
    });

    test('deve retornar 0 quando lista de incidentes está vazia', () => {
      const mttr = calculateMTTR([]);
      expect(mttr).toBe(0);
    });
  });

  // Testes de contagem por categoria
  describe('Incidentes por Categoria', () => {
    const countByCategory = (incidents) => {
      return incidents.reduce((acc, inc) => {
        acc[inc.category] = (acc[inc.category] || 0) + 1;
        return acc;
      }, {});
    };

    test('deve contar incidentes por categoria', () => {
      const incidents = [
        { category: 'Infraestrutura' },
        { category: 'Infraestrutura' },
        { category: 'Software' },
        { category: 'Hardware' }
      ];
      
      const counts = countByCategory(incidents);
      expect(counts['Infraestrutura']).toBe(2);
      expect(counts['Software']).toBe(1);
      expect(counts['Hardware']).toBe(1);
    });

    test('deve retornar objecto vazio para lista vazia', () => {
      const counts = countByCategory([]);
      expect(Object.keys(counts).length).toBe(0);
    });
  });

  // Testes de contagem por prioridade
  describe('Incidentes por Prioridade', () => {
    const countByPriority = (incidents) => {
      return incidents.reduce((acc, inc) => {
        acc[inc.priority] = (acc[inc.priority] || 0) + 1;
        return acc;
      }, {});
    };

    test('deve contar incidentes por prioridade', () => {
      const incidents = [
        { priority: 'Crítica' },
        { priority: 'Alta' },
        { priority: 'Alta' },
        { priority: 'Baixa' }
      ];
      
      const counts = countByPriority(incidents);
      expect(counts['Crítica']).toBe(1);
      expect(counts['Alta']).toBe(2);
      expect(counts['Baixa']).toBe(1);
    });
  });

  // Testes de contagem por status
  describe('Incidentes por Status', () => {
    const countByStatus = (incidents) => {
      return incidents.reduce((acc, inc) => {
        acc[inc.status] = (acc[inc.status] || 0) + 1;
        return acc;
      }, {});
    };

    test('deve contar incidentes por status', () => {
      const incidents = [
        { status: 'Resolvido' },
        { status: 'Resolvido' },
        { status: 'Em Progresso' },
        { status: 'Aberto' }
      ];
      
      const counts = countByStatus(incidents);
      expect(counts['Resolvido']).toBe(2);
      expect(counts['Em Progresso']).toBe(1);
      expect(counts['Aberto']).toBe(1);
    });
  });

  // Testes de taxa de resolução
  describe('Taxa de Resolução', () => {
    const calculateResolutionRate = (incidents) => {
      if (incidents.length === 0) return 0;
      
      const resolved = incidents.filter(i => 
        i.status === 'Resolvido' || i.status === 'Fechado'
      ).length;
      
      return Math.round((resolved / incidents.length) * 100);
    };

    test('deve calcular taxa de resolução 100%', () => {
      const incidents = [
        { status: 'Resolvido' },
        { status: 'Fechado' }
      ];
      
      const taxa = calculateResolutionRate(incidents);
      expect(taxa).toBe(100);
    });

    test('deve calcular taxa de resolução 50%', () => {
      const incidents = [
        { status: 'Resolvido' },
        { status: 'Fechado' },
        { status: 'Aberto' },
        { status: 'Em Progresso' }
      ];
      
      const taxa = calculateResolutionRate(incidents);
      expect(taxa).toBe(50);
    });

    test('deve calcular taxa de resolução 0%', () => {
      const incidents = [
        { status: 'Aberto' },
        { status: 'Em Progresso' }
      ];
      
      const taxa = calculateResolutionRate(incidents);
      expect(taxa).toBe(0);
    });

    test('deve retornar 0 para lista vazia', () => {
      const taxa = calculateResolutionRate([]);
      expect(taxa).toBe(0);
    });
  });

  // Testes de taxa de utilizadores afetados
  describe('Utilizadores Afetados', () => {
    const calculateTotalAffected = (incidents) => {
      return incidents.reduce((sum, inc) => sum + (inc.affectedUsers || 0), 0);
    };

    const calculateAverageAffected = (incidents) => {
      if (incidents.length === 0) return 0;
      return Math.round(calculateTotalAffected(incidents) / incidents.length);
    };

    test('deve calcular total de utilizadores afetados', () => {
      const incidents = [
        { affectedUsers: 100 },
        { affectedUsers: 250 },
        { affectedUsers: 150 }
      ];
      
      const total = calculateTotalAffected(incidents);
      expect(total).toBe(500);
    });

    test('deve calcular média de utilizadores afetados', () => {
      const incidents = [
        { affectedUsers: 100 },
        { affectedUsers: 200 },
        { affectedUsers: 300 }
      ];
      
      const media = calculateAverageAffected(incidents);
      expect(media).toBe(200);
    });

    test('deve retornar 0 para lista vazia', () => {
      const total = calculateTotalAffected([]);
      expect(total).toBe(0);
    });
  });

  // Testes de rankings
  describe('Rankings', () => {
    const getTopCategories = (incidents, limit = 3) => {
      const counts = {};
      incidents.forEach(inc => {
        counts[inc.category] = (counts[inc.category] || 0) + 1;
      });
      
      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([category, count]) => ({ category, count }));
    };

    test('deve retornar top 3 categorias mais frequentes', () => {
      const incidents = [
        { category: 'Infraestrutura' },
        { category: 'Infraestrutura' },
        { category: 'Infraestrutura' },
        { category: 'Software' },
        { category: 'Software' },
        { category: 'Hardware' }
      ];
      
      const top = getTopCategories(incidents, 3);
      expect(top[0].category).toBe('Infraestrutura');
      expect(top[0].count).toBe(3);
      expect(top[1].category).toBe('Software');
      expect(top[1].count).toBe(2);
    });

    test('deve retornar menos de 3 se não houver suficientes', () => {
      const incidents = [
        { category: 'Infraestrutura' },
        { category: 'Software' }
      ];
      
      const top = getTopCategories(incidents, 3);
      expect(top.length).toBe(2);
    });
  });
});
