// server/tests/metrics.test.js
require('./setup');

describe('Métricas', () => {
  // MTTR calculation
  test('deve calcular MTTR com múltiplos incidentes', () => {
    const calculateMTTR = (incidents) => {
      if (incidents.length === 0) return 0;
      const totalTime = incidents.reduce((sum, inc) => {
        if (!inc.resolvedAt) return sum;
        const diffMs = new Date(inc.resolvedAt) - new Date(inc.createdAt);
        return sum + (diffMs / (1000 * 60 * 60));
      }, 0);
      const resolvedCount = incidents.filter(i => i.resolvedAt).length;
      return resolvedCount > 0 ? Math.round(totalTime / resolvedCount) : 0;
    };

    const incidents = [
      { createdAt: new Date('2025-12-01 10:00:00'), resolvedAt: new Date('2025-12-01 12:00:00') },
      { createdAt: new Date('2025-12-01 08:00:00'), resolvedAt: new Date('2025-12-01 10:00:00') }
    ];
    
    const mttr = calculateMTTR(incidents);
    expect(mttr).toBe(2);
  });

  // Count by category
  test('deve contar incidentes por categoria', () => {
    const countByCategory = (incidents) => {
      return incidents.reduce((acc, inc) => {
        acc[inc.category] = (acc[inc.category] || 0) + 1;
        return acc;
      }, {});
    };

    const incidents = [
      { category: 'Infraestrutura' },
      { category: 'Infraestrutura' },
      { category: 'Software' }
    ];
    
    const counts = countByCategory(incidents);
    expect(counts['Infraestrutura']).toBe(2);
    expect(counts['Software']).toBe(1);
  });

  // Resolution rate
  test('deve calcular taxa de resolução correctamente', () => {
    const calculateResolutionRate = (incidents) => {
      if (incidents.length === 0) return 0;
      const resolved = incidents.filter(i => 
        i.status === 'Resolvido' || i.status === 'Fechado'
      ).length;
      return Math.round((resolved / incidents.length) * 100);
    };

    const incidents = [
      { status: 'Resolvido' },
      { status: 'Fechado' },
      { status: 'Aberto' },
      { status: 'Em Progresso' }
    ];
    
    const taxa = calculateResolutionRate(incidents);
    expect(taxa).toBe(50);
  });
});
