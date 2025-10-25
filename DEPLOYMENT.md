# Deploying RealSync to Vercel

## Quick Deploy (Frontend Only)

Since we have a full-stack application, we'll deploy the frontend to Vercel first for preview.

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy from the frontend directory**
```bash
cd "Realsync App V1/frontend/web"
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name: **realsync** (or your preferred name)
- In which directory is your code located? **./** (current directory)
- Want to override settings? **N**

4. **Deploy to Production**
```bash
vercel --prod
```

### Option 2: Deploy via GitHub + Vercel Dashboard

1. **Create GitHub Repository**
```bash
# From the project root
cd "/Users/alonsoincaroca/Realsync App V1"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/realsync.git
git branch -M main
git push -u origin main
```

2. **Import to Vercel**
- Go to https://vercel.com/new
- Import your GitHub repository
- Configure project:
  - **Framework Preset**: Vite
  - **Root Directory**: `frontend/web`
  - **Build Command**: `npm run build`
  - **Output Directory**: `dist`
  - **Install Command**: `npm install`

3. **Click Deploy**

### Environment Variables (Vercel Dashboard)

Since the backend is not deployed yet, the app will run in **demo mode**. Set these in Vercel:

```
VITE_API_URL=https://demo-api.realsync.pe/api/v1
VITE_ENV=production
```

For now, the frontend will work without a backend - you can navigate the UI.

## Full Stack Deployment (Future)

### Backend Deployment Options:

1. **Railway.app** (Recommended for microservices)
   - Supports Docker
   - PostgreSQL included
   - Easy scaling

2. **Render.com**
   - Free tier available
   - Supports Docker
   - PostgreSQL included

3. **AWS ECS/Fargate**
   - Production-grade
   - Fully managed
   - More complex setup

4. **DigitalOcean App Platform**
   - Simple deployment
   - Docker support
   - PostgreSQL included

### Steps for Backend Deployment:

1. Deploy PostgreSQL database
2. Deploy Redis instance
3. Deploy each microservice
4. Update frontend `VITE_API_URL` to point to your backend

## Vercel-Specific Configuration

The following files are already configured:

- ✅ `frontend/web/vercel.json` - Routing & headers
- ✅ `frontend/web/.env.production` - Production env vars
- ✅ `frontend/web/vite.config.ts` - Build configuration

## Testing Your Deployment

After deployment:

1. **Visit your Vercel URL**: https://realsync-xxx.vercel.app
2. **Test the login page**: Should load without errors
3. **UI should be responsive**: Test on mobile

## Troubleshooting

### Build Errors

If you get build errors:

```bash
# Test build locally first
cd frontend/web
npm install
npm run build
```

### 404 on Routes

Already configured in `vercel.json` with rewrites to handle React Router.

### Missing Dependencies

Make sure `package.json` includes all dependencies. Already configured.

## Post-Deployment

After your first deployment:

1. **Custom Domain**: Add in Vercel dashboard
2. **Analytics**: Enable Vercel Analytics
3. **Preview Deployments**: Every git push creates a preview

## Next Steps

1. Deploy the frontend to get a preview URL
2. Share the preview with stakeholders
3. Set up backend infrastructure (Railway/Render)
4. Connect frontend to deployed backend
5. Add custom domain

---

**Your Vercel deployment is ready!** 🚀

Run `cd frontend/web && vercel` to deploy now.
