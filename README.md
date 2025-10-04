# Website Preview System with Chatbot Overlay

A complete system that allows customers to see their website rendered in your application with a chatbot overlay for instant testing, bypassing iframe restrictions.

## 🎯 Features

- **Three rendering methods**: Reverse Proxy, Screenshot Fallback, and Browser Extension
- **Smart fallback logic**: Automatically switches methods when iframe blocking is detected
- **Split-screen preview**: Resizable interface with website preview and chat testing panel
- **Device preview modes**: Desktop, Tablet, and Mobile views
- **Real-time chat testing**: Test your chatbot on actual website content
- **Share preview links**: Generate temporary shareable URLs
- **Analytics tracking**: Response times, confidence scores, and user satisfaction

## 📦 Project Structure

```
.
├── services/
│   ├── proxy-service/       # Node.js reverse proxy with URL rewriting
│   ├── screenshot-service/  # Playwright screenshot generation service
│   └── api-service/         # FastAPI main API service
├── frontend/                # React frontend application
├── shared/                  # Shared utilities and types
├── plan.md                  # Implementation plan
└── tasks.md                 # Task breakdown
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- Python >= 3.9
- Redis
- Docker (optional)

### Installation

```bash
# Install dependencies
npm install

# Start all services in development mode
npm run dev
```

### Using Docker

```bash
# Build and start all services
npm run docker:build
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

## 🛠️ Development

### Running Individual Services

```bash
# Proxy service
npm run dev:proxy

# Screenshot service
npm run dev:screenshot

# API service
npm run dev:api

# Frontend
npm run dev:frontend
```

### Testing

```bash
npm test
```

### Building for Production

```bash
npm run build
```

## 📖 Documentation

- [Implementation Plan](plan.md)
- [Task Breakdown](tasks.md)
- [Architecture Documentation](docs/architecture.md) (Coming soon)
- [API Documentation](docs/api.md) (Coming soon)

## 🔒 Security

- URL validation and sanitization
- Rate limiting (100 requests/min per IP)
- Domain blacklist for sensitive sites
- No proxy for authentication pages
- Comprehensive input validation

## 📊 Success Metrics

- ✅ 80%+ website render success rate
- ✅ Preview loads in < 5 seconds
- ✅ Chatbot widget appears correctly
- ✅ Mobile preview works smoothly
- ✅ Zero critical security vulnerabilities

## 🤝 Contributing

See [tasks.md](tasks.md) for the current development roadmap.

## 📄 License

MIT

## 🙏 Acknowledgments

Built with ❤️ by Cognavia
