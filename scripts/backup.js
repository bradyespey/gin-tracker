import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
// Requires FIREBASE_SERVICE_ACCOUNT env var to be a JSON string
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.error('Error: FIREBASE_SERVICE_ACCOUNT environment variable is missing.');
  process.exit(1);
}

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function backup() {
  console.log('Starting backup...');
  const gamesRef = db.collection('games');
  const snapshot = await gamesRef.get();
  
  const games = [];
  snapshot.forEach(doc => {
    // Store doc ID inside the data for complete restoration capability
    games.push({ id: doc.id, ...doc.data() });
  });

  // Sort by date (descending) and then creation time for consistent file ordering
  // This minimizes git diff noise
  games.sort((a, b) => {
    const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateCompare === 0) {
      return (new Date(b.created_at || 0).getTime()) - (new Date(a.created_at || 0).getTime());
    }
    return dateCompare;
  });

  // Create backups directory if it doesn't exist
  // We use 'data-backups' to distinguish from the ignored 'backup' folder
  const backupDir = path.join(__dirname, '../data-backups');
  if (!fs.existsSync(backupDir)){
    fs.mkdirSync(backupDir);
  }

  const filePath = path.join(backupDir, 'games.json');
  fs.writeFileSync(filePath, JSON.stringify(games, null, 2));
  
  console.log(`Successfully backed up ${games.length} games to ${filePath}`);
}

backup().catch(error => {
  console.error('Backup failed:', error);
  process.exit(1);
});

