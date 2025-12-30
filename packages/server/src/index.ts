// =====================================================================
// ControlBox Server Entry Point
// =====================================================================

import 'dotenv/config';
import { createServer } from 'http';
import { config } from './config/index.js';
import { app } from './app.js';
import { initializeDatabase } from './db/pool.js';
import { initializeWebSocket } from './websocket/index.js';

async function main() {
    console.log('🏎️  ControlBox Server Starting...');
    console.log(`   Environment: ${config.nodeEnv}`);
    console.log(`   Port: ${config.port}`);

    // Initialize database connection
    try {
        await initializeDatabase();
        console.log('✅ Database connected');
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }

    // Create HTTP server
    const httpServer = createServer(app);

    // Initialize WebSocket server
    initializeWebSocket(httpServer);
    console.log('✅ WebSocket server initialized');

    // Start listening
    httpServer.listen(config.port, config.host, () => {
        console.log(`🚀 ControlBox server running at http://${config.host}:${config.port}`);
        console.log(`   Health check: http://${config.host}:${config.port}/api/health`);
    });

    // Graceful shutdown
    const shutdown = async () => {
        console.log('\n🛑 Shutting down gracefully...');
        httpServer.close(() => {
            console.log('   HTTP server closed');
            process.exit(0);
        });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
}

main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
