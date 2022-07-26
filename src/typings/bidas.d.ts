interface RawResponse {
    id: string;
    event_id: string;
    event_date: string;
    holiday_type: string;
    status: number;
    created_at: string;
    updated_at: string;
    deleted_at?: any;
    ad: string;
    bs: string;
    bs_day: number;
    bs_month: number;
    bs_year: number;
    tithi: number;
    ns_month: string;
    ns_year: number;
    chandrama: number;
    is_verified?: any;
    remarks?: any;
    parent_event_id?: any;
    title: string;
    priority: string;
    description: string;
    type?: any;
    start_date: string;
    end_date: string;
    is_full_day_event: number;
    recurring_end_date: string;
    is_recurring: number;
    created_by: string;
    has_reminder: number;
    location: string;
    guests: string;
    rsvp?: any;
    note: string;
    event_permission?: any;
    visibility: string;
    privacy: string;
    duration: number;
    rrule: string;
    calendar_id: string;
    based_on: string;
    gh: number;
    image?: any;

}

export interface APIResponse extends Array<RawResponse> { }