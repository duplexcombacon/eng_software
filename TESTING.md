# 🔐 Guia de Testes - Sistema de Gestão de Incidentes

## 📋 Credenciais de Login (Temporary Local Database)

### 1️⃣ João Almeida - Gestor de IT (Administrator)
- **Email:** `joao.almeida@empresa.pt`
- **Senha:** `senha123`
- **Rol:** `gestor`
- **Acesso:** Dashboard com Relatórios e Métricas (MTTR, incidentes por tipo/categoria)

### 2️⃣ Marta Ferreira - Técnica de Suporte (Helpdesk Nível 1)
- **Email:** `marta.ferreira@empresa.pt`
- **Senha:** `senha123`
- **Rol:** `tecnico`
- **Acesso:** Dashboard para registar e categorizar novos incidentes

### 3️⃣ Carlos Pinto - Administrador de Sistemas (SysAdmin)
- **Email:** `carlos.pinto@empresa.pt`
- **Senha:** `senha123`
- **Rol:** `sysadmin`
- **Acesso:** Dashboard com alertas de infraestrutura e incidentes críticos

---

## 📁 Base de Dados Temporária

### Localização:
```
c:\Users\rodri\OneDrive\Documentos\GitHub\eng_software\
├── data/
│   ├── users.json          # Utilizadores com credenciais
│   └── incidents.json      # Incidentes e métricas simuladas
```

### Dados Disponíveis:

#### **users.json**
- 3 utilizadores de teste
- Informações pessoais (nome, idade, objetivo, frustração)
- Roles distintos para cada persona

#### **incidents.json**
- 6 incidentes de teste (Aberto, Em Progresso, Escalado, Resolvido)
- Categorias: Email, Hardware, Software, Infraestrutura, Redes
- Métricas de MTTR, prioridades, status, impacto de utilizadores

---

## 🧪 Cenários de Teste

### Cenário 1: João (Gestor) - "A Reunião de Segunda-Feira"
1. Fazer login como `joao.almeida@empresa.pt`
2. Verificar dashboard com:
   - ✅ Métrica MTTR = 2.5 horas
   - ✅ Incidentes por categoria
   - ✅ Prioridades críticas destacadas
   - ✅ Filtros por período

### Cenário 2: Marta (Técnico) - "O Telefone Toca"
1. Fazer login como `marta.ferreira@empresa.pt`
2. Clicar em "Novo Incidente"
3. Preencher:
   - Título: "CRM Lento"
   - Categoria: "Software/CRM"
   - Prioridade: "Alta"
   - Impacto: 15 utilizadores

### Cenário 3: Carlos (SysAdmin) - "Alerta Crítico na Infraestrutura"
1. Fazer login como `carlos.pinto@empresa.pt`
2. Ver dashboard com:
   - ✅ Alertas críticos de infraestrutura
   - ✅ Incidentes escalados
   - ✅ Servidor BD com CPU 100%

---

## 🔄 Armazenamento Local (localStorage)

Após login bem-sucedido:
```json
{
  "currentUser": {
    "id": 1,
    "name": "João Almeida",
    "email": "joao.almeida@empresa.pt",
    "role": "gestor",
    "title": "Gestor de IT (Administrator)"
  },
  "userEmail": "joao.almeida@empresa.pt"  // Se "Lembrar-me" marcado
}
```

---

## 📝 Funções Disponíveis (main.js)

### Autenticação:
```javascript
getCurrentUser()          // Retorna dados do utilizador autenticado
logout()                  // Faz logout
requireAuth()             // Força autenticação
hasRole('gestor')         // Verifica se tem rol específico
hasAnyRole(['gestor', 'sysadmin'])  // Verifica múltiplos roles
```

### Dados:
```javascript
loadUsers()               // Carrega lista de utilizadores
loadIncidents()           // Carrega incidentes e métricas
```

### Utilitários:
```javascript
formatDate(dateStr)       // Formata data para PT
getPriorityColor(priority) // Retorna cor CSS da prioridade
getStatusColor(status)    // Retorna cor CSS do status
formatUserName(name, role) // Formata nome com rol
getTimeAgo(dateStr)       // Calcula "X dias atrás"
```

---

## 🚀 Próximos Passos

### Frontend:
- [ ] Criar dashboard para cada rol (gestor, tecnico, sysadmin)
- [ ] Implementar formulário de novo incidente
- [ ] Criar página de listar incidentes
- [ ] Implementar filtros e buscas

### Backend (Firebase):
- [ ] Configurar Firestore
- [ ] Implementar endpoints REST
- [ ] Migrar de localStorage para Firestore

---

## ⚙️ Estrutura de Pastas

```
eng_software/
├── html/
│   ├── index.html                  (Login)
│   ├── static/
│   │   ├── css/
│   │   │   ├── style.css          (Estilos globais)
│   │   │   ├── index.css          (Estilos do login)
│   │   │   ├── dashboard.css      (Estilos dashboard - criar)
│   │   │   └── register.css       (Estilos registo - criar)
│   │   └── js/
│   │       ├── main.js            (Funções globais)
│   │       └── dashboard.js       (Lógica dashboard - criar)
│   └── templates/
│       ├── dashboard.html         (Dashboard genérico - adaptar)
│       ├── incident-list.html     (Lista incidentes - criar)
│       └── register-incident.html (Novo incidente - criar)
├── data/
│   ├── users.json                 (Utilizadores locais)
│   └── incidents.json             (Incidentes locais)
└── README.md
```

---

## 📞 Suporte

**Nota:** Esta é uma base de dados **temporária em JSON**. Será substituída por **Firebase Firestore** quando estivermos prontos.

Para resetar dados, basta eliminar `localStorage` no DevTools (F12 > Application > Storage).
