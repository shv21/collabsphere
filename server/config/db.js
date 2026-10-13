import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let memoryServerInstance = null;
let isPersistentLocal = false;

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  // 1. Attempt connection to configured MONGODB_URI (e.g. MongoDB Atlas or running service)
  if (mongoUri) {
    try {
      console.log(`[Database] Connecting to MongoDB at ${mongoUri.replace(/:([^:@]+)@/, ':****@')}...`);
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 3000,
      });
      console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (err) {
      console.warn(`[Database] Connection to ${mongoUri.replace(/:([^:@]+)@/, ':****@')} failed (${err.message}).`);
      if (process.env.NODE_ENV === 'production') {
        console.error('[Database] Cannot fallback in production environment.');
        throw err;
      }
    }
  }

  // 2. Local Fallback: Embedded MongoDB Server on port 27017 with persistent disk storage
  try {
    console.log('[Database] Initializing persistent local MongoDB instance for development...');
    const { MongoMemoryServer } = await import('mongodb-memory-server');

    const dataDir = path.resolve(__dirname, '../data/db');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Try binding to port 27017 first so MongoDB Compass can connect directly
    try {
      memoryServerInstance = await MongoMemoryServer.create({
        instance: {
          port: 27017,
          dbPath: dataDir,
          dbName: 'collabsphere',
          storageEngine: 'wiredTiger',
        },
      });
      isPersistentLocal = true;
    } catch (portErr) {
      console.warn(`[Database] Port 27017 unavailable (${portErr.message}), falling back to dynamic port...`);
      memoryServerInstance = await MongoMemoryServer.create({
        instance: {
          dbPath: dataDir,
          dbName: 'collabsphere',
          storageEngine: 'wiredTiger',
        },
      });
      isPersistentLocal = true;
    }

    const uri = memoryServerInstance.getUri('collabsphere');
    await mongoose.connect(uri, { dbName: 'collabsphere' });

    const host = mongoose.connection.host;
    const port = mongoose.connection.port;

    console.log('\n============================================================');
    console.log(' [Database] MongoDB is READY and CONNECTED!');
    console.log(` [Database] Server URI: ${uri}`);
    console.log(` [Database] MongoDB Compass: Connect to mongodb://${host}:${port}`);
    console.log(` [Database] Database Name: collabsphere`);
    console.log(` [Database] Storage: Persistent on disk in server/data/db`);
    console.log('============================================================\n');
  } catch (err) {
    console.error('[Database] Failed to start local MongoDB instance:', err.message);
    throw err;
  }
};

export const closeDB = async () => {
  try {
    await mongoose.disconnect();
  } catch (e) {
    // ignore
  }
  if (memoryServerInstance) {
    try {
      await memoryServerInstance.stop();
    } catch (e) {
      // ignore
    }
    memoryServerInstance = null;
  }
};

// Graceful cleanup on process exit
process.once('SIGINT', async () => {
  await closeDB();
  process.exit(0);
});

process.once('SIGTERM', async () => {
  await closeDB();
  process.exit(0);
});

export const getDBStatus = () => {
  return {
    connected: mongoose.connection.readyState === 1,
    isLocalEmbedded: !!memoryServerInstance,
    isPersistent: isPersistentLocal,
    host: mongoose.connection.host || null,
    port: mongoose.connection.port || null,
    name: mongoose.connection.name || null,
    compassUrl: memoryServerInstance
      ? `mongodb://${mongoose.connection.host || 'localhost'}:${mongoose.connection.port || 27017}`
      : (process.env.MONGODB_URI || 'mongodb://localhost:27017'),
    configuredUri: process.env.MONGODB_URI
      ? process.env.MONGODB_URI.replace(/:([^:@]+)@/, ':****@')
      : null,
  };
};
