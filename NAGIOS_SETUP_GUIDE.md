# 🚀 GUIA PRÁTICO: Integração Nagios com Sistema de Incidentes

## ⚡ Quick Start (15 minutos)

### Passo 1: Ativar o Webhook no Backend (JÁ FEITO!)

✅ Endpoint criado: `POST /api/nagios/webhook`
✅ Route adicionada em `app.js`
✅ Testes implementados (16 testes passando)

**Verificar que está ativo:**
```bash
npm test # Deve passar 108 testes
curl -X POST http://localhost:3001/api/nagios/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "host": "TEST-SERVER",
    "service": "CPU",
    "status": "CRITICAL",
    "output": "CPU at 95%"
  }'
```

---

### Passo 2: Instalar Nagios Core (Linux/Ubuntu)

```bash
# Atualizar system
sudo apt-get update && sudo apt-get upgrade -y

# Instalar dependências
sudo apt-get install -y build-essential libgd-dev libmcrypt-dev libssl-dev libpng-dev apache2 apache2-utils

# Instalar Nagios Core (versão 4.5.5)
cd /tmp
wget https://assets.nagios.com/downloads/nagioscore/releases/nagios-4.5.5.tar.gz
tar xzf nagios-4.5.5.tar.gz
cd nagios-4.5.5

./configure --with-httpd-conf=/etc/apache2/sites-enabled
make all
sudo make install
sudo make install-init
sudo make install-config
sudo make install-webui

# Criar user
sudo useradd nagios
sudo usermod -a -G nagios www-data

# Start
sudo systemctl start nagios4
sudo systemctl enable nagios4
```

**Aceder a Nagios:**
- URL: `http://localhost/nagios4`
- Username: `nagiosadmin`
- Password: (solicitado durante instalação)

---

### Passo 3: Configurar Notificação Webhook

#### 3.1. Copiar Script de Notificação

```bash
sudo cp server/nagios-notify-script.sh /usr/local/nagios/libexec/notify-incident.sh
sudo chmod +x /usr/local/nagios/libexec/notify-incident.sh
sudo chown nagios:nagios /usr/local/nagios/libexec/notify-incident.sh
```

#### 3.2. Editar Arquivo de Configuração Nagios

```bash
sudo nano /etc/nagios4/objects/commands.cfg
```

Adicionar no final:

```cfg
# Custom command para webhook de incidentes
define command{
    command_name    notify-incident-by-webhook
    command_line    /usr/local/nagios/libexec/notify-incident.sh '$HOSTNAME$' '$SERVICEDESC$' '$SERVICESTATE$' '$SERVICEOUTPUT$'
}
```

#### 3.3. Criar Contact com Webhook

```bash
sudo nano /etc/nagios4/objects/contacts.cfg
```

Adicionar:

```cfg
define contact{
    contact_name                    webhook-receiver
    alias                           Webhook Receiver
    service_notification_period     24x7
    service_notification_options    w,u,c,r
    service_notification_commands   notify-incident-by-webhook
    host_notification_period        24x7
    host_notification_options       d,u,r
    host_notification_commands      notify-incident-by-webhook
}
```

#### 3.4. Criar Contact Group

```bash
sudo nano /etc/nagios4/objects/contactgroups.cfg
```

Adicionar:

```cfg
define contactgroup{
    contactgroup_name       webhook-group
    alias                   Webhook Group
    members                 webhook-receiver
}
```

---

### Passo 4: Configurar Hosts e Services para Monitorizar

```bash
sudo nano /etc/nagios4/objects/localhost.cfg
```

Exemplo de configuração (substituir localhost por servidores reais):

```cfg
# Define um Host
define host{
    use                     linux-server
    host_name               app-server-01
    alias                   Application Server 01
    address                 192.168.1.100
    contact_groups          webhook-group
}

# Define um Service (CPU)
define service{
    use                     local-service
    host_name               app-server-01
    service_description     CPU Load
    check_command           check_local_load!5.0,4.0!10.0,6.0
    contact_groups          webhook-group
}

# Define um Service (Disk)
define service{
    use                     local-service
    host_name               app-server-01
    service_description     Root Partition
    check_command           check_local_disk!20%!10%!/
    contact_groups          webhook-group
}

# Define um Service (Database)
define service{
    use                     local-service
    host_name               app-server-01
    service_description     MySQL Service
    check_command           check_tcp!3306
    contact_groups          webhook-group
}
```

---

### Passo 5: Validar Configuração

```bash
# Verificar sintaxe
sudo /usr/sbin/nagios4 -v /etc/nagios4/nagios.cfg

# Se tudo OK, restart
sudo systemctl restart nagios4
```

---

### Passo 6: Testar Integração

#### 6.1. Simulação Manual

```bash
# Enviar alerta crítico para vosso sistema
/usr/local/nagios/libexec/notify-incident.sh \
  "APP-SERVER-01" \
  "CPU Load" \
  "CRITICAL" \
  "CPU at 95%"
```

#### 6.2. Verificar Incidente Criado

```bash
# Aceder ao dashboard vosso
# Deve aparecer novo incidente: "CPU Load - APP-SERVER-01"
```

---

## 📊 Fluxo Completo de Teste

### Cenário: CPU Sobe para 95%

```
1. 12:00:00 - Nagios executa check_local_load
2. 12:00:05 - CPU > 90% detectado
3. 12:00:06 - Status muda para CRITICAL
4. 12:00:07 - Dispara notify-incident.sh
5. 12:00:08 - POST /api/nagios/webhook chamado
6. 12:00:09 - Incidente #1234 criado no banco
7. 12:00:10 - Atribuído ao SysAdmin (priority = Crítica)
8. 12:00:15 - Admin vê no dashboard
9. 12:05:00 - Admin reduz carga do servidor
10. 12:05:30 - CPU volta a 45%
11. 12:06:00 - Nagios detecta OK
12. 12:06:01 - Dispara webhook com status=OK
13. 12:06:02 - Incidente #1234 marcado como Resolvido
14. 12:06:03 - MTTR registado: 5 minutos 30 segundos
```

---

## 🔍 Troubleshooting

### Webhook não está sendo chamado

**Verificar logs:**
```bash
tail -f /var/log/nagios4/nagios.log
tail -f /var/log/nagios4/incidents.log
```

**Checklist:**
- [ ] Script `/usr/local/nagios/libexec/notify-incident.sh` existe?
- [ ] Tem permissões executáveis? (`chmod +x`)
- [ ] URL em SISTEMA_URL está correcta?
- [ ] Firewall permite saída HTTP/HTTPS?
- [ ] Contact tem notification_commands definido?

### Incidente não está sendo criado

**Verificar:**
```bash
# Verificar se endpoint está acessível
curl http://localhost:3001/api/nagios/webhook

# Ver logs do backend
tail -f /home/user/eng_software/server.log

# Verificar DB
SELECT * FROM Incidents WHERE category = 'Infraestrutura' ORDER BY createdAt DESC;
```

### Duplicação de incidentes

**Solução:** O sistema já verifica se existe incidente aberto para mesmo service/host
```javascript
// Verificado em nagios-webhook.js linha ~60
const existingIncident = await pool.request()...
```

---

## 📈 Monitorizar Incidentes Criados por Nagios

### Query SQL

```sql
-- Incidentes criados automaticamente pelo Nagios
SELECT 
    id,
    title,
    priority,
    status,
    createdAt,
    resolvedAt,
    DATEDIFF(HOUR, createdAt, ISNULL(resolvedAt, GETDATE())) AS mttr_hours
FROM Incidents
WHERE category = 'Infraestrutura'
AND description LIKE '%Nagios Alert%'
ORDER BY createdAt DESC;
```

### Dashboard Widget (Frontend)

```javascript
// Adicionar a dashboard-gestor.html
const nagiosIncidentsWidget = {
    title: "Alertas Nagios",
    total: incidentsFromNagios.length,
    critical: incidentsFromNagios.filter(i => i.priority === 'Crítica').length,
    resolved: incidentsFromNagios.filter(i => i.status === 'Resolvido').length,
    avgMTTR: calculateAverageMTTR(incidentsFromNagios)
};
```

---

## 🎓 Casos de Uso Avançados

### 1. Auto-Assign por Type de Alerta

```javascript
// Em nagios-webhook.js
const assignmentRules = {
  'CPU Load': 'sysadmin',
  'Disk Space': 'sysadmin',
  'Database': 'dba',
  'Web Service': 'tecnico'
};
```

### 2. Correlação de Múltiplos Alertas

```javascript
// Se 3+ serviços down no mesmo host → escalate para gestor
if (relatedAlerts.length >= 3) {
  assignToGestor = true;
}
```

### 3. Supressão de Alertas Ruidosos

```javascript
// Não criar novo incidente se houver 1 aberto há menos de 5 minutos
const recentIncident = await pool.request()...
  .query(`
    SELECT * FROM Incidents 
    WHERE createdAt > DATEADD(minute, -5, GETDATE())
  `);
```

---

## ✅ Checklist de Implementação

- [ ] Endpoint `/api/nagios/webhook` funcionando
- [ ] Testes unitários passando (108/108)
- [ ] Nagios Core instalado e running
- [ ] Script de notificação copiado e permissões OK
- [ ] Configuração Nagios validada (nagios -v)
- [ ] Contact/ContactGroup criados
- [ ] Hosts e Services configurados
- [ ] Webhook testado manualmente
- [ ] Incidentes criados no dashboard
- [ ] Recovery alerts fecham incidentes
- [ ] SLA/MTTR sendo calculado
- [ ] Documentação completa

---

## 🚀 Próximos Passos

**Sprint 5 (Recomendado):**
1. ✅ Webhook implementado
2. [ ] Escalação inteligente
3. [ ] Correlation engine
4. [ ] Custom dashboards Nagios
5. [ ] Integration tests

**Sprint 6 (Avançado):**
1. [ ] Socket.io real-time updates
2. [ ] Webhook bidirectional (vosso sistema → Nagios)
3. [ ] Custom metrics
4. [ ] BI/Analytics

---

**Sugestão:** Demonstre isto no professor! 🎯 
- Mostrar webhook a receber alertas
- Dashboard a atualizar em tempo real
- Correlação de múltiplos alerts
- MTTR calculado automaticamente

Este é o tipo de integração que impressiona! 🚀
