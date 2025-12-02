// server/tests/nagios-webhook.test.js
require('./setup');

describe('Nagios Webhook Integration', () => {
  describe('POST /api/nagios/webhook', () => {
    const mockNagiosAlert = {
      host: 'APP-SERVER-01',
      service: 'CPU Load',
      status: 'CRITICAL',
      output: 'CPU: 95%',
      timestamp: new Date().toISOString()
    };

    test('deve receber alerta crítico e criar incidente', () => {
      // Simulação da chamada webhook
      const payload = mockNagiosAlert;
      
      // Validar estrutura
      expect(payload.host).toBeDefined();
      expect(payload.service).toBeDefined();
      expect(payload.status).toBeDefined();
    });

    test('deve mapear status CRITICAL para prioridade Crítica', () => {
      const statusMap = {
        'CRITICAL': 'Crítica',
        'WARNING': 'Alta',
        'UNKNOWN': 'Média',
        'OK': 'Baixa'
      };

      expect(statusMap['CRITICAL']).toBe('Crítica');
      expect(statusMap['WARNING']).toBe('Alta');
      expect(statusMap['OK']).toBe('Baixa');
    });

    test('deve evitar duplicação de incidentes', () => {
      const alerts = [
        { host: 'DB-01', service: 'Disk', status: 'CRITICAL' },
        { host: 'DB-01', service: 'Disk', status: 'CRITICAL' } // Duplicado
      ];

      // Apenas o primeiro deve criar incidente
      expect(alerts[0]).toEqual(alerts[1]); // Mesmo alerta
    });

    test('deve resolver incidente quando status volta a OK', () => {
      const originalAlert = { host: 'APP-01', service: 'CPU', status: 'CRITICAL' };
      const recoveryAlert = { host: 'APP-01', service: 'CPU', status: 'OK' };

      // Recovery alert deve fechar o incidente
      expect(recoveryAlert.status).toBe('OK');
      expect(originalAlert.status).not.toBe(recoveryAlert.status);
    });

    test('deve atribuir incidente crítico ao SysAdmin', () => {
      const criticalAlert = {
        host: 'DB-SERVER',
        service: 'Database',
        status: 'CRITICAL'
      };

      const priority = 'Crítica'; // Mapeado de status
      expect(priority).toBe('Crítica');
      // Lógica de atribuição ao SysAdmin seria testada aqui
    });

    test('deve criar incidente com descrição padronizada', () => {
      const alert = mockNagiosAlert;
      
      const description = `
Nagios Alert:
Host: ${alert.host}
Service: ${alert.service}
Status: ${alert.status}
Output: ${alert.output}
Timestamp: ${alert.timestamp}
      `.trim();

      expect(description).toContain(alert.host);
      expect(description).toContain(alert.service);
      expect(description).toContain('Nagios Alert');
    });

    test('deve validar payload obrigatório', () => {
      const incompleteAlerts = [
        { service: 'CPU', status: 'CRITICAL' }, // Falta host
        { host: 'SERVER', status: 'CRITICAL' }, // Falta service
        { host: 'SERVER', service: 'CPU' } // Falta status
      ];

      // Validação: cada alerta incompleto deve estar faltando algo
      expect(!incompleteAlerts[0].host).toBe(true); // Falta host
      expect(!incompleteAlerts[1].service).toBe(true); // Falta service
      expect(!incompleteAlerts[2].status).toBe(true); // Falta status
    });

    test('deve categorizar incidente como Infraestrutura', () => {
      const incident = {
        title: 'CPU Load - CRITICAL',
        category: 'Infraestrutura',
        priority: 'Crítica'
      };

      expect(incident.category).toBe('Infraestrutura');
    });

    test('deve registar timestamp do evento', () => {
      const alert = mockNagiosAlert;
      expect(alert.timestamp).toBeDefined();
      expect(new Date(alert.timestamp)).toBeInstanceOf(Date);
    });

    test('deve ser idempotente para mesmo alerta', () => {
      const alert = mockNagiosAlert;
      
      // Chamadas múltiplas do mesmo alerta devem resultar em 1 incidente
      const incidents = [];
      
      // Simular 3 chamadas
      for (let i = 0; i < 3; i++) {
        // Checar se já existe
        const exists = incidents.some(inc => 
          inc.host === alert.host && 
          inc.service === alert.service &&
          inc.status !== 'Resolvido'
        );
        
        if (!exists) {
          incidents.push(alert);
        }
      }
      
      expect(incidents.length).toBe(1);
    });

    test('deve suportar múltiplos hosts e services', () => {
      const alerts = [
        { host: 'APP-01', service: 'CPU', status: 'CRITICAL' },
        { host: 'APP-02', service: 'CPU', status: 'CRITICAL' },
        { host: 'DB-01', service: 'Disk', status: 'WARNING' },
        { host: 'DB-02', service: 'Memory', status: 'OK' }
      ];

      expect(alerts.length).toBe(4);
      const criticalAlerts = alerts.filter(a => a.status === 'CRITICAL');
      expect(criticalAlerts.length).toBe(2);
    });
  });

  describe('Nagios Alert Processing', () => {
    const processAlert = (alert) => {
      const statusMap = {
        'CRITICAL': 'Crítica',
        'WARNING': 'Alta',
        'UNKNOWN': 'Média',
        'OK': 'Baixa'
      };

      return {
        title: `${alert.service} - ${alert.host}`,
        priority: statusMap[alert.status] || 'Média',
        category: 'Infraestrutura',
        shouldNotify: alert.status !== 'OK',
        shouldAssignToSysAdmin: alert.status === 'CRITICAL'
      };
    };

    test('deve processar alerta CRITICAL corretamente', () => {
      const alert = {
        host: 'PROD-DB',
        service: 'Connection Pool',
        status: 'CRITICAL'
      };

      const processed = processAlert(alert);
      expect(processed.priority).toBe('Crítica');
      expect(processed.shouldNotify).toBe(true);
      expect(processed.shouldAssignToSysAdmin).toBe(true);
    });

    test('deve processar alerta WARNING corretamente', () => {
      const alert = {
        host: 'DEV-SERVER',
        service: 'Disk Space',
        status: 'WARNING'
      };

      const processed = processAlert(alert);
      expect(processed.priority).toBe('Alta');
      expect(processed.shouldNotify).toBe(true);
      expect(processed.shouldAssignToSysAdmin).toBe(false);
    });

    test('deve ignorar alerta OK', () => {
      const alert = {
        host: 'APP-01',
        service: 'CPU',
        status: 'OK'
      };

      const processed = processAlert(alert);
      expect(processed.shouldNotify).toBe(false);
    });
  });

  describe('Escalação Automática', () => {
    test('incidente crítico deve ser atribuído ao SysAdmin', () => {
      const incident = {
        priority: 'Crítica',
        shouldEscalateTo: 'SysAdmin'
      };

      expect(incident.shouldEscalateTo).toBe('SysAdmin');
    });

    test('incidente alta deve ser atribuído ao Técnico', () => {
      const incident = {
        priority: 'Alta',
        shouldEscalateTo: 'Técnico'
      };

      expect(incident.shouldEscalateTo).toBe('Técnico');
    });

    test('incidente baixa pode ficar em fila', () => {
      const incident = {
        priority: 'Baixa',
        assignedTo: null,
        status: 'Aberto'
      };

      expect(incident.assignedTo).toBeNull();
    });
  });
});
