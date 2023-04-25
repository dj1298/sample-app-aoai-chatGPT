export type AskResponse = {
    answer: string;
    thoughts: string | null;
    data_points: string[];
    top_docs: DocumentResult[];
    error?: string;
};

export type MessageContent = {
    content_type: string;
    parts: string[];
    top_docs: DocumentResult[];
    intent: string | null;
};

export type DocumentResult = {
    content: string;
    id: string;
    title: string | null;
    filepath: string | null;
    url: string | null;
    metadata: string | null;
}

export type ChatMessage = {
    message_id: string;
    parent_message_id: string | null;
    role: string;
    content: MessageContent;
};

export type Settings = {
    acs_index: string | null;
    in_domain_only: boolean | null;
}

export type MWFeedback = {
    overall_response_quality: number | null;
    overall_document_quality: number | null;
    incorrect_answer: string | null;
    not_5_star: string | null;
    inaccurate_answer: boolean | null;
    missing_info: boolean | null;
    too_long: boolean | null;
    too_short: boolean | null;
    confusing: boolean | null;
    offensive: boolean | null;
    biased: boolean | null;
    outdated: boolean | null;
    repetitive: boolean | null;
    fantastic: boolean | null;
    case_number: number | null;

}

export type ConversationRequest = {
    messages: ChatMessage[];
    settings: Settings;
};
