/**
 * MAIN.JS - Funções Globais de Autenticação e Utilitários
 */

// ============================================
// Funções de Autenticação
// ============================================

/**
 * Verifica se o utilizador está autenticado
 * @returns {Object|null} Dados do utilizador ou null
 */
function getCurrentUser() {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
}

/**
 * Faz logout do utilizador
 */
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userEmail');
    window.location.href = '../index.html';
}

/**
 * Redireciona para login se não está autenticado
 */
function requireAuth() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = '../index.html';
        return false;
    }
    return user;
}

/**
 * Verifica se o utilizador tem um rol específico
 * @param {string} requiredRole - Rol requerido (gestor, tecnico, sysadmin)
 * @returns {boolean}
 */
function hasRole(requiredRole) {
    const user = getCurrentUser();
    return user && user.role === requiredRole;
}

/**
 * Verifica se o utilizador tem múltiplos roles
 * @param {array} requiredRoles - Array de roles
 * @returns {boolean}
 */
function hasAnyRole(requiredRoles) {
    const user = getCurrentUser();
    return user && requiredRoles.includes(user.role);
}

// ============================================
// Funções de Dados (Simuladas com JSON local)
// ============================================

/**
 * Carrega dados de utilizadores
 */
async function loadUsers() {
    const users = [
        {
            id: 1,
            name: "João Almeida",
            email: "joao.almeida@empresa.pt",
            password: "senha123",
            role: "gestor",
            title: "Gestor de IT (Administrator)"
        },
        {
            id: 2,
            name: "Marta Ferreira",
            email: "marta.ferreira@empresa.pt",
            password: "senha123",
            role: "tecnico",
            title: "Técnica de Suporte (Helpdesk Nível 1)"
        },
        {
            id: 3,
            name: "Carlos Pinto",
            email: "carlos.pinto@empresa.pt",
            password: "senha123",
            role: "sysadmin",
            title: "Administrador de Sistemas (SysAdmin)"
        }
    ];
    return users;
}

/**
 * Carrega dados de incidentes
 */
async function loadIncidents() {
    return {
        incidents: [
            {
                id: "INC-001",
                title: "Email não funciona - Utilizador João Silva",
                description: "Utilizador não consegue aceder ao email corporativo.",
                category: "Email/Comunicações",
                priority: "Alta",
                status: "Aberto",
                createdAt: "2025-11-10T09:30:00Z",
                assignedTo: "Marta Ferreira",
                impact: 1
            },
            {
                id: "INC-002",
                title: "Impressora de Rede Offline",
                description: "A impressora do piso 3 está offline e não está a responder.",
                category: "Hardware/Impressoras",
                priority: "Média",
                status: "Em Progresso",
                createdAt: "2025-11-10T10:15:00Z",
                assignedTo: "Marta Ferreira",
                impact: 3
            },
            {
                id: "INC-003",
                title: "CRM Lento - Toda a Aplicação",
                description: "Aplicação CRM está muito lenta, afetando toda a equipa de vendas.",
                category: "Software/CRM",
                priority: "Crítica",
                status: "Escalado",
                createdAt: "2025-11-10T11:45:00Z",
                assignedTo: "Carlos Pinto",
                impact: 15
            },
            {
                id: "INC-004",
                title: "Servidor BD Principais - CPU 100%",
                description: "Alerta crítico: Servidor de BD está com CPU a 100% e a responder lentamente.",
                category: "Infraestrutura/Base de Dados",
                priority: "Crítica",
                status: "Escalado",
                createdAt: "2025-11-10T14:20:00Z",
                assignedTo: "Carlos Pinto",
                impact: 50
            },
            {
                id: "INC-005",
                title: "Acesso VPN não funciona",
                description: "Utilizador remoto não consegue estabelecer ligação VPN.",
                category: "Redes/Conectividade",
                priority: "Alta",
                status: "Aberto",
                createdAt: "2025-11-11T08:00:00Z",
                assignedTo: "Marta Ferreira",
                impact: 1
            },
            {
                id: "INC-006",
                title: "Sincronização de Ficheiros Lenta",
                description: "Sincronização OneDrive/SharePoint está muito lenta.",
                category: "Software/Armazenamento",
                priority: "Média",
                status: "Resolvido",
                createdAt: "2025-11-09T15:30:00Z",
                assignedTo: "Marta Ferreira",
                impact: 5,
                resolvedAt: "2025-11-10T10:00:00Z"
            }
        ],
        metrics: {
            mttr: {
                total: 2.5,
                byCategory: {
                    "Email/Comunicações": 1.2,
                    "Hardware/Impressoras": 1.8,
                    "Software/CRM": 4.5,
                    "Infraestrutura/Base de Dados": 3.2,
                    "Redes/Conectividade": 2.1,
                    "Software/Armazenamento": 1.5
                }
            },
            incidentsByPriority: {
                "Crítica": 2,
                "Alta": 2,
                "Média": 2,
                "Baixa": 0
            },
            incidentsByStatus: {
                "Aberto": 2,
                "Em Progresso": 1,
                "Escalado": 2,
                "Resolvido": 1
            },
            incidentsByCategory: {
                "Email/Comunicações": 1,
                "Hardware/Impressoras": 1,
                "Software/CRM": 1,
                "Infraestrutura/Base de Dados": 1,
                "Redes/Conectividade": 1,
                "Software/Armazenamento": 1
            },
            totalImpactedUsers: 79
        }
    };
}

// ============================================
// Funções de Utilitários
// ============================================

/**
 * Formata data para formato legível
 * @param {string} dateStr - Data em formato ISO
 * @returns {string} Data formatada
 */
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-PT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Retorna cor baseada na prioridade
 * @param {string} priority - Prioridade do incidente
 * @returns {string} Classe CSS de cor
 */
function getPriorityColor(priority) {
    switch(priority) {
        case 'Crítica': return 'danger';
        case 'Alta': return 'warning';
        case 'Média': return 'info';
        case 'Baixa': return 'success';
        default: return 'secondary';
    }
}

/**
 * Retorna cor baseada no status
 * @param {string} status - Status do incidente
 * @returns {string} Classe CSS de cor
 */
function getStatusColor(status) {
    switch(status) {
        case 'Aberto': return 'danger';
        case 'Em Progresso': return 'warning';
        case 'Escalado': return 'info';
        case 'Resolvido': return 'success';
        default: return 'secondary';
    }
}

/**
 * Formata nome do utilizador com abreviatura do role
 * @param {string} name - Nome do utilizador
 * @param {string} role - Role do utilizador
 * @returns {string} Nome formatado
 */
function formatUserName(name, role) {
    const roleMap = {
        'gestor': 'G',
        'tecnico': 'T',
        'sysadmin': 'S'
    };
    return `${name} (${roleMap[role] || role})`;
}

/**
 * Calcula tempo decorrido desde uma data
 * @param {string} dateStr - Data em formato ISO
 * @returns {string} Tempo decorrido formatado
 */
function getTimeAgo(dateStr) {
    const date = new Date(dateStr);
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

/**
 * Inicializa a página verificando autenticação
 */
function initPage() {
    const user = getCurrentUser();
    if (!user) {
        // Se não está autenticado e está numa página protegida, redireciona
        const currentPage = window.location.pathname;
        if (currentPage.includes('templates/') || currentPage.includes('dashboard')) {
            window.location.href = '../index.html';
        }
    }
}

// Executar verificação de autenticação quando a página carrega
document.addEventListener('DOMContentLoaded', initPage);
