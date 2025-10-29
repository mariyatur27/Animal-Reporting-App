export type Report = {
    uid: string;
    report_id: number;
    status: string;
    AnimalReports: {
        id: number;
        created_at: string;
        uid: string;
        location?: string;
        species?: string;
        color?: string;
        size?: string;
        is_injured?: boolean;
        condition?: string;
        photo_link?: string;
    }
}

export type ReportInformation = {
    id: number;
    created_at: string;
    uid: string;
    location?: string;
    species?: string;
    color?: string;
    size?: string;
    is_injured?: boolean;
    condition?: string;
    photo_link?: string;
    ManageReports: {
        report_id: number;
        org_id: number;
        status: string;
        comments?: string;
    };
    Organizations:{
        id: number;
        created_at: string;
        name: string;
        email: string;
        location: string;
        phoneNumber: string;
        share_contact_info: boolean;
    }
}