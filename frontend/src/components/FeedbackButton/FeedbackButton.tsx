import { Text } from "@fluentui/react";
import { Settings24Regular } from "@fluentui/react-icons";

import styles from "./FeedbackButton.module.css";

interface Props {
    className?: string;
    onClick: () => void;
}

export const FeedbackButton = ({ className, onClick }: Props) => {
    return (
        <div className={`${styles.container} ${className ?? ""}`} onClick={onClick}>
            <Settings24Regular />
            <Text>{"Feedback"}</Text>
        </div>
    );
};
