import * as admin from 'firebase-admin';

// Initialize Admin SDK once
admin.initializeApp();

// Export functions
export * from './dueDateReminder';
export * from './habitReminder';
