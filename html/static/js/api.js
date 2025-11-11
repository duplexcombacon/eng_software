const API_URL = 'http://localhost:3000/api';

// GET incidentes com filtros
async function getIncidents(filters = {}) {
    try {
        const params = new URLSearchParams(filters);
        const response = await fetch(`${API_URL}/incidents?${params}`);
        const data = await response.json();
        return data.data || [];
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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(incident)
        });
        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error('Erro ao criar incidente:', error);
        return false;
    }
}

// PUT atualizar incidente
async function updateIncident(id, updates) {
    try {
        const response = await fetch(`${API_URL}/incidents/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error('Erro ao atualizar incidente:', error);
        return false;
    }
}

// GET utilizadores
async function getUsers() {
    try {
        const response = await fetch(`${API_URL}/users`);
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Erro ao buscar utilizadores:', error);
        return [];
    }
}
