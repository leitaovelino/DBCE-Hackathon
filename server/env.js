/**
 * GoaSmart Platform - Backend Environment Loader
 * 
 * Ensures environment variables from server/.env are loaded:
 * 1. Using a path resolved strictly relative to this file's directory (server/),
 *    NOT dependent on the terminal's current working directory (process.cwd()).
 * 2. Loaded before any service or route modules are imported or initialized.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '.env');

dotenv.config({ path: envPath });

export default process.env;
