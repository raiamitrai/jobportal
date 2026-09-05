import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import https from 'https'
import querystring from 'querystring'
import fs from 'fs'
import path from 'path'

function githubOAuthPlugin() {
  return {
    name: 'github-oauth-handler',
    configureServer(server) {
      server.middlewares.use('/api/github-oauth', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method Not Allowed');
          return;
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const data = JSON.parse(body || '{}');
            const postData = JSON.stringify({
              client_id: data.client_id || data.clientId,
              client_secret: data.client_secret || data.clientSecret,
              code: data.code,
              redirect_uri: data.redirect_uri
            });

            const options = {
              hostname: 'github.com',
              port: 443,
              path: '/login/oauth/access_token',
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Careonix-Job-Portal/1.0',
                'Content-Length': Buffer.byteLength(postData)
              }
            };

            const ghReq = https.request(options, ghRes => {
              let responseBody = '';
              ghRes.on('data', chunk => { responseBody += chunk; });
              ghRes.on('end', () => {
                let parsedResponse;
                try {
                  parsedResponse = JSON.parse(responseBody);
                } catch (_) {
                  parsedResponse = querystring.parse(responseBody);
                }

                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.statusCode = 200;
                res.end(JSON.stringify(parsedResponse));
              });
            });

            ghReq.on('error', err => {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            });

            ghReq.write(postData);
            ghReq.end();
          } catch (e) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 400;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      });
    }
  };
}

function sharedDataPlugin() {
  const dataDir = path.resolve(__dirname, 'src/data');
  const jobsFilePath = path.join(dataDir, 'shared_jobs.json');
  const appsFilePath = path.join(dataDir, 'shared_applications.json');
  const messagesFilePath = path.join(dataDir, 'shared_messages.json');
  const plansFilePath = path.join(dataDir, 'shared_plans.json');
  const couponsFilePath = path.join(dataDir, 'shared_coupons.json');

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  return {
    name: 'shared-data-handler',
    configureServer(server) {
      // ── Shared Jobs ──
      server.middlewares.use('/api/shared-jobs', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end();
          return;
        }

        if (req.method === 'GET') {
          try {
            if (fs.existsSync(jobsFilePath)) {
              const content = fs.readFileSync(jobsFilePath, 'utf8');
              res.statusCode = 200;
              res.end(content || '[]');
            } else {
              res.statusCode = 200;
              res.end('[]');
            }
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const jobs = JSON.parse(body || '[]');
              fs.writeFileSync(jobsFilePath, JSON.stringify(jobs, null, 2), 'utf8');
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, count: jobs.length }));
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        res.statusCode = 405;
        res.end('Method Not Allowed');
      });

      // ── Shared Applications ──
      server.middlewares.use('/api/shared-applications', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end();
          return;
        }

        if (req.method === 'GET') {
          try {
            if (fs.existsSync(appsFilePath)) {
              const content = fs.readFileSync(appsFilePath, 'utf8');
              res.statusCode = 200;
              res.end(content || '[]');
            } else {
              res.statusCode = 200;
              res.end('[]');
            }
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const incomingApps = JSON.parse(body || '[]');
              let existingApps = [];
              if (fs.existsSync(appsFilePath)) {
                try {
                  existingApps = JSON.parse(fs.readFileSync(appsFilePath, 'utf8') || '[]');
                } catch (_) {}
              }
              const appMap = new Map();
              existingApps.forEach(a => {
                const key = `${(a.candidateEmail || a.email || '').toLowerCase().trim()}_${String(a.jobId || a.jobTitle || '').toLowerCase().trim()}`;
                appMap.set(key, a);
              });
              incomingApps.forEach(a => {
                const key = `${(a.candidateEmail || a.email || '').toLowerCase().trim()}_${String(a.jobId || a.jobTitle || '').toLowerCase().trim()}`;
                const ex = appMap.get(key);
                appMap.set(key, ex ? { ...ex, ...a } : a);
              });
              const mergedApps = Array.from(appMap.values());
              fs.writeFileSync(appsFilePath, JSON.stringify(mergedApps, null, 2), 'utf8');
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, count: mergedApps.length, applications: mergedApps }));
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        res.statusCode = 405;
        res.end('Method Not Allowed');
      });

      // ── Shared Chat Messages ──
      server.middlewares.use('/api/shared-messages', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end();
          return;
        }

        if (req.method === 'GET') {
          try {
            if (fs.existsSync(messagesFilePath)) {
              const content = fs.readFileSync(messagesFilePath, 'utf8');
              res.statusCode = 200;
              res.end(content || '[]');
            } else {
              res.statusCode = 200;
              res.end('[]');
            }
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const incomingThreads = JSON.parse(body || '[]');
              let existingThreads = [];
              if (fs.existsSync(messagesFilePath)) {
                try {
                  existingThreads = JSON.parse(fs.readFileSync(messagesFilePath, 'utf8') || '[]');
                } catch (_) {}
              }

              // Merge threads by id
              const threadMap = new Map();
              existingThreads.forEach(t => threadMap.set(t.id, t));
              incomingThreads.forEach(inT => {
                if (!threadMap.has(inT.id)) {
                  threadMap.set(inT.id, inT);
                } else {
                  const exT = threadMap.get(inT.id);
                  // Merge messages by id
                  const msgMap = new Map();
                  (exT.messages || []).forEach(m => msgMap.set(m.id, m));
                  (inT.messages || []).forEach(m => msgMap.set(m.id, m));
                  const mergedMessages = Array.from(msgMap.values()).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
                  threadMap.set(inT.id, {
                    ...exT,
                    ...inT,
                    messages: mergedMessages,
                    updatedAt: Math.max(exT.updatedAt || 0, inT.updatedAt || 0)
                  });
                }
              });

              const mergedList = Array.from(threadMap.values()).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
              fs.writeFileSync(messagesFilePath, JSON.stringify(mergedList, null, 2), 'utf8');
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, count: mergedList.length, threads: mergedList }));
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        res.statusCode = 405;
        res.end('Method Not Allowed');
      });

      // ── Shared Plans & Custom Pricing ──
      server.middlewares.use('/api/shared-plans', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end();
          return;
        }

        if (req.method === 'GET') {
          try {
            if (fs.existsSync(plansFilePath)) {
              const content = fs.readFileSync(plansFilePath, 'utf8');
              res.statusCode = 200;
              res.end(content || '{}');
            } else {
              res.statusCode = 200;
              res.end('{}');
            }
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const plans = JSON.parse(body || '{}');
              fs.writeFileSync(plansFilePath, JSON.stringify(plans, null, 2), 'utf8');
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true }));
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        res.statusCode = 405;
        res.end('Method Not Allowed');
      });

      // ── Shared Promo Coupons ──
      server.middlewares.use('/api/shared-coupons', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end();
          return;
        }

        if (req.method === 'GET') {
          try {
            if (fs.existsSync(couponsFilePath)) {
              const content = fs.readFileSync(couponsFilePath, 'utf8');
              res.statusCode = 200;
              res.end(content || '[]');
            } else {
              res.statusCode = 200;
              res.end('[]');
            }
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const coupons = JSON.parse(body || '[]');
              fs.writeFileSync(couponsFilePath, JSON.stringify(coupons, null, 2), 'utf8');
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, count: coupons.length }));
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        res.statusCode = 405;
        res.end('Method Not Allowed');
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  root: path.resolve(__dirname),
  publicDir: path.resolve(__dirname, 'public'),
  plugins: [react(), githubOAuthPlugin(), sharedDataPlugin()],
  server: {
    port: 3000,
    host: true
  }
})
