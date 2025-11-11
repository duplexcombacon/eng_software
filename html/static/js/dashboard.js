/**
 * DASHBOARD.JS - Lógica dos Dashboards
 */

let incidents = [];
let filteredIncidents = [];
let currentUser = null;

// ============================================
// Inicialização
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    currentUser = requireAuth();
    if (!currentUser) return;

    // Carregar dados
    loadData();
    
    // Preencher info do utilizador
    updateUserInfo();
});

// ============================================
// Carregamento de Dados
// ============================================

async function loadData() {
    // Carregar incidentes de teste
    const data = await loadIncidents();
    incidents = data.incidents;
    filteredIncidents = [...incidents];

    // Renderizar dashboards de acordo com o rol
    if (currentUser.role === 'gestor') {
        renderGestorDashboard();
    } else if (currentUser.role === 'tecnico') {
        renderTecnicoDashboard();
    } else if (currentUser.role === 'sysadmin') {
        renderSysAdminDashboard();
    }

    // Renderizar tabela comum
    renderIncidentsTable();
}

// ============================================
// Atualizar Informação do Utilizador
// ============================================

function updateUserInfo() {
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');

    if (userAvatar) userAvatar.textContent = currentUser.name.charAt(0);
    if (userName) userName.textContent = currentUser.name;
    if (userRole) userRole.textContent = currentUser.title;
}

// ============================================
// Dashboard do Gestor
// ============================================

function renderGestorDashboard() {
    // Calcular métricas
    const metrics = calculateMetrics();

    // Preencher valores
    document.getElementById('mttrValue').textContent = metrics.mttr.toFixed(1);
    document.getElementById('totalIncidentsValue').textContent = incidents.length;
    document.getElementById('criticalValue').textContent = metrics.critical;
    document.getElementById('openValue').textContent = metrics.open;
    document.getElementById('resolvedValue').textContent = metrics.resolved;
    document.getElementById('impactedValue').textContent = metrics.totalImpacted;
}

// ============================================
// Dashboard da Técnica
// ============================================

function renderTecnicoDashboard() {
    // Filtrar apenas incidentes atribuídos a Marta
    const myIncidents = incidents.filter(inc => inc.assignedTo === currentUser.name);

    // Calcular métricas
    const myOpen = myIncidents.filter(inc => inc.status === 'Aberto').length;
    const myProgress = myIncidents.filter(inc => inc.status === 'Em Progresso').length;
    const myResolved = myIncidents.filter(inc => inc.status === 'Resolvido').length;
    const myEscalated = myIncidents.filter(inc => inc.status === 'Escalado').length;

    // Preencher valores
    document.getElementById('myOpenValue').textContent = myOpen;
    document.getElementById('myProgressValue').textContent = myProgress;
    document.getElementById('myResolvedValue').textContent = myResolved;
    document.getElementById('myEscalatedValue').textContent = myEscalated;

    // Filtrar para tabela
    filteredIncidents = myIncidents;
}

// ============================================
// Dashboard do SysAdmin
// ============================================

function renderSysAdminDashboard() {
    // Filtrar apenas incidentes escalados ou críticos
    const escalatedIncidents = incidents.filter(inc => 
        inc.status === 'Escalado' || inc.priority === 'Crítica'
    );

    // Calcular métricas
    const critical = escalatedIncidents.filter(inc => inc.priority === 'Crítica').length;
    const high = escalatedIncidents.filter(inc => inc.priority === 'Alta').length;
    const resolved = incidents.filter(inc => inc.status === 'Resolvido').length;
    const totalImpacted = incidents.reduce((sum, inc) => sum + inc.impact, 0);

    // Preencher valores
    document.getElementById('criticalAlertsValue').textContent = critical;
    document.getElementById('highAlertsValue').textContent = high;
    document.getElementById('resolvedValue').textContent = resolved;
    document.getElementById('impactedValue').textContent = totalImpacted;

    // Mostrar alerta crítico se houver
    const criticalIncident = incidents.find(inc => inc.priority === 'Crítica' && inc.status !== 'Resolvido');
    if (criticalIncident) {
        const alertDiv = document.getElementById('criticalAlert');
        if (alertDiv) {
            alertDiv.style.display = 'block';
            document.getElementById('criticalAlertMsg').textContent = 
                `${criticalIncident.title} - ${criticalIncident.id}`;
        }
    }

    // Filtrar para tabela
    filteredIncidents = escalatedIncidents;
}

// ============================================
// Cálculo de Métricas
// ============================================

function calculateMetrics() {
    const critical = incidents.filter(inc => inc.priority === 'Crítica').length;
    const open = incidents.filter(inc => inc.status === 'Aberto').length;
    const resolved = incidents.filter(inc => inc.status === 'Resolvido').length;
    const totalImpacted = incidents.reduce((sum, inc) => sum + inc.impact, 0);

    // Calcular MTTR (tempo médio de resolução)
    const resolvedIncidents = incidents.filter(inc => inc.status === 'Resolvido' && inc.resolvedAt);
    let mttr = 0;
    if (resolvedIncidents.length > 0) {
        const totalHours = resolvedIncidents.reduce((sum, inc) => {
            const created = new Date(inc.createdAt);
            const resolved = new Date(inc.resolvedAt);
            const hours = (resolved - created) / (1000 * 60 * 60);
            return sum + hours;
        }, 0);
        mttr = totalHours / resolvedIncidents.length;
    }

    return {
        mttr,
        critical,
        open,
        resolved,
        totalImpacted
    };
}

// ============================================
// Renderizar Tabela de Incidentes
// ============================================

function renderIncidentsTable() {
    const tbody = document.getElementById('incidentsTableBody');
    const emptyState = document.getElementById('emptyState');

    if (!tbody) return;

    tbody.innerHTML = '';

    if (filteredIncidents.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    filteredIncidents.forEach(incident => {
        const row = document.createElement('tr');
        
        const priorityClass = incident.priority.toLowerCase().replace(' ', '-');
        const statusClass = incident.status.toLowerCase().replace(' ', '-');

        row.innerHTML = `
            <td><strong>${incident.id}</strong></td>
            <td>${incident.title}</td>
            <td>${incident.category}</td>
            <td><span class="priority-badge ${priorityClass}">${incident.priority}</span></td>
            <td><span class="status-badge ${statusClass}">${incident.status}</span></td>
            <td>${incident.impact}</td>
            <td>${incident.assignedTo}</td>
            <td>
                <a href="#" class="btn-action" onclick="viewIncident('${incident.id}', event)" style="color: #667eea; text-decoration: none; font-weight: 600;">
                    Ver
                </a>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// ============================================
// Filtros
// ============================================

function applyFilters() {
    filteredIncidents = [...incidents];

    // Filtros do Gestor
    const filterPeriod = document.getElementById('filterPeriod');
    const filterCategory = document.getElementById('filterCategory');
    const filterPriority = document.getElementById('filterPriority');

    // Filtros do Técnico
    const filterStatus = document.getElementById('filterStatus');

    // Filtros do SysAdmin
    const filterSeverity = document.getElementById('filterSeverity');
    const filterType = document.getElementById('filterType');

    // Aplicar filtro de período (Gestor)
    if (filterPeriod && filterPeriod.value) {
        const period = filterPeriod.value;
        const now = new Date();
        let startDate = new Date();

        switch(period) {
            case 'week':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case 'quarter':
                startDate.setMonth(now.getMonth() - 3);
                break;
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
        }

        filteredIncidents = filteredIncidents.filter(inc => 
            new Date(inc.createdAt) >= startDate
        );
    }

    // Aplicar filtro de categoria
    if (filterCategory && filterCategory.value) {
        filteredIncidents = filteredIncidents.filter(inc => 
            inc.category === filterCategory.value
        );
    }

    // Aplicar filtro de prioridade
    if (filterPriority && filterPriority.value) {
        filteredIncidents = filteredIncidents.filter(inc => 
            inc.priority === filterPriority.value
        );
    }

    // Aplicar filtro de status
    if (filterStatus && filterStatus.value) {
        filteredIncidents = filteredIncidents.filter(inc => 
            inc.status === filterStatus.value
        );
    }

    // Aplicar filtro de severidade (SysAdmin)
    if (filterSeverity && filterSeverity.value) {
        filteredIncidents = filteredIncidents.filter(inc => 
            inc.priority === filterSeverity.value
        );
    }

    // Aplicar filtro de tipo (SysAdmin)
    if (filterType && filterType.value) {
        filteredIncidents = filteredIncidents.filter(inc => 
            inc.category === filterType.value
        );
    }

    renderIncidentsTable();
}

function resetFilters() {
    // Limpar todos os filtros
    const filterPeriod = document.getElementById('filterPeriod');
    const filterCategory = document.getElementById('filterCategory');
    const filterPriority = document.getElementById('filterPriority');
    const filterStatus = document.getElementById('filterStatus');
    const filterSeverity = document.getElementById('filterSeverity');
    const filterType = document.getElementById('filterType');

    if (filterPeriod) filterPeriod.value = '';
    if (filterCategory) filterCategory.value = '';
    if (filterPriority) filterPriority.value = '';
    if (filterStatus) filterStatus.value = '';
    if (filterSeverity) filterSeverity.value = '';
    if (filterType) filterType.value = '';

    // Resetar incidentes filtrados
    if (currentUser.role === 'tecnico') {
        filteredIncidents = incidents.filter(inc => inc.assignedTo === currentUser.name);
    } else if (currentUser.role === 'sysadmin') {
        filteredIncidents = incidents.filter(inc => 
            inc.status === 'Escalado' || inc.priority === 'Crítica'
        );
    } else {
        filteredIncidents = [...incidents];
    }

    renderIncidentsTable();
}

// ============================================
// Ações
// ============================================

function viewIncident(id, event) {
    event.preventDefault();
    const incident = incidents.find(inc => inc.id === id);
    
    if (incident) {
        // Mostrar notificação
        showNotification(`A visualizar: ${incident.title}`, 'info');
        
        // Aqui poderia redirecionar para página de detalhe
        console.log('Incidente:', incident);
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto-remover após 4 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}
