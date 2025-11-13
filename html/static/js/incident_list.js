/**
 * INCIDENT-LIST.JS
 * Lógica para a página de Lista de Incidentes (Gestor)
 */

let incidents = [];
let filteredIncidents = [];
let currentUser = null;

// ============================================
// Inicialização
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticação (função do main.js)
    currentUser = requireAuth();
    if (!currentUser || currentUser.role !== 'gestor') {
        // Apenas gestores podem ver esta página
        window.location.href = '../index.html';
        return;
    }

    // Preencher info do utilizador (função do main.js)
    updateUserInfo();

    // Carregar dados
    try {
        await loadData();
    } catch (err) {
        console.error("Erro ao carregar dados:", err);
    }
});

// ============================================
// Carregamento de Dados
// ============================================

async function loadData() {
    // loadIncidents() vem de main.js e chama a API real
    const data = await loadIncidents(); 
    incidents = Array.isArray(data.incidents) ? data.incidents : [];
    
    // O Gestor começa por ver tudo
    filteredIncidents = [...incidents]; 

    // Renderizar tabela
    renderIncidentsTable();
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

        // Classes de CSS para as badges (copiado do seu dashboard.js)
        const priorityClass = (incident.priority || '')
            .toLowerCase()
            .replace(/\s+/g, '-');
        const statusClass = (incident.status || '')
            .toLowerCase()
            .replace(/\s+/g, '-');

        const assignedTo = incident.assignedToName || '-';
        const affectedUsers = (incident.affectedUsers != null) ? incident.affectedUsers : '-';
        
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
            <td>${assignedTo}</td>
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
// (Copiado do seu dashboard.js, mas simplificado)
// ============================================

function applyFilters() {
    // O Gestor filtra sempre a partir da lista total
    filteredIncidents = [...incidents];

    const filterPeriod = document.getElementById('filterPeriod');
    const filterCategory = document.getElementById('filterCategory');
    const filterPriority = document.getElementById('filterPriority');
    const filterStatus = document.getElementById('filterStatus');

    // Período
    if (filterPeriod && filterPeriod.value) {
        const period = filterPeriod.value;
        const now = new Date();
        const startDate = new Date(now);

        if (period === 'week') {
            startDate.setDate(now.getDate() - now.getDay()); // Início da semana (Domingo)
        } else if (period === 'month') {
            startDate.setDate(1); // Dia 1 do mês
        } else if (period === 'quarter') {
            const quarter = Math.floor(now.getMonth() / 3);
            startDate.setMonth(quarter * 3, 1); // Início do trimestre
        }
        startDate.setHours(0, 0, 0, 0); // Início do dia

        filteredIncidents = filteredIncidents.filter(inc => {
            const createdAt = inc.createdAt || inc.created_at;
            if (!createdAt) return false;
            const created = new Date(createdAt);
            return !isNaN(created) && created >= startDate;
        });
    }
    
    // Outros filtros
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

    renderIncidentsTable();
}

function resetFilters() {
    const ids = ['filterPeriod', 'filterCategory', 'filterPriority', 'filterStatus'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    // Resetar para a lista total
    filteredIncidents = [...incidents];
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

// ============================================
// Funções de UI (ex: Notificações)
// (Copiado do seu dashboard.js)
// ============================================

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

// Função para preencher o nome/avatar do utilizador
function updateUserInfo() {
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');

    if (!currentUser) return;

    if (userAvatar) userAvatar.textContent = currentUser.name?.charAt(0) || 'U';
    if (userName) userName.textContent = currentUser.name || 'Utilizador';
    if (userRole) userRole.textContent = currentUser.title || 'Perfil';
}