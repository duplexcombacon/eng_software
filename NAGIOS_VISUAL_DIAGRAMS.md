# 📊 DIAGRAMA VISUAL - Integração Nagios com Sistema de Incidentes

## 1️⃣ ARQUITETURA GERAL

```
╔════════════════════════════════════════════════════════════════════════╗
║                         INFRAESTRUTURA                                ║
║  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ ║
║  │ APP-SERVER  │  │ DATABASE     │  │ WEB-SERVER   │  │ STORAGE    │ ║
║  │ CPU: 45%    │  │ Connections: │  │ Status: UP   │  │ Disk: 60%  │ ║
║  └──────┬──────┘  └──────┬───────┘  └──────┬───────┘  └──────┬─────┘ ║
║         │                │                │                 │         ║
║         └────────────────┴────────────────┴─────────────────┘         ║
║                                 │                                     ║
║                    (SNMP, agents, logs, APIs)                        ║
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
╔════════════════════════════════════════════════════════════════════════╗
║                         NAGIOS CORE (Monitoring)                      ║
║  ┌────────────────────────────────────────────────────────────────┐  ║
║  │  Check Interval: 5 min                                        │  ║
║  │  ├─ Plugin: check_cpu  → OK                                  │  ║
║  │  ├─ Plugin: check_db   → OK                                  │  ║
║  │  ├─ Plugin: check_web  → OK                                  │  ║
║  │  └─ Plugin: check_disk → WARNING (80%)                       │  ║
║  │                                                               │  ║
║  │  Alert Decision Engine:                                      │  ║
║  │  └─ If status != OK → Trigger Event                         │  ║
║  └────────────────────────────────────────────────────────────────┘  ║
║                                 │                                     ║
║                                 │ CRITICAL: Disk full!               ║
║                                 ▼                                     ║
║  ┌────────────────────────────────────────────────────────────────┐  ║
║  │  Notification Handler                                         │  ║
║  │  ├─ Email nagios-admin@company.pt                            │  ║
║  │  ├─ SMS +351 91234567                                        │  ║
║  │  └─ Webhook → http://seu-sistema/api/nagios/webhook 🎯      │  ║
║  └────────────────────────────────────────────────────────────────┘  ║
└────────────────────────────────────┬────────────────────────────────┘
                                     │
         ┌───────────────────────────┴───────────────────────────┐
         │                                                       │
         ▼                                                       ▼
╔═══════════════════════════════╗              ╔════════════════════════╗
║    EMAIL NOTIFICATION         ║              ║   VOSSO SISTEMA        ║
║                               ║              ║   /api/nagios/webhook  ║
║ [CRITICAL] Disk Full on ...   ║              ║                        ║
║ Severity: 5/5                 ║              ║ ┌──────────────────┐   ║
║ Action: Contact SysAdmin      ║              ║ │ Parse payload    │   ║
║                               ║              ║ │ {host, service,  │   ║
║ [Reply to ticket]             ║              ║ │  status, output} │   ║
└───────────────────────────────┘              ║ └────────┬─────────┘   ║
                                               ║          │             ║
                                               ║          ▼             ║
                                               ║ ┌──────────────────┐   ║
                                               ║ │ Map Status:      │   ║
                                               ║ │ CRITICAL → HIGH  │   ║
                                               ║ │ WARNING → MEDIUM │   ║
                                               ║ │ OK → resolve     │   ║
                                               ║ └────────┬─────────┘   ║
                                               ║          │             ║
                                               ║          ▼             ║
                                               ║ ┌──────────────────┐   ║
                                               ║ │ INSERT Incidente │   ║
                                               ║ │ - Title          │   ║
                                               ║ │ - Priority       │   ║
                                               ║ │ - Category       │   ║
                                               ║ │ - Status: Aberto │   ║
                                               ║ └────────┬─────────┘   ║
                                               ║          │             ║
                                               ║          ▼             ║
                                               ║ ┌──────────────────┐   ║
                                               ║ │ Assign to:       │   ║
                                               ║ │ - SysAdmin (se   │   ║
                                               ║ │   priority HIGH) │   ║
                                               ║ │ - Técnico (se    │   ║
                                               ║ │   priority MED)  │   ║
                                               ║ └────────┬─────────┘   ║
                                               ║          │             ║
                                               ║          ▼             ║
                                               ║ ┌──────────────────┐   ║
                                               ║ │ Notification     │   ║
                                               ║ │ - Email/SMS      │   ║
                                               ║ │ - Dashboard      │   ║
                                               ║ │   atualiza       │   ║
                                               ║ └────────┬─────────┘   ║
                                               ║          │             ║
                                               ║          ▼             ║
                                               ║  INCIDENTE CRIADO ✅   ║
                                               └════════════════════════┘
                                                        │
                                                        ▼
                                               ╔════════════════════════╗
                                               ║   VOSSO DASHBOARD      ║
                                               ║                        ║
                                               ║ [🔴 CRÍTICO]           ║
                                               ║ Disk Full - STORAGE    ║
                                               ║ Priority: HIGH         ║
                                               ║ Assigned to: SysAdmin  ║
                                               ║ Status: Aberto         ║
                                               ║ Time: 12:30            ║
                                               ║                        ║
                                               ║ [Update] [Close]       ║
                                               └════════════════════════┘
```

---

## 2️⃣ FLUXO TEMPORAL DE RESOLUÇÃO

```
Timeline: Disk Full Incident

12:00:00 ┌─ Nagios check_disk executado
         │
12:00:02 ├─ Disk usage: 85% (> threshold 80%)
         │
12:00:03 ├─ Status: WARNING → CRITICAL
         │
12:00:05 ├─ Notification Handler ativado
         │
12:00:06 ├─ POST /api/nagios/webhook com payload
         │
12:00:07 ├─ Vosso sistema recebe
         │
12:00:08 ├─ Parse e valida dados
         │
12:00:09 ├─ Insert Incident #4521
         │  └─ Title: "Disk Full - STORAGE"
         │  └─ Priority: "Crítica"
         │  └─ Status: "Aberto"
         │
12:00:10 ├─ Assign to SysAdmin (Priority=Crítica)
         │
12:00:11 ├─ Dashboard atualiza (WebSocket/polling)
         │
12:00:12 ├─ SysAdmin recebe notificação
         │  │
         │  └─► "NOVO: Disk Full - STORAGE (Crítica)"
         │
12:00:15 ├─ SysAdmin acede ao dashboard
         │  │
         │  └─► Vê incidente com detalhes do Nagios
         │
12:05:30 ├─ SysAdmin deleta ficheiros antigos
         │  │
         │  └─► Disk: 85% → 45%
         │
12:06:00 ├─ Nagios check_disk próximo
         │
12:06:02 ├─ Disk usage: 45% (< threshold 80%)
         │
12:06:03 ├─ Status: CRITICAL → OK
         │
12:06:05 ├─ Notification com status=OK enviado
         │
12:06:06 ├─ Vosso sistema recebe OK
         │
12:06:07 ├─ UPDATE Incident #4521 SET status='Resolvido'
         │
12:06:08 ├─ Set resolvedAt = 12:06:08
         │
12:06:09 ├─ Calculate MTTR = 6 minutos 8 segundos
         │
12:06:10 ├─ Dashboard atualiza
         │  │
         │  └─► Incidente muda de 🔴 para ✅
         │
12:06:11 └─ SysAdmin recebe "Incidente #4521 Resolvido"
           MTTR: 6 min 8 sec


═════════════════════════════════════════════════════════════════════════

MÉTRICA FINAL:
├─ TTD (Time To Detect): 3 segundos (Nagios)
├─ TTN (Time To Notify): 3 segundos (Webhook)
├─ TTA (Time To Act): 5 minutos 30 segundos (SysAdmin)
├─ TTR (Time To Resolve): 6 minutos 8 segundos
└─ SLA: 6:08 / 1:00 (service objective) = OK ✅
```

---

## 3️⃣ ESTRUTURA DE DADOS

```
NAGIOS ALERT (entrada)
│
├─ host: "STORAGE-SERVER"
├─ service: "Root Partition"
├─ status: "CRITICAL"
├─ output: "Disk: 85% usage"
└─ timestamp: "2025-12-02T12:00:03Z"
     │
     │ [Parser]
     ▼
INCIDENTE (saída no banco)
│
├─ id: 4521
├─ title: "Root Partition - STORAGE-SERVER"
├─ description: "
│   Nagios Alert:
│   Host: STORAGE-SERVER
│   Service: Root Partition
│   Status: CRITICAL
│   Output: Disk: 85% usage
│   Timestamp: 2025-12-02T12:00:03Z
│   "
├─ category: "Infraestrutura"
├─ priority: "Crítica" ← (mapeado de status)
├─ affectedUsers: 500
├─ status: "Aberto"
├─ assignedTo: 3 ← (SysAdmin ID)
├─ createdBy: 1 ← (System user)
├─ createdAt: "2025-12-02T12:00:08Z"
├─ resolvedAt: "2025-12-02T12:06:08Z"
└─ mttr: 6.133 ← (em horas decimais)
```

---

## 4️⃣ DECISÃO DE ASSIGN

```
Incident Priority Determination:

Nagios Status
    │
    ├─ CRITICAL
    │   ├─ Map to: "Crítica"
    │   ├─ Priority: Máxima
    │   ├─ Assign to: SysAdmin
    │   └─ Notify: Email + SMS + Dashboard
    │
    ├─ WARNING
    │   ├─ Map to: "Alta"
    │   ├─ Priority: Alta
    │   ├─ Assign to: Técnico
    │   └─ Notify: Email + Dashboard
    │
    ├─ UNKNOWN
    │   ├─ Map to: "Média"
    │   ├─ Priority: Média
    │   ├─ Assign to: Queue (sem atribuição)
    │   └─ Notify: Dashboard apenas
    │
    └─ OK
        ├─ Action: Procurar incidente aberto
        ├─ If Found: Mark as Resolved
        ├─ Calculate: MTTR
        └─ Notify: Dashboard atualiza
```

---

## 5️⃣ EXEMPLO DE PAYLOAD JSON

### Entrada (de Nagios):
```json
{
  "host": "APP-SERVER-01",
  "service": "MySQL Connection Pool",
  "status": "CRITICAL",
  "output": "Cannot connect to MySQL: Connection refused",
  "timestamp": "2025-12-02T15:30:45.123Z"
}
```

### Saída (no banco de dados):
```json
{
  "id": 4523,
  "title": "MySQL Connection Pool - APP-SERVER-01",
  "description": "Nagios Alert:\nHost: APP-SERVER-01\n...",
  "category": "Infraestrutura",
  "priority": "Crítica",
  "affectedUsers": 350,
  "status": "Aberto",
  "assignedTo": 3,
  "createdAt": "2025-12-02T15:30:46.000Z",
  "resolvedAt": null,
  "createdBy": 1
}
```

---

## 6️⃣ DASHBOARD IMPACT

```
╔══════════════════════════════════════════════════════════════════╗
║            DASHBOARD - Gestor de Incidentes                     ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  ALERTAS NAGIOS (Real-time)                                    ║
║  ┌────────────────────────────────────────────────────────────┐ ║
║  │ 🔴 CRÍTICO - MySQL Pool - APP-01          Há 5 min      │ ║
║  │ 🟠 ALTO    - Disk Space - STORAGE         Há 12 min     │ ║
║  │ 🟡 MÉDIO   - CPU Load - WEB-SERVER        Há 1 hora     │ ║
║  │ ✅ OK      - Network Check - ROUTER       Resolvido     │ ║
║  └────────────────────────────────────────────────────────────┘ ║
║                                                                  ║
║  ESTATÍSTICAS                                                   ║
║  ┌────────────────────────────────────────────────────────────┐ ║
║  │ Total: 4        Críticos: 1      Altos: 1      Médios: 1 │ ║
║  │ Nagios Auto: 3  Manual: 1        Resolvidos: 1            │ ║
║  │ MTTR Médio: 4h 23min             SLA: 94%                 │ ║
║  └────────────────────────────────────────────────────────────┘ ║
║                                                                  ║
║  DETALHES DO CRÍTICO                                           ║
║  ┌────────────────────────────────────────────────────────────┐ ║
║  │ ID: #4523                                                 │ ║
║  │ Título: MySQL Connection Pool - APP-SERVER-01            │ ║
║  │ Descrição: Cannot connect to MySQL (Nagios)              │ ║
║  │ Prioridade: CRÍTICA                                       │ ║
║  │ Atribuído: Carlos Silva (SysAdmin)                        │ ║
║  │ Status: Aberto há 5 minutos                               │ ║
║  │ Fonte: Nagios Webhook ← [Origem clara]                   │ ║
║  └────────────────────────────────────────────────────────────┘ ║
║                                                                  ║
║  [Ver Histórico] [Escalar] [Resolver] [Comentário] [Histórico] ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 7️⃣ COMPARAÇÃO: COM vs SEM NAGIOS

```
╔════════════════════════════════════════════════════════════════════╗
║                  COM NAGIOS              │  SEM NAGIOS            ║
╠════════════════════════════════════════════════════════════════════╣
║ Detecção de Problema                                              ║
║ ├─ COM:     Automática (segundos)        │ Manual (minutos/horas)║
║ ├─ Ticket:  Criado instantaneamente       │ Técnico cria depois   ║
║ └─ SLA:     Calculado real                │ Estimado              ║
║                                                                    ║
║ Escalação                                                         ║
║ ├─ COM:     Automática (if critical)      │ Manual/ad-hoc         ║
║ ├─ SysAdmin:Notificado imediatamente      │ Talvez não saiba      ║
║ └─ Response:Minutos                       │ Horas                 ║
║                                                                    ║
║ Correlação                                                        ║
║ ├─ COM:     10 alerts CPU+Memory+Disk =  │ 10 tickets isolados   ║
║ │           1 "Server Down" principal    │ (ruído elevado)       ║
║ ├─ Análise: Fácil (agregado)              │ Difícil (disperso)    ║
║ └─ Decisão: Rápida e informada            │ Lenta e incerta       ║
║                                                                    ║
║ Histórico                                                         ║
║ ├─ COM:     Completo (Nagios + sistema)  │ Apenas sistema        ║
║ ├─ Audit:   Rastreável                    │ Incompleto            ║
║ └─ Replay:  Reconstruir timeline          │ Impossível            ║
║                                                                    ║
║ Profissionalismo                                                  ║
║ ├─ COM:     Production-ready              │ Básico                ║
║ ├─ 24/7:    Eficiente                     │ Ad-hoc                ║
║ └─ DevOps:  Best practice                 │ Manual ops            ║
╚════════════════════════════════════════════════════════════════════╝
```

---

## 8️⃣ COMPONENTES DO SISTEMA

```
┌─────────────────────────────────────────────────────────────────┐
│                      VOSSO SISTEMA                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Frontend (HTML/CSS/JS)                                      │
│     ├─ Dashboard (3 roles)                                     │
│     ├─ Tabela de incidentes                                    │
│     ├─ Filtros & Busca                                         │
│     └─ Sistema de comentários                                  │
│                                                                 │
│  2. Backend (Node.js)                                           │
│     ├─ /api/incidents          (CRUD)                          │
│     ├─ /api/comments           (Get/Post/Delete)               │
│     ├─ /api/metrics            (SLA/MTTR/Stats)                │
│     ├─ /api/auth               (Login/Auth)                    │
│     └─ /api/nagios/webhook ← [NOVO!] ✨                       │
│                                                                 │
│  3. Database (SQL Server)                                       │
│     ├─ Users (roles)                                           │
│     ├─ Incidents (tickets)                                     │
│     ├─ Comments (discussions)                                  │
│     └─ [Queries para MTTR/SLA]                                │
│                                                                 │
│  4. Integração Nagios                                           │
│     ├─ Webhook receiver                                        │
│     ├─ Alert parser                                            │
│     ├─ Auto-create incidents                                   │
│     ├─ Auto-assign (SysAdmin)                                  │
│     └─ Auto-close (when OK)                                    │
│                                                                 │
│  5. Monitorização                                               │
│     ├─ Nagios Core (infraestrutura)                            │
│     ├─ 20+ hosts/services                                      │
│     ├─ Alertas em tempo real                                   │
│     └─ +108 testes (todos passing)                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

Este diagrama visual mostra:
✅ Como Nagios se integra
✅ Fluxo completo de um alerta
✅ Impacto no dashboard
✅ Comparação com/sem Nagios
✅ Arquitetura do sistema completo
