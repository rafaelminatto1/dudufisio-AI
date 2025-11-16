#!/bin/bash
# Script para matar todos os servidores de desenvolvimento
# Uso: npm run kill:servers

echo "🛑 Matando todos os servidores de desenvolvimento..."
echo ""

# Matar processos Node.js relacionados ao Vite
echo "🔍 Procurando processos Node.js..."
NODE_PIDS=$(pgrep -f "node.*vite" || true)

if [ ! -z "$NODE_PIDS" ]; then
    echo "   Encontrado(s) processo(s) Node.js"
    echo "$NODE_PIDS" | while read pid; do
        echo "   🛑 Matando: node (PID: $pid)"
        kill -9 $pid 2>/dev/null || true
    done
else
    echo "   ✓ Nenhum processo Node.js encontrado"
fi

# Matar processos em portas comuns do Vite
PORTS=(5176 5177 5178 5179 5180 3000 3001 3002 4173 4174)

echo ""
echo "🔍 Verificando portas..."

for port in "${PORTS[@]}"; do
    PID=$(lsof -ti:$port 2>/dev/null || true)
    
    if [ ! -z "$PID" ]; then
        echo "   🛑 Matando processo na porta $port (PID: $PID)"
        kill -9 $PID 2>/dev/null || true
    fi
done

echo ""
echo "✅ Todos os servidores foram finalizados!"
echo ""

