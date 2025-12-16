terraform {
  required_version = ">= 1.0"
  
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }

  backend "azurerm" {
    resource_group_name  = "rsg-terraform-state-rg"
    storage_account_name = "rsgtfstate"
    container_name       = "tfstate"
    key                  = "rsg-platform.tfstate"
  }
}

provider "azurerm" {
  features {}
}

# Resource Group
resource "azurerm_resource_group" "rsg" {
  name     = var.resource_group_name
  location = var.location
  
  tags = {
    Environment = var.environment
    Project     = "RSG-Platform"
    ManagedBy   = "Terraform"
  }
}

# Virtual Network
resource "azurerm_virtual_network" "rsg" {
  name                = "${var.project_name}-vnet"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.rsg.location
  resource_group_name = azurerm_resource_group.rsg.name
  
  tags = azurerm_resource_group.rsg.tags
}

# Subnet for App Service
resource "azurerm_subnet" "app_service" {
  name                 = "${var.project_name}-app-subnet"
  resource_group_name  = azurerm_resource_group.rsg.name
  virtual_network_name = azurerm_virtual_network.rsg.name
  address_prefixes     = ["10.0.1.0/24"]

  delegation {
    name = "app-service-delegation"

    service_delegation {
      name    = "Microsoft.Web/serverFarms"
      actions = ["Microsoft.Network/virtualNetworks/subnets/action"]
    }
  }
}

# Subnet for PostgreSQL
resource "azurerm_subnet" "database" {
  name                 = "${var.project_name}-db-subnet"
  resource_group_name  = azurerm_resource_group.rsg.name
  virtual_network_name = azurerm_virtual_network.rsg.name
  address_prefixes     = ["10.0.2.0/24"]
  
  service_endpoints = ["Microsoft.Storage"]

  delegation {
    name = "postgres-delegation"

    service_delegation {
      name = "Microsoft.DBforPostgreSQL/flexibleServers"
      actions = [
        "Microsoft.Network/virtualNetworks/subnets/join/action",
      ]
    }
  }
}

# Private DNS Zone for PostgreSQL
resource "azurerm_private_dns_zone" "postgres" {
  name                = "${var.project_name}.postgres.database.azure.com"
  resource_group_name = azurerm_resource_group.rsg.name
  
  tags = azurerm_resource_group.rsg.tags
}

resource "azurerm_private_dns_zone_virtual_network_link" "postgres" {
  name                  = "${var.project_name}-postgres-vnet-link"
  private_dns_zone_name = azurerm_private_dns_zone.postgres.name
  virtual_network_id    = azurerm_virtual_network.rsg.id
  resource_group_name   = azurerm_resource_group.rsg.name
}

# PostgreSQL Flexible Server
resource "azurerm_postgresql_flexible_server" "rsg" {
  name                   = "${var.project_name}-postgres"
  resource_group_name    = azurerm_resource_group.rsg.name
  location               = azurerm_resource_group.rsg.location
  version                = "14"
  delegated_subnet_id    = azurerm_subnet.database.id
  private_dns_zone_id    = azurerm_private_dns_zone.postgres.id
  administrator_login    = var.db_admin_username
  administrator_password = var.db_admin_password
  zone                   = "1"

  storage_mb = 32768

  sku_name   = var.db_sku_name
  
  backup_retention_days = 7
  geo_redundant_backup_enabled = false

  tags = azurerm_resource_group.rsg.tags

  depends_on = [azurerm_private_dns_zone_virtual_network_link.postgres]
}

# PostgreSQL Database
resource "azurerm_postgresql_flexible_server_database" "rsg" {
  name      = var.database_name
  server_id = azurerm_postgresql_flexible_server.rsg.id
  collation = "en_US.utf8"
  charset   = "utf8"
}

# PostgreSQL Firewall Rule (for Azure Services)
resource "azurerm_postgresql_flexible_server_firewall_rule" "azure_services" {
  name             = "AllowAzureServices"
  server_id        = azurerm_postgresql_flexible_server.rsg.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# App Service Plan
resource "azurerm_service_plan" "rsg" {
  name                = "${var.project_name}-plan"
  resource_group_name = azurerm_resource_group.rsg.name
  location            = azurerm_resource_group.rsg.location
  os_type             = "Linux"
  sku_name            = var.app_service_sku

  tags = azurerm_resource_group.rsg.tags
}

# App Service (Web App)
resource "azurerm_linux_web_app" "rsg" {
  name                = "${var.project_name}-app"
  resource_group_name = azurerm_resource_group.rsg.name
  location            = azurerm_service_plan.rsg.location
  service_plan_id     = azurerm_service_plan.rsg.id

  site_config {
    always_on = var.environment == "production" ? true : false

    application_stack {
      node_version = "18-lts"
    }

    health_check_path = "/health"
  }

  app_settings = {
    "NODE_ENV"                      = var.environment
    "DATABASE_URL"                  = "postgresql://${var.db_admin_username}:${var.db_admin_password}@${azurerm_postgresql_flexible_server.rsg.fqdn}:5432/${var.database_name}?sslmode=require"
    "DATABASE_HOST"                 = azurerm_postgresql_flexible_server.rsg.fqdn
    "DATABASE_PORT"                 = "5432"
    "DATABASE_NAME"                 = var.database_name
    "DATABASE_USER"                 = var.db_admin_username
    "DATABASE_PASSWORD"             = var.db_admin_password
    "DATABASE_SSL"                  = "true"
    "SESSION_SECRET"                = var.session_secret
    "ENABLE_COLLABORATION"          = "true"
    "ENABLE_AUTHENTICATION"         = "true"
    "WEBSITES_PORT"                 = "3000"
    "WEBSITE_NODE_DEFAULT_VERSION"  = "18-lts"
  }

  https_only = true

  virtual_network_subnet_id = azurerm_subnet.app_service.id

  tags = azurerm_resource_group.rsg.tags
}

# Application Insights
resource "azurerm_application_insights" "rsg" {
  name                = "${var.project_name}-insights"
  location            = azurerm_resource_group.rsg.location
  resource_group_name = azurerm_resource_group.rsg.name
  application_type    = "Node.JS"

  tags = azurerm_resource_group.rsg.tags
}
