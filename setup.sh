#!/bin/bash

# 🎤 RSG Platform - Quick Setup Script
# This script helps you set up the RSG Platform quickly

set -e

echo "🎤 RSG Platform - Quick Setup"
echo "=============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version) detected${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm $(npm --version) detected${NC}"
echo ""

# Setup environment variables
if [ ! -f .env ]; then
    echo "⚙️  Setting up environment variables..."
    cp .env.template .env
    echo -e "${YELLOW}📝 Please edit .env file with your database credentials${NC}"
    echo ""
else
    echo -e "${YELLOW}⚠️  .env file already exists, skipping...${NC}"
    echo ""
fi

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install
echo ""

# Install app dependencies
echo "📦 Installing app dependencies..."
cd app
npm install
cd ..
echo ""

# Ask if user wants to initialize the database
echo "Would you like to initialize the database? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "🗄️  Initializing database..."
    echo "Make sure your DATABASE_URL is set in .env"
    cd app
    npm run migrate || echo -e "${YELLOW}⚠️  Database migration failed. Make sure your database is running.${NC}"
    cd ..
    echo ""
fi

# Ask if user wants to start the development server
echo "Would you like to start the development server? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo ""
    echo "🚀 Starting development server..."
    echo ""
    echo "╔═══════════════════════════════════════════════╗"
    echo "║                                               ║"
    echo "║   🎤 RSG PLATFORM - Development Server       ║"
    echo "║                                               ║"
    echo "║   Server will start on:                      ║"
    echo "║   🌐 http://localhost:3000                    ║"
    echo "║                                               ║"
    echo "║   Press Ctrl+C to stop the server            ║"
    echo "║                                               ║"
    echo "╚═══════════════════════════════════════════════╝"
    echo ""
    cd app
    npm run dev
else
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Edit .env file with your database credentials"
    echo "2. Run: cd app && npm run dev"
    echo "3. Open: http://localhost:3000"
    echo ""
    echo "For more information, see README.md"
    echo ""
fi
