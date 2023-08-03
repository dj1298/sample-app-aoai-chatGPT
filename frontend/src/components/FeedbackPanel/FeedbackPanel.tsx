import { Checkbox, DefaultButton, Label, Panel, PrimaryButton, Rating, RatingSize, TextField } from "@fluentui/react";
import { useId, useEffect, useState } from "react";
import { feedbackApi } from "../../api/mw.api";

import styles from "./FeedbackPanel.module.css";
import { MWDocFeedback, MWFeedback } from "../../api/mw.models";
import { ChatMessage, Citation, ToolMessageContent } from "../../api";

export interface IFeedbackPanelProps {
    isOpen: boolean;
    onDismiss: () => void;
    feedbackMessageIndex: number;
    chatMessages: ChatMessage[];
    selectedContentIndex: string;
    inDomain: boolean;
    allowContact: boolean;
}

export const FeedbackPanel: React.FC<IFeedbackPanelProps> = ({
    isOpen,
    onDismiss,
    feedbackMessageIndex,
    chatMessages,
    selectedContentIndex,
    inDomain,
    allowContact,
}) => {
    const [feedback, setFeedback] = useState<MWFeedback>({
        overall_response_quality: 3,
        overall_document_quality: 3,
        verbatim: "",
        documentation_accuracy_relevance: "",
        inaccurate_answer: false,
        confusing: false,
        outdated: false,
        repetitive: false,
        fantastic: false,
        case_number: "",
        question_id: "",
        question: "",
        answer_id: "",
        answer: "",
        contentIndex: "",
        top_docs: [],
        in_domain: inDomain,
        // allow_contact: allowContact,
    });

    const getRoleMessage = (role: "user" | "tool" | "assistant") : ChatMessage | null => {
        for (let i = 0; i < 3; i++) {
            const searchIndex = feedbackMessageIndex - i;
            if (searchIndex >= 0 && chatMessages[searchIndex].role === role) {
                return chatMessages[searchIndex];
            }
        }

        return null;
    }

    useEffect(() => {
        let questionId = "";
        let question = "";
        let answerId = "";
        let answer = "";
        let topDocs: MWDocFeedback[] = [];

        if (feedbackMessageIndex >= 1) {
            question = getRoleMessage("user")?.content ?? "";
            answer = getRoleMessage("assistant")?.content ?? "";

            // Parse out citations from the "tool" role message
            const toolMessage = getRoleMessage("tool");
            if (toolMessage) {
                let citations: Citation[] = [];
                try {
                    const toolMessageContent = JSON.parse(toolMessage.content) as ToolMessageContent;
                    citations = toolMessageContent.citations;
                }
                catch {
                    // Failure to parse tool message, weird - but not fatal
                }

                topDocs = citations.map((d) => ({
                    title: d.title ?? "",
                    filepath: d.filepath ?? "",
                }));
            }
        }

        setFeedback({
            ...feedback,
            question_id: questionId,
            question: question,
            answer_id: answerId,
            answer: answer,
            contentIndex: selectedContentIndex,
            top_docs: topDocs,
            in_domain: inDomain,
            // allow_contact: allowContact,
        });
    }, [isOpen]);

    const onSubmit = () => {
        void feedbackApi(feedback);
        onDismiss();
    };

    const overallRatingId = useId();
    const documentRatingId = useId();

    return (
        <Panel
            headerText="Feedback"
            isOpen={isOpen}
            isBlocking={true}
            onDismiss={onDismiss}
            closeButtonAriaLabel="Close"
            onRenderFooterContent={() => (
                <>
                    <DefaultButton onClick={onDismiss}>Cancel</DefaultButton>
                    <PrimaryButton onClick={onSubmit}>Submit</PrimaryButton>
                </>
            )}
            isFooterAtBottom={true}
        >
            <Label htmlFor={overallRatingId}>Overall response quality</Label>
            <Rating
                id={overallRatingId}
                size={RatingSize.Large}
                allowZeroStars={false}
                max={5}
                defaultRating={3}
                onChange={(_ev, rating) => setFeedback({ ...feedback, overall_response_quality: rating ?? 1 })}
            />
            <br />
            <Label htmlFor={documentRatingId}>Overall document quality</Label>
            <Rating
                id={documentRatingId}
                size={RatingSize.Large}
                allowZeroStars={false}
                max={5}
                defaultRating={3}
                onChange={(_ev, rating) => setFeedback({ ...feedback, overall_document_quality: rating ?? 1 })}
            />
            <hr />
            <TextField
                label="Answer quality"
                placeholder="Eg. The answer was accurate, but I expected it to contain information on..."
                multiline
                autoAdjustHeight
                onChange={(_ev, value) => setFeedback({ ...feedback, verbatim: value ?? "" })}
            />
            <TextField
                label="Expected Document URL"
                placeholder="Eg. I expected to see the answer cite a specific article. Or an unexpected article was cited. Please provide details of best references for this question."
                multiline
                autoAdjustHeight
                onChange={(_ev, value) => setFeedback({ ...feedback, documentation_accuracy_relevance: value ?? "" })}
            />
            <hr />
            <Checkbox
                label="Inaccurate"
                className={styles.checkBox}
                onChange={(_ev, value) => setFeedback({ ...feedback, inaccurate_answer: !!value })}
            />
            <Checkbox
                label="Confusing"
                className={styles.checkBox}
                onChange={(_ev, value) => setFeedback({ ...feedback, confusing: !!value })}
            />
            <Checkbox
                label="Outdated"
                className={styles.checkBox}
                onChange={(_ev, value) => setFeedback({ ...feedback, outdated: !!value })}
            />
            <Checkbox
                label="Repetitive"
                className={styles.checkBox}
                onChange={(_ev, value) => setFeedback({ ...feedback, repetitive: !!value })}
            />
            <Checkbox
                label="Fantastic!"
                className={styles.checkBox}
                onChange={(_ev, value) => setFeedback({ ...feedback, fantastic: !!value })}
            />
            <TextField
                label="Case number"
                className={styles.TextField}
                onChange={(_ev, value) => setFeedback({ ...feedback, case_number: value ?? "" })}
            />
{/*             <Checkbox
                label="Is it okay to contact me about this feedback?"
                className={styles.checkBox}
                onChange={(_ev, value) => setFeedback({ ...feedback, allow_contact: !!value })}
            /> */}
        </Panel>
    );
};
