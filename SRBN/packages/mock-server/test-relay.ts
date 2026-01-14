#!/usr/bin/env node
/**
 * Test Relay Connection
 * Simulates a relay agent sending data to BroadcastBox server
 * 
 * Usage: npx tsx test-relay.ts
 */

import { io } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3002/relay';

console.log('🔌 Connecting to BroadcastBox server...');
console.log('   URL:', SERVER_URL);

const socket = io(SERVER_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 3,
    timeout: 5000,
});

socket.on('connect', () => {
    console.log('✅ Connected to BroadcastBox!');
    console.log('   Socket ID:', socket.id);

    // Send session metadata
    console.log('\n📋 Sending session metadata...');
    socket.emit('session_metadata', {
        sessionId: 'test-session-001',
        timestamp: Date.now(),
        trackName: 'Daytona International Speedway',
        trackConfig: 'Road Course',
        category: 'sports_car',
        multiClass: true,
        cautionsEnabled: true,
        driverSwap: false,
        maxDrivers: 40,
        weather: {
            ambientTemp: 28,
            trackTemp: 42,
            precipitation: 0,
            trackState: 'dry',
        },
    });

    // Send initial drivers
    setTimeout(() => {
        console.log('👥 Sending driver updates...');

        const drivers = [
            { driverId: 'driver-1', driverName: 'Max Verstappen', carNumber: '1', carName: 'Red Bull RB20' },
            { driverId: 'driver-2', driverName: 'Lewis Hamilton', carNumber: '44', carName: 'Mercedes W15' },
            { driverId: 'driver-3', driverName: 'Charles Leclerc', carNumber: '16', carName: 'Ferrari SF-24' },
            { driverId: 'driver-4', driverName: 'Lando Norris', carNumber: '4', carName: 'McLaren MCL38' },
            { driverId: 'driver-5', driverName: 'Carlos Sainz', carNumber: '55', carName: 'Ferrari SF-24' },
        ];

        drivers.forEach(driver => {
            socket.emit('driver_update', {
                sessionId: 'test-session-001',
                timestamp: Date.now(),
                action: 'join',
                ...driver,
            });
        });
    }, 500);

    // Send race event (green flag)
    setTimeout(() => {
        console.log('🏁 Sending race event (GREEN FLAG)...');
        socket.emit('race_event', {
            sessionId: 'test-session-001',
            timestamp: Date.now(),
            flagState: 'green',
            lap: 1,
            timeRemaining: 3600,
            sessionPhase: 'racing',
        });
    }, 1000);

    // Start sending telemetry
    let lap = 1;
    let tick = 0;

    const telemetryInterval = setInterval(() => {
        tick++;

        const cars = [
            { carId: 1, driverId: 'driver-1', driverName: 'Verstappen', carNumber: '1', position: 1, pos: { s: (tick * 0.01) % 1 }, speed: 80, gear: 6, throttle: 0.9, brake: 0, steering: 0.1, inPit: false, lap },
            { carId: 2, driverId: 'driver-2', driverName: 'Hamilton', carNumber: '44', position: 2, pos: { s: ((tick * 0.01) - 0.02) % 1 }, speed: 79, gear: 6, throttle: 1.0, brake: 0, steering: -0.05, inPit: false, lap },
            { carId: 3, driverId: 'driver-3', driverName: 'Leclerc', carNumber: '16', position: 3, pos: { s: ((tick * 0.01) - 0.04) % 1 }, speed: 78, gear: 5, throttle: 0.85, brake: 0.1, steering: 0.2, inPit: false, lap },
            { carId: 4, driverId: 'driver-4', driverName: 'Norris', carNumber: '4', position: 4, pos: { s: ((tick * 0.01) - 0.05) % 1 }, speed: 77, gear: 5, throttle: 0.95, brake: 0, steering: 0, inPit: false, lap },
            { carId: 5, driverId: 'driver-5', driverName: 'Sainz', carNumber: '55', position: 5, pos: { s: ((tick * 0.01) - 0.07) % 1 }, speed: 76, gear: 5, throttle: 0.9, brake: 0, steering: -0.1, inPit: false, lap },
        ];

        socket.emit('telemetry', {
            sessionId: 'test-session-001',
            timestamp: Date.now(),
            cars,
        });

        // New lap every ~100 ticks
        if (tick % 100 === 0) {
            lap++;
            console.log(`🏎️  Lap ${lap}`);

            socket.emit('race_event', {
                sessionId: 'test-session-001',
                timestamp: Date.now(),
                flagState: 'green',
                lap,
                timeRemaining: 3600 - (lap * 90),
                sessionPhase: 'racing',
            });
        }

        // Simulate an incident at tick 50
        if (tick === 50) {
            console.log('🚨 Simulating incident...');
            socket.emit('incident', {
                sessionId: 'test-session-001',
                timestamp: Date.now(),
                cars: [3, 4],
                carNames: ['Ferrari SF-24', 'McLaren MCL38'],
                driverNames: ['Leclerc', 'Norris'],
                lap: 1,
                corner: 5,
                cornerName: 'Bus Stop',
                trackPosition: 0.45,
                severity: 'med',
            });
        }
    }, 100);

    // Stop after 30 seconds
    setTimeout(() => {
        console.log('\n🛑 Test complete. Disconnecting...');
        clearInterval(telemetryInterval);
        socket.disconnect();
        process.exit(0);
    }, 30000);
});

socket.on('connect_error', (err) => {
    console.error('❌ Connection error:', err.message);
    console.log('\n💡 Make sure the BroadcastBox server is running:');
    console.log('   npm run dev:mock');
    process.exit(1);
});

socket.on('disconnect', (reason) => {
    console.log('📴 Disconnected:', reason);
});
