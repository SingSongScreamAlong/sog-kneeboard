/**
 * SOG Kneeboard - Bridge Tool
 * Bridges file-based communication between Arma 3 and the kneeboard server
 * 
 * This tool:
 * 1. Watches for position updates from Arma 3 (sog_position.json)
 * 2. Sends position data to the kneeboard server via HTTP
 * 3. Monitors for world metadata updates (sog_worldmeta.json)
 * 
 * Usage: node bridge.js
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuration
const ARMA_PROFILE = path.join(process.env.USERPROFILE || process.env.HOME, 'Documents', 'Arma 3');
const POSITION_FILE = path.join(ARMA_PROFILE, 'sog_position.json');
const WORLDMETA_FILE = path.join(ARMA_PROFILE, 'sog_worldmeta.json');
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:31337';
const TOKEN = process.env.TOKEN || 'sog-kneeboard-secure-token-2024';
const CHECK_INTERVAL = 1000; // Check files every 1 second

// Ensure Arma 3 profile directory exists
if (!fs.existsSync(ARMA_PROFILE)) {
    console.log(`Creating Arma 3 profile directory: ${ARMA_PROFILE}`);
    fs.mkdirSync(ARMA_PROFILE, { recursive: true });
}

// Track last modification times
let lastPositionMtime = 0;
let lastWorldMetaMtime = 0;

console.log('═══════════════════════════════════════════════════════');
console.log('  SOG KNEEBOARD - BRIDGE TOOL');
console.log('═══════════════════════════════════════════════════════');
console.log(`Server URL: ${SERVER_URL}`);
console.log(`Arma 3 Profile: ${ARMA_PROFILE}`);
console.log(`Position File: ${POSITION_FILE}`);
console.log(`World Meta File: ${WORLDMETA_FILE}`);
console.log('═══════════════════════════════════════════════════════');
console.log('Bridge tool started. Waiting for Arma 3 data...\n');

/**
 * Send position data to server
 */
async function sendPosition(data) {
    try {
        const response = await axios.post(`${SERVER_URL}/position`, {
            token: TOKEN,
            ...data
        });
        
        if (response.data.success) {
            console.log(`✓ Position updated: [${data.worldPos[0].toFixed(0)}, ${data.worldPos[1].toFixed(0)}] heading ${data.heading.toFixed(0)}° - ${data.playerName}`);
        }
    } catch (error) {
        console.error(`✗ Error sending position: ${error.message}`);
    }
}

/**
 * Send world metadata to server
 */
async function sendWorldMeta(data) {
    try {
        const response = await axios.post(`${SERVER_URL}/worldmeta`, {
            token: TOKEN,
            ...data
        });
        
        if (response.data.success) {
            console.log(`✓ World metadata updated: ${data.terrainName} (${data.worldSize}m)`);
        }
    } catch (error) {
        console.error(`✗ Error sending world metadata: ${error.message}`);
    }
}

/**
 * Check and process position file
 */
function checkPositionFile() {
    if (!fs.existsSync(POSITION_FILE)) {
        return;
    }
    
    try {
        const stats = fs.statSync(POSITION_FILE);
        const mtime = stats.mtimeMs;
        
        // Only process if file has been modified
        if (mtime > lastPositionMtime) {
            lastPositionMtime = mtime;
            
            const data = JSON.parse(fs.readFileSync(POSITION_FILE, 'utf8'));
            sendPosition(data);
        }
    } catch (error) {
        // Ignore read errors (file might be locked by Arma 3)
    }
}

/**
 * Check and process world metadata file
 */
function checkWorldMetaFile() {
    if (!fs.existsSync(WORLDMETA_FILE)) {
        return;
    }
    
    try {
        const stats = fs.statSync(WORLDMETA_FILE);
        const mtime = stats.mtimeMs;
        
        // Only process if file has been modified
        if (mtime > lastWorldMetaMtime) {
            lastWorldMetaMtime = mtime;
            
            const data = JSON.parse(fs.readFileSync(WORLDMETA_FILE, 'utf8'));
            sendWorldMeta(data);
        }
    } catch (error) {
        // Ignore read errors
    }
}

/**
 * Main monitoring loop
 */
function monitorFiles() {
    checkPositionFile();
    checkWorldMetaFile();
}

// Start monitoring
setInterval(monitorFiles, CHECK_INTERVAL);

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\nBridge tool stopped.');
    process.exit(0);
});

// Create example files for testing
if (!fs.existsSync(POSITION_FILE)) {
    const examplePosition = {
        worldPos: [1024, 1024],
        heading: 0,
        playerName: "EXAMPLE_PLAYER",
        vehicleName: "",
        timestamp: Date.now()
    };
    
    console.log('\nCreating example position file for testing...');
    fs.writeFileSync(POSITION_FILE, JSON.stringify(examplePosition, null, 2));
    console.log(`Example file created: ${POSITION_FILE}\n`);
}
