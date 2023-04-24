import { useRef, useState, useEffect } from "react";
import { Pivot, PivotItem, Checkbox, Panel, DefaultButton, TextField, Dropdown, IDropdownOption, DropdownMenuItemType, ExtendedSelectedItem, Slider } from "@fluentui/react";
import { Sparkle28Filled } from "@fluentui/react-icons";

import styles from "./Chat.module.css";

import {
    ChatMessage,
    ConversationRequest,
    conversationApi,
    MessageContent,
    FeedbackString,
    FeedbackRequest,
    feedbackApi,
    DocumentResult
} from "../../api";
import { Answer } from "../../components/Answer";
import { QuestionInput } from "../../components/QuestionInput";
import { SupportingContent } from "../../components/SupportingContent";
import { ClearChatButton } from "../../components/ClearChatButton";
import { SettingsButton } from "../../components/SettingsButton";
import { FeedbackButton } from "../../components/FeedbackButton";

enum Tabs {
    ThoughtProcessTab = "thoughtProcess",
    SupportingContentTab = "supportingContent",
    CitationTab = "citation"
}

const Chat = () => {
    const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
    const [isFeedbackPanelOpen, setIsFeedbackPanelOpen] = useState(false);
    const [enableInDomainOnly, setEnableInDomainOnly] = useState<boolean>(true);
    
    const [feedbackOverallResponseQuality, setFeedbackOverallResponseQuality] = useState<number>(3);
    const [feedbackOverallDocumentQuality, setFeedbackOverallDocumentQuality] = useState<number>(3);
    const [feedbackIncorrectAnswer, setFeedbackIncorrectAnswer] = useState<string>();
    const [feedbackNot5Star, setFeedbackNot5Star] = useState<string>();
    const [feedbackInaccurate, setFeedbackInaccurate] = useState<boolean>(false);
    const [feedbackMissingInfo, setFeedbackMissingInfo] = useState<boolean>(false);
    const [feedbackTooLong, setFeedbackTooLong] = useState<boolean>(false);
    const [feedbackTooShort, setFeedbackTooShort] = useState<boolean>(false);
    const [feedbackConfusing, setFeedbackConfusing] = useState<boolean>(false);
    const [feedbackOffensive, setFeedbackOffensive] = useState<boolean>(false);
    const [feedbackBiased, setFeedbackBiased] = useState<boolean>(false);
    const [feedbackOutdated, setFeedbackOutdated] = useState<boolean>(false);
    const [feedbackRepetitive, setFeedbackRepetitive] = useState<boolean>(false);
    const [feedbackFantastic, setFeedbackFantastic] = useState<boolean>(false);

    const [acsIndex, setacsIndex] = useState<string>("m365index");

    const acsIndexOptions: IDropdownOption[] = [
      { key: "m365index", text: "M365 Combined Index" },
      { key: "commerceindex", text: "Commerce Index" },
      { key: "exchangeoutlookindex", text: "Exchange Outlook Index" },
      { key: "mdoindex", text: "MDO Index" },
      { key: "odspindex", text: "ODSP Index" },
      { key: "purviewindex", text: "Purview Index" },
      { key: "teamsindex", text: "Teams Index" },
    ];

    const lastQuestionRef = useRef<string>("");
    const chatMessageStreamEnd = useRef<HTMLDivElement | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [activeCitation, setActiveCitation] = useState<[content: string, id: string, title: string, filepath: string, url: string, metadata: string]>();
    const [activeTab, setActiveTab] = useState<Tabs | undefined>(undefined);

    const [currentAnswer, setCurrentAnswer] = useState<number>(0);
    const [answers, setAnswers] = useState<[message_id: string, parent_message_id: string, role: string, content: MessageContent, feedback: FeedbackString][]>(
        []
    );

    const makeApiRequest = async (question: string) => {
        lastQuestionRef.current = question;

        setIsLoading(true);
        setActiveCitation(undefined);
        setActiveTab(undefined);

        try {
            const prevMessages: ChatMessage[] = answers.map(a => ({
                message_id: a[0],
                parent_message_id: a[1] ?? "",
                role: a[2],
                content: a[3]
            }));
            const userMessage: ChatMessage = {
                message_id: crypto.randomUUID(),
                parent_message_id: prevMessages.length > 0 ? prevMessages[prevMessages.length - 1].message_id : "",
                role: "user",
                content: {
                    content_type: "text",
                    parts: [question],
                    top_docs: [],
                    intent: ""
                }
            };

            const request: ConversationRequest = {
                messages: [...prevMessages, userMessage],
                settings: {
                    acs_index: acsIndex,
                    in_domain_only: enableInDomainOnly
                }
            };

            const result = await conversationApi(request);

            setAnswers([
                ...answers,
                [userMessage.message_id, userMessage.parent_message_id ?? "", userMessage.role, userMessage.content, FeedbackString.Neutral],
                [result.message_id, result.parent_message_id ?? "", result.role, result.content, FeedbackString.Neutral]
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const makeFeedbackRequest = async (message_id: string, feedback: FeedbackString) => {
        const request: FeedbackRequest = {
            message_id: message_id,
            feedback: feedback
        };

        await feedbackApi(request);

        return;
    };

    const clearChat = () => {
        lastQuestionRef.current = "";
        setActiveCitation(undefined);
        setAnswers([]);
    };

    useEffect(() => chatMessageStreamEnd.current?.scrollIntoView({ behavior: "smooth" }), [isLoading]);

    const onShowCitation = (citation: DocumentResult, index: number) => {
        setCurrentAnswer(index);
        if (activeCitation && activeCitation[1] === citation.id && activeTab === Tabs.CitationTab) {
            setActiveTab(undefined);
        } else {
            setActiveCitation([citation.content, citation.id, citation.title ?? "", citation.filepath ?? "", "", ""]);
            setActiveTab(Tabs.CitationTab);
        }
    };

    const onToggleTab = (tab: Tabs, index: number) => {
        setCurrentAnswer(index);
        if (activeTab === tab) {
            setActiveTab(undefined);
        } else {
            setActiveTab(tab);
        }
    };

    const onLikeResponse = (index: number) => {
        setIsFeedbackPanelOpen(!isFeedbackPanelOpen);
        let answer = answers[index];
        answer[4] = answer[4] === FeedbackString.ThumbsUp ? FeedbackString.Neutral : FeedbackString.ThumbsUp;
        setAnswers([...answers.slice(0, index), answer, ...answers.slice(index + 1)]);
        if (answer[4] === FeedbackString.ThumbsUp) {
            makeFeedbackRequest(answer[0], answer[4]);
        }
        console.log("Liked response", answer[0]);
    };

    const onDislikeResponse = (index: number) => {
        setIsFeedbackPanelOpen(!isFeedbackPanelOpen);
        let answer = answers[index];
        answer[4] = answer[4] === FeedbackString.ThumbsDown ? FeedbackString.Neutral : FeedbackString.ThumbsDown;
        setAnswers([...answers.slice(0, index), answer, ...answers.slice(index + 1)]);
        if (answer[4] === FeedbackString.ThumbsDown) {
            makeFeedbackRequest(answer[0], answer[4]);
        }
        console.log("Dislike response", answer[0]);
    };

    const onACSIndexDropDownChanged = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption | undefined, index?: number | undefined): void => {
        if (option) {
            setacsIndex(option.key.toString());
        }
    }


    const onInDomainOnlyChanged = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean)  => {
        setEnableInDomainOnly(checked || false);
    }

    const onOverallResponseQualityChanged = (value: number, range?: [number, number]) => {
        setFeedbackOverallResponseQuality(value || 3);
    }

    const onOverallDocumentQualityChanged = (value: number, range?: [number, number]) => {
        setFeedbackOverallResponseQuality(value || 3);
    }

    const onIncorrectAnswerChanged = (_ev?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setFeedbackIncorrectAnswer(newValue || "");
    }

    const onNot5StarChanged = (_ev?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setFeedbackNot5Star(newValue || "");
    }

    const onInaccurateChanged = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean)  => {
        setFeedbackInaccurate(checked || false);
    }
    const onMissingInfoChanged = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean)  => {
        setFeedbackMissingInfo(checked || false);
    }
    const onTooLongChanged = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean)  => {
        setFeedbackTooLong(checked || false);
    }
    const onTooShortChanged = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean)  => {
        setFeedbackTooShort(checked || false);
    }
    const onConfusingChanged = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean)  => {
        setFeedbackConfusing(checked || false);
    }
    const onOffensiveChanged = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean)  => {
        setFeedbackOffensive(checked || false);
    }
    const onBiasedChanged = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean)  => {
        setFeedbackBiased(checked || false);
    }
    const onOutdatedChanged = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean)  => {
        setFeedbackOutdated(checked || false);
    }
    const onRepetitiveChanged = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean)  => {
        setFeedbackRepetitive(checked || false);
    }
    const onFantasticChanged = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean)  => {
        setFeedbackFantastic(checked || false);
    }


    const isDisabledCitationTab: boolean = !activeCitation;

    return (
        <div className={styles.container}>
            <div className={styles.commandsContainer}>
                <ClearChatButton className={styles.commandButton} onClick={clearChat} disabled={!lastQuestionRef.current || isLoading} />
                <SettingsButton className={styles.commandButton} onClick={() => setIsConfigPanelOpen(!isConfigPanelOpen)} />
            </div>
            <div className={styles.chatRoot}>
                <div className={styles.chatContainer}>
                    {!lastQuestionRef.current ? (
                        <div className={styles.chatEmptyState}>
                            
                            <h1 className={styles.chatEmptyStateTitle}>Ask question to start.</h1>
                            <h2 className={styles.chatEmptyStateSubtitle}><i>"Entering personally identifiable information (PII) and customer data is strictly forbidden."</i></h2>
                            <img src="/MWLogo.PNG" height="233" width="233"></img>
                        </div>
                    ) : (
                        <div className={styles.chatMessageStream}>
                            {answers.map((answer, index) => (
                                <>
                                    {answer[2] === "user" ? (
                                        <div className={styles.chatMessageUser}>
                                            <div className={styles.chatMessageUserMessage}>{answer[3].parts[0]}</div>
                                        </div>
                                    ) : (
                                        <div className={styles.chatMessageGpt}>
                                            <Answer
                                                answer={{
                                                    answer: answer[3].parts[0],
                                                    thoughts: null,
                                                    data_points: [],
                                                    feedback: answer[4],
                                                    top_docs: answer[3].top_docs
                                                }}
                                                onCitationClicked={c => onShowCitation(c, index)}
                                                onThoughtProcessClicked={() => onToggleTab(Tabs.ThoughtProcessTab, index)}
                                                onSupportingContentClicked={() => onToggleTab(Tabs.SupportingContentTab, index)}
                                                onLikeResponseClicked={() => onLikeResponse(index)}
                                                onDislikeResponseClicked={() => onDislikeResponse(index)}
                                            />
                                        </div>
                                    )}
                                </>
                            ))}
                            {isLoading && (
                                <>
                                    <div className={styles.chatMessageUser}>
                                        <div className={styles.chatMessageUserMessage}>{lastQuestionRef.current}</div>
                                    </div>
                                    <div className={styles.chatMessageGptLoading}>
                                        <Sparkle28Filled aria-hidden="true" aria-label="Answer logo" />
                                        <p>Generating answer...</p>
                                    </div>
                                </>
                            )}
                            <div ref={chatMessageStreamEnd} />
                        </div>
                    )}

                    <div className={styles.chatInput}>
                        <QuestionInput
                            clearOnSend
                            placeholder="Type a new question..."
                            disabled={isLoading}
                            onSend={question => makeApiRequest(question)}
                        />
                    </div>
                </div>

                {!isLoading && answers.length > 0 && activeTab && (
                    <Pivot
                        className={styles.chatAnalysisPanel}
                        selectedKey={activeTab}
                        onLinkClick={pivotItem => pivotItem && setActiveTab(pivotItem.props.itemKey! as Tabs)}
                    >
                        <PivotItem
                            itemKey={Tabs.CitationTab}
                            headerText="Citation"
                            headerButtonProps={isDisabledCitationTab ? { disabled: true, style: { color: "grey" } } : undefined}
                        >
                            { activeCitation && <SupportingContent supportingContent={{
                                content: activeCitation[0], 
                                id: activeCitation[1],
                                title: activeCitation[2],
                                filepath: activeCitation[3],
                                url: activeCitation[4],
                                metadata: activeCitation[5]
                            }} />}
                        </PivotItem>
                    </Pivot>
                )}

                    <Panel
                    headerText="Feedback"
                    isOpen={isFeedbackPanelOpen}
                    isBlocking={false}
                    onDismiss={() => setIsFeedbackPanelOpen(false)}
                    closeButtonAriaLabel="Close"
                    onRenderFooterContent={() => <DefaultButton onClick={() => setIsFeedbackPanelOpen(false)}>Close</DefaultButton>}
                    isFooterAtBottom={true}
                    >
                        <Slider label="Overall response quality" min={0} max={5} defaultValue={3} onChange={onOverallResponseQualityChanged}/>
                        <br />
                        <Slider label="Overall document quality" min={0} max={5} defaultValue={3} onChange={onOverallDocumentQualityChanged}/>
                        <hr />
                        <TextField label="(Optional)If answer is not correct, provide correct document link/path." multiline autoAdjustHeight onChange={onIncorrectAnswerChanged}/>
                        <TextField label="(Optional) Provide reason if rating is not 5." multiline autoAdjustHeight onChange={onNot5StarChanged}/>
                        <hr />
                        <Checkbox label="Inaccurate" onChange={onInaccurateChanged} />
                        <Checkbox label="Missing information" onChange={onMissingInfoChanged} />
                        <Checkbox label="Too long" onChange={onTooLongChanged} />
                        <Checkbox label="Too short" onChange={onTooShortChanged} />
                        <Checkbox label="Confusing" onChange={onConfusingChanged} />
                        <Checkbox label="Offensive" onChange={onOffensiveChanged} />
                        <Checkbox label="Biased" onChange={onBiasedChanged} />
                        <Checkbox label="Outdated" onChange={onOutdatedChanged} />
                        <Checkbox label="Repetitive" onChange={onRepetitiveChanged} />
                        <Checkbox label="Fantastic!" onChange={onFantasticChanged} />
                        
                    </Panel>

                    <Panel
                    headerText="Configure Resources"
                    isOpen={isConfigPanelOpen}
                    isBlocking={false}
                    onDismiss={() => setIsConfigPanelOpen(false)}
                    closeButtonAriaLabel="Close"
                    onRenderFooterContent={() => <DefaultButton onClick={() => setIsConfigPanelOpen(false)}>Close</DefaultButton>}
                    isFooterAtBottom={true}
                    >
                    <Dropdown
                        className={styles.chatSettingsSeparator}
                        selectedKey={ acsIndex }
                        options={acsIndexOptions}
                        label="Product"
                        onChange={onACSIndexDropDownChanged}
                        
                    />
                    <Checkbox
                        className={styles.chatSettingsSeparator}
                        checked={enableInDomainOnly}
                        label="Answer in-domain questions only"
                        onChange={onInDomainOnlyChanged}
                    />
                    {/* <SpinButton
                        className={styles.chatSettingsSeparator}
                        label="Retrieve this many documents from search:"
                        min={1}
                        max={50}
                        // defaultValue={}
                        // onChange={}
                    /> */}
                    
                    
                </Panel>
            </div>
        </div>
    );
};

export default Chat;
