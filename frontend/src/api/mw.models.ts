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
    case_number: string | null;
}