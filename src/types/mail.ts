export interface MailItem {
    id: string;
    userId?: string;
    title: string;
    date: string;
    summary: string;
    fullText: string;
    suggestions: string[];
    photoUrl?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
