export interface TwitterResponse {
    data: Datum[];
    includes: Includes;
    meta: Meta;
}

export interface Datum {
    text: string;
    attachments?: Attachments;
    id: string;
    author_id: string;
    created_at: string;
}

export interface Attachments {
    media_keys: string[];
}

export interface Includes {
    media: Media[];
    users: User[];
}

export interface Media {
    media_key: string;
    type: string;
    url: string;
}

export interface User {
    profile_image_url: string;
    name: string;
    username: string;
    id: string;
}

export interface Meta {
    newest_id: string;
    oldest_id: string;
    result_count: number;
    next_token: string;
}
