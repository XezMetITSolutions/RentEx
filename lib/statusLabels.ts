const rentalStatus: Record<string, string> = {
    Active: 'Aktiv',
    Pending: 'Ausstehend',
    Completed: 'Abgeschlossen',
    Cancelled: 'Storniert',
    Confirmed: 'Bestätigt',
    Rejected: 'Abgelehnt',
};

const paymentStatus: Record<string, string> = {
    Pending: 'Ausstehend',
    Partial: 'Teilweise',
    Paid: 'Bezahlt',
    Unpaid: 'Unbezahlt',
    Refunded: 'Erstattet',
    Failed: 'Fehlgeschlagen',
};

const carStatus: Record<string, string> = {
    Active: 'Verfügbar',
    Available: 'Verfügbar',
    Maintenance: 'Wartung',
    Reserved: 'Reserviert',
    Inactive: 'Inaktiv',
    Rented: 'Vermietet',
};

const taskStatus: Record<string, string> = {
    Todo: 'Zu erledigen',
    InProgress: 'In Bearbeitung',
    'In Progress': 'In Bearbeitung',
    Done: 'Erledigt',
    Open: 'Offen',
    Closed: 'Geschlossen',
    Pending: 'Ausstehend',
    Completed: 'Abgeschlossen',
};

export function rentalStatusLabel(status?: string | null): string {
    if (!status) return '-';
    return rentalStatus[status] ?? status;
}

export function paymentStatusLabel(status?: string | null): string {
    if (!status) return '-';
    return paymentStatus[status] ?? status;
}

export function carStatusLabel(status?: string | null): string {
    if (!status) return '-';
    return carStatus[status] ?? status;
}

export function taskStatusLabel(status?: string | null): string {
    if (!status) return '-';
    return taskStatus[status] ?? status;
}
