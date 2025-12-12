import admin from 'firebase-admin';
import { google } from 'googleapis';
import { Readable } from 'stream';

// Initialize Firebase Admin
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.error('Error: FIREBASE_SERVICE_ACCOUNT environment variable is missing.');
  process.exit(1);
}

if (!process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT) {
  console.error('Error: GOOGLE_DRIVE_SERVICE_ACCOUNT environment variable is missing.');
  process.exit(1);
}

if (!process.env.GOOGLE_DRIVE_BACKUP_FOLDER_ID) {
  console.error('Error: GOOGLE_DRIVE_BACKUP_FOLDER_ID environment variable is missing.');
  process.exit(1);
}

const firebaseServiceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
const driveServiceAccount = JSON.parse(process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT);
const backupFolderId = process.env.GOOGLE_DRIVE_BACKUP_FOLDER_ID;

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(firebaseServiceAccount)
});

const db = admin.firestore();

// Initialize Google Drive
const auth = new google.auth.GoogleAuth({
  credentials: driveServiceAccount,
  // NOTE:
  // - drive.file often cannot "see" an existing folder that the service account didn't create.
  // - We use full Drive scope so the service account can access folders explicitly shared with it.
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

// Project-specific settings
const PROJECT_NAME = 'GinTracker';
const COLLECTION_NAME = 'games';
const RETENTION_DAYS = 90; // 3 months

async function testDriveConnection(folderId) {
  console.log('Testing Google Drive connection...');
  try {
    const response = await drive.files.get({
      fileId: folderId,
      fields: 'id, name, mimeType',
      supportsAllDrives: true
    });
    console.log(`  ✅ Connected to Drive folder: "${response.data.name}" (${response.data.id})`);
    return true;
  } catch (error) {
    console.error(`  ❌ Drive connection failed:`, error.message);
    if (error.code === 404) {
      console.error(`  → Folder ID not found. Check that the folder exists and is shared with: ${driveServiceAccount.client_email}`);
    } else if (error.code === 403) {
      console.error(`  → Permission denied. Share the folder with: ${driveServiceAccount.client_email}`);
      console.error(`  → Make sure Google Drive API is enabled in your Firebase/GCP project`);
    }
    throw error;
  }
}

async function getOrCreateProjectFolder(parentFolderId, folderName) {
  console.log(`Looking for project folder: ${folderName}`);
  
  try {
    // Check if folder exists
    const response = await drive.files.list({
      q: `name='${folderName}' and '${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive',
      includeItemsFromAllDrives: true,
      supportsAllDrives: true
    });

    if (response.data.files && response.data.files.length > 0) {
      console.log(`  ✅ Found existing folder: ${response.data.files[0].id}`);
      return response.data.files[0].id;
    }

    // Create folder if it doesn't exist
    console.log(`  Creating new folder...`);
    const folderMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId]
    };

    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id',
      supportsAllDrives: true
    });

    console.log(`  ✅ Created folder: ${folder.data.id}`);
    return folder.data.id;
  } catch (error) {
    console.error(`  ❌ Failed to get/create folder:`, error.message);
    if (error.response) {
      console.error(`  Status: ${error.response.status}`);
      console.error(`  Details:`, JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

async function uploadBackupToDrive(projectFolderId, backupData, timestamp) {
  const fileName = `${timestamp}-${COLLECTION_NAME}.json`;
  console.log(`Uploading ${fileName} to Google Drive...`);

  const fileMetadata = {
    name: fileName,
    parents: [projectFolderId]
  };

  // Convert data to JSON string and create proper stream
  const jsonString = JSON.stringify(backupData, null, 2);
  const buffer = Buffer.from(jsonString, 'utf8');
  const stream = Readable.from(buffer);

  const media = {
    mimeType: 'application/json',
    body: stream
  };

  try {
    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, size',
      supportsAllDrives: true
    });

    console.log(`  ✅ Uploaded: ${file.data.name} (${file.data.size} bytes)`);
    console.log(`  File ID: ${file.data.id}`);
    return file.data.id;
  } catch (error) {
    console.error(`  ❌ Upload failed:`, error.message);
    if (error.response) {
      console.error(`  Status: ${error.response.status}`);
      console.error(`  Details:`, JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

async function cleanupOldBackups(projectFolderId) {
  console.log('Checking for old backups to clean up...');
  
  // Get all backup files in the project folder
  const response = await drive.files.list({
    q: `'${projectFolderId}' in parents and trashed=false and mimeType='application/json'`,
    fields: 'files(id, name, createdTime)',
    orderBy: 'createdTime desc',
    spaces: 'drive',
    includeItemsFromAllDrives: true,
    supportsAllDrives: true
  });

  const files = response.data.files || [];
  
  if (files.length === 0) {
    console.log('  No existing backups found');
    return;
  }

  console.log(`  Found ${files.length} existing backup(s)`);

  // Check if we have recent backups (within last 90 days)
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - (RETENTION_DAYS * 24 * 60 * 60 * 1000));
  
  const recentBackups = files.filter(file => {
    const fileDate = new Date(file.createdTime);
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
    const fileDate = new Date(file.createdTime);
    return fileDate <= cutoffDate;
  });

  if (oldBackups.length === 0) {
    console.log('  No old backups to delete');
    return;
  }

  console.log(`  Deleting ${oldBackups.length} old backup(s)...`);
  
  for (const file of oldBackups) {
    try {
      await drive.files.delete({ fileId: file.id, supportsAllDrives: true });
      const fileAge = Math.floor((now - new Date(file.createdTime)) / (24 * 60 * 60 * 1000));
      console.log(`    Deleted: ${file.name} (${fileAge} days old)`);
    } catch (error) {
      console.error(`    Failed to delete ${file.name}:`, error.message);
    }
  }
}

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

async function main() {
  try {
    console.log(`\n🎮 ${PROJECT_NAME} Database Backup to Google Drive`);
    console.log('='.repeat(60));
    console.log(`Backup folder ID: ${backupFolderId}`);
    console.log(`Service account: ${driveServiceAccount.client_email}`);
    console.log(`Firebase project: ${firebaseServiceAccount.project_id}`);
    
    // Verify we have the Drive service account (not just Firebase)
    if (!driveServiceAccount.client_email || !driveServiceAccount.private_key) {
      console.error('\n❌ ERROR: GOOGLE_DRIVE_SERVICE_ACCOUNT is missing or invalid!');
      console.error('Make sure you added GOOGLE_DRIVE_SERVICE_ACCOUNT secret to GitHub.');
      process.exit(1);
    }
    
    if (!backupFolderId || backupFolderId.length < 10) {
      console.error('\n❌ ERROR: GOOGLE_DRIVE_BACKUP_FOLDER_ID is missing or invalid!');
      console.error('Make sure you added GOOGLE_DRIVE_BACKUP_FOLDER_ID secret to GitHub.');
      process.exit(1);
    }
    
    console.log('='.repeat(60));
    
    // Step 0: Test Drive connection
    console.log('\n[Step 0/5] Testing Google Drive connection...');
    await testDriveConnection(backupFolderId);
    
    // Step 1: Backup Firestore data
    console.log('\n[Step 1/5] Backing up Firestore data...');
    const backupData = await backupFirestoreData();
    
    if (!backupData || backupData.length === 0) {
      console.log('⚠️  Warning: No data found to backup');
    }
    
    // Step 2: Get or create project folder in Google Drive
    console.log('\n[Step 2/5] Getting/creating project folder in Google Drive...');
    const projectFolderId = await getOrCreateProjectFolder(backupFolderId, PROJECT_NAME);
    
    // Step 3: Upload backup to Google Drive
    console.log('\n[Step 3/5] Uploading backup to Google Drive...');
    const timestamp = new Date().toISOString().split('T')[0];
    await uploadBackupToDrive(projectFolderId, backupData, timestamp);
    
    // Step 4: Clean up old backups (90+ days old)
    console.log('\n[Step 4/5] Cleaning up old backups...');
    await cleanupOldBackups(projectFolderId);
    
    console.log('\n✅ Backup completed successfully!');
    console.log(`📁 Check your Drive folder: https://drive.google.com/drive/u/0/folders/${backupFolderId}`);
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

