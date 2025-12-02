# 🚨 Sistema de Gestão de Incidentes Corporativo

Um sistema completo de gestão de incidentes desenvolvido em **Node.js**, **Express**, **SQL Server** e **HTML/CSS/JavaScript vanilla**.

---

## 📋 Índice

- [Features](#features)
- [Arquitetura](#arquitetura)
- [Requisitos](#requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Como Usar](#como-usar)
- [Roles e Permissões](#roles-e-permissões)
- [API Endpoints](#api-endpoints)
- [Estrutura do Projeto](#estrutura-do-projeto)

---

## ✨ Features

### ✅ Implementadas (Sprint 4)

- **Dashboard com Gráficos** (Chart.js)
  - 📊 Gráficos de incidentes por prioridade, categoria, status
  - ⏳ Evolução do MTTR (Mean Time To Resolution)
  - 📈 Responsivos e interativos

- **Sistema de Comentários**
  - 💬 Adicionar, visualizar e eliminar comentários nos incidentes
  - 👥 Disponível para todas as roles (Gestor, Técnico, SysAdmin)
  - ⏱️ Timestamps automáticos

- **Validações Completas**
  - ✔️ Email validation (regex)
  - ✔️ Comprimento mínimo/máximo de campos
  - ✔️ Mensagens de erro específicas
  - ✔️ Loading states nos formulários

- **Autenticação e Autorização**
  - 🔐 JWT tokens
  - 👤 3 roles distintos: Gestor, Técnico, SysAdmin
  - 🔒 Permissões por role

- **Gestão de Incidentes**
  - 📝 Criar, listar, atualizar incidentes
  - 🏷️ Categorização automática
  - 🚨 Níveis de prioridade
  - 📊 Status de resolução

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────┐
│                    Frontend                          │
│         (HTML/CSS/JavaScript Vanilla)               │
│   ├─ Login/Autenticação                             │
│   ├─ 3 Dashboards (Gestor, Técnico, SysAdmin)      │
│   ├─ Gestão de Incidentes                           │
│   └─ Sistema de Comentários                         │
└────────────────┬────────────────────────────────────┘
                 │ HTTP/REST
┌────────────────▼────────────────────────────────────┐
│                  Backend (Node.js)                   │
│           ├─ Express Server (Port 3001)             │
│           ├─ Rotas (Auth, Incidents, Metrics)      │
│           ├─ Middleware (Auth JWT)                  │
│           └─ Database Connection Pool               │
└────────────────┬────────────────────────────────────┘
                 │ ODBC
┌────────────────▼────────────────────────────────────┐
│            Database (SQL Server)                     │
│      ├─ Users (autenticação)                        │
│      ├─ Incidents (gestão)                          │
│      └─ Comments (notas)                            │
└─────────────────────────────────────────────────────┘
```

---

## 📦 Requisitos

- **Node.js** v14+ 
- **npm** (geralmente vem com Node.js)
- **SQL Server** 2017+ (ou Azure SQL)
- **Navegador moderno** (Chrome, Firefox, Safari, Edge)

---

## 🚀 Instalação

### 1. Clonar o repositório
```bash
git clone https://github.com/duplexcombacon/eng_software.git
cd eng_software
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
Copia o arquivo `.env.example` para `.env` e preenche com os teus dados:
```bash
cp .env.example .env
```

Edita `.env` com as credenciais do SQL Server:
```
PORT=3001
DB_USER=seu_usuario
DB_PASS=sua_password
DB_SERVER=localhost
DB_NAME=IncidentDB
JWT_SECRET=uma_chave_secreta_forte
JWT_EXPIRES=8h
```

### 4. Configurar Base de Dados

**a) Criar a base de dados (SQL Server):**
```sql
CREATE DATABASE IncidentDB;
USE IncidentDB;
```

**b) Executar scripts SQL:**
- Criar tabelas: Executa o script de schema (com Users, Incidents)
- Criar tabela de Comments: `COMMENTS_TABLE.sql`

### 5. Iniciar o servidor
```bash
npm start
```

O servidor vai estar disponível em: `http://localhost:3001`

---

## ⚙️ Configuração

### Variáveis de Ambiente (.env)

```
# Servidor
PORT=3001

# Database
DB_USER=incident_user
DB_PASS=Incident123!
DB_SERVER=localhost
DB_NAME=IncidentDB

# JWT
JWT_SECRET=umaCoisaBemSecreta123
JWT_EXPIRES=8h
```

### Criar Utilizadores (SQL Server)

```sql
USE IncidentDB;

INSERT INTO Users (name, email, passwordHash, role, title)
VALUES 
  ('João Gestor', 'joao@empresa.pt', 'hash_aqui', 'gestor', 'Gestor de Incidentes'),
  ('Maria Técnico', 'maria@empresa.pt', 'hash_aqui', 'tecnico', 'Técnico de Suporte'),
  ('Admin SysAdmin', 'admin@empresa.pt', 'hash_aqui', 'sysadmin', 'Administrador');
```

> **Nota:** Os passwords são hasheados com bcrypt. Use a página de registo para criar contas (apenas admin pode criar).

---

## 👥 Roles e Permissões

| Feature | Gestor | Técnico | SysAdmin |
|---------|--------|---------|----------|
| Ver Dashboard | ✅ | ✅ | ✅ |
| Ver Gráficos | ✅ | ✅ | ✅ |
| Criar Incidente | ❌ | ✅ | ✅ |
| Editar Incidente | ✅ | ✅ | ✅ |
| Atribuir Técnico | ✅ | ❌ | ✅ |
| Escalar Incidente | ✅ | ✅ | ✅ |
| Adicionar Comentários | ✅ | ✅ | ✅ |
| Ver Métricas | ✅ | ✅ | ✅ |

---

## 🔌 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login de utilizador

### Incidentes
- `GET /api/incidents` - Listar incidentes
- `POST /api/incidents` - Criar novo incidente
- `PATCH /api/incidents/:id` - Atualizar incidente

### Comentários
- `GET /api/incidents/:id/comments` - Listar comentários
- `POST /api/incidents/:id/comments` - Adicionar comentário
- `DELETE /api/incidents/:id/comments/:commentId` - Eliminar comentário

### Métricas
- `GET /api/metrics/summary` - Resumo de métricas

---

## 📁 Estrutura do Projeto

```
eng_software/
├── README.md                          # Este arquivo
├── .env.example                       # Template de variáveis
├── package.json                       # Dependências Node
├── COMMENTS_TABLE.sql                 # Script para tabela de comentários
│
├── server/
│   ├── server.js                      # Entrada do servidor
│   ├── app.js                         # Configuração Express
│   ├── db.js                          # Conexão SQL Server
│   ├── generate-hash.js               # Gerador de hashes bcrypt
│   │
│   ├── middlewares/
│   │   └── auth.js                    # Middleware JWT
│   │
│   └── routes/
│       ├── auth.js                    # Rotas de autenticação
│       ├── incidents.js               # Rotas de incidentes
│       ├── comments.js                # Rotas de comentários
│       ├── alerts.js                  # Rotas de alertas
│       ├── metrics.js                 # Rotas de métricas
│       └── options.js                 # Rotas de opções
│
├── html/
│   ├── index.html                     # Página de login
│   ├── static/
│   │   ├── css/
│   │   │   ├── style.css              # Estilos globais
│   │   │   ├── index.css              # Estilos login
│   │   │   └── dashboard.css          # Estilos dashboards
│   │   └── js/
│   │       ├── main.js                # Funções globais
│   │       ├── api.js                 # Client API
│   │       ├── dashboard.js           # Lógica dashboards
│   │       └── options.js             # Opções dinâmicas
│   │
│   └── templates/
│       ├── register.html              # Registo de utilizadores
│       ├── dashboard-gestor.html      # Dashboard Gestor
│       ├── dashboard-tecnico.html     # Dashboard Técnico
│       ├── dashboard-sysadmin.html    # Dashboard SysAdmin
│       ├── incident-new.html          # Criar novo incidente
│       └── [outros templates]
│
└── data/
    ├── users.json                     # Dados de exemplo
    └── incidents.json                 # Dados de exemplo
```

---

## 🚀 Como Usar

### 1. Fazer Login
- Acede a `http://localhost:3001/html/index.html`
- Email: `joao@empresa.pt` (ou outro utilizador)
- Password: (conforme criado)

### 2. Ver Dashboard
- Após login, serás redirecionado para o dashboard correspondente ao teu role

### 3. Criar um Incidente (se és Técnico)
- Clica em "Registar Novo Incidente"
- Preenche os campos obrigatórios
- Clica "Registar Incidente"

### 4. Adicionar Comentário
- Na tabela de incidentes, clica numa linha
- Aparece a secção de comentários
- Escreve um comentário e clica "Enviar"

### 5. Ver Gráficos
- Os gráficos aparecem automaticamente no dashboard
- Mostram estatísticas em tempo real

---

## 🧪 Testes

Para executar testes (quando implementados):
```bash
npm test
```

---

## 📝 Notas Importantes

- ⚠️ **Nunca** commit `.env` com dados sensíveis
- ⚠️ **Sempre** valida dados no frontend E backend
- ⚠️ **Tokens JWT** expiram em 8h por padrão
- ⚠️ **Passwords** são hasheadas com bcrypt (nunca armazenar plain text)

---

## 🐛 Troubleshooting

### "Cannot find module 'mssql'"
```bash
npm install mssql
```

### "Erro na ligação à BD"
- Verifica `.env` (credenciais corretas?)
- Confirma que SQL Server está ligado
- Testa conexão com SQL Server Management Studio

### "Erro ao fazer login"
- Confirma que o utilizador existe na BD
- Verifica se o JWT_SECRET está igual no `.env`

---

## 👨‍💻 Desenvolvimento

### Para adicionar uma nova rota:
1. Cria ficheiro em `server/routes/minha-rota.js`
2. Importa em `server/app.js`
3. Adiciona middleware de autenticação se necessário

### Para adicionar um novo dashboard:
1. Cria `html/templates/dashboard-novo.html`
2. Adiciona scripts necessários (main.js, dashboard.js)
3. Valida permissões no JavaScript

---

## 📄 Licença

Este projeto é propriedade da empresa. Uso interno apenas.

---

## 📞 Suporte

Para dúvidas ou problemas, contacta o administrador do sistema.

---

**Última atualização:** Dezembro 2025  
**Versão:** 1.0.0  
**Status:** Em desenvolvimento (Sprint 4)
