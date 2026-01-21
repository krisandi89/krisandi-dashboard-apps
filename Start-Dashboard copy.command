#!/bin/bash

# ========================================
# Krisandi Dashboard - Startup Script
# Double-click file ini untuk menyalakan localhost:3001
# ========================================

# Pindah ke directory project
cd "$(dirname "$0")"

# Warna untuk output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo "================================================"
echo "   🚀 KRISANDI DASHBOARD - STARTING SERVER"
echo "================================================"
echo ""

# Cek apakah port 3001 sudah digunakan
PORT_CHECK=$(lsof -i :3001 | grep LISTEN)
if [ -n "$PORT_CHECK" ]; then
    echo -e "${YELLOW}⚠️  Port 3001 sudah digunakan!${NC}"
    echo "   Menghentikan proses yang menggunakan port 3001..."
    lsof -ti :3001 | xargs kill -9 2>/dev/null
    sleep 1
    echo -e "${GREEN}✅ Port 3001 sudah dibersihkan${NC}"
    echo ""
fi

# Cek apakah node_modules ada
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
    echo ""
fi

echo -e "${GREEN}🌐 Starting server on http://localhost:3001${NC}"
echo ""
echo "   Tekan Ctrl+C untuk menghentikan server"
echo ""
echo "================================================"
echo ""

# Buka browser otomatis setelah 3 detik
(sleep 3 && open "http://localhost:3001") &

# Jalankan development server
npm run dev
