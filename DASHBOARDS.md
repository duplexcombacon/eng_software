# Documentação dos Dashboards

## Visão Geral

O sistema possui 3 dashboards diferentes, cada um otimizado para as necessidades específicas de cada persona: Gestor, Técnico e SysAdmin.

## Dashboard 1: Gestor de IT (João Almeida)

Arquivo: html/templates/dashboard-gestor.html

Objetivo: Monitorizar a estabilidade dos sistemas e a eficiência da equipa de suporte, garantindo que os incidentes críticos são resolvidos rapidamente.

Features Principais:
Métricas: Tempo Médio de Resolução (MTTR), Total de incidentes, Incidentes críticos abertos, Incidentes por status, Taxa de resolução, Utilizadores afetados.

Gráficos: Distribuição por prioridade, Distribuição por categoria, Distribuição por status, Evolução do MTTR.

Filtros: Período (Semana, Mês, Trimestre, Ano), Categoria do incidente, Prioridade.

Tabela: Lista dos incidentes mais críticos com ID, Título, Categoria, Prioridade, Status, Afetados, Atribuído a.

Ações: Visualizar detalhes de incidente, Aplicar ou resetar filtros, Exportar relatórios (futuro).

## Dashboard 2: Técnica de Suporte (Marta Ferreira)

Arquivo: html/templates/dashboard-tecnico.html

Objetivo: Registar, categorizar e resolver incidentes de Nível 1 de forma eficiente, garantindo que os utilizadores voltam a trabalhar rapidamente e que os incidentes complexos são escalados.

Features Principais:
Métricas: Meus incidentes abertos, Incidentes em progresso, Resolvidos hoje (com meta), Escalados para Nível 2.

Botão Novo Incidente: Acesso rápido para registar novo incidente.

Filtros: Status (Aberto, Em Progresso, Escalado, Resolvido), Categoria, Prioridade.

Tabela: Apenas incidentes atribuídos a esta técnica com ID, Título, Categoria, Prioridade, Status, Afetados, Criado em.

Gráfico: Tempo Médio de Resolução (Diário).

Ações: Criar novo incidente, Filtrar meus incidentes, Visualizar detalhes, Atualizar status.

## Dashboard 3: Administrador de Sistemas (Carlos Pinto)

Arquivo: html/templates/dashboard-sysadmin.html

Objetivo: Receber alertas de infraestrutura de forma centralizada e resolver incidentes complexos que o Nível 1 não consegue.

Features Principais:
Banner de Alerta: Alerta crítico destacado se houver, mostrando ID e título do incidente crítico.

Métricas: Alertas críticos (requerem ação), Alertas altos (sob monitorização), Sistemas online vs Total, Incidentes resolvidos hoje, Utilizadores afetados, Uptime atual.

Filtros: Severidade (Crítica, Alta, Média), Tipo (BD, Rede, Aplicações, Hardware), Status (Aberto, Em Progresso, Resolvido).

Gráficos: CPU e Memória (BD Principal), Distribuição de alertas, Tempo de resposta (APIs), Uptime dos servidores.

Tabelas: Incidentes escalados com ID, Título, Tipo, Severidade, Status, Afetados, De (quem escalou); Status da Infraestrutura com Sistema, Status, CPU, Memória, Latência, Última verificação para 6 servidores monitorados.

## Sistema de Autenticação

Credenciais de Teste:

Gestor: joao.almeida@empresa.pt, senha: senha123, role: gestor, dashboard: dashboard-gestor.html

Técnico: marta.ferreira@empresa.pt, senha: senha123, role: tecnico, dashboard: dashboard-tecnico.html

SysAdmin: carlos.pinto@empresa.pt, senha: senha123, role: sysadmin, dashboard: dashboard-sysadmin.html

Fluxo de Login: Utilizador acessa index.html, preenche email e senha, sistema valida credenciais, guarda dados em localStorage, redireciona para dashboard correto baseado no role.

## Estrutura de Ficheiros

Pasta html contém index.html (Login), pasta static com css e js (main.js e dashboard.js), pasta templates com dashboard-gestor.html, dashboard-tecnico.html, dashboard-sysadmin.html e ficheiros de incidentes.

## Cores Utilizadas

Primária: #667eea (Roxo). Secundária: #764ba2 (Roxo escuro). Sucesso: #27ae60 (Verde). Perigo: #e74c3c (Vermelho). Aviso: #f39c12 (Laranja). Info: #3498db (Azul).

## Classes CSS Principais

metric-card: Cards de métricas
status-badge: Badges de status
priority-badge: Badges de prioridade
table-container: Tabelas
filter-section: Filtros
chart-container: Gráficos

## Próximos Passos

Curto Prazo: Criar página de novo incidente, criar página de detalhe, criar página de lista com paginação, implementar Chart.js para gráficos, implementar notificações push.

Médio Prazo: Criar página de relatórios, implementar exportação de dados (CSV/PDF), adicionar comentários em incidentes, criar sistema de atribuição dinâmica, adicionar histórico de mudanças.

Longo Prazo: Migrar para Firebase Firestore, implementar autenticação real (Google Auth/SSO), adicionar notificações em tempo real (WebSocket), criar app mobile (React Native), implementar analytics avançado.

## Funcionalidades JavaScript

main.js fornece: getCurrentUser(), logout(), requireAuth(), hasRole(), loadUsers(), loadIncidents(), formatDate(), getPriorityColor(), getStatusColor(), getTimeAgo()

dashboard.js fornece: loadData(), renderGestorDashboard(), renderTecnicoDashboard(), renderSysAdminDashboard(), calculateMetrics(), renderIncidentsTable(), applyFilters(), resetFilters(), viewIncident(), showNotification()
