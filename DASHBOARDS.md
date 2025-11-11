# 🚨 Gestor de Incidentes - Documentação dos Dashboards

## 📋 Visão Geral

O sistema possui **3 dashboards diferentes**, cada um otimizado para as necessidades específicas de cada persona:

---

## 🎯 Dashboard 1: Gestor de IT (João Almeida)

**Arquivo:** `html/templates/dashboard-gestor.html`

### Objetivo
Monitorizar a estabilidade dos sistemas e a eficiência da equipa de suporte, garantindo que os incidentes críticos são resolvidos rapidamente.

### Features
✅ **Métricas Principais:**
- ⏱️ Tempo Médio de Resolução (MTTR)
- 📊 Total de incidentes
- 🔴 Incidentes críticos abertos
- 📋 Incidentes por status
- ✅ Taxa de resolução
- 👥 Utilizadores afetados

✅ **Gráficos:**
- Distribuição por prioridade (Pie/Bar)
- Distribuição por categoria (Pie/Bar)
- Distribuição por status (Pie/Bar)
- Evolução do MTTR (Line)

✅ **Filtros:**
- Período (Semana, Mês, Trimestre, Ano)
- Categoria do incidente
- Prioridade

✅ **Tabela:**
- Lista dos incidentes mais críticos
- Informações: ID, Título, Categoria, Prioridade, Status, Afetados, Atribuído a

### Ações
- Visualizar detalhes de cada incidente
- Aplicar/Resetar filtros
- Exportar relatórios (futuro)

---

## 💼 Dashboard 2: Técnica de Suporte (Marta Ferreira)

**Arquivo:** `html/templates/dashboard-tecnico.html`

### Objetivo
Registar, categorizar e resolver incidentes de Nível 1 de forma eficiente, garantindo que os utilizadores voltam a trabalhar o mais rápido possível e que os incidentes complexos são escalados.

### Features
✅ **Métricas Personalizadas:**
- 📋 Meus incidentes abertos
- ⏳ Incidentes em progresso
- ✅ Resolvidos hoje (com meta)
- 🔴 Escalados para Nível 2

✅ **Botão Destacado:**
- ➕ **Novo Incidente** (acesso rápido para registar)

✅ **Filtros:**
- Status (Aberto, Em Progresso, Escalado, Resolvido)
- Categoria
- Prioridade

✅ **Tabela:**
- Apenas incidentes atribuídos a Marta
- Informações: ID, Título, Categoria, Prioridade, Status, Afetados, Criado em

✅ **Gráfico:**
- Tempo Médio de Resolução (Diário)

✅ **Empty State:**
- Link para novo incidente quando sem dados

### Ações
- ➕ Criar novo incidente
- Filtrar meus incidentes
- Visualizar detalhes
- Atualizar status

---

## 🖥️ Dashboard 3: Administrador de Sistemas (Carlos Pinto)

**Arquivo:** `html/templates/dashboard-sysadmin.html`

### Objetivo
Receber alertas de infraestrutura de forma centralizada e resolver incidentes complexos que a Nível 1 (Marta) não consegue.

### Features
✅ **Banner de Alerta:**
- 🚨 Alerta crítico destacado se houver
- Mostra ID e título do incidente crítico

✅ **Métricas Críticas:**
- 🔴 Alertas críticos (requerem ação)
- ⚠️ Alertas altos (sob monitorização)
- 📶 Sistemas online / Total
- ✅ Incidentes resolvidos (hoje)
- 👥 Utilizadores afetados
- 📊 Uptime atual

✅ **Filtros:**
- Severidade (Crítica, Alta, Média)
- Tipo (BD, Rede, Aplicações, Hardware)
- Status (Aberto, Em Progresso, Resolvido)

✅ **Gráficos:**
- CPU & Memória (BD Principal)
- Distribuição de alertas
- Tempo de resposta (APIs)
- Uptime dos servidores

✅ **Tabelas:**
- **Tabela 1:** Incidentes escalados de Nível 2
  - ID, Título, Tipo, Severidade, Status, Afetados, De (quem escalou)
  
- **Tabela 2:** Status da Infraestrutura
  - Sistema, Status (com badge), CPU, Memória, Latência, Última verificação
  - 6 servidores/sistemas monitorados

### Ações
- Filtrar incidentes por tipo/severidade
- Monitorizar recursos dos servidores
- Visualizar detalhes de incidentes
- Redirecionar para alertas/logs

---

## 🔐 Sistema de Autenticação

### Credenciais de Teste

```
Gestor:
  Email: joao.almeida@empresa.pt
  Senha: senha123
  Role: gestor
  → Dashboard: dashboard-gestor.html

Técnico:
  Email: marta.ferreira@empresa.pt
  Senha: senha123
  Role: tecnico
  → Dashboard: dashboard-tecnico.html

SysAdmin:
  Email: carlos.pinto@empresa.pt
  Senha: senha123
  Role: sysadmin
  → Dashboard: dashboard-sysadmin.html
```

### Fluxo de Login
1. Utilizador acessa `index.html`
2. Preenche email e senha
3. Sistema valida credenciais
4. Guarda dados no `localStorage`
5. **Redireciona para dashboard correto baseado no `role`**

---

## 📁 Estrutura de Ficheiros

```
html/
├── index.html                              (Login)
├── static/
│   ├── css/
│   │   ├── style.css                      (Estilos globais)
│   │   ├── index.css                      (Estilos do login)
│   │   └── dashboard.css                  (Estilos dos dashboards)
│   └── js/
│       ├── main.js                        (Funções globais + auth)
│       └── dashboard.js                   (Lógica dos dashboards)
└── templates/
    ├── dashboard-gestor.html              (Dashboard do Gestor)
    ├── dashboard-tecnico.html             (Dashboard da Técnica)
    ├── dashboard-sysadmin.html            (Dashboard do SysAdmin)
    └── incident-*.html                    (Páginas de incidentes - por criar)
```

---

## 🔄 Fluxo de Dados

### 1. Carregamento Inicial
```
DOMContentLoaded
  ↓
requireAuth() - Verifica localStorage
  ↓
loadData() - Carrega incidentes de data/incidents.json
  ↓
render[Role]Dashboard() - Renderiza dashboard específico
  ↓
updateUserInfo() - Mostra nome/role do utilizador
```

### 2. Filtros
```
applyFilters()
  ↓
Filtra incidentes baseado em critérios
  ↓
renderIncidentsTable() - Atualiza tabela
```

### 3. Ações
```
viewIncident(id)
  ↓
showNotification() - Mostra mensagem de feedback
  ↓
[Futuro] Redireciona para página de detalhe
```

---

## 🎨 Componentes CSS Principais

### Cores Utilizadas
- **Primária:** `#667eea` (Roxo)
- **Secundária:** `#764ba2` (Roxo escuro)
- **Sucesso:** `#27ae60` (Verde)
- **Perigo:** `#e74c3c` (Vermelho)
- **Aviso:** `#f39c12` (Laranja)
- **Info:** `#3498db` (Azul)

### Classes Principais
- `.metric-card` - Cards de métricas
- `.status-badge` - Badges de status
- `.priority-badge` - Badges de prioridade
- `.table-container` - Tabelas
- `.filter-section` - Filtros
- `.chart-container` - Gráficos (placeholders)

---

## 🚀 Próximos Passos

### Curto Prazo
- [ ] Criar página de novo incidente (`incident-new.html`)
- [ ] Criar página de detalhe de incidente
- [ ] Criar página de lista de incidentes (com paginação)
- [ ] Implementar integração com Chart.js para gráficos
- [ ] Implementar notificações push (Marta/Carlos)

### Médio Prazo
- [ ] Criar página de relatórios (Gestor)
- [ ] Implementar exportação de dados (CSV/PDF)
- [ ] Adicionar comentários/notas em incidentes
- [ ] Criar sistema de atribuição dinâmica
- [ ] Adicionar histórico de mudanças

### Longo Prazo
- [ ] Migrar para Firebase Firestore (base dados permanente)
- [ ] Implementar autenticação real (Google Auth / SSO)
- [ ] Adicionar notificações em tempo real (WebSocket)
- [ ] Criar app mobile (React Native)
- [ ] Implementar analytics avançado

---

## 📊 Dados de Teste

### Incidentes Simulados
O ficheiro `data/incidents.json` contém 6 incidentes de teste:

1. **INC-001** - Email não funciona (Aberto, Marta)
2. **INC-002** - Impressora Offline (Em Progresso, Marta)
3. **INC-003** - CRM Lento (Escalado, Carlos) ⭐ CRÍTICO
4. **INC-004** - Servidor BD CPU 100% (Escalado, Carlos) ⭐ CRÍTICO
5. **INC-005** - VPN não funciona (Aberto, Marta)
6. **INC-006** - Sincronização lenta (Resolvido, Marta)

---

## 🔍 Funcionalidades JavaScript

### main.js (Funções Globais)
```javascript
getCurrentUser()                    // Retorna utilizador autenticado
logout()                            // Faz logout
requireAuth()                       // Força autenticação
hasRole(role)                       // Verifica rol
loadUsers()                         // Carrega utilizadores
loadIncidents()                     // Carrega incidentes
formatDate(dateStr)                 // Formata data
getPriorityColor(priority)          // Retorna cor da prioridade
getStatusColor(status)              // Retorna cor do status
getTimeAgo(dateStr)                 // Calcula "X dias atrás"
```

### dashboard.js (Lógica dos Dashboards)
```javascript
loadData()                          // Carrega dados
renderGestorDashboard()             // Renderiza dashboard Gestor
renderTecnicoDashboard()            // Renderiza dashboard Técnico
renderSysAdminDashboard()           // Renderiza dashboard SysAdmin
calculateMetrics()                  // Calcula métricas
renderIncidentsTable()              // Renderiza tabela
applyFilters()                      // Aplica filtros
resetFilters()                      // Limpa filtros
viewIncident(id)                    // Visualiza incidente
showNotification(msg, type)         // Mostra notificação
```

---

## 🐛 Troubleshooting

### Problema: Dashboard branco depois de login
**Solução:** Verificar console (F12) para erros, validar localStorage com `getCurrentUser()`

### Problema: Filtros não funcionam
**Solução:** Verificar que `filterPeriod`, `filterCategory`, etc. estão sendo criados corretamente no HTML

### Problema: Dados não aparecem
**Solução:** Verificar que `data/incidents.json` existe e tem formato correto

### Problema: Logout não funciona
**Solução:** Verificar que `logout()` é chamada corretamente e localStorage é limpo

---

## 📞 Suporte

Para questões ou sugestões, contactar a equipa de desenvolvimento.

**Nota:** Esta documentação será atualizada conforme novas features sejam adicionadas.
