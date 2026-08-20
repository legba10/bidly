import { seedDevelopmentDatabase } from '../dev-seed.js';

const connectionString = process.env['DATABASE_URL'];
if (!connectionString) throw new Error('DATABASE_URL is required');

await seedDevelopmentDatabase(connectionString);
process.stdout.write('DEV ONLY fixtures are ready.\n');
