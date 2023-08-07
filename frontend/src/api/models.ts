import { Settings } from "./mw.models";

export type AskResponse = {
    answer: string;
    citations: Citation[];
    //diagnostics: Diagnostic[];
    error?: string;
};

export type Citation = {
    content: string;
    id: string;
    title: string | null;
    filepath: string | null;
    url: string | null;
    metadata: string | null;
    chunk_id: string | null;
    reindex_id: string | null;
}

export type Diagnostic = {
    diagnosticLink: string | null;
}

export type ToolMessageContent = {
    citations: Citation[];
    diagnostics: Diagnostic[];
    intent: string;
}

export type ChatMessage = {
    role: string;
    content: string;
    end_turn?: boolean;
};

export enum ChatCompletionType {
    ChatCompletion = "chat.completion",
    ChatCompletionChunk = "chat.completion.chunk"
}

export type ChatResponseChoice = {
    messages: ChatMessage[];
}

export type ChatResponse = {
    id: string;
    model: string;
    created: number;
    object: ChatCompletionType;
    choices: ChatResponseChoice[];
    error?: any;
}

export type ConversationRequest = {
    messages: ChatMessage[];
    settings: Settings;
};

export type UserInfo = {
    access_token: string;
    expires_on: string;
    id_token: string;
    provider_name: string;
    user_claims: any[];
    user_id: string;
};