export interface Entry {
    _id?: string;
    type: string;
    description: string;
    value: number;
    dueDate: Date;
    isPaid?: boolean;
    showRecurrenceNumber?: boolean;
    creditCardId?: string;
    purchaseDate?: Date;
    recurrenceId?: string;
    recurrenceType?: string;
    recurrenceNumber?: number;
    recurrenceTotal?: number;
    prevision?: number;
    entries?: Entry[];
    commitEntries?: boolean;
}