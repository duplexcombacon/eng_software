/**
 * OPTIONS.JS - Utilitário para popular selects com opções dinâmicas
 */

// Cache de opções para evitar múltiplas chamadas
let optionsCache = null;

/**
 * Carrega opções da API e popula os selects na página
 */
async function loadOptions() {
    try {
        // Se já temos cache, usar ele
        if (optionsCache) {
            populateSelects(optionsCache);
            return optionsCache;
        }

        // Carregar opções da API
        const options = await getOptions();
        optionsCache = options;
        populateSelects(options);
        return options;
    } catch (error) {
        console.error('Erro ao carregar opções:', error);
        // Usar valores padrão
        const defaultOptions = {
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
        populateSelects(defaultOptions);
        return defaultOptions;
    }
}

/**
 * Popula os selects na página com as opções carregadas
 */
function populateSelects(options) {
    const { categories, priorities, statuses } = options;

    // Popular selects de categoria
    const categorySelects = document.querySelectorAll('#category, #filterCategory, #filterType, #reportCategory');
    categorySelects.forEach(select => {
        if (!select) return;
        
        // Manter o valor atual se existir
        const currentValue = select.value;
        
        // Limpar opções existentes (exceto a primeira que é "Selecione" ou "Todas")
        const firstOption = select.options[0];
        select.innerHTML = '';
        if (firstOption && (firstOption.value === '' || firstOption.textContent.includes('Selecione') || firstOption.textContent.includes('Todas'))) {
            select.appendChild(firstOption);
        } else {
            // Adicionar opção padrão se não existir
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = select.id === 'category' ? 'Selecione uma categoria' : 'Todas';
            select.appendChild(defaultOption);
        }
        
        // Adicionar categorias
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
        });
        
        // Restaurar valor anterior se existir
        if (currentValue && Array.from(select.options).some(opt => opt.value === currentValue)) {
            select.value = currentValue;
        }
    });

    // Popular selects de prioridade
    const prioritySelects = document.querySelectorAll('#priority, #filterPriority, #filterSeverity, #updatePriority');
    prioritySelects.forEach(select => {
        if (!select) return;
        
        const currentValue = select.value;
        const firstOption = select.options[0];
        select.innerHTML = '';
        if (firstOption && (firstOption.value === '' || firstOption.textContent.includes('Selecione') || firstOption.textContent.includes('Todas'))) {
            select.appendChild(firstOption);
        } else {
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = select.id === 'priority' || select.id === 'updatePriority' ? 'Selecione prioridade' : 'Todas';
            select.appendChild(defaultOption);
        }
        
        priorities.forEach(priority => {
            const option = document.createElement('option');
            option.value = priority;
            option.textContent = priority;
            select.appendChild(option);
        });
        
        if (currentValue && Array.from(select.options).some(opt => opt.value === currentValue)) {
            select.value = currentValue;
        }
    });

    // Popular selects de status
    const statusSelects = document.querySelectorAll('#filterStatus, #updateStatus');
    statusSelects.forEach(select => {
        if (!select) return;
        
        const currentValue = select.value;
        const firstOption = select.options[0];
        select.innerHTML = '';
        if (firstOption && (firstOption.value === '' || firstOption.textContent.includes('Selecione') || firstOption.textContent.includes('Todas'))) {
            select.appendChild(firstOption);
        } else {
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = select.id === 'updateStatus' ? 'Selecionar...' : 'Todos';
            select.appendChild(defaultOption);
        }
        
        statuses.forEach(status => {
            const option = document.createElement('option');
            option.value = status;
            option.textContent = status;
            select.appendChild(option);
        });
        
        if (currentValue && Array.from(select.options).some(opt => opt.value === currentValue)) {
            select.value = currentValue;
        }
    });
}

/**
 * Limpa o cache de opções (útil quando se adiciona nova categoria, etc.)
 */
function clearOptionsCache() {
    optionsCache = null;
}

