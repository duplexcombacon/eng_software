/**
 * DASHBOARD.JS - Lógica dos Dashboards
 */

let incidents = [];
let filteredIncidents = [];
let currentUser = null;

// ============================================
// Inicialização
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticação
    currentUser = requireAuth();
    if (!currentUser) return;

    // Preencher info do utilizador (nome, avatar, título)
    updateUserInfo();

    // Carregar incidentes da API
    try {
        await loadData();
    } catch (err) {
        console.error("Erro ao carregar dados do dashboard:", err);
        showNotification("Erro ao carregar incidentes do servidor.", "error");
    }
});

// ============================================
// Carregamento de Dados
// ============================================

async function loadData() {
    const data = await loadIncidents(); // vem de main.js e chama a API real
    incidents = Array.isArray(data.incidents) ? data.incidents : [];
    filteredIncidents = [...incidents];

    // Renderizar dashboards conforme o role
    if (currentUser.role === 'gestor') {
        renderGestorDashboard();
    } else if (currentUser.role === 'tecnico') {
        renderTecnicoDashboard();
    } else if (currentUser.role === 'sysadmin') {
        renderSysAdminDashboard();
    }

    // Renderizar tabela
    renderIncidentsTable();
}

// ============================================
// Atualizar Informação do Utilizador
// ============================================

function updateUserInfo() {
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');

    if (!currentUser) return;

    if (userAvatar) userAvatar.textContent = currentUser.name?.charAt(0) || 'U';
    if (userName) userName.textContent = currentUser.name || 'Utilizador';
    if (userRole) userRole.textContent = currentUser.title || 'Perfil';
}

// ============================================
// Dashboard do Gestor
// ============================================

function renderGestorDashboard() {
    const metrics = calculateMetrics();

    const mttrEl = document.getElementById('mttrValue');
    const totalEl = document.getElementById('totalIncidentsValue');
    const criticalEl = document.getElementById('criticalValue');
    const openEl = document.getElementById('openValue');
    const resolvedEl = document.getElementById('resolvedValue');
    const impactedEl = document.getElementById('impactedValue');

    if (mttrEl) mttrEl.textContent = metrics.mttr > 0 ? metrics.mttr.toFixed(1) : '0.0';
    if (totalEl) totalEl.textContent = incidents.length;
    if (criticalEl) criticalEl.textContent = metrics.critical;
    if (openEl) openEl.textContent = metrics.open;
    if (resolvedEl) resolvedEl.textContent = metrics.resolved;
    if (impactedEl) impactedEl.textContent = metrics.totalImpacted;
}

// ============================================
// Dashboard da Técnica
// ============================================

function renderTecnicoDashboard() {
    // Suporta dois formatos:
    // - assignedTo == currentUser.name (mock antigo)
    // - assignedToId == currentUser.id (se backend devolver)
    const myIncidents = incidents.filter(inc => {
        if (inc.assignedToId && currentUser.id) {
            return inc.assignedToId === currentUser.id;
        }
        if (inc.assignedTo && currentUser.name) {
            return inc.assignedTo === currentUser.name;
        }
        return false;
    });

    const myOpen = myIncidents.filter(inc => inc.status === 'Aberto').length;
    const myProgress = myIncidents.filter(inc => inc.status === 'Em Progresso').length;
    const myResolved = myIncidents.filter(inc => inc.status === 'Resolvido').length;
    const myEscalated = myIncidents.filter(inc => inc.status === 'Escalado').length;

    const myOpenEl = document.getElementById('myOpenValue');
    const myProgressEl = document.getElementById('myProgressValue');
    const myResolvedEl = document.getElementById('myResolvedValue');
    const myEscalatedEl = document.getElementById('myEscalatedValue');

    if (myOpenEl) myOpenEl.textContent = myOpen;
    if (myProgressEl) myProgressEl.textContent = myProgress;
    if (myResolvedEl) myResolvedEl.textContent = myResolved;
    if (myEscalatedEl) myEscalatedEl.textContent = myEscalated;

    filteredIncidents = myIncidents;
}

// ============================================
// Dashboard do SysAdmin
// ============================================

function renderSysAdminDashboard() {
    // Incidentes críticos ou escalados
    const escalatedIncidents = incidents.filter(inc =>
        inc.status === 'Escalado' || inc.priority === 'Crítica'
    );

    const critical = escalatedIncidents.filter(inc => inc.priority === 'Crítica').length;
    const high = escalatedIncidents.filter(inc => inc.priority === 'Alta').length;
    const resolved = incidents.filter(inc => inc.status === 'Resolvido').length;
    const totalImpacted = incidents.reduce(
        (sum, inc) => sum + (inc.affectedUsers || 0),
        0
    );

    const criticalAlertsEl = document.getElementById('criticalAlertsValue');
    const highAlertsEl = document.getElementById('highAlertsValue');
    const resolvedEl = document.getElementById('resolvedValue');
    const impactedEl = document.getElementById('impactedValue');

    if (criticalAlertsEl) criticalAlertsEl.textContent = critical;
    if (highAlertsEl) highAlertsEl.textContent = high;
    if (resolvedEl) resolvedEl.textContent = resolved;
    if (impactedEl) impactedEl.textContent = totalImpacted;

    // Banner de alerta crítico, se existir
    const criticalIncident = incidents.find(
        inc => inc.priority === 'Crítica' && inc.status !== 'Resolvido'
    );
    const alertDiv = document.getElementById('criticalAlert');
    const alertMsg = document.getElementById('criticalAlertMsg');

    if (alertDiv && alertMsg) {
        if (criticalIncident) {
            alertDiv.style.display = 'block';
            alertMsg.textContent = `${criticalIncident.title} - ${criticalIncident.id}`;
        } else {
            alertDiv.style.display = 'none';
        }
    }

    filteredIncidents = escalatedIncidents;
}

// ============================================
// Cálculo de Métricas
// ============================================

function calculateMetrics() {
    const critical = incidents.filter(inc => inc.priority === 'Crítica').length;
    const open = incidents.filter(inc => inc.status === 'Aberto').length;
    const resolved = incidents.filter(inc => inc.status === 'Resolvido').length;

    const totalImpacted = incidents.reduce(
        (sum, inc) => sum + (inc.affectedUsers || 0),
        0
    );

    // MTTR: média (em horas) entre createdAt e resolvedAt
    const resolvedIncidents = incidents.filter(
        inc => inc.status === 'Resolvido' && inc.resolvedAt && inc.createdAt
    );

    let mttr = 0;
    if (resolvedIncidents.length > 0) {
        const totalHours = resolvedIncidents.reduce((sum, inc) => {
            const created = new Date(inc.createdAt);
            const resolvedDate = new Date(inc.resolvedAt);
            if (isNaN(created) || isNaN(resolvedDate)) return sum;
            const hours = (resolvedDate - created) / (1000 * 60 * 60);
            return sum + (hours > 0 ? hours : 0);
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

    if (!filteredIncidents.length) {
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    filteredIncidents.forEach(incident => {
        const row = document.createElement('tr');

        const priorityClass = (incident.priority || '')
            .toLowerCase()
            .replace(/\s+/g, '-');
        const statusClass = (incident.status || '')
            .toLowerCase()
            .replace(/\s+/g, '-');

        row.innerHTML = `
            <td><strong>${incident.id}</strong></td>
            <td>${incident.title || '-'}</td>
            <td>${incident.category || '-'}</td>
            <td>
                <span class="priority-badge ${priorityClass}">
                    ${incident.priority || '-'}
                </span>
            </td>
            <td>
                <span class="status-badge ${statusClass}">
                    ${incident.status || '-'}
                </span>
            </td>
            <td>${incident.affectedUsers != null ? incident.affectedUsers : '-'}</td>
            <td>${incident.assignedTo || '-'}</td>
            <td>
                <a href="#" class="btn-action"
                   onclick="viewIncident('${incident.id}', event)"
                   style="color: #667eea; text-decoration: none; font-weight: 600;">
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

    const filterPeriod = document.getElementById('filterPeriod');
    const filterCategory = document.getElementById('filterCategory');
    const filterPriority = document.getElementById('filterPriority');
    const filterStatus = document.getElementById('filterStatus');
    const filterSeverity = document.getElementById('filterSeverity');
    const filterType = document.getElementById('filterType');

    // Período
    if (filterPeriod && filterPeriod.value) {
        const period = filterPeriod.value;
        const now = new Date();
        const startDate = new Date(now);

        switch (period) {
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

        filteredIncidents = filteredIncidents.filter(inc => {
            if (!inc.createdAt) return false;
            const created = new Date(inc.createdAt);
            return !isNaN(created) && created >= startDate;
        });
    }

    if (filterCategory && filterCategory.value) {
        filteredIncidents = filteredIncidents.filter(
            inc => inc.category === filterCategory.value
        );
    }

    if (filterPriority && filterPriority.value) {
        filteredIncidents = filteredIncidents.filter(
            inc => inc.priority === filterPriority.value
        );
    }

    if (filterStatus && filterStatus.value) {
        filteredIncidents = filteredIncidents.filter(
            inc => inc.status === filterStatus.value
        );
    }

    if (filterSeverity && filterSeverity.value) {
        filteredIncidents = filteredIncidents.filter(
            inc => inc.priority === filterSeverity.value
        );
    }

    if (filterType && filterType.value) {
        filteredIncidents = filteredIncidents.filter(
            inc => inc.category === filterType.value
        );
    }

    renderIncidentsTable();
}

function resetFilters() {
    const ids = [
        'filterPeriod',
        'filterCategory',
        'filterPriority',
        'filterStatus',
        'filterSeverity',
        'filterType'
    ];

    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    if (currentUser.role === 'tecnico') {
        filteredIncidents = incidents.filter(inc => {
            if (inc.assignedToId && currentUser.id) {
                return inc.assignedToId === currentUser.id;
            }
            if (inc.assignedTo && currentUser.name) {
                return inc.assignedTo === currentUser.name;
            }
            return false;
        });
    } else if (currentUser.role === 'sysadmin') {
        filteredIncidents = incidents.filter(
            inc => inc.status === 'Escalado' || inc.priority === 'Crítica'
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
    if (event) event.preventDefault();

    const incident = incidents.find(inc => String(inc.id) === String(id));
    if (!incident) {
        showNotification("Incidente não encontrado.", "error");
        return;
    }

    showNotification(`A visualizar: ${incident.title}`, "info");
    console.log("Incidente:", incident);
}

// Notificação simples
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
