"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const config_1 = require("./config");
const db_1 = require("./database/db");
const startServer = async () => {
    const app = (0, app_1.createApp)();
    // Try to connect to PostgreSQL (falls back gracefully to memory engine if not running)
    await db_1.db.connect();
    const server = app.listen(config_1.config.port, config_1.config.host, () => {
        console.log('====================================================');
        console.log(`🎮 ${config_1.config.brand.name.toUpperCase()} - PRODUCTION BACKEND ONLINE`);
        console.log(`📍 URL: http://${config_1.config.host}:${config_1.config.port}`);
        console.log(`⚡ Environment: ${config_1.config.env}`);
        console.log(`🛡️ Demo Mode: ${config_1.config.demoMode ? 'ENABLED (Instant verification & simulation)' : 'DISABLED'}`);
        console.log(`💰 Financial Mode: ${config_1.config.productionFinancialMode ? 'PRODUCTION REAL-MONEY' : 'SANDBOX / TEST'}`);
        console.log(`📖 Health Check: http://${config_1.config.host}:${config_1.config.port}/health`);
        console.log('====================================================');
    });
    // Graceful shutdown
    const handleShutdown = async (signal) => {
        console.log(`\nReceived ${signal}. Shutting down gracefully...`);
        server.close(async () => {
            await db_1.db.close();
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
