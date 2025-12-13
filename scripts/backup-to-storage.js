import admin from 'firebase-admin';
import { Readable } from 'stream';

// Initialize Firebase Admin
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.error('Error: FIREBASE_SERVICE_ACCOUNT environment variable is missing.');
  process.exit(1);
}

const firebaseServiceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// Initialize Firebase (includes Firestore and Storage)
admin.initializeApp({
  credential: admin.credential.cert(firebaseServiceAccount),
  // Try new Firebase Storage bucket format first, fallback to old format
  storageBucket: `${firebaseServiceAccount.project_id}.firebasestorage.app` || `${firebaseServiceAccount.project_id}.appspot.com`
});

const db = admin.firestore();
const storage = admin.storage();
// Use the bucket name from config, or try to get default
const bucketName = admin.app().options.storageBucket || `${firebaseServiceAccount.project_id}.firebasestorage.app`;
const bucket = storage.bucket(bucketName);

// Project-specific settings
const PROJECT_NAME = 'GinTracker';
const COLLECTION_NAME = 'games';
const RETENTION_DAYS = 90; // 3 months
const BACKUP_PREFIX = `backups/${PROJECT_NAME}/`;

async function backupFirestoreData() {
  console.log('Starting Firestore backup...');
  const gamesRef = db.collection(COLLECTION_NAME);
  const snapshot = await gamesRef.get();
  
  const games = [];
  snapshot.forEach(doc => {
    games.push({ id: doc.id, ...doc.data() });
  });

  // Sort by date for consistent ordering
  games.sort((a, b) => {
    const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateCompare === 0) {
      return (new Date(b.created_at || 0).getTime()) - (new Date(a.created_at || 0).getTime());
    }
    return dateCompare;
  });

  console.log(`  Backed up ${games.length} ${COLLECTION_NAME}`);
  return games;
}

async function uploadBackupToStorage(backupData, timestamp) {
  const fileName = `${timestamp}-${COLLECTION_NAME}.json`;
  const filePath = `${BACKUP_PREFIX}${fileName}`;
  
  console.log(`Uploading ${fileName} to Firebase Storage...`);

  // Convert data to JSON string
  const jsonString = JSON.stringify(backupData, null, 2);
  const buffer = Buffer.from(jsonString, 'utf8');

  try {
    const file = bucket.file(filePath);
    const stream = file.createWriteStream({
      metadata: {
        contentType: 'application/json',
        metadata: {
          project: PROJECT_NAME,
          collection: COLLECTION_NAME,
          timestamp: new Date().toISOString()
        }
      }
    });

    return new Promise((resolve, reject) => {
      stream.on('error', (error) => {
        console.error(`  ❌ Upload failed:`, error.message);
        reject(error);
      });

      stream.on('finish', async () => {
        // Make file public is not needed - we'll keep it private
        // But we can set metadata
        const [metadata] = await file.getMetadata();
        const sizeInBytes = parseInt(metadata.size || '0', 10);
        console.log(`  ✅ Uploaded: ${fileName} (${sizeInBytes} bytes)`);
        console.log(`  Path: ${filePath}`);
        resolve(filePath);
      });

      stream.end(buffer);
    });
  } catch (error) {
    console.error(`  ❌ Upload failed:`, error.message);
    throw error;
  }
}

async function cleanupOldBackups() {
  console.log('Checking for old backups to clean up...');
  
  try {
    // List all files in the backup folder
    const [files] = await bucket.getFiles({ prefix: BACKUP_PREFIX });
    
    if (files.length === 0) {
      console.log('  No existing backups found');
      return;
    }

    console.log(`  Found ${files.length} existing backup(s)`);

    // Check if we have recent backups (within last 90 days)
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - (RETENTION_DAYS * 24 * 60 * 60 * 1000));
    
    const recentBackups = files.filter(file => {
      const fileDate = new Date(file.metadata.timeCreated);
      return fileDate > cutoffDate;
    });

    // Safety check: Only delete old backups if we have recent ones
    if (recentBackups.length === 0) {
      console.log('  ⚠️  No recent backups found - skipping cleanup to preserve data');
      console.log('  This prevents data loss if automation has been failing');
      return;
    }

    console.log(`  Found ${recentBackups.length} recent backup(s) (within ${RETENTION_DAYS} days)`);

    // Delete backups older than retention period
    const oldBackups = files.filter(file => {
      const fileDate = new Date(file.metadata.timeCreated);
      return fileDate <= cutoffDate;
    });

    if (oldBackups.length === 0) {
      console.log('  No old backups to delete');
      return;
    }

    console.log(`  Deleting ${oldBackups.length} old backup(s)...`);
    
    for (const file of oldBackups) {
      try {
        await file.delete();
        const fileAge = Math.floor((now - new Date(file.metadata.timeCreated)) / (24 * 60 * 60 * 1000));
        console.log(`    Deleted: ${file.name} (${fileAge} days old)`);
      } catch (error) {
        console.error(`    Failed to delete ${file.name}:`, error.message);
      }
    }
  } catch (error) {
    console.error('  ❌ Cleanup failed:', error.message);
    // Don't throw - cleanup failure shouldn't fail the backup
  }
}

async function testStorageConnection() {
  console.log('Testing Firebase Storage connection...');
  try {
    // Check if bucket exists
    const [exists] = await bucket.exists();
    
    if (!exists) {
      console.log(`  ⚠️  Bucket ${bucket.name} does not exist. Creating...`);
      try {
        // Create bucket in us-central1 (supports free tier)
        await bucket.create({
          location: 'us-central1',
          storageClass: 'STANDARD'
        });
        console.log(`  ✅ Created bucket: ${bucket.name} in us-central1`);
      } catch (createError) {
        if (createError.code === 409) {
          // Bucket already exists (race condition)
          console.log(`  ✅ Bucket already exists: ${bucket.name}`);
        } else if (createError.code === 403) {
          console.error(`  ❌ Permission denied. Service account needs Storage Admin role.`);
          console.error(`  → Grant permissions: https://console.cloud.google.com/iam-admin/iam?project=${firebaseServiceAccount.project_id}`);
          console.error(`  → Find: ${firebaseServiceAccount.client_email}`);
          console.error(`  → Add role: "Storage Admin"\n`);
          throw createError;
        } else {
          console.error(`  ❌ Failed to create bucket:`, createError.message);
          console.error(`  → Try creating manually: https://console.firebase.google.com/project/${firebaseServiceAccount.project_id}/storage`);
          console.error(`  → Or use gcloud: gcloud storage buckets create gs://${bucket.name} --location=us-central1\n`);
          throw createError;
        }
      }
    } else {
      console.log(`  ✅ Connected to Firebase Storage bucket: ${bucket.name}`);
    }
    
    // Try to list files (just to test connection)
    await bucket.getFiles({ prefix: BACKUP_PREFIX, maxResults: 1 });
    return true;
  } catch (error) {
    console.error(`  ❌ Storage connection failed:`, error.message);
    if (error.code === 404 || error.message.includes('does not exist')) {
      console.error(`\n  📋 ACTION REQUIRED:`);
      console.error(`  → Firebase Storage bucket does not exist`);
      console.error(`  → The script will try to create it automatically`);
      console.error(`  → If that fails, create manually: https://console.firebase.google.com/project/${firebaseServiceAccount.project_id}/storage`);
      console.error(`  → Or use gcloud CLI: gcloud storage buckets create gs://${bucket.name} --location=us-central1\n`);
    } else if (error.code === 403) {
      console.error(`\n  📋 ACTION REQUIRED:`);
      console.error(`  → Service account needs Storage Admin permissions`);
      console.error(`  → Grant permissions: https://console.cloud.google.com/iam-admin/iam?project=${firebaseServiceAccount.project_id}`);
      console.error(`  → Find: ${firebaseServiceAccount.client_email}`);
      console.error(`  → Add role: "Storage Admin"\n`);
    }
    throw error;
  }
}

async function main() {
  try {
    console.log(`\n🎮 ${PROJECT_NAME} Database Backup to Firebase Storage`);
    console.log('='.repeat(60));
    console.log(`Firebase project: ${firebaseServiceAccount.project_id}`);
    console.log(`Storage bucket: ${bucket.name}`);
    console.log(`Backup path: ${BACKUP_PREFIX}`);
    console.log('='.repeat(60));
    
    // Step 0: Test Storage connection
    console.log('\n[Step 0/4] Testing Firebase Storage connection...');
    await testStorageConnection();
    
    // Step 1: Backup Firestore data
    console.log('\n[Step 1/4] Backing up Firestore data...');
    const backupData = await backupFirestoreData();
    
    if (!backupData || backupData.length === 0) {
      console.log('⚠️  Warning: No data found to backup');
    }
    
    // Step 2: Upload backup to Firebase Storage
    console.log('\n[Step 2/4] Uploading backup to Firebase Storage...');
    const timestamp = new Date().toISOString().split('T')[0];
    await uploadBackupToStorage(backupData, timestamp);
    
    // Step 3: Clean up old backups (90+ days old)
    console.log('\n[Step 3/4] Cleaning up old backups...');
    await cleanupOldBackups();
    
    console.log('\n✅ Backup completed successfully!');
    console.log(`📦 Backups stored in Firebase Storage: ${BACKUP_PREFIX}`);
    console.log(`🔒 Backups are private and secure`);
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Backup failed:', error.message);
    console.error('Full error:', error);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

main();


