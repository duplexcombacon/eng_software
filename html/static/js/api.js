const API_URL = 'http://localhost:3001/api';

function getAuthToken() {
    return localStorage.getItem('token');
}

function getAuthHeaders() {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
}

// GET incidentes com filtros
async function getIncidents(filters = {}) {
    try {
        const params = new URLSearchParams(filters);
        const response = await fetch(`${API_URL}/incidents?${params}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // A API retorna um array diretamente
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Erro ao buscar incidentes:', error);
        return [];
    }
}

// POST novo incidente
async function createIncident(incident) {
    try {
        const response = await fetch(`${API_URL}/incidents`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(incident)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao criar incidente:', error);
        return null;
    }
}

// PATCH atualizar incidente
async function updateIncident(id, updates) {
    try {
        const response = await fetch(`${API_URL}/incidents/${id}`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify(updates)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao atualizar incidente:', error);
        return null;
    }
}

// GET incidente por ID
async function getIncidentById(id) {
    try {
        const response = await fetch(`${API_URL}/incidents/${id}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao buscar incidente:', error);
        return null;
    }
}

// GET utilizadores
async function getUsers() {
    try {
        const response = await fetch(`${API_URL}/users`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Erro ao buscar utilizadores:', error);
        return [];
    }
}

// GET opções (categorias, prioridades, status)
async function getOptions() {
    try {
        const response = await fetch(`${API_URL}/options`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao buscar opções:', error);
        // Retornar valores padrão em caso de erro
        return {
            categories: [
                "Email/Comunicações",
                "Hardware/Impressoras",
                "Software/CRM",
                "Infraestrutura/Base de Dados",
                "Redes/Conectividade",
                "Software/Armazenamento"
            ],
            priorities: ["Baixa", "Média", "Alta", "Crítica"],
            statuses: ["Aberto", "Em Progresso", "Escalado", "Resolvido"]
        };
    }
}