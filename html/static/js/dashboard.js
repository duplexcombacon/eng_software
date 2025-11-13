/**
 * DASHBOARD.JS - Lógica dos Dashboards
 */

let incidents = [];
let filteredIncidents = [];
let currentUser = null;
let lastReloadTime = 0;
const RELOAD_THROTTLE = 2000; // Recarregar no máximo a cada 2 segundos

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
        
        // Verificar se um incidente foi criado recentemente
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('created') === 'true') {
            showNotification("Incidente criado com sucesso! ✅", "success");
            // Limpar o parâmetro da URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    } catch (err) {
        console.error("Erro ao carregar dados do dashboard:", err);
        showNotification("Erro ao carregar incidentes do servidor.", "error");
    }
});

// Função auxiliar para recarregar dados com throttle
async function reloadDataIfNeeded() {
    const now = Date.now();
    if (now - lastReloadTime < RELOAD_THROTTLE) {
        return; // Ignorar se foi recarregado recentemente
    }
    lastReloadTime = now;
    
    if (currentUser) {
        try {
            await loadData();
        } catch (err) {
            console.error("Erro ao recarregar dados:", err);
        }
    }
}

// Recarregar dados quando a página recebe foco (útil quando volta de outra página)
document.addEventListener('visibilitychange', async () => {
    if (!document.hidden && currentUser) {
        // Página ficou visível, recarregar dados (com throttle)
        await reloadDataIfNeeded();
    }
});

// Recarregar dados quando a página recebe foco (via window focus)
window.addEventListener('focus', async () => {
    await reloadDataIfNeeded();
});

// ============================================
// Carregamento de Dados
// ============================================

async function loadData() {
    const data = await loadIncidents(); // vem de main.js e chama a API real
    incidents = Array.isArray(data.incidents) ? data.incidents : [];

    // Renderizar dashboards conforme o role (isto também define filteredIncidents)
    if (currentUser.role === 'gestor') {
        renderGestorDashboard();
        // Para gestor, mostrar todos os incidentes por padrão
        filteredIncidents = [...incidents];
    } else if (currentUser.role === 'tecnico') {
        renderTecnicoDashboard();
        // renderTecnicoDashboard já define filteredIncidents
    } else if (currentUser.role === 'sysadmin') {
        renderSysAdminDashboard();
        // renderSysAdminDashboard já define filteredIncidents
    } else {
        // Fallback: mostrar todos os incidentes
        filteredIncidents = [...incidents];
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
    // Filtrar incidentes criados pelo utilizador OU atribuídos a ele
    // Um técnico deve ver os incidentes que criou e os que foram atribuídos a ele
    const myIncidents = incidents.filter(inc => {
        if (!currentUser || !currentUser.id) return false;
        
        // Converter para números para comparação (pode ser string ou número)
        const userId = Number(currentUser.id);
        const createdBy = inc.createdBy != null ? Number(inc.createdBy) : null;
        const assignedTo = inc.assignedTo != null ? Number(inc.assignedTo) : null;
        
        // Verificar se foi criado por ele
        const createdByMe = createdBy === userId;
        // Verificar se foi atribuído a ele
        const assignedToMe = assignedTo === userId;
        
        return createdByMe || assignedToMe;
    });

    // Calcular métricas baseadas nos incidentes do técnico
    const myOpen = myIncidents.filter(inc => inc.status === 'Aberto').length;
    const myProgress = myIncidents.filter(inc => inc.status === 'Em Progresso').length;
    const myResolved = myIncidents.filter(inc => inc.status === 'Resolvido').length;
    const myEscalated = myIncidents.filter(inc => inc.status === 'Escalado').length;

    // Atualizar elementos HTML com as métricas
    const myOpenEl = document.getElementById('myOpenValue');
    const myProgressEl = document.getElementById('myProgressValue');
    const myResolvedEl = document.getElementById('myResolvedValue');
    const myEscalatedEl = document.getElementById('myEscalatedValue');

    if (myOpenEl) myOpenEl.textContent = myOpen;
    if (myProgressEl) myProgressEl.textContent = myProgress;
    if (myResolvedEl) myResolvedEl.textContent = myResolved;
    if (myEscalatedEl) myEscalatedEl.textContent = myEscalated;

    // Atualizar lista filtrada com os incidentes do técnico
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
        (sum, inc) => sum + (parseInt(inc.affectedUsers) || 0),
        0
    );

    // MTTR: média (em horas) entre createdAt e resolvedAt
    // Os campos podem ser createdAt/createdAt ou created_at/resolved_at dependendo da BD
    const resolvedIncidents = incidents.filter(inc => {
        const statusResolved = inc.status === 'Resolvido' || inc.status === 'Fechado';
        const hasDates = (inc.resolvedAt || inc.resolved_at) && (inc.createdAt || inc.created_at);
        return statusResolved && hasDates;
    });

    let mttr = 0;
    if (resolvedIncidents.length > 0) {
        const totalHours = resolvedIncidents.reduce((sum, inc) => {
            // Tentar ambos os formatos de nome de campo
            const created = new Date(inc.createdAt || inc.created_at);
            const resolvedDate = new Date(inc.resolvedAt || inc.resolved_at);
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

        // Usar assignedToName se disponível (vem do JOIN), senão mostrar '-' 
        // assignedToName pode ser null se não houver utilizador atribuído
        const assignedTo = incident.assignedToName || '-';
        // Usar affectedUsers (campo da BD)
        const affectedUsers = (incident.affectedUsers != null && incident.affectedUsers !== undefined) 
            ? incident.affectedUsers 
            : '-';
        
        // Formatar data de criação
        const createdAt = incident.createdAt || incident.created_at;
        const createdDate = createdAt ? formatDate(createdAt) : '-';

        // Determinar qual coluna mostrar após "Afetados" baseado no role
        let extraColumn = '';
        if (currentUser && currentUser.role === 'tecnico') {
            // Para técnico, mostrar "Criado em"
            extraColumn = `<td>${createdDate}</td>`;
        } else {
            // Para gestor e sysadmin, mostrar "Atribuído a"
            extraColumn = `<td>${assignedTo}</td>`;
        }

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
            <td>${affectedUsers}</td>
            ${extraColumn}
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

// Função auxiliar para obter a lista base de incidentes conforme o role
function getBaseIncidentsList() {
    if (!currentUser) return [];
    
    if (currentUser.role === 'tecnico') {
        // Para técnico, mostrar incidentes criados por ele OU atribuídos a ele
        return incidents.filter(inc => {
            if (!currentUser.id) return false;
            
            // Converter para números para comparação
            const userId = Number(currentUser.id);
            const createdBy = inc.createdBy != null ? Number(inc.createdBy) : null;
            const assignedTo = inc.assignedTo != null ? Number(inc.assignedTo) : null;
            
            const createdByMe = createdBy === userId;
            const assignedToMe = assignedTo === userId;
            return createdByMe || assignedToMe;
        });
    } else if (currentUser.role === 'sysadmin') {
        // Para sysadmin, mostrar apenas críticos ou escalados
        return incidents.filter(inc =>
            inc.status === 'Escalado' || inc.priority === 'Crítica'
        );
    } else {
        // Para gestor, mostrar todos os incidentes
        return [...incidents];
    }
}

function applyFilters() {
    // Começar sempre com a lista base conforme o role
    filteredIncidents = getBaseIncidentsList();

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
            // Tentar ambos os formatos de nome de campo
            const createdAt = inc.createdAt || inc.created_at;
            if (!createdAt) return false;
            const created = new Date(createdAt);
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

    // Atualizar métricas se for técnico (para refletir os filtros aplicados)
    if (currentUser && currentUser.role === 'tecnico') {
        // Recalcular métricas baseadas nos incidentes filtrados
        const myOpen = filteredIncidents.filter(inc => inc.status === 'Aberto').length;
        const myProgress = filteredIncidents.filter(inc => inc.status === 'Em Progresso').length;
        const myResolved = filteredIncidents.filter(inc => inc.status === 'Resolvido').length;
        const myEscalated = filteredIncidents.filter(inc => inc.status === 'Escalado').length;

        const myOpenEl = document.getElementById('myOpenValue');
        const myProgressEl = document.getElementById('myProgressValue');
        const myResolvedEl = document.getElementById('myResolvedValue');
        const myEscalatedEl = document.getElementById('myEscalatedValue');

        if (myOpenEl) myOpenEl.textContent = myOpen;
        if (myProgressEl) myProgressEl.textContent = myProgress;
        if (myResolvedEl) myResolvedEl.textContent = myResolved;
        if (myEscalatedEl) myEscalatedEl.textContent = myEscalated;
    }

    renderIncidentsTable();
}

function resetFilters() {
    // Limpar todos os valores dos filtros
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

    // Resetar para a lista base conforme o role
    filteredIncidents = getBaseIncidentsList();
    
    // Recalcular métricas se for técnico
    if (currentUser && currentUser.role === 'tecnico') {
        renderTecnicoDashboard();
    }

    renderIncidentsTable();
}

// ============================================
// Ações
// ============================================

function viewIncident(id, event) {
    if (event) event.preventDefault();

    // Redirecionar para a página de detalhes
    window.location.href = `incident-details.html?id=${id}`;
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
