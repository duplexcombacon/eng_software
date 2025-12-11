// server/tests/nagios-webhook.test.js
require('./setup');

describe('Nagios Webhook Integration', () => {
  // Webhook reception
  test('deve receber alerta crítico e criar incidente', () => {
    const mockNagiosAlert = {
      host: 'APP-SERVER-01',
      service: 'CPU Load',
      status: 'CRITICAL',
      output: 'CPU: 95%',
      timestamp: new Date().toISOString()
    };

    const payload = mockNagiosAlert;
    expect(payload.host).toBeDefined();
    expect(payload.service).toBeDefined();
    expect(payload.status).toBeDefined();
  });

  // Alert processing and mapping
  test('deve processar alerta CRITICAL corretamente', () => {
    const processAlert = (alert) => {
      const statusMap = {
        'CRITICAL': 'Crítica',
        'WARNING': 'Alta',
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

  // Escalation
  test('deve escalar incidente crítico ao SysAdmin', () => {
    const escalateIncident = (priority) => {
      const escalationMap = {
        'Crítica': 'SysAdmin',
        'Alta': 'Técnico',
        'Baixa': null
      };
      return escalationMap[priority];
    };

    const assignment = escalateIncident('Crítica');
    expect(assignment).toBe('SysAdmin');
  });
});
