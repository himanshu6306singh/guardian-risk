import express from 'express';
import { Guardian } from 'guardian-risk';
import { expressPlugin, guardianMiddleware, type ExpressRequest } from 'guardian-risk-express';
import { redisPlugin, recordLoginAttempt } from 'guardian-risk-redis';
import { vpnPlugin, StaticIpProvider } from 'guardian-risk-vpn';
import { loggerPlugin } from 'guardian-risk-logger';

/**
 * Production-oriented Express example.
 *
 * Requires: REDIS_URL for shared rate limits across instances.
 */
const app = express();
app.set('trust proxy', 1);
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const ipProvider = new StaticIpProvider({
  '127.0.0.1': { vpn: false, proxy: false, tor: false, country: 'local', hosting: false },
});

const riskTemplate = new Guardian()
  .use(expressPlugin({ trustProxy: true }))
  .use(
    redisPlugin({
      url: process.env.REDIS_URL,
      windowMs: 60_000,
      allowInMemoryFallback: process.env.NODE_ENV !== 'production',
      rateLimitByIpWhenNoSession: true,
    }),
  )
  .use(vpnPlugin({ provider: ipProvider, vpnScore: 25 }))
  .use(loggerPlugin({ minScore: 20 }))
  .rule({
    name: 'SuspiciousBurst',
    when: (s) => (s.requestsInWindow as number) > 30,
    score: 40,
  })
  .rule({
    name: 'HeadlessUA',
    when: (s) => typeof s.userAgent === 'string' && /headless|bot|crawler/i.test(s.userAgent),
    score: 35,
  });

app.use(
  guardianMiddleware(riskTemplate, {
    trustProxy: true,
    blockAboveScore: 80,
    onAnalyzeError: 'block',
    exposeBlockDetails: false,
  }),
);

app.post('/login', async (req: ExpressRequest, res) => {
  const report = req.riskReport!;
  const sessionId = req.headers['x-session-id'];
  const ok = report.score < 50;

  if (!ok && typeof sessionId === 'string') {
    try {
      await recordLoginAttempt(sessionId);
    } catch {
      // Invalid session id — ignore
    }
  }

  res.json({
    ok,
    level: report.level,
  });
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`Guardian Express example listening on http://localhost:${port}`);
});
