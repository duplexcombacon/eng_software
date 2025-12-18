# Sistema de Gestão de Incidentes Corporativo

Sistema completo de gestão de incidentes desenvolvido em Node.js, Express, SQL Server e HTML/CSS/JavaScript vanilla.

## Índice

1. Features
2. Arquitetura
3. Requisitos
4. Instalação
5. Configuração
6. Uso
7. Roles e Permissões
8. API Endpoints
9. Estrutura do Projeto

## Features

### Implementadas (Sprint 4)

Dashboard com Gráficos (Chart.js). Gráficos de incidentes por prioridade, categoria e status. Evolução do MTTR (Mean Time To Resolution). Responsivos e interativos em todos os tamanhos de ecrã.

Sistema de Comentários. Adicionar, visualizar e eliminar comentários nos incidentes. Disponível para todas as roles (Gestor, Técnico, SysAdmin). Timestamps automáticos para cada comentário.

Validações Completas. Validação de email com regex. Comprimento mínimo e máximo de campos. Mensagens de erro específicas. Loading states nos formulários.

Autenticação e Autorização. JWT tokens para autenticação. Três roles distintos (Gestor, Técnico, SysAdmin). Permissões por role para acesso a funcionalidades.

Gestão de Incidentes. Criar, listar e atualizar incidentes. Categorização automática. Níveis de prioridade. Status de resolução.

## Arquitetura

Três componentes principais: Frontend em HTML/CSS/JavaScript Vanilla, Backend em Node.js com Express (Port 3001), Base de dados em SQL Server com tabelas de Users, Incidents e Comments.

## Requisitos

Node.js v14 ou superior. npm (geralmente vem com Node.js). SQL Server 2017 ou superior. Navegador moderno (Chrome, Firefox, Safari ou Edge).

## Instalação

Clonar o repositório:
git clone https://github.com/duplexcombacon/eng_software.git
cd eng_software

Instalar dependências:
npm install

Configurar variáveis de ambiente. Copiar .env.example para .env e preencher com dados:
PORT=3001
DB_USER=seu_usuario
DB_PASS=sua_password
DB_SERVER=localhost
DB_NAME=IncidentDB
JWT_SECRET=uma_chave_secreta_forte
JWT_EXPIRES=8h

Criar base de dados em SQL Server:
CREATE DATABASE IncidentDB;
USE IncidentDB;

Executar scripts SQL disponíveis no repositório para criar tabelas de Users, Incidents e Comments.

Iniciar o servidor:
npm start

O servidor estará disponível em http://localhost:3001

## Configuração

Variáveis de Ambiente necessárias no ficheiro .env:

PORT: Porta do servidor (padrão 3001)
DB_USER: Utilizador SQL Server
DB_PASS: Password SQL Server
DB_SERVER: Endereço do servidor SQL
DB_NAME: Nome da base de dados
JWT_SECRET: Chave secreta para JWT
JWT_EXPIRES: Tempo de expiração do token (padrão 8h)

Os passwords são hasheados com bcrypt. Use a página de registo para criar contas. Apenas admin pode criar novos utilizadores.

## Uso

Fazer login em http://localhost:3001/html/index.html com email e password criados.

Após login, será redirecionado para o dashboard correspondente ao seu role.

Para criar incidente (apenas Técnico ou SysAdmin): Clicar em "Registar Novo Incidente", preencher campos obrigatórios, clicar em "Registar Incidente".

Para adicionar comentário: Na tabela de incidentes, clicar numa linha para visualizar detalhes, escrever comentário na secção de comentários, clicar "Enviar".

Os gráficos aparecem automaticamente no dashboard e mostram estatísticas em tempo real.

## Roles e Permissões

Gestor: Ver dashboard, ver gráficos, editar incidente, atribuir técnico, escalar incidente, adicionar comentários, ver métricas.

Técnico: Ver dashboard, ver gráficos, criar incidente, editar incidente, escalar incidente, adicionar comentários, ver métricas.

SysAdmin: Ver dashboard, ver gráficos, criar incidente, editar incidente, atribuir técnico, escalar incidente, adicionar comentários, ver métricas.

## API Endpoints

Autenticação: POST /api/auth/login

Incidentes: GET /api/incidents, POST /api/incidents, PATCH /api/incidents/:id

Comentários: GET /api/incidents/:id/comments, POST /api/incidents/:id/comments, DELETE /api/incidents/:id/comments/:commentId

Métricas: GET /api/metrics/summary

## Estrutura do Projeto

Pasta server contém server.js (entrada), app.js (configuração Express), db.js (conexão SQL), middlewares (auth.js), routes (auth.js, incidents.js, comments.js, metrics.js, alerts.js).

Pasta html contém index.html (login), static (css e js), templates (dashboards e formulários).

Pasta data contém ficheiros JSON de exemplo (users.json, incidents.json).

## Notas Importantes

Nunca fazer commit de .env com dados sensíveis. Sempre validar dados no frontend e backend. Tokens JWT expiram em 8h por padrão. Passwords são hasheados com bcrypt e nunca armazenados em texto plano.

## Troubleshooting

Se faltar módulo mssql, executar: npm install mssql

Se houver erro na ligação à BD, verificar credenciais em .env, confirmar que SQL Server está ligado, testar conexão com SQL Server Management Studio.

Se erro ao fazer login, confirmar que utilizador existe na BD, verificar se JWT_SECRET está igual em .env.

## Desenvolvimento

Para adicionar nova rota: Criar ficheiro em server/routes/minha-rota.js, importar em server/app.js, adicionar middleware de autenticação se necessário.

Para adicionar novo dashboard: Criar ficheiro em html/templates/dashboard-novo.html, adicionar scripts necessários (main.js, dashboard.js), validar permissões no JavaScript.

## Última atualização

Dezembro 2025. Versão 1.0.0. Status: Em desenvolvimento (Sprint 4).
