#!/bin/bash
#
# Script de Notificação Nagios para Integração com Sistema de Gestão de Incidentes
# 
# Uso: notify-incident.sh <host> <service> <status> <output>
#
# Este script converte alertas do Nagios em chamadas HTTP para o vosso sistema
# criando incidentes automaticamente
#
# Instalação:
# 1. Copiar para: /usr/local/nagios/libexec/notify-incident.sh
# 2. chmod +x /usr/local/nagios/libexec/notify-incident.sh
# 3. Configurar em Nagios:
#    - Definir contact notification command
#    - Testar com: service nagios4 restart
#

# Configurações
SISTEMA_URL="http://localhost:3001/api/nagios/webhook"  # Mudar para URL real
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Parâmetros
HOST=$1
SERVICE=$2
STATUS=$3
OUTPUT=$4

# Validação
if [ -z "$HOST" ] || [ -z "$SERVICE" ] || [ -z "$STATUS" ]; then
    echo "Uso: $0 <host> <service> <status> <output>"
    exit 1
fi

# Construir payload JSON
PAYLOAD=$(cat <<EOF
{
  "host": "$HOST",
  "service": "$SERVICE",
  "status": "$STATUS",
  "output": "$OUTPUT",
  "timestamp": "$TIMESTAMP"
}
EOF
)

# Log local (optional)
echo "[$TIMESTAMP] Nagios Alert: $HOST - $SERVICE ($STATUS)" >> /var/log/nagios/incidents.log

# Enviar para vosso sistema
curl -X POST \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  "$SISTEMA_URL" \
  2>/dev/null

exit 0
