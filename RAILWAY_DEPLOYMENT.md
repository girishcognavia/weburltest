# Railway Deployment Guide for CognaBot

This guide will help you deploy the CognaBot application to Railway.app.

## Prerequisites

- Railway account (sign up at https://railway.app)
- GitHub account with your code pushed to a repository
- Railway CLI (optional, for command-line deployment)

## Architecture

The application consists of two main services:
1. **Frontend** - React + Vite application (port 8080)
2. **Proxy Service** - Node.js/Express API (port 3000)
3. **Redis** - Railway Redis addon (optional, for caching)

## Deployment Steps

### Step 1: Create a New Railway Project

1. Go to https://railway.app and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository: `girishcognavia/weburltest`
5. Railway will automatically detect your services

### Step 2: Deploy Proxy Service

1. Railway will create a service for `services/proxy-service`
2. Configure the following environment variables:
   ```
   NODE_ENV=production
   PORT=3000
   REDIS_URL=${{Redis.REDIS_URL}}
   CACHE_TTL=300
   MAX_PROXY_TIMEOUT=10000
   REQUEST_SIZE_LIMIT=10mb
   RATE_LIMIT_PER_MINUTE=100
   ALLOWED_DOMAINS=*
   LOG_LEVEL=info
   ```

3. Set the **Root Directory** to: `services/proxy-service`
4. The Dockerfile will be automatically detected
5. Deploy the service
6. Once deployed, copy the public URL (e.g., `https://your-proxy-service.up.railway.app`)

### Step 3: Deploy Frontend Service

1. Add a new service for the frontend
2. Set the **Root Directory** to: `frontend`
3. Configure the following environment variables:
   ```
   VITE_PROXY_API_URL=https://your-proxy-service.up.railway.app
   ```
   (Replace with your actual proxy service URL from Step 2)

4. The Dockerfile will be automatically detected
5. Deploy the service
6. Once deployed, you'll get a public URL (e.g., `https://your-frontend.up.railway.app`)

### Step 4: Add Redis (Optional but Recommended)

1. In your Railway project, click "New"
2. Select "Database" → "Add Redis"
3. Railway will automatically provision Redis and create a `REDIS_URL` variable
4. The proxy service will automatically use `${{Redis.REDIS_URL}}`

### Step 5: Configure Custom Domain (Optional)

1. Go to your frontend service settings
2. Click on "Settings" → "Domains"
3. Add your custom domain
4. Update your DNS records as instructed by Railway

## Environment Variables Reference

### Proxy Service Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `production` | Yes |
| `PORT` | Server port | `3000` | Yes |
| `REDIS_URL` | Redis connection URL | - | Yes |
| `CACHE_TTL` | Cache time-to-live (seconds) | `300` | No |
| `MAX_PROXY_TIMEOUT` | Max proxy timeout (ms) | `10000` | No |
| `RATE_LIMIT_PER_MINUTE` | API rate limit | `100` | No |
| `ALLOWED_DOMAINS` | CORS allowed domains | `*` | No |
| `LOG_LEVEL` | Logging level | `info` | No |

### Frontend Environment Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `VITE_PROXY_API_URL` | Proxy service URL | `https://proxy.railway.app` | Yes |

## Dockerfile Configuration

### Frontend Dockerfile

The frontend uses a multi-stage Docker build:
- **Stage 1**: Build the React app with Node.js
- **Stage 2**: Serve static files with Nginx on port 8080

### Proxy Service Dockerfile

The proxy service uses a multi-stage Docker build:
- **Stage 1**: Build TypeScript to JavaScript
- **Stage 2**: Run the Node.js app with production dependencies

## Troubleshooting

### Build Failures

1. **Module not found errors**:
   - Ensure all dependencies are in `package.json`
   - Check that the root directory is set correctly

2. **Port binding issues**:
   - Railway automatically sets the `PORT` variable
   - Ensure your app listens on `process.env.PORT`

### Runtime Issues

1. **CORS errors**:
   - Check that `VITE_PROXY_API_URL` points to the correct proxy service URL
   - Verify CORS is configured in the proxy service

2. **Redis connection errors**:
   - Ensure Redis addon is provisioned
   - Check that `REDIS_URL` variable is set correctly

3. **Widget not loading**:
   - Verify the embed code uses the correct proxy service URL
   - Check browser console for errors

## Monitoring and Logs

- View logs in Railway dashboard under each service
- Use Railway's built-in metrics to monitor performance
- Set up alerts for service downtime

## Updating the Application

1. Push changes to your GitHub repository
2. Railway will automatically detect changes and redeploy
3. Or manually trigger a redeploy from the Railway dashboard

## Cost Considerations

- Railway offers a free tier with $5 credit per month
- Monitor your usage in the Railway dashboard
- Consider upgrading to a paid plan for production use

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: https://github.com/girishcognavia/weburltest/issues

## Next Steps

After deployment:
1. Test the application thoroughly
2. Update embed codes to use production URLs
3. Set up custom domain (optional)
4. Configure monitoring and alerts
5. Set up backups for Redis data (if critical)
