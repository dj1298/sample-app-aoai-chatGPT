import { Text } from "@fluentui/react";
import { Settings24Regular, Beaker24Filled} from "@fluentui/react-icons";

import styles from "./DiagnosticButton.module.css";

interface Props {
    className?: string;
    onClick: () => void;
}

export const DiagnosticButton = ({ className, onClick }: Props) => {
    return (
        <div className={`${styles.container} ${className ?? ""}`} onClick={onClick}>
            <Beaker24Filled />
            <Text>{"Diagnostics"}</Text>
        </div>
    );
};
