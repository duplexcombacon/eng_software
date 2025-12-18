# Guia de Testes

## Credenciais de Login

Utilizador: João Almeida - Gestor de IT
Email: joao.almeida@empresa.pt
Senha: senha123
Rol: gestor
Acesso: Dashboard com Relatórios e Métricas (MTTR, incidentes por tipo e categoria)

Utilizador: Marta Ferreira - Técnica de Suporte
Email: marta.ferreira@empresa.pt
Senha: senha123
Rol: tecnico
Acesso: Dashboard para registar e categorizar novos incidentes

Utilizador: Carlos Pinto - Administrador de Sistemas
Email: carlos.pinto@empresa.pt
Senha: senha123
Rol: sysadmin
Acesso: Dashboard com alertas de infraestrutura e incidentes críticos

## Base de Dados Temporária

Localização: data/ (pasta do projeto)

users.json contém 3 utilizadores de teste com informações pessoais e roles distintos.

incidents.json contém 6 incidentes de teste em vários estados (Aberto, Em Progresso, Escalado, Resolvido) com categorias variadas (Email, Hardware, Software, Infraestrutura, Redes) e métricas de MTTR, prioridades, status e impacto de utilizadores.

## Cenários de Teste

Cenário 1: João (Gestor) - Reunião de Segunda-Feira
Fazer login como joao.almeida@empresa.pt
Verificar dashboard com métrica MTTR igual a 2.5 horas, incidentes por categoria, prioridades críticas destacadas e filtros por período.

Cenário 2: Marta (Técnico) - O Telefone Toca
Fazer login como marta.ferreira@empresa.pt
Clicar em Novo Incidente
Preencher: Título (CRM Lento), Categoria (Software/CRM), Prioridade (Alta), Impacto (15 utilizadores)

Cenário 3: Carlos (SysAdmin) - Alerta Crítico na Infraestrutura
Fazer login como carlos.pinto@empresa.pt
Verificar dashboard com alertas críticos de infraestrutura, incidentes escalados e servidor BD com CPU 100%

## Armazenamento Local (localStorage)

Após login bem-sucedido, os dados são armazenados em localStorage com currentUser e userEmail (se "Lembrar-me" for marcado).

## Funções Disponíveis

Autenticação: getCurrentUser(), logout(), requireAuth(), hasRole(), hasAnyRole()

Dados: loadUsers(), loadIncidents()

Utilitários: formatDate(), getPriorityColor(), getStatusColor(), formatUserName(), getTimeAgo()

## Estrutura de Pastas

Pasta html contém index.html (Login), pasta static com css e js, pasta templates com dashboards e formulários.

Pasta data contém users.json e incidents.json.

## Nota Importante

Esta é uma base de dados temporária em JSON que será substituída por Firebase Firestore. Para resetar dados, eliminar localStorage no DevTools (F12 > Application > Storage).
