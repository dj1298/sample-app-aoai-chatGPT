import { Checkbox, DefaultButton, Label, Panel, PrimaryButton, Rating, RatingSize, TextField } from "@fluentui/react";
import { useId, useEffect, useState } from "react";
import { PillarDiagnosticApi } from "../../api/mw.api";

import styles from "./DiagnosticPanel.module.css";
import { PillarDiagnosticParameters } from "../../api/mw.models";
import { ChatMessage, Citation, ToolMessageContent } from "../../api";

export interface IDiagnosticPanelProps {
    isOpen: boolean;
    onDismiss: () => void;
}

export const DiagnosticPanel: React.FC<IDiagnosticPanelProps> = ({
    isOpen,
    onDismiss,
}) => {
    const [diagnosticParameters, setDiagnosticParameters] = useState<PillarDiagnosticParameters>({
        tenant_id: "",
        case_id: "",
        primary_smtp_address: "",
    });

    useEffect(() => {
        let tenantId = "";
        let caseId = "";
        let primaryEmailAddress = "";
        


        setDiagnosticParameters({
            ...diagnosticParameters,


        });
    }, [isOpen]);

    const onSubmit = () => {
        void PillarDiagnosticApi(diagnosticParameters);
        onDismiss();
    };

    return (
        <Panel
            headerText="Diagnostics"
            isOpen={isOpen}
            isBlocking={true}
            onDismiss={onDismiss}
            closeButtonAriaLabel="Close"
            onRenderFooterContent={() => (
                <>
                    <DefaultButton onClick={onDismiss}>Cancel</DefaultButton>
                    <PrimaryButton onClick={onSubmit}>Run</PrimaryButton>
                </>
            )}
            isFooterAtBottom={true}
        >

        <TextField
                label="Tenant Id"
                placeholder="Tenant Id"
                onChange={(_ev, value) => setDiagnosticParameters({ ...diagnosticParameters, tenant_id: value ?? "" })}
            />
        <TextField
                label="Case Id"
                placeholder="Case Id"
                onChange={(_ev, value) => setDiagnosticParameters({ ...diagnosticParameters, case_id: value ?? "" })}
            />
        <TextField
                label="Primary SMTP address"
                placeholder="Primary SMTP address"
                onChange={(_ev, value) => setDiagnosticParameters({ ...diagnosticParameters, primary_smtp_address: value ?? "" })}
            />
        </Panel>
    );
}
