import { createApp } from './app';
import { config } from './config';
import { db } from './database/db';

const startServer = async () => {
  const app = createApp();

  // Try to connect to PostgreSQL (falls back gracefully to memory engine if not running)
  await db.connect();

  const server = app.listen(config.port, config.host, () => {
    console.log('====================================================');
    console.log(`🎮 ${config.brand.name.toUpperCase()} - PRODUCTION BACKEND ONLINE`);
    console.log(`📍 URL: http://${config.host}:${config.port}`);
    console.log(`⚡ Environment: ${config.env}`);
    console.log(`🛡️ Demo Mode: ${config.demoMode ? 'ENABLED (Instant verification & simulation)' : 'DISABLED'}`);
    console.log(`💰 Financial Mode: ${config.productionFinancialMode ? 'PRODUCTION REAL-MONEY' : 'SANDBOX / TEST'}`);
    console.log(`📖 Health Check: http://${config.host}:${config.port}/health`);
    console.log('====================================================');
  });

  // Graceful shutdown
  const handleShutdown = async (signal: string) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      await db.close();
      console.log('Server and database pool closed. Clean exit.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
};

startServer().catch((err) => {
  console.error('Fatal Server Startup Error:', err);
  process.exit(1);
});
