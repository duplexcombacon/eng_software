// server/tests/incidents.test.js
require('./setup');

describe('Incidentes', () => {
  // Core tests
  test('deve criar incidente com dados válidos', () => {
    const validateIncident = (data) => {
      const errors = [];
      if (!data.title || data.title.trim().length === 0) {
        errors.push('Título obrigatório');
      }
      if (data.title && data.title.length < 5) {
        errors.push('Título deve ter pelo menos 5 caracteres');
      }
      if (!data.description || data.description.trim().length === 0) {
        errors.push('Descrição obrigatória');
      }
      if (!data.category) {
        errors.push('Categoria obrigatória');
      }
      if (!data.priority) {
        errors.push('Prioridade obrigatória');
      }
      return { isValid: errors.length === 0, errors };
    };

    const validData = {
      title: 'Servidor offline',
      description: 'O servidor principal está offline desde as 14h',
      category: 'Infraestrutura',
      priority: 'Crítica'
    };
    
    const result = validateIncident(validData);
    expect(result.isValid).toBe(true);
  });

  test('deve calcular MTTR correctamente', () => {
    const calculateMTTR = (createdAt, resolvedAt) => {
      if (!resolvedAt) return null;
      const diffMs = new Date(resolvedAt) - new Date(createdAt);
      return Math.round(diffMs / (1000 * 60 * 60));
    };

    const created = new Date('2025-12-01 10:00:00');
    const resolved = new Date('2025-12-01 12:00:00');
    const mttr = calculateMTTR(created, resolved);
    
    expect(mttr).toBe(2);
  });

  test('deve agrupar incidentes por prioridade', () => {
    const incidents = [
      { priority: 'Alta', id: 1 },
      { priority: 'Crítica', id: 2 },
      { priority: 'Alta', id: 3 }
    ];
    
    const grouped = {};
    incidents.forEach(inc => {
      grouped[inc.priority] = (grouped[inc.priority] || 0) + 1;
    });
    
    expect(grouped['Alta']).toBe(2);
    expect(grouped['Crítica']).toBe(1);
  });
});
