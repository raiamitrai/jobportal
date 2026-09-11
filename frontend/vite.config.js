import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import https from 'https'
import crypto from 'crypto'
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

function loadRootEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  const env = {};
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        env[key] = val;
      }
    }
  }
  return env;
}

function razorpayPaymentPlugin() {
  return {
    name: 'razorpay-payment-handler',
    configureServer(server) {
      // ── Payments Config / Health Check ──
      server.middlewares.use('/payments/config', (req, res) => {
        const rootEnv = loadRootEnv();
        const keyId = rootEnv.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || '';
        const configured = !!keyId && !keyId.includes('YourKey');
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.statusCode = 200;
        res.end(JSON.stringify({ configured, keyId: configured ? keyId : '' }));
      });

      server.middlewares.use('/payments/health', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.statusCode = 200;
        res.end(JSON.stringify({ status: 'UP', service: 'razorpay-vite-dev-handler' }));
      });

      // ── Step 1: Create Order ──
      server.middlewares.use('/payments/create-order', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end();
          return;
        }

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const rootEnv = loadRootEnv();
            const keyId = rootEnv.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || '';
            const keySecret = rootEnv.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET || '';

            const data = JSON.parse(body || '{}');
            const amountInPaise = Math.round((Number(data.amount) || 49.99) * 100);
            const isConfigured = !!keyId && !keyId.includes('YourKey') && !!keySecret && !keySecret.includes('YourSecret');

            if (isConfigured) {
              // Call live Razorpay API to create official order
              const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
              const postData = JSON.stringify({
                amount: amountInPaise,
                currency: 'INR',
                receipt: `rcpt_${Date.now()}`,
                notes: {
                  plan_id: data.planId,
                  plan_name: data.planName,
                  recruiter_email: data.recruiterEmail
                }
              });

              const options = {
                hostname: 'api.razorpay.com',
                port: 443,
                path: '/v1/orders',
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': authHeader,
                  'Content-Length': Buffer.byteLength(postData)
                }
              };

              const rzpReq = https.request(options, rzpRes => {
                let responseBody = '';
                rzpRes.on('data', c => { responseBody += c; });
                rzpRes.on('end', () => {
                  try {
                    const rzpOrder = JSON.parse(responseBody);
                    if (rzpRes.statusCode >= 200 && rzpRes.statusCode < 300) {
                      res.statusCode = 200;
                      res.end(JSON.stringify({
                        orderId: rzpOrder.id,
                        amount: rzpOrder.amount,
                        currency: rzpOrder.currency || 'INR',
                        keyId: keyId
                      }));
                    } else {
                      res.statusCode = rzpRes.statusCode || 400;
                      res.end(JSON.stringify({
                        error: rzpOrder?.error?.description || 'Razorpay order creation failed',
                        detail: rzpOrder
                      }));
                    }
                  } catch (parseErr) {
                    res.statusCode = 500;
                    res.end(JSON.stringify({ error: parseErr.message }));
                  }
                });
              });

              rzpReq.on('error', err => {
                res.statusCode = 502;
                res.end(JSON.stringify({ error: `Failed to contact Razorpay: ${err.message}` }));
              });

              rzpReq.write(postData);
              rzpReq.end();
            } else {
              // Keys not configured yet
              res.statusCode = 400;
              res.end(JSON.stringify({
                error: 'Razorpay keys not configured in .env',
                detail: 'Please open .env and set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.'
              }));
            }
          } catch (e) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      });

      // ── Step 2: Verify Payment ──
      server.middlewares.use('/payments/verify', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end();
          return;
        }

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const rootEnv = loadRootEnv();
            const keySecret = rootEnv.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET || '';

            const data = JSON.parse(body || '{}');
            const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = data;

            if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Missing payment verification parameters' }));
              return;
            }

            // Verify HMAC SHA256 signature
            const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
            const expectedSignature = crypto
              .createHmac('sha256', keySecret)
              .update(payload)
              .digest('hex');

            if (expectedSignature !== razorpaySignature) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid payment signature' }));
              return;
            }

            // Valid signature! Return activated subscription payload
            const durationDays = Number(data.durationDays) || 30;
            const expiryDate = new Date(Date.now() + durationDays * 86400000).toISOString();

            res.statusCode = 200;
            res.end(JSON.stringify({
              active: true,
              planId: data.planId,
              planName: data.planName,
              durationDays: durationDays,
              amountPaid: data.amountPaid,
              maxJobPosts: data.maxJobPosts || 25,
              startDate: new Date().toISOString(),
              expiryDate: expiryDate,
              lastPaymentId: razorpayPaymentId
            }));
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      });
    }
  };
}

const rootEnv = loadRootEnv();

// https://vitejs.dev/config/
export default defineConfig({
  root: path.resolve(__dirname),
  publicDir: path.resolve(__dirname, 'public'),
  plugins: [react(), githubOAuthPlugin(), sharedDataPlugin(), razorpayPaymentPlugin()],
  define: {
    'import.meta.env.VITE_RAZORPAY_KEY_ID': JSON.stringify(rootEnv.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || '')
  },
  server: {
    port: 3000,
    host: true
  }
})
