.PHONY: help install dev start test lint clean deploy-vercel deploy-azure infra-plan infra-apply

# Default target
help:
	@echo "🎤 RSG Platform - Available Commands"
	@echo ""
	@echo "Development:"
	@echo "  make install        - Install all dependencies"
	@echo "  make dev           - Start development server"
	@echo "  make start         - Start production server"
	@echo "  make migrate       - Initialize database"
	@echo ""
	@echo "Testing & Quality:"
	@echo "  make test          - Run all tests"
	@echo "  make test-watch    - Run tests in watch mode"
	@echo "  make lint          - Run linter"
	@echo "  make lint-fix      - Fix linting issues"
	@echo ""
	@echo "Deployment:"
	@echo "  make deploy-vercel - Deploy to Vercel"
	@echo "  make deploy-azure  - Deploy to Azure"
	@echo ""
	@echo "Infrastructure:"
	@echo "  make infra-init    - Initialize Terraform"
	@echo "  make infra-plan    - Plan infrastructure changes"
	@echo "  make infra-apply   - Apply infrastructure changes"
	@echo "  make infra-destroy - Destroy infrastructure"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean         - Clean build artifacts"
	@echo "  make logs-azure    - Tail Azure App Service logs"

# Development
install:
	@echo "📦 Installing dependencies..."
	npm install
	cd app && npm install

dev:
	@echo "🚀 Starting development server..."
	cd app && npm run dev

start:
	@echo "🚀 Starting production server..."
	cd app && npm start

migrate:
	@echo "🗄️ Initializing database..."
	cd app && npm run migrate

# Testing
test:
	@echo "🧪 Running tests..."
	cd app && npm test

test-watch:
	@echo "🧪 Running tests in watch mode..."
	cd app && npm run test:watch

lint:
	@echo "🔍 Running linter..."
	cd app && npm run lint

lint-fix:
	@echo "🔧 Fixing linting issues..."
	cd app && npm run lint:fix

# Deployment
deploy-vercel:
	@echo "🌐 Deploying to Vercel..."
	vercel --prod

deploy-azure:
	@echo "☁️ Deploying to Azure..."
	cd app && az webapp up --name rsg-platform-app --resource-group rsg-platform-rg --runtime "NODE:18-lts"

# Infrastructure
infra-init:
	@echo "🏗️ Initializing Terraform..."
	cd infra && terraform init

infra-plan:
	@echo "📋 Planning infrastructure changes..."
	cd infra && terraform plan

infra-apply:
	@echo "✅ Applying infrastructure changes..."
	cd infra && terraform apply

infra-destroy:
	@echo "🗑️ Destroying infrastructure..."
	cd infra && terraform destroy

# Utilities
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf app/node_modules
	rm -rf node_modules
	rm -rf app/coverage
	rm -rf .vercel

logs-azure:
	@echo "📜 Tailing Azure logs..."
	az webapp log tail --name rsg-platform-app --resource-group rsg-platform-rg

# Database management
db-backup:
	@echo "💾 Creating database backup..."
	@if [ -z "$(DATABASE_URL)" ]; then \
		echo "❌ DATABASE_URL not set"; \
		exit 1; \
	fi
	pg_dump $(DATABASE_URL) > backup_$(shell date +%Y%m%d_%H%M%S).sql

db-restore:
	@echo "♻️ Restoring database..."
	@if [ -z "$(BACKUP_FILE)" ]; then \
		echo "❌ Usage: make db-restore BACKUP_FILE=backup.sql"; \
		exit 1; \
	fi
	psql $(DATABASE_URL) < $(BACKUP_FILE)

# Setup
setup-env:
	@echo "⚙️ Setting up environment..."
	@if [ ! -f .env ]; then \
		cp .env.template .env; \
		echo "✅ Created .env file. Please edit with your values."; \
	else \
		echo "⚠️ .env file already exists"; \
	fi

# Health check
health:
	@echo "🏥 Checking application health..."
	@curl -s http://localhost:3000/health | jq . || echo "❌ Server not responding"

# Docker (optional)
docker-build:
	@echo "🐳 Building Docker image..."
	docker build -t rsg-platform:latest -f Dockerfile .

docker-run:
	@echo "🐳 Running Docker container..."
	docker run -p 3000:3000 --env-file .env rsg-platform:latest

# CI/CD helpers
ci-test:
	@echo "🤖 Running CI tests..."
	cd app && npm ci && npm test

ci-lint:
	@echo "🤖 Running CI linter..."
	cd app && npm ci && npm run lint
