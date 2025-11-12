# Firestore Setup Instructions

## Required Firestore Configuration

### 1. Collection Structure

The app uses a `mailSummaries` collection with the following structure:

```
mailSummaries/
  └── {documentId}/
      ├── userId: string
      ├── title: string
      ├── summary: string
      ├── fullText: string
      ├── suggestions: string[]
      ├── photoUrl: string (optional)
      ├── createdAt: timestamp
      └── updatedAt: timestamp
```

### 2. Required Firestore Index

You need to create a composite index for the query used in the Archive screen:

**Collection:** `mailSummaries`
**Fields to index:**
- `userId` (Ascending)
- `createdAt` (Descending)

#### How to Create the Index:

**Option 1: Via Firebase Console**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to Firestore Database → Indexes
4. Click "Create Index"
5. Set:
   - Collection ID: `mailSummaries`
   - Field 1: `userId` - Ascending
   - Field 2: `createdAt` - Descending
   - Query scope: Collection
6. Click "Create"

**Option 2: Via Error Link**
When you first run the app and try to fetch summaries, Firestore will throw an error with a direct link to create the required index. Simply click that link and it will auto-configure the index for you.

**Option 3: Using firestore.indexes.json**
Create a `firestore.indexes.json` file in your project root:

```json
{
  "indexes": [
    {
      "collectionGroup": "mailSummaries",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

Then deploy using Firebase CLI:
```bash
firebase deploy --only firestore:indexes
```

### 3. Security Rules

Add these security rules to your Firestore to ensure users can only access their own summaries:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Mail summaries - users can only read/write their own
    match /mailSummaries/{summaryId} {
      allow read, write: if request.auth != null && 
                           request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
                      request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 4. Testing the Setup

After setting up the index and security rules:

1. **Test Scanning**: Open the Camera screen and scan/select an image
2. **Verify Save**: Check the console logs for "[CameraScreen] Summary saved to Firestore"
3. **Test Archive**: Navigate to the Archive screen
4. **Verify Load**: Check that your scanned summaries appear in the list
5. **Test Detail View**: Tap on any summary to view its full details
6. **Test Refresh**: Pull down on the Archive screen to refresh the list

### 5. Monitoring

You can monitor your Firestore usage in the Firebase Console:
- Go to Firestore Database → Usage tab
- Check document reads, writes, and deletes
- Monitor storage usage

### Notes

- The app automatically associates each scanned summary with the currently logged-in user
- Summaries are ordered by creation date (newest first)
- The Archive screen includes pull-to-refresh functionality
- Error handling is implemented for network issues and authentication failures
