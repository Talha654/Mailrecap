import { firestore } from 'firebase-admin';

export interface ActionableDate {
    date: firestore.Timestamp;
    type: 'payment' | 'deadline' | 'appointment' | 'expiry' | 'other';
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    description?: string;
}

export interface MailSummary {
    id: string;
    userId: string;
    actionableDate?: ActionableDate;
    // ... other fields
}

export interface ScanEntry {
    scannedAt: firestore.Timestamp;
    localTimeHour: number;
    localTimeMinute: number;
}
