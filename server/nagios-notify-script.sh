#!/bin/bash
#
# NÃO IMPLEMENTADO!!
# motivo acabamos por não implementar o nagios pois tínhamos pontos mais importantes
# para focar no tempo disponível. Para engenharia de Software, decidimos focar em outras áreas

# Configurações
SISTEMA_URL="http://localhost:3001/api/nagios/webhook" 
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
