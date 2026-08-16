import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'

// Middleware to mock Vercel serverless functions locally
const vercelMockPlugin = (env) => ({
  name: 'vercel-mock',
  configureServer(server) {
    // Inject loaded env into process.env for the backend mock
    Object.assign(process.env, env);
    
    server.middlewares.use('/api', async (req, res, next) => {
      try {
        const urlPath = req.originalUrl.split('?')[0]; // e.g., /api/policy-scan
        const filePath = path.resolve(__dirname, `.${urlPath}.js`);
        
        if (!fs.existsSync(filePath)) {
          return next();
        }

        // Polyfill Vercel res methods
        res.status = (code) => {
          res.statusCode = code;
          return res;
        };
        res.json = (data) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        };

        // Parse JSON body manually for local dev
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          await new Promise((resolve) => req.on('end', resolve));
          if (body) {
            try {
              req.body = JSON.parse(body);
            } catch(e) {}
          }
        }

        // Dynamically import the API route (bypass cache)
        const module = await import(pathToFileURL(filePath).href + '?t=' + Date.now());
        const handler = module.default;
        
        await handler(req, res);
      } catch (err) {
        console.error('API Mock Error:', err);
        if (!res.headersSent) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Internal Server Error' }));
        }
      }
    });
  }
});

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), vercelMockPlugin(env)],
  };
});
