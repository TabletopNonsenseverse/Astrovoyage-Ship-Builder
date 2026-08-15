import { writeFileSync } from 'node:fs';

const url = process.env.SUPABASE_URL || '';
const key = process.env.SUPABASE_ANON_KEY || '';

const js = `// Generated during deployment. Do not edit manually.\nwindow.SUPABASE_URL = ${JSON.stringify(url)};\nwindow.SUPABASE_ANON_KEY = ${JSON.stringify(key)};\n`;

writeFileSync('config.js', js, 'utf8');
console.log(`Generated config.js (${url ? 'Supabase configured' : 'Supabase not configured'})`);
