// static/js/main.js

const API_BASE_URL = "http://localhost:3001/api";

function getAuthToken() {
    return localStorage.getItem('token');
}

function getAuthHeaders() {
    const token = getAuthToken();
    return {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
    };
}

// ============================================
// Funções de Autenticação
// ============================================

function getCurrentUser() {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
}

function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('token');
    window.location.href = '../index.html';
}

function requireAuth() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = '../index.html';
        return false;
    }
    return user;
}

function hasRole(requiredRole) {
    const user = getCurrentUser();
    return user && user.role === requiredRole;
}

function hasAnyRole(requiredRoles) {
    const user = getCurrentUser();
    return user && requiredRoles.includes(user.role);
}

// ============================================
// Dados (via API real)
// ============================================

async function loadIncidents() {
    const res = await fetch(`${API_BASE_URL}/incidents`, {
        headers: getAuthHeaders()
    });

    if (!res.ok) {
        console.error("Erro ao carregar incidentes", res.status);
        throw new Error("Erro ao carregar incidentes");
    }

    // A API retorna um array diretamente
    const incidents = await res.json();
    return { incidents: Array.isArray(incidents) ? incidents : [] };
}

// ============================================
// Atualizar Informação do Utilizador
// ============================================

function updateUserInfo() {
    const user = getCurrentUser();
    if (!user) return;

    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');

    if (userAvatar) userAvatar.textContent = user.name?.charAt(0) || 'U';
    if (userName) userName.textContent = user.name || 'Utilizador';
    if (userRole) userRole.textContent = user.title || 'Perfil';
}

// ============================================
// Utilitários
// ============================================

function formatDate(dateStr) {
    const date = new Date(dateStr);
    if (isNaN(date)) return "-";
    return date.toLocaleDateString('pt-PT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getPriorityColor(priority) {
    switch(priority) {
        case 'Crítica': return 'danger';
        case 'Alta': return 'warning';
        case 'Média': return 'info';
        case 'Baixa': return 'success';
        default: return 'secondary';
    }
}

function getStatusColor(status) {
    switch(status) {
        case 'Aberto': return 'danger';
        case 'Em Progresso': return 'warning';
        case 'Escalado': return 'info';
        case 'Resolvido': return 'success';
        default: return 'secondary';
    }
}

function formatUserName(name, role) {
    const roleMap = {
        'gestor': 'G',
        'tecnico': 'T',
        'sysadmin': 'S'
    };
    return `${name} (${roleMap[role] || role})`;
}

function getTimeAgo(dateStr) {
    const date = new Date(dateStr);
    if (isNaN(date)) return "-";
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    return `${diffDays}d atrás`;
}

// ============================================
// Inicialização
// ============================================

function initPage() {
    const user = getCurrentUser();
    const currentPage = window.location.pathname;

    if (!user && (currentPage.includes('templates/') || currentPage.includes('dashboard'))) {
        window.location.href = '../index.html';
    }
}

document.addEventListener('DOMContentLoaded', initPage);
