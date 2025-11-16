#!/bin/bash
# Script para matar APENAS processos Node.js
# Uso: npm run kill:node

echo "🛑 Matando todos os processos Node.js..."
echo ""

NODE_PIDS=$(pgrep -f node || true)

if [ ! -z "$NODE_PIDS" ]; then
    echo "   Encontrado(s) processo(s) Node.js"
    echo "$NODE_PIDS" | while read pid; do
        echo "   🛑 Matando: node (PID: $pid)"
        kill -9 $pid 2>/dev/null || true
    done
    echo ""
    echo "✅ Todos os processos Node.js foram finalizados!"
else
    echo "   ✓ Nenhum processo Node.js encontrado"
fi

echo ""

