/**
 * DASHBOARD.JS - Lógica dos Dashboards
 */

let incidents = [];
let filteredIncidents = [];
let currentUser = null;
let lastReloadTime = 0;
const RELOAD_THROTTLE = 2000; // Recarregar no máximo a cada 2 segundos

// Referências para gráficos Chart.js (evitar recriar múltiplas vezes)
let gestorCharts = {};
let tecnicoCharts = {};
let sysadminCharts = {};

// ============================================
// Inicialização
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticação
    currentUser = requireAuth();
    if (!currentUser) return;

    // Preencher info do utilizador (nome, avatar, título)
    updateUserInfo();

    // Setup do formulário de comentários
    setupCommentForm();

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
    
    // Setup para cliques nas linhas (comentários)
    setupIncidentRowClick();
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

    // Atualizar gráficos do gestor
    updateGestorCharts();
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

    // Atualizar gráfico da técnica
    updateTecnicoCharts(myIncidents);
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

    // Atualizar gráficos do sysadmin
    updateSysadminCharts(escalatedIncidents, incidents);
}

// ============================================
// Gráficos Chart.js - Gestor
// ============================================

function createOrUpdateChart(store, key, ctx, config) {
    if (!ctx || typeof Chart === "undefined") return;
    if (store[key]) {
        store[key].data = config.data;
        if (config.options) {
            store[key].options = config.options;
        }
        store[key].update();
        return;
    }
    store[key] = new Chart(ctx, config);
}

function updateGestorCharts() {
    const priorityCanvas = document.getElementById("chartGestorPriority");
    const categoryCanvas = document.getElementById("chartGestorCategory");
    const statusCanvas = document.getElementById("chartGestorStatus");
    const mttrCanvas = document.getElementById("chartGestorMttr");

    if (!priorityCanvas && !categoryCanvas && !statusCanvas && !mttrCanvas) return;

    const countsBy = (items, field) => {
        const map = {};
        items.forEach((inc) => {
            const key = inc[field] || "Desconhecido";
            map[key] = (map[key] || 0) + 1;
        });
        return map;
    };

    // Prioridade
    if (priorityCanvas) {
        const dataMap = countsBy(incidents, "priority");
        const labels = Object.keys(dataMap);
        const values = Object.values(dataMap);
        createOrUpdateChart(
            gestorCharts,
            "priority",
            priorityCanvas,
            {
                type: "doughnut",
                data: {
                    labels,
                    datasets: [
                        {
                            data: values,
                            backgroundColor: ["#2ecc71", "#3498db", "#f1c40f", "#e74c3c"],
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                },
            }
        );
    }

    // Categoria
    if (categoryCanvas) {
        const dataMap = countsBy(incidents, "category");
        const labels = Object.keys(dataMap);
        const values = Object.values(dataMap);
        createOrUpdateChart(
            gestorCharts,
            "category",
            categoryCanvas,
            {
                type: "bar",
                data: {
                    labels,
                    datasets: [
                        {
                            label: "Incidentes",
                            data: values,
                            backgroundColor: "#667eea",
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    scales: {
                        y: { beginAtZero: true, ticks: { precision: 0 } },
                    },
                },
            }
        );
    }

    // Status
    if (statusCanvas) {
        const dataMap = countsBy(incidents, "status");
        const labels = Object.keys(dataMap);
        const values = Object.values(dataMap);
        createOrUpdateChart(
            gestorCharts,
            "status",
            statusCanvas,
            {
                type: "bar",
                data: {
                    labels,
                    datasets: [
                        {
                            label: "Incidentes",
                            data: values,
                            backgroundColor: "#27ae60",
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    scales: {
                        y: { beginAtZero: true, ticks: { precision: 0 } },
                    },
                },
            }
        );
    }

    // MTTR por mês (linha)
    if (mttrCanvas) {
        const byMonth = {};
        incidents.forEach((inc) => {
            const statusResolved =
                inc.status === "Resolvido" || inc.status === "Fechado";
            const createdRaw = inc.createdAt || inc.created_at;
            const resolvedRaw = inc.resolvedAt || inc.resolved_at;
            if (!statusResolved || !createdRaw || !resolvedRaw) return;
            const created = new Date(createdRaw);
            const resolved = new Date(resolvedRaw);
            if (isNaN(created) || isNaN(resolved)) return;
            const key = `${created.getFullYear()}-${String(
                created.getMonth() + 1
            ).padStart(2, "0")}`;
            const hours = (resolved - created) / (1000 * 60 * 60);
            if (hours <= 0) return;
            if (!byMonth[key]) {
                byMonth[key] = { totalHours: 0, count: 0 };
            }
            byMonth[key].totalHours += hours;
            byMonth[key].count += 1;
        });

        const labels = Object.keys(byMonth).sort();
        const values = labels.map(
            (m) => byMonth[m].totalHours / byMonth[m].count
        );

        // Validação: se não houver dados, mostrar placeholder
        if (labels.length === 0) {
            mttrCanvas.style.display = 'none';
            const placeholder = document.createElement('div');
            placeholder.style.cssText = 'height: 300px; display: flex; align-items: center; justify-content: center; color: #95a5a6;';
            placeholder.textContent = 'Sem dados de MTTR (nenhum incidente resolvido)';
            mttrCanvas.parentNode.insertBefore(placeholder, mttrCanvas.nextSibling);
            return;
        }

        createOrUpdateChart(
            gestorCharts,
            "mttr",
            mttrCanvas,
            {
                type: "line",
                data: {
                    labels,
                    datasets: [
                        {
                            label: "MTTR (h)",
                            data: values,
                            fill: false,
                            borderColor: "#e67e22",
                            tension: 0.2,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    scales: {
                        y: { beginAtZero: true },
                    },
                },
            }
        );
    }
}

// ============================================
// Gráficos Chart.js - Técnica
// ============================================

function updateTecnicoCharts(myIncidents) {
    const mttrCanvas = document.getElementById("chartTecnicoMttr");
    if (!mttrCanvas || typeof Chart === "undefined") return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysResolved = myIncidents.filter((inc) => {
        const resolvedRaw = inc.resolvedAt || inc.resolved_at;
        if (!resolvedRaw) return false;
        const resolved = new Date(resolvedRaw);
        if (isNaN(resolved)) return false;
        return resolved >= today;
    });

    let mttr = 0;
    if (todaysResolved.length > 0) {
        const totalHours = todaysResolved.reduce((sum, inc) => {
            const created = new Date(inc.createdAt || inc.created_at);
            const resolved = new Date(inc.resolvedAt || inc.resolved_at);
            if (isNaN(created) || isNaN(resolved)) return sum;
            const hours = (resolved - created) / (1000 * 60 * 60);
            return sum + (hours > 0 ? hours : 0);
        }, 0);
        mttr = totalHours / todaysResolved.length;
    }

    createOrUpdateChart(
        tecnicoCharts,
        "mttr",
        mttrCanvas,
        {
            type: "bar",
            data: {
                labels: ["Hoje"],
                datasets: [
                    {
                        label: "MTTR (h)",
                        data: [mttr],
                        backgroundColor: "#9b59b6",
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: { beginAtZero: true },
                },
            },
        }
    );
}

// ============================================
// Gráficos Chart.js - SysAdmin
// ============================================

function updateSysadminCharts(escalatedIncidents, allIncidents) {
    const severityCanvas = document.getElementById("chartSysadminSeverity");
    const categoryCanvas = document.getElementById("chartSysadminCategory");
    const mttrCanvas = document.getElementById("chartSysadminMttr");
    const resolvedRateCanvas = document.getElementById(
        "chartSysadminResolvedRate"
    );

    if (
        !severityCanvas &&
        !categoryCanvas &&
        !mttrCanvas &&
        !resolvedRateCanvas
    ) {
        return;
    }

    const countsBy = (items, field) => {
        const map = {};
        items.forEach((inc) => {
            const key = inc[field] || "Desconhecido";
            map[key] = (map[key] || 0) + 1;
        });
        return map;
    };

    // Severidade (prioridade) dos escalados
    if (severityCanvas) {
        const dataMap = countsBy(escalatedIncidents, "priority");
        const labels = Object.keys(dataMap);
        const values = Object.values(dataMap);
        createOrUpdateChart(
            sysadminCharts,
            "severity",
            severityCanvas,
            {
                type: "doughnut",
                data: {
                    labels,
                    datasets: [
                        {
                            data: values,
                            backgroundColor: ["#e74c3c", "#f1c40f", "#3498db"],
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                },
            }
        );
    }

    // Categoria dos escalados
    if (categoryCanvas) {
        const dataMap = countsBy(escalatedIncidents, "category");
        const labels = Object.keys(dataMap);
        const values = Object.values(dataMap);
        createOrUpdateChart(
            sysadminCharts,
            "category",
            categoryCanvas,
            {
                type: "bar",
                data: {
                    labels,
                    datasets: [
                        {
                            label: "Incidentes Escalados",
                            data: values,
                            backgroundColor: "#1abc9c",
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    scales: {
                        y: { beginAtZero: true, ticks: { precision: 0 } },
                    },
                },
            }
        );
    }

    // MTTR dos escalados
    if (mttrCanvas) {
        let mttr = 0;
        const resolvedEscalated = escalatedIncidents.filter((inc) => {
            const statusResolved =
                inc.status === "Resolvido" || inc.status === "Fechado";
            const hasDates =
                (inc.resolvedAt || inc.resolved_at) &&
                (inc.createdAt || inc.created_at);
            return statusResolved && hasDates;
        });
        if (resolvedEscalated.length > 0) {
            const totalHours = resolvedEscalated.reduce((sum, inc) => {
                const created = new Date(inc.createdAt || inc.created_at);
                const resolved = new Date(inc.resolvedAt || inc.resolved_at);
                if (isNaN(created) || isNaN(resolved)) return sum;
                const hours = (resolved - created) / (1000 * 60 * 60);
                return sum + (hours > 0 ? hours : 0);
            }, 0);
            mttr = totalHours / resolvedEscalated.length;
        }

        createOrUpdateChart(
            sysadminCharts,
            "mttr",
            mttrCanvas,
            {
                type: "bar",
                data: {
                    labels: ["Escalados"],
                    datasets: [
                        {
                            label: "MTTR (h)",
                            data: [mttr],
                            backgroundColor: "#e67e22",
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    scales: {
                        y: { beginAtZero: true },
                    },
                },
            }
        );
    }

    // Taxa de resolução geral
    if (resolvedRateCanvas) {
        const total = allIncidents.length;
        const resolved = allIncidents.filter(
            (inc) => inc.status === "Resolvido"
        ).length;
        const rate = total > 0 ? (resolved / total) * 100 : 0;

        createOrUpdateChart(
            sysadminCharts,
            "resolvedRate",
            resolvedRateCanvas,
            {
                type: "doughnut",
                data: {
                    labels: ["Resolvidos", "Em aberto"],
                    datasets: [
                        {
                            data: [rate, 100 - rate],
                            backgroundColor: ["#2ecc71", "#95a5a6"],
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                },
            }
        );
    }
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
        
        row.dataset.incidentId = incident.id;

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

// ============================================
// Sistema de Comentários
// ============================================

let selectedIncidentId = null;

// Adicionar evento ao clicar numa linha de incidente
function setupIncidentRowClick() {
    const table = document.getElementById('incidentsTableBody');
    if (!table) return;

    table.addEventListener('click', (e) => {
        const row = e.target.closest('tr');
        if (!row) return;

        const incidentId = row.dataset.incidentId;
        if (incidentId) {
            selectedIncidentId = parseInt(incidentId);
            updateSelectedIncidentDisplay(selectedIncidentId);
            loadComments(selectedIncidentId);
            showCommentsSection();
        }
    });
}

// Mostrar secção de comentários
function showCommentsSection() {
    const section = document.getElementById('commentsSection');
    if (section) {
        section.style.display = 'block';
    }
}

// Carregar comentários do incidente
async function loadComments(incidentId) {
    try {
        const res = await fetch(`${API_BASE_URL}/incidents/${incidentId}/comments`, {
            headers: getAuthHeaders()
        });

        if (!res.ok) {
            console.error("Erro ao carregar comentários", res.status);
            return;
        }

        const comments = await res.json();
        displayComments(comments);
    } catch (err) {
        console.error("Erro ao carregar comentários:", err);
    }
}

// Mostrar comentários na UI
function displayComments(comments) {
    const commentsList = document.getElementById('commentsList');
    if (!commentsList) return;

    if (comments.length === 0) {
        commentsList.innerHTML = '<p style="color: #7f8c8d; font-style: italic; padding: 1rem;">Nenhum comentário ainda. Seja o primeiro!</p>';
        return;
    }

    commentsList.innerHTML = comments.map(comment => `
        <div style="background: #f8f9fa; padding: 1rem; margin-bottom: 0.5rem; border-radius: 4px; border-left: 3px solid #667eea;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                <strong style="color: #2c3e50;">${comment.userName || 'Utilizador Desconhecido'}</strong>
                <small style="color: #95a5a6;">${formatDate(comment.createdAt)}</small>
            </div>
            <p style="color: #34495e; margin: 0; word-wrap: break-word;">${escapeHtml(comment.text)}</p>
            ${comment.userId === currentUser.id || currentUser.role === 'sysadmin' ? `
                <button onclick="deleteComment(${selectedIncidentId}, ${comment.id})" style="font-size: 0.85rem; color: #e74c3c; background: none; border: none; cursor: pointer; padding: 0.25rem 0; margin-top: 0.5rem;">
                    🗑️ Eliminar
                </button>
            ` : ''}
        </div>
    `).join('');
}

// Função auxiliar para escapar HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Adicionar novo comentário
async function addComment(incidentId, text) {
    try {
        const res = await fetch(`${API_BASE_URL}/incidents/${incidentId}/comments`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ text })
        });

        if (!res.ok) {
            const error = await res.json();
            showNotification(error.message || "Erro ao adicionar comentário", "error");
            return false;
        }

        showNotification("Comentário adicionado com sucesso", "success");
        await loadComments(incidentId);
        return true;
    } catch (err) {
        console.error("Erro ao adicionar comentário:", err);
        showNotification("Erro ao adicionar comentário", "error");
        return false;
    }
}

// Eliminar comentário
async function deleteComment(incidentId, commentId) {
    if (!confirm("Deseja eliminar este comentário?")) return;

    try {
        const res = await fetch(`${API_BASE_URL}/incidents/${incidentId}/comments/${commentId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!res.ok) {
            showNotification("Erro ao eliminar comentário", "error");
            return;
        }

        showNotification("Comentário eliminado com sucesso", "success");
        await loadComments(incidentId);
    } catch (err) {
        console.error("Erro ao eliminar comentário:", err);
        showNotification("Erro ao eliminar comentário", "error");
    }
}

// Setup do formulário de comentários
function setupCommentForm() {
    const form = document.getElementById('commentForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const textarea = document.getElementById('commentText');
        const text = textarea.value.trim();

        if (!text) {
            showNotification("Comentário não pode estar vazio", "error");
            return;
        }

        if (selectedIncidentId) {
            const success = await addComment(selectedIncidentId, text);
            if (success) {
                textarea.value = '';
            }
        }
    });
}

// Preencher dados de incidente selecionado na secção de comentários
function updateSelectedIncidentDisplay(incidentId) {
    const span = document.getElementById('selectedIncidentId');
    if (span) {
        span.textContent = incidentId;
    }
}
