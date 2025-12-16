# 🎤 RSG Platform

**The Ultimate Underground Hub for Hip-Hop, Rappers & Streetwear Culture**

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

---

## 🌟 Overview

RSG Platform is a full-stack web application designed for the hip-hop community - rappers, producers, beatmakers, and streetwear enthusiasts. Built with a dark navy and neon green aesthetic that embodies the underground culture.

### ✨ Features

- 🎵 **Beat Marketplace** - Upload, share, and sell beats
- 🎤 **Artist Profiles** - Showcase your work and build your brand
- 👥 **Community Hub** - Connect with fellow artists and producers
- 📊 **Analytics Dashboard** - Track plays, downloads, and engagement
- 🔐 **Secure Authentication** - User registration and login
- 🎨 **Dark Theme** - Navy and neon green underground aesthetic
- 📱 **Responsive Design** - Works on all devices

---

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- HTML5, CSS3, JavaScript (Vanilla)
- Font Awesome Icons
- Google Fonts (Bebas Neue, Inter)

**Backend:**
- Node.js 18+
- Express.js
- PostgreSQL (Azure Flexible Server)
- Session Management (express-session)
- bcrypt for password hashing

**Infrastructure:**
- Azure App Service (Linux)
- Azure PostgreSQL Flexible Server
- Vercel (Alternative deployment)
- Terraform for Infrastructure as Code

**CI/CD:**
- GitHub Actions
- Automated testing and deployment

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or Azure)
- Azure CLI (for Azure deployment)
- Terraform (for infrastructure provisioning)

### Local Development

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/azure-rsg.git
cd azure-rsg
```

2. **Set up environment variables:**
```bash
cp .env.template .env
# Edit .env with your configuration
```

3. **Install dependencies:**
```bash
cd app
npm install
```

4. **Initialize database:**
```bash
npm run migrate
```

5. **Start development server:**
```bash
npm run dev
```

6. **Access the application:**
```
http://localhost:3000
```

---

## 📦 Project Structure

```
azure-rsg/
├── app/                        # Application code
│   ├── config/                # Configuration files
│   │   └── database.js        # PostgreSQL connection
│   ├── routes/                # API routes
│   │   ├── auth.js           # Authentication endpoints
│   │   ├── beats.js          # Beat management
│   │   ├── content.js        # Content management
│   │   └── health.js         # Health check
│   ├── public/                # Frontend assets
│   │   ├── index.html        # Landing page
│   │   ├── dashboard.html    # User dashboard
│   │   ├── login.html        # Login page
│   │   └── register.html     # Registration page
│   ├── utils/                 # Utility functions
│   │   └── db-init.js        # Database initialization
│   ├── app.js                # Express app configuration
│   ├── server.js             # Server entry point
│   └── package.json          # Dependencies
│
├── infra/                     # Terraform infrastructure
│   ├── main.tf               # Main Terraform config
│   ├── variables.tf          # Variable definitions
│   ├── outputs.tf            # Output values
│   └── terraform.tfvars.example
│
├── api/                       # Vercel serverless functions
│   └── migrate.js            # Database migration endpoint
│
├── .github/workflows/         # CI/CD pipelines
│   ├── ci.yml                # Tests and linting
│   ├── vercel-deploy.yml     # Vercel deployment
│   └── azure-infrastructure.yml # Azure deployment
│
├── .env.template             # Environment variables template
├── .gitignore               # Git ignore rules
├── vercel.json              # Vercel configuration
├── package.json             # Root package config
└── README.md                # This file
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Application
NODE_ENV=development
PORT=3000

# Database (Azure PostgreSQL)
DATABASE_URL=postgresql://username:password@hostname:5432/database_name
DATABASE_HOST=your-postgres.postgres.database.azure.com
DATABASE_PORT=5432
DATABASE_NAME=rsg_db
DATABASE_USER=rsgadmin
DATABASE_PASSWORD=your_secure_password
DATABASE_SSL=true

# Session
SESSION_SECRET=your-random-secret-key

# Azure (for deployment)
AZURE_SUBSCRIPTION_ID=your-subscription-id
AZURE_RESOURCE_GROUP=rsg-platform-rg
AZURE_LOCATION=westus2
```

---

## 🌐 Deployment

### Option 1: Deploy to Vercel

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Deploy:**
```bash
vercel --prod
```

4. **Set up environment variables in Vercel dashboard**

### Option 2: Deploy to Azure

1. **Initialize Terraform:**
```bash
cd infra
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
terraform init
```

2. **Plan infrastructure:**
```bash
terraform plan
```

3. **Apply infrastructure:**
```bash
terraform apply
```

4. **Deploy application:**
```bash
# Use GitHub Actions or Azure CLI
az webapp up --name rsg-platform-app --resource-group rsg-platform-rg
```

---

## 🧪 Testing

```bash
cd app

# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Beats
- `GET /api/beats` - List all beats
- `GET /api/beats/:id` - Get beat by ID
- `POST /api/beats` - Create new beat
- `POST /api/beats/:id/play` - Increment play count
- `POST /api/beats/:id/like` - Like a beat
- `DELETE /api/beats/:id` - Delete beat

### Content
- `GET /api/content` - List all content
- `GET /api/content/:id` - Get content by ID
- `POST /api/content` - Create new content
- `PUT /api/content/:id` - Update content
- `DELETE /api/content/:id` - Delete content
- `POST /api/content/:id/like` - Like content

### Health
- `GET /health` - Application health check
- `GET /api/health` - Detailed health status

---

## 🎨 Design System

### Color Palette

```css
/* Primary Colors */
--rsg-navy: #0A1628;          /* Main background */
--rsg-navy-light: #1a2942;    /* Cards and surfaces */
--rsg-navy-dark: #050B14;     /* Deep backgrounds */
--rsg-green: #39FF14;         /* Primary accent - Neon green */
--rsg-green-dark: #2BCC10;    /* Hover states */

/* Accent Colors */
--rsg-purple: #9D4EDD;        /* Secondary accent */
--rsg-red: #FF006E;           /* Error/Alert */
--rsg-gold: #FFD700;          /* Premium features */

/* Text Colors */
--text-primary: #FFFFFF;      /* Primary text */
--text-secondary: #B0B0B0;    /* Secondary text */
--text-muted: #666666;        /* Muted text */
```

### Typography

- **Headings:** Bebas Neue (Bold, uppercase)
- **Body:** Inter (Regular, 400-700 weights)

---

## 🔒 Security

- **Password Hashing:** bcrypt with salt rounds
- **Session Management:** Secure HTTP-only cookies
- **HTTPS Enforcement:** Production environment
- **SQL Injection Protection:** Parameterized queries
- **CORS Configuration:** Restricted origins
- **Rate Limiting:** API endpoint protection
- **Helmet.js:** Security headers

---

## 📈 Monitoring

### Application Insights (Azure)

Terraform automatically provisions Azure Application Insights for:
- Performance monitoring
- Error tracking
- Usage analytics
- Custom metrics

Access insights in Azure Portal or integrate with your monitoring tools.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🆘 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact: support@rsg-platform.com
- Discord: [Join our community](#)

---

## 🎯 Roadmap

- [ ] Real-time collaboration features
- [ ] Beat download and payment integration
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] AI-powered beat recommendations
- [ ] Live streaming integration
- [ ] Merchandise store
- [ ] NFT integration for exclusive beats

---

## 🙏 Acknowledgments

- Inspired by the underground hip-hop and streetwear culture
- Design influenced by modern trap and drill aesthetics
- Built for artists, by developers who love hip-hop

---

<div align="center">

**🎤 Keep it underground. Keep it real. RSG Platform. 🎤**

[Website](#) • [Documentation](#) • [API](#) • [Community](#)

</div>
