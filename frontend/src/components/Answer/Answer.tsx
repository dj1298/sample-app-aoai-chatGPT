import { useEffect, useMemo, useState } from "react";
import { useBoolean } from "@fluentui/react-hooks"
import { FontIcon, Stack, Text } from "@fluentui/react";

import styles from "./Answer.module.css";

import { AskResponse, DocumentResult } from "../../api";
import { parseAnswerToJsx } from "./AnswerParser";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import supersub from 'remark-supersub'
import { Sparkle28Filled, ThumbDislike20Filled, ThumbLike20Filled } from "@fluentui/react-icons";

interface Props {
    answer: AskResponse;
    onCitationClicked: (citedDocument: DocumentResult) => void;
    onLikeResponseClicked: () => void;
    onDislikeResponseClicked: () => void;
}

export const Answer = ({
    answer,
    onCitationClicked,
    onLikeResponseClicked,
    onDislikeResponseClicked
}: Props) => {
    const [feedback, setFeedback] = useState<number>(0);

    const [isRefAccordionOpen, { toggle: toggleIsRefAccordionOpen }] = useBoolean(false);
    const onInlineCitationClicked = () => {
        if (!isRefAccordionOpen) {
            toggleIsRefAccordionOpen();
        }
    };

    const useMarkdownFormat = true; // set to false to use inline clickable citations without markdown formatting
    const filePathTruncationLimit = 50;

    const parsedAnswer = useMemo(() => parseAnswerToJsx(answer, onInlineCitationClicked), [answer]);
    const [chevronIsExpanded, setChevronIsExpanded] = useState(isRefAccordionOpen);

    const handleChevronClick = () => {
        setChevronIsExpanded(!chevronIsExpanded);
        toggleIsRefAccordionOpen();
      };

    useEffect(() => {
        setChevronIsExpanded(isRefAccordionOpen);
    }, [isRefAccordionOpen]);

    const createCitationFilepath = (citation: DocumentResult, index: number, truncate: boolean = false) => {
        let citationFilename = "";

        if (citation.filepath && citation.chunk_id) {
            if (truncate && citation.filepath.length > filePathTruncationLimit) {
                const citationLength = citation.filepath.length;
                citationFilename = `${citation.filepath.substring(0, 20)}...${citation.filepath.substring(citationLength -20)} - Part ${parseInt(citation.chunk_id) + 1}`;
            }
            else {
                citationFilename = `${citation.filepath} - Part ${parseInt(citation.chunk_id) + 1}`;
            }
        }
        else {
            citationFilename = `Citation ${index}`;
        }
        return citationFilename;
    }

    return (
        <>
            <Stack className={styles.answerContainer}>
                <Stack.Item style={{ width: "100%" }}>
                    <Stack horizontal horizontalAlign="space-between">
                        <Sparkle28Filled aria-hidden="true" aria-label="Answer logo" />
                        <Stack horizontal>
                            <ThumbLike20Filled
                                aria-hidden="false"
                                aria-label="Like this response"
                                onClick={() => { setFeedback(1); onLikeResponseClicked(); }}
                                style={feedback > 0 ? { color: "darkgreen" } : { color: "slategray" }}
                            />
                            <ThumbDislike20Filled
                                aria-hidden="false"
                                aria-label="Dislike this response"
                                onClick={() => { setFeedback(-1); onDislikeResponseClicked(); }}
                                style={feedback < 0 ? { color: "darkred" } : { color: "slategray" }}
                            />
                        </Stack>
                    </Stack>
                </Stack.Item>
                <Stack.Item grow>
                    {useMarkdownFormat ? ( 
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm, supersub]}
                            children={parsedAnswer.markdownFormatText}
                            className={styles.answerText}
                        /> ) : ( 
                        <p className={styles.answerText}>{parsedAnswer.answerJsx}</p>)}
                </Stack.Item>
                <Stack horizontal className={styles.answerFooter}>
                {!!parsedAnswer.citations.length && (
                    <Stack.Item aria-label="References">
                        <Stack style={{width: "100%"}} >
                            <Stack horizontal horizontalAlign='start' verticalAlign='center'>
                                <Text
                                    className={styles.accordionTitle}
                                    onClick={toggleIsRefAccordionOpen}
                                >
                                <span>{parsedAnswer.citations.length > 1 ? parsedAnswer.citations.length + " references" : "1 reference"}</span>
                                </Text>
                                <FontIcon className={styles.accordionIcon}
                                onClick={handleChevronClick} iconName={chevronIsExpanded ? 'ChevronDown' : 'ChevronRight'}
                                />
                            </Stack>
                            
                        </Stack>
                    </Stack.Item>
                )}
                <Stack.Item className={styles.answerDisclaimerContainer}>
                    <span className={styles.answerDisclaimer}>AI-generated content may be incorrect</span>
                </Stack.Item>
                </Stack>
                {chevronIsExpanded && 
                    <div style={{ marginTop: 8, display: "flex", flexFlow: "wrap column", maxHeight: "150px", gap: "4px" }}>
                        {parsedAnswer.citations.map((citation, idx) => {
                            return (
                                <span title={createCitationFilepath(citation, ++idx)} key={idx} onClick={() => onCitationClicked(citation)} className={styles.citationContainer}>
                                    <div className={styles.citation}>{idx}</div>
                                    {createCitationFilepath(citation, idx, true)}
                                </span>);
                        })}
                    </div>
                }
            </Stack>
        </>
    );
};
