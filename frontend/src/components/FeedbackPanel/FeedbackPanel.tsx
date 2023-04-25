import { Button, Checkbox, DefaultButton, Panel, PrimaryButton, Slider, TextField } from "@fluentui/react";
import { useState } from "react";
import { feedbackApi } from "../../api/mw.api";

import styles from "./FeedbackPanel.module.css";
import { MWFeedback } from "../../api/mw.models";

export interface IFeedbackPanelProps {
    isOpen: boolean;
    onDismiss: () => void;
}

export const FeedbackPanel: React.FC<IFeedbackPanelProps> = ({ isOpen, onDismiss }) => {
    const [feedback, setFeedback] = useState<MWFeedback>({
        overall_response_quality: 3,
        overall_document_quality: 3,
        incorrect_answer: "",
        not_5_star: "",
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
    });

    const onSubmit = () => {
        void feedbackApi(feedback);
        onDismiss();
    };

    return (
        <Panel
            headerText="Feedback"
            isOpen={isOpen}
            isBlocking={false}
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
                min={0}
                max={5}
                defaultValue={3}
                onChange={(value) => setFeedback({ ...feedback, overall_response_quality: value })}
            />
            <br />
            <Slider
                label="Overall document quality"
                min={0}
                max={5}
                defaultValue={3}
                onChange={(value) => setFeedback({ ...feedback, overall_document_quality: value })}
            />
            <hr />
            <TextField
                label="(Optional)If answer is not correct, provide correct document link/path."
                multiline
                autoAdjustHeight
                onChange={(_ev, value) => setFeedback({ ...feedback, incorrect_answer: value ?? "" })}
            />
            <TextField
                label="(Optional) Provide reason if rating is not 5."
                multiline
                autoAdjustHeight
                onChange={(_ev, value) => setFeedback({ ...feedback, not_5_star: value ?? "" })}
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
        </Panel>
    );
};
