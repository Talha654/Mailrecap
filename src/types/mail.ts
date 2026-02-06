export interface MailItem {
    id: string;
    userId?: string;
    title: string;
    date: string;
    summary: string;
    fullText: string;
    suggestions: string[];
    // UI specific fields
    category?: string;
    priority?: boolean;
    isCompleted?: boolean;
    actionableDate?: {
        date: string;
        type: string;
        confidence: string;
        description: string;
    };
    links?: string[];
    photoUrl?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
