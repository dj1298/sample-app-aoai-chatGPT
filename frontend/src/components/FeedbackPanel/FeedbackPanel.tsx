import { Button, Checkbox, DefaultButton, Panel, PrimaryButton, Slider, TextField } from "@fluentui/react";
import { useEffect, useState } from "react";
import { feedbackApi } from "../../api/mw.api";

import styles from "./FeedbackPanel.module.css";
import { MWDocFeedback, MWFeedback } from "../../api/mw.models";
import { FeedbackRequest, FeedbackString, MessageContent } from "../../api";

export interface IFeedbackPanelProps {
    isOpen: boolean;
    onDismiss: () => void;
    feedbackMessageIndex: number;
    chatMessages: [message_id: string, parent_message_id: string, role: string, content: MessageContent, feedback: FeedbackString][];
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
        inaccurate_answer: false,
        missing_info: false,
        too_long: false,
        too_short: false,
        confusing: false,
        offensive: false,
        biased: false,
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
        allow_contact: allowContact,
    });

    useEffect(() => {
        let questionId = "";
        let question = "";
        let answerId = "";
        let answer = "";
        let topDocs: MWDocFeedback[] = [];

        if (feedbackMessageIndex >= 1) {
            questionId = chatMessages[feedbackMessageIndex - 1][0];
            question = chatMessages[feedbackMessageIndex - 1][3].parts.join("\n");

            answerId = chatMessages[feedbackMessageIndex][0];
            answer = chatMessages[feedbackMessageIndex][3].parts.join("\n");

            topDocs = chatMessages[feedbackMessageIndex][3].top_docs.map((d) => ({
                title: d.title ?? "",
                filepath: d.filepath ?? "",
            }));
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
            allow_contact: allowContact,
        });
    }, [isOpen]);

    const onSubmit = () => {
        void feedbackApi(feedback);
        onDismiss();
    };

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
            <Slider
                label="Overall response quality"
                min={1}
                max={3}
                defaultValue={2}
                onChange={(value) => setFeedback({ ...feedback, overall_response_quality: value })}
            />
            <br />
            <Slider
                label="Overall document quality"
                min={1}
                max={3}
                defaultValue={2}
                onChange={(value) => setFeedback({ ...feedback, overall_document_quality: value })}
            />
            <hr />
            <TextField
                label="Additional feedback - provide details on citations and answer quality."
                multiline
                autoAdjustHeight
                onChange={(_ev, value) => setFeedback({ ...feedback, verbatim: value ?? "" })}
            />
            <hr />
            <Checkbox
                label="Inaccurate"
                className={styles.checkBox}
                onChange={(_ev, value) => setFeedback({ ...feedback, inaccurate_answer: !!value })}
            />
            <Checkbox
                label="Missing information"
                className={styles.checkBox}
                onChange={(_ev, value) => setFeedback({ ...feedback, missing_info: !!value })}
            />
            <Checkbox
                label="Too long"
                className={styles.checkBox}
                onChange={(_ev, value) => setFeedback({ ...feedback, too_long: !!value })}
            />
            <Checkbox
                label="Too short"
                className={styles.checkBox}
                onChange={(_ev, value) => setFeedback({ ...feedback, too_short: !!value })}
            />
            <Checkbox
                label="Confusing"
                className={styles.checkBox}
                onChange={(_ev, value) => setFeedback({ ...feedback, confusing: !!value })}
            />
            <Checkbox
                label="Offensive"
                className={styles.checkBox}
                onChange={(_ev, value) => setFeedback({ ...feedback, offensive: !!value })}
            />
            <Checkbox
                label="Biased"
                className={styles.checkBox}
                onChange={(_ev, value) => setFeedback({ ...feedback, biased: !!value })}
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
            <Checkbox
                label="Is it okay to contact me about this feedback?"
                className={styles.checkBox}
                onChange={(_ev, value) => setFeedback({ ...feedback, allow_contact: !!value })}
            />
        </Panel>
    );
};
