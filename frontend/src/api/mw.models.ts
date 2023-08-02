export enum AcsIndex {
    M365Combined = "M365Combined",
    MWOnPrem = "MWOnPrem",
}

export type Settings = {
    acs_index: AcsIndex;
    in_domain_only: boolean | null;
}

export type AzureIndexDate = {
    azure_index_date: string | null;
}

export type MWDocFeedback = {
    title: string;
    filepath: string;
}

export type MWFeedback = {
    overall_response_quality: number | null;
    overall_document_quality: number | null;
    verbatim: string | null;
    documentation_accuracy_relevance: string | null;
    inaccurate_answer: boolean | null;
    confusing: boolean | null;
    outdated: boolean | null;
    repetitive: boolean | null;
    fantastic: boolean | null;
    case_number: string | null;
    question_id: string | null;
    question: string | null;
    answer_id: string | null;
    answer: string | null;
    contentIndex: string | null;
    top_docs: MWDocFeedback[];
    in_domain: boolean | null;
    // allow_contact: boolean | null;
}