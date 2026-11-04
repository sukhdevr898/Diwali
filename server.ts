import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const RUPAYEX_TOKEN = process.env.RUPAYEX_API_TOKEN || '6e9066fd1f930cf88521377ee677d8aa';
const RUPAYEX_BASE_URL = process.env.RUPAYEX_BASE_URL || 'https://rupayex.net/api';
const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // RupayEx 1: Create Payment Order
  app.post('/api/rupayex/create-order', async (req, res) => {
    try {
      const { amount, order_id, redirect_url, customer_mobile, remark1 } = req.body;
      if (!amount || !order_id) {
        return res.status(400).json({ ok: false, error: 'Amount and order_id are required' });
      }

      const params = new URLSearchParams();
      params.append('user_token', RUPAYEX_TOKEN);
      params.append('amount', String(amount));
      params.append('order_id', String(order_id));
      params.append('redirect_url', redirect_url || `${req.protocol}://${req.get('host')}/callback`);
      if (customer_mobile) params.append('customer_mobile', String(customer_mobile));
      if (remark1) params.append('remark1', String(remark1));

      const rupayRes = await fetch(`${RUPAYEX_BASE_URL}/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Api-Token': RUPAYEX_TOKEN,
        },
        body: params.toString(),
      });

      const text = await rupayRes.text();
      let data: unknown;
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }

      return res.json({ ok: rupayRes.ok, data });
    } catch (err: unknown) {
      console.error('RupayEx create-order error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to call RupayEx';
      return res.status(500).json({ ok: false, error: msg });
    }
  });

  // RupayEx 2: Check Order Status
  app.get('/api/rupayex/order-status/:orderId', async (req, res) => {
    try {
      const { orderId } = req.params;
      const targetUrl = `${RUPAYEX_BASE_URL}/order-status?user_token=${encodeURIComponent(RUPAYEX_TOKEN)}&order_id=${encodeURIComponent(orderId)}`;

      const rupayRes = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'X-Api-Token': RUPAYEX_TOKEN,
        },
      });

      const text = await rupayRes.text();
      let data: unknown;
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }

      return res.json({ ok: rupayRes.ok, data });
    } catch (err: unknown) {
      console.error('RupayEx status check error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to check order status';
      return res.status(500).json({ ok: false, error: msg });
    }
  });

  // RupayEx 3: Webhook / Callback handler
  app.all('/api/rupayex/callback', (req, res) => {
    const payload = { ...req.query, ...req.body };
    console.log('Received RupayEx callback:', payload);
    return res.json({ status: 'ok', received: payload });
  });

  // Mount Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
