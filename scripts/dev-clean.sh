#!/bin/bash
# Script para iniciar o servidor de desenvolvimento limpando a porta
# Uso: npm run dev:clean

echo "🔍 Verificando processos na porta 5176..."

# Encontrar processos usando a porta 5176
PID=$(lsof -ti:5176)

if [ ! -z "$PID" ]; then
    echo "⚠️  Encontrado(s) processo(s) usando a porta 5176"
    echo "   🛑 Matando processo(s) (PID: $PID)"
    kill -9 $PID
    echo "✅ Porta 5176 liberada!"
    sleep 1
else
    echo "✅ Porta 5176 já está livre"
fi

echo ""
echo "🚀 Iniciando servidor de desenvolvimento..."
echo ""

# Iniciar o servidor
npm run dev:skip-check

