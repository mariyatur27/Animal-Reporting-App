export const ReportStatus = {
    "Processing": "#F9BE68",
    "Help coming": "#BCE0BE",
    "At the vet": "#BCE0BE",
    "Adoption": "#BCE0BE",
    "Declined": "#BCE0BE",
} as const;

export type ReportStatusKey = keyof typeof ReportStatus;