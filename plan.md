# Website Preview System with Chatbot Overlay - Implementation Plan

## Phase 1: Project Setup & Infrastructure (Week 1) ✅ IN PROGRESS

### 1.1 Project Structure Setup ✅ COMPLETED
- ✅ Initialize monorepo structure with separate services
- ✅ Set up TypeScript configurations
- ⏳ Configure linting and formatting (ESLint, Prettier)
- ✅ Set up Git repository with proper .gitignore

### 1.2 Backend Foundation ✅ COMPLETED
- ✅ Initialize Node.js/Express proxy service
- ⏳ Initialize Python/FastAPI main API service
- ✅ Set up environment variable management
- ✅ Configure logging infrastructure (Winston)
- ✅ Set up error handling middleware

### 1.3 Database & Caching ✅ COMPLETED
- ✅ Set up Redis for caching and session management
- ✅ Configure Redis connection pooling
- ⏳ Set up database schemas for preview sessions
- ✅ Implement cache invalidation strategies

### 1.4 Development Environment ✅ COMPLETED
- ✅ Create Docker Compose for local development
- ⏳ Set up hot-reload for all services
- ✅ Configure CORS for local development
- ⏳ Set up API documentation (Swagger/OpenAPI)

## Phase 2: Proxy Service Implementation (Week 1-2) ✅ COMPLETED

### 2.1 Core Proxy Functionality ✅ COMPLETED
- ✅ Create `/api/proxy` endpoint
- ✅ Implement URL fetching with axios
- ✅ Add request timeout handling (10s)
- ✅ Implement basic error handling

### 2.2 HTML Processing ✅ COMPLETED
- ✅ Integrate Cheerio for HTML parsing
- ✅ Strip X-Frame-Options headers
- ✅ Strip Content-Security-Policy headers
- ✅ Remove frame-busting JavaScript patterns
- ✅ Implement URL rewriting for:
  - ✅ Absolute URLs
  - ✅ Relative URLs
  - ✅ Protocol-relative URLs
  - ✅ Data URIs
  - ✅ CSS background images
  - ✅ Inline styles

### 2.3 Chatbot Widget Injection
- Create widget injection logic
- Add frame-busting prevention code
- Configure widget with client_id and preview mode
- Position widget correctly in DOM

### 2.4 Security & Performance
- Implement URL validation
- Add domain blacklist for sensitive sites
- Set up rate limiting (10 req/min per IP)
- Implement response caching (5-10 min TTL)
- Add request logging
- Set security headers

### 2.5 Testing Proxy Service
- Test with WordPress sites
- Test with React/Vue SPAs
- Test with static HTML sites
- Test with e-commerce platforms
- Test frame-busting prevention
- Test URL rewriting edge cases

## Phase 3: Frontend Foundation (Week 2)

### 3.1 React Application Setup
- Initialize React app with Vite/Create React App
- Set up TailwindCSS
- Configure routing (React Router)
- Set up state management (Redux/Zustand)
- Configure API client (Axios/Fetch)

### 3.2 URL Input Interface
- Create URL input component
- Add real-time URL validation
- Implement device selector (Desktop/Tablet/Mobile)
- Add render method selector
- Create loading states with progress bar
- Add example URLs for demo

### 3.3 Split-Screen Layout
- Implement resizable split pane
- Create header with controls
- Add device preview frame
- Implement zoom controls
- Add fullscreen toggle
- Create refresh button

### 3.4 Basic Chat Interface
- Create chat message component
- Implement message input
- Add send message functionality
- Display message history
- Show typing indicator
- Add timestamps

## Phase 4: Backend API Endpoints (Week 2-3)

### 4.1 Preview Management API
- `POST /api/v1/preview/create`
  - Accept website URL and settings
  - Generate preview_id
  - Initialize preview session in Redis
  - Return preview metadata
- `GET /api/v1/preview/{preview_id}/status`
  - Return processing status
  - Show progress percentage
  - Return crawled page count
- `DELETE /api/v1/preview/{preview_id}`
  - Clean up preview session
  - Clear cached data

### 4.2 Render API
- `GET /api/v1/preview/{preview_id}/render`
  - Support method parameter (proxy/screenshot)
  - Return proxied HTML or screenshot
  - Handle errors gracefully
  - Implement fallback logic

### 4.3 Chat API Integration
- `POST /api/v1/preview/{preview_id}/chat`
  - Accept message and conversation_id
  - Connect to existing RAG backend
  - Return response with sources
  - Track response time
  - Store conversation history

### 4.4 Share & Collaboration
- `GET /api/v1/preview/{preview_id}/share`
  - Generate temporary shareable URL
  - Set 24-hour expiration
  - Create public access token
  - Return share link

## Phase 5: Screenshot Fallback Service (Week 3)

### 5.1 Playwright Integration
- Set up Playwright in separate service
- Configure headless browser
- Implement browser pool management
- Add timeout handling (30s)

### 5.2 Screenshot Generation
- Create `/api/screenshot` endpoint
- Implement page navigation
- Wait for network idle
- Inject chatbot widget before screenshot
- Take full-page screenshot
- Compress image (JPEG quality 85)

### 5.3 Screenshot Caching & Storage
- Implement 15-minute cache
- Store screenshots in memory/Redis
- Optional: Set up S3/CDN integration
- Add lazy loading

### 5.4 Queue Management
- Implement job queue (Bull/BullMQ)
- Set concurrency limits
- Add queue monitoring
- Implement retry logic

## Phase 6: Intelligent Fallback Logic (Week 3)

### 6.1 Fallback Strategy Implementation
- Try proxy method first
- Detect iframe blocking
- Detect timeout errors
- Automatically fallback to screenshot
- Log fallback reasons

### 6.2 Error Detection
- Detect CSP violations
- Detect X-Frame-Options blocks
- Detect CORS errors
- Detect timeouts
- Detect SSL errors

### 6.3 User-Friendly Error Messages
- Create error message templates
- Map error codes to user messages
- Provide actionable solutions
- Add "Continue anyway" options

## Phase 7: Advanced Frontend Features (Week 3-4)

### 7.1 Enhanced Chat Interface
- Add source citations display
- Show confidence scores
- Implement quick test questions
- Add clear history button
- Create export conversation feature
- Build analytics panel:
  - Response time tracking
  - Source count display
  - Satisfaction feedback (thumbs up/down)

### 7.2 Device Preview Modes
- Implement desktop view (1920x1080)
- Implement tablet view (768x1024)
- Implement mobile view (375x667)
- Add device frame visuals
- Handle viewport scaling

### 7.3 Interactive Controls
- Screenshot/record demo button
- Copy preview link button
- Open in new tab link
- Share preview button
- Device switcher
- Zoom in/out controls

### 7.4 Loading & Progress States
- Animated skeleton UI
- Multi-stage progress indicators:
  - "Fetching website..." (0-30%)
  - "Processing content..." (30-60%)
  - "Preparing preview..." (60-90%)
  - "Almost ready..." (90-100%)
- Estimated time remaining
- Cancel button

### 7.5 Mobile Responsive Design
- Stack layout for mobile
- Swipe between preview/chat
- Touch-optimized controls
- Responsive breakpoints

## Phase 8: Security Hardening (Week 4)

### 8.1 Input Validation
- URL format validation
- Whitelist/blacklist implementation
- Prevent SSRF attacks
- Sanitize all inputs

### 8.2 Rate Limiting
- Per-IP rate limiting
- Per-user rate limiting
- Preview creation limits (10/hour)
- Proxy request limits (100/min)

### 8.3 Security Headers
- Implement CSP headers
- Set CORS policies
- Add HSTS headers
- Configure X-Content-Type-Options

### 8.4 Request Size & Resource Limits
- Limit request body sizes
- Set memory limits
- Implement request timeouts
- Monitor resource usage

## Phase 9: Testing & Quality Assurance (Week 4)

### 9.1 Unit Tests
- Proxy service tests
- URL rewriting tests
- API endpoint tests
- Frontend component tests

### 9.2 Integration Tests
- End-to-end preview flow
- Fallback mechanism tests
- Chat integration tests
- Error handling tests

### 9.3 Load Testing
- 100 concurrent previews
- Rate limit verification
- Cache performance
- Memory leak detection

### 9.4 Cross-Browser Testing
- Chrome
- Firefox
- Safari
- Edge
- Mobile browsers

### 9.5 Website Compatibility Testing
- Test with 20+ diverse websites
- Document success rate
- Identify problematic patterns
- Adjust proxy logic accordingly

## Phase 10: Analytics & Monitoring (Week 4)

### 10.1 Logging Infrastructure
- Centralized logging
- Error tracking (Sentry)
- Performance monitoring
- Request/response logging

### 10.2 Analytics Tracking
- Preview creation events
- Render method usage
- Fallback frequency
- Chat interaction metrics
- User satisfaction scores

### 10.3 Monitoring Dashboards
- Service health checks
- Cache hit rates
- Response times
- Error rates
- Queue status

## Phase 11: Deployment & DevOps (Week 4)

### 11.1 Docker Configuration
- Create Dockerfile for proxy service
- Create Dockerfile for screenshot service
- Create Dockerfile for main API
- Create Dockerfile for frontend
- Set up multi-stage builds

### 11.2 Docker Compose
- Compose file for local development
- Compose file for production
- Network configuration
- Volume management
- Environment variable handling

### 11.3 CI/CD Pipeline
- Automated testing
- Build process
- Deployment automation
- Rollback procedures

### 11.4 Production Infrastructure
- Container orchestration (Kubernetes/ECS)
- Load balancing
- Auto-scaling configuration
- CDN setup for static assets
- Redis cluster setup

## Phase 12: Documentation (Week 4)

### 12.1 Technical Documentation
- Architecture overview
- API documentation
- Proxy server implementation details
- URL rewriting logic
- Security considerations
- Deployment guide
- Troubleshooting guide

### 12.2 User Documentation
- How to use preview mode
- Supported websites
- Troubleshooting common issues
- Best practices
- FAQ

### 12.3 Developer Documentation
- Setup instructions
- Development workflow
- Testing guidelines
- Contributing guide
- Code style guide

## Optional Phase 13: Browser Extension (Future Enhancement)

### 13.1 Chrome Extension
- Manifest V3 setup
- Content script for widget injection
- Background service worker
- Message passing architecture
- API integration

### 13.2 Extension Features
- One-click installation
- Auto-configuration with API key
- Preview badge
- Enable/disable toggle
- Settings popup

### 13.3 Extension Distribution
- Chrome Web Store submission
- Update mechanism
- Analytics integration

## Success Criteria

- ✅ 80%+ website render success rate
- ✅ Preview loads in < 5 seconds
- ✅ Chatbot widget appears correctly
- ✅ Chat responses work reliably
- ✅ Mobile preview works smoothly
- ✅ Fallback methods work automatically
- ✅ No critical security vulnerabilities
- ✅ Clear error messages for all failures
- ✅ Comprehensive test coverage (>80%)
- ✅ Production-ready documentation

## Risk Mitigation

### Technical Risks
- **Website compatibility issues**: Extensive testing + graceful fallbacks
- **Performance bottlenecks**: Caching, queue management, load testing
- **Security vulnerabilities**: Security audits, penetration testing
- **Frame-busting bypasses**: Multiple prevention strategies

### Operational Risks
- **High server costs**: Optimize caching, implement rate limiting
- **Scalability issues**: Design for horizontal scaling from day 1
- **Legal concerns**: Terms of service, acceptable use policy

## Timeline Summary

- **Week 1**: Infrastructure + Proxy Service
- **Week 2**: Frontend Foundation + API Endpoints
- **Week 3**: Screenshot Service + Fallback Logic + Advanced UI
- **Week 4**: Security + Testing + Deployment + Documentation

**Total Estimated Time**: 4 weeks for MVP

## Next Steps

1. Review and approve this plan
2. Set up project repository and infrastructure
3. Begin Phase 1 implementation
4. Daily standups to track progress
5. Weekly demos to stakeholders
6. Iterative testing and refinement
