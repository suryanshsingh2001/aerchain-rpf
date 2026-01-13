#!/bin/bash

# ============================================
# RFP Backend - Complete Setup Script
# ============================================

set -e  # Exit on any error

echo "🚀 RFP Management System - Backend Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
echo "📦 Checking Docker..."
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}"

# Start PostgreSQL with Docker Compose
echo ""
echo "🐘 Starting PostgreSQL database..."
docker-compose up -d
echo -e "${GREEN}✓ PostgreSQL started on port 5432${NC}"
echo -e "${GREEN}✓ Adminer (DB UI) available at http://localhost:8080${NC}"

# Wait for PostgreSQL to be ready
echo ""
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 3

# Check if PostgreSQL is accepting connections
for i in {1..10}; do
    if docker exec local-postgres pg_isready -U postgres > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PostgreSQL is ready${NC}"
        break
    fi
    if [ $i -eq 10 ]; then
        echo -e "${RED}❌ PostgreSQL failed to start${NC}"
        exit 1
    fi
    echo "  Waiting... ($i/10)"
    sleep 2
done

# Check for .env file
echo ""
echo "🔧 Checking environment configuration..."
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠ .env file not found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠ Please edit .env and add your GEMINI_API_KEY${NC}"
fi
echo -e "${GREEN}✓ Environment file exists${NC}"

# Install dependencies if needed
echo ""
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Generate Prisma client
echo ""
echo "🔨 Generating Prisma client..."
npm run prisma:generate
echo -e "${GREEN}✓ Prisma client generated${NC}"

# Run database migrations
echo ""
echo "🗄️ Running database migrations..."
npm run prisma:migrate
echo -e "${GREEN}✓ Database migrations complete${NC}"

# Seed database
echo ""
echo "🌱 Seeding database with sample data..."
npx tsx prisma/seed.ts
echo -e "${GREEN}✓ Database seeded${NC}"

# Build TypeScript
echo ""
echo "🔨 Building TypeScript..."
npm run build
echo -e "${GREEN}✓ Build complete${NC}"

# Done!
echo ""
echo "=========================================="
echo -e "${GREEN}✅ Setup complete!${NC}"
echo "=========================================="
echo ""
echo "To start the development server:"
echo -e "  ${YELLOW}npm run dev${NC}"
echo ""
echo "API will be available at:"
echo "  http://localhost:3001"
echo ""
echo "Database admin (Adminer):"
echo "  http://localhost:8080"
echo "  System: PostgreSQL"
echo "  Server: postgres"
echo "  Username: postgres"
echo "  Password: postgres"
echo "  Database: rfp_db"
echo ""
echo "Quick test:"
echo "  curl http://localhost:3001/health"
echo ""
