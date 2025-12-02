# 📊 ANÁLISE: Integração de Nagios com Sistema de Gestão de Incidentes

## 🎯 O que é Nagios?

**Nagios** é uma plataforma de **monitorização em tempo real** de infraestrutura IT usada por +10.000 organizações (Fortune 500, empresas de tecnologia, etc.).

### Principais Características:
- ✅ Monitora servidores, redes, aplicações, bases de dados
- ✅ Alertas multi-channel (email, SMS, Slack, Teams)
- ✅ Dashboards customizáveis
- ✅ Role-based access control (similar ao vosso!)
- ✅ API REST para integração
- ✅ Plugins e extensões (community)

---

## 🔄 Como Funciona Nagios?

```
┌──────────────────────────────────────────────┐
│     Hosts/Services para Monitorar            │
│   (Servidores, BD, Aplicações, Redes)       │
└────────────┬─────────────────────────────────┘
             │ Polling (a cada N segundos)
             ▼
┌──────────────────────────────────────────────┐
│        Nagios Core Engine                    │
│  ├─ Executa checks (plugins)                │
│  ├─ Recolhe status (OK, WARNING, CRITICAL)  │
│  └─ Verifica thresholds                     │
└────────────┬─────────────────────────────────┘
             │ Eventos de Status
             ▼
┌──────────────────────────────────────────────┐
│        Alertas & Notificações                │
│  ├─ Email para admin                        │
│  ├─ SMS (crítico)                           │
│  ├─ Webhooks/API calls                      │
│  └─ Tickets automáticos                     │
└────────────┬─────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────┐
│     Web UI + Dashboards                      │
│  (Visualização centralizada)                 │
└──────────────────────────────────────────────┘
```

### Ciclo de Monitorização:
1. **Check** - Nagios executa um plugin para verificar serviço
2. **Status** - Resultado: OK (0), WARNING (1), CRITICAL (2), UNKNOWN (3)
3. **Alert** - Se status != OK → dispara notificação
4. **Recovery** - Quando volta a OK → notifica resolução

---

## 💡 Como Pode Ajudar Vosso Projeto?

### Cenário Atual (Vosso Sistema):
- ✅ Incidentes registados **manualmente** pelos técnicos
- ✅ Dashboard mostra incidentes existentes
- ⚠️ **Não há monitorização automática**

### Cenário com Nagios Integrado:
- ✅ **Monitorização automática** de infraestrutura
- ✅ **Geração automática de incidentes** quando problemas ocorrem
- ✅ **Correlação de dados** - relacionar alertas Nagios com incidentes
- ✅ **SLA tracking** - MTTR baseado em dados reais
- ✅ **Escalação automática** - ticket vai direto ao SysAdmin se crítico

---

## 🔌 Integração Prática: Nagios API + Vosso Sistema

### Opção 1: **Nagios → Vosso Sistema** (Recomendado para MVP)

Quando algo crítico ocorre em Nagios:
1. Nagios dispara webhook para `POST /api/incidents`
2. Seu sistema cria incidente automaticamente
3. Atribui ao técnico apropriado
4. Envia notificação

**Código do Webhook (Nagios):**
```
/usr/local/nagios/libexec/notify-incident.sh
├─ Recolhe host, service, status
├─ POST para http://seu-servidor/api/incidents
└─ JSON: {title, description, priority, category, affectedUsers}
```

**Endpoint Vosso (já existe!):**
```javascript
POST /api/incidents
{
  "title": "Servidor BD Offline",
  "description": "Nagios Alert: host=DB-SERVER status=CRITICAL",
  "category": "Infraestrutura",
  "priority": "Crítica",
  "affectedUsers": 500
}
```

### Opção 2: **Vosso Sistema → Nagios** (Avançado)

Quando um incidente é criado manualmente:
1. Vosso sistema envia dados para Nagios
2. Nagios cria check automático
3. Monitoriza até resolução

**Fluxo Completo:**
```
Técnico cria incidente
    ↓
Sistema chama Nagios API
    ↓
Nagios monitora métrica relacionada
    ↓
Métrica volta ao normal?
    ↓
Sistema marca incidente como resolvido
```

---

## 📈 Benefícios Específicos Para Vosso Projeto

| Benefício | Impacto | Prioridade |
|-----------|--------|-----------|
| **Detecção Automática** | Menos incidentes "missed" | ⭐⭐⭐⭐⭐ |
| **SLA Real** | MTTR baseado em dados reais | ⭐⭐⭐⭐ |
| **Escalação** | Críticos vão direto ao SysAdmin | ⭐⭐⭐⭐ |
| **Correlação** | Relacionar múltiplos alerts | ⭐⭐⭐ |
| **Histórico** | Audit trail completo | ⭐⭐⭐ |

---

## ⚙️ Como Implementar (Passo a Passo)

### Fase 1: Setup Nagios (1-2 dias)
```bash
# 1. Instalar Nagios Core (ou usar Nagios XI para produção)
sudo apt-get install nagios4 nagios-plugins nagios-nrpe-plugin

# 2. Configurar hosts e services
/etc/nagios4/conf.d/hosts.cfg
/etc/nagios4/conf.d/services.cfg

# 3. Testar
sudo nagios -v /etc/nagios4/nagios.cfg
```

### Fase 2: Setup Webhook (Nagios → Vosso Sistema)
```bash
# Criar script de notificação
/usr/local/nagios/libexec/notify-incident.sh
```

**Script (Python):**
```python
#!/usr/bin/env python3
import sys
import requests
import json

host = sys.argv[1]
service = sys.argv[2]
status = sys.argv[3]

# Mapear status para prioridade
priority_map = {
    'CRITICAL': 'Crítica',
    'WARNING': 'Alta',
    'OK': 'Resolvido'
}

incident = {
    'title': f'{service} - {status}',
    'description': f'Nagios Alert on {host}: {service} is {status}',
    'category': 'Infraestrutura',
    'priority': priority_map.get(status, 'Média'),
    'affectedUsers': 100
}

# POST para vosso sistema
requests.post('http://seu-servidor/api/incidents', json=incident, 
              headers={'Authorization': 'Bearer SEU_TOKEN'})
```

### Fase 3: Integração Frontend
```javascript
// server/routes/incidents.js - Adicionar webhook endpoint
router.post('/webhook/nagios', async (req, res) => {
  // Receber alerta Nagios
  // Criar incidente
  // Notificar técnico
  // Retornar confirmação
});
```

---

## 📊 Exemplo de Fluxo Completo

```
12:00 - CPU do Servidor sobe para 95%
  ↓
Nagios detecta: CPU > 90%
  ↓
Nagios dispara webhook
  ↓
POST /api/incidents/webhook/nagios
{
  "host": "APP-SERVER-01",
  "service": "CPU Load",
  "status": "CRITICAL",
  "output": "CPU: 95%"
}
  ↓
Seu sistema cria incidente automático:
{
  "title": "CPU Load - CRITICAL",
  "priority": "Crítica",
  "category": "Infraestrutura",
  "status": "Aberto",
  "assignedTo": [SysAdmin]
}
  ↓
Dashboard mostra novo incidente vermelho
  ↓
SysAdmin recebe notificação (email/SMS)
  ↓
SysAdmin acessa dashboard
  ↓
Vê CPU em alta carga, reinicia serviço
  ↓
CPU volta a 30%
  ↓
Nagios detecta: CPU normal
  ↓
Sistema marca incidente como Resolvido
  ↓
MTTR registado: 15 minutos
```

---

## 🔍 Alternativas a Considerar

| Ferramenta | Pros | Contras | Custo |
|-----------|------|---------|-------|
| **Nagios** | Open-source, customizável, maduro | Steep learning curve | Grátis (Core) |
| **Prometheus** | Modern, cloud-native, time-series DB | Menos alerting nativo | Grátis |
| **Zabbix** | Completo, boa UI, API forte | Heavy em recursos | Grátis |
| **Datadog** | Cloud, muito fácil, ML | Caro ($$$) | Pago |
| **New Relic** | APM especializado | Caro | Pago |

**Para Vosso Projeto: Nagios Core ou Prometheus são as melhores opções.**

---

## 📌 Minha Recomendação

### ✅ **SIM, integrem Nagios, MAS com estratégia:**

**Curto Prazo (Sprint 5):**
1. Instalar Nagios Core numa VM local
2. Configurar monitorização básica (CPU, RAM, Disk, DB)
3. Criar webhook simples para criar incidentes
4. Testar fluxo completo

**Impacto: +3-4 pontos no projeto**

**Médio Prazo (Sprint 6):**
1. Escalação inteligente (crítico → SysAdmin direto)
2. Correlação de alerts (múltiplos alerts = 1 incidente)
3. Integração com API de notificações
4. Painel de status de infraestrutura no dashboard

**Impacto: +5-6 pontos**

---

## ⚠️ O Que NÃO Fazer

❌ **Não substituam** vosso sistema por Nagios  
❌ **Não tentem** tudo de uma vez (start small)  
❌ **Não ignorem** a curva de aprendizado de Nagios  
❌ **Não esqueçam** backups/high availability do Nagios

---

## 🚀 Próximos Passos Recomendados

1. **Verificar com professor** se quer apenas monitorização ou integração completa
2. **Avaliar** qual é o escopo exato esperado
3. **Instalar localmente** para testar antes de integrar
4. **Documentar** toda a integração (será avaliado!)
5. **Demonstrar** no projeto final (Nagios + Vosso Sistema = wow factor!)

---

## 📚 Recursos de Aprendizado

- **Nagios Core**: https://www.nagios.org/
- **API Docs**: https://assets.nagios.com/downloads/nagioscore/docs/
- **Plugin Dev**: https://nagios-plugins.org/
- **Community**: https://exchange.nagios.org/

---

## 💬 Conclusão

**Nagios pode transformar vosso projeto de "Sistema de Gestão de Incidentes Manual" para "Sistema Inteligente com Monitorização Automática".**

É um excelente caso de uso académico que demonstra:
- ✅ Integração de sistemas (Nagios + Vosso app)
- ✅ APIs e webhooks
- ✅ Automação de processos
- ✅ Thinking like a DevOps engineer

**Impacto no professor: 9/10** - Muito good para mostrar conhecimento avançado!

---

**Quer que eu comece a implementação?** Posso criar:
1. Script de webhook Nagios
2. Endpoint para receber alerts
3. Lógica de auto-criação de incidentes
4. Documentação de setup

O que preferem?
