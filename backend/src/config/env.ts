import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  isProduction: process.env.NODE_ENV === 'production',
  dataPath: path.resolve(process.cwd(), '.data/groceryflow-pg'),
};
