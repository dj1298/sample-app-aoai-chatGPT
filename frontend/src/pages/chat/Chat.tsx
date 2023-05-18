import { useRef, useState, useEffect } from "react";
import { Stack } from "@fluentui/react";
import { BroomRegular, DismissRegular, SquareRegular } from "@fluentui/react-icons";

import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm'
import rehypeRaw from "rehype-raw"; 

import styles from "./Chat.module.css";
import AzureOpenAILogo from "../../assets/AzureOpenAILogo.svg";
import mwStyles from "./Chat.mw.module.css";

import {
    ChatMessage,
    ConversationRequest,
    conversationApi,
    MessageContent,
    DocumentResult
} from "../../api";
import { Answer } from "../../components/Answer";
import { QuestionInput } from "../../components/QuestionInput";
import { Settings } from "../../api/mw.models";
import { FeedbackPanel } from "../../components/FeedbackPanel/FeedbackPanel";
import { SettingsPanel } from "../../components/SettingsPanel/SettingsPanel";
import { SettingsButton } from "../../components/SettingsButton";


const Chat = () => {
    const [isFeedbackPanelOpen, setIsFeedbackPanelOpen] = useState(false);
    const [feedbackMessageIndex, setFeedbackMessageIndex] = useState(-1);
    const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
    const [settings, setSettings] = useState<Settings>({
        acs_index: "m365index",
        in_domain_only: true,
    });

    const lastQuestionRef = useRef<string>("");
    const chatMessageStreamEnd = useRef<HTMLDivElement | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [activeCitation, setActiveCitation] = useState<[content: string, id: string, title: string, filepath: string, url: string, metadata: string]>();
    const [isCitationPanelOpen, setIsCitationPanelOpen] = useState<boolean>(false);
    const [answers, setAnswers] = useState<[message_id: string, parent_message_id: string, role: string, content: MessageContent][]>([]);
    const abortFuncs = useRef([] as AbortController[]);

    const makeApiRequest = async (question: string) => {
        lastQuestionRef.current = question;

        setIsLoading(true);
        const abortController = new AbortController();
        abortFuncs.current.unshift(abortController);

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
            settings: settings,
        };

        try {
            const result = await conversationApi(request, abortController.signal);
            setAnswers([
                ...answers,
                [userMessage.message_id, userMessage.parent_message_id ?? "", userMessage.role, userMessage.content],
                [result.message_id, result.parent_message_id ?? "", result.role, result.content]
            ]);
        } catch {
            setAnswers([
                ...answers,
                [userMessage.message_id, userMessage.parent_message_id ?? "", userMessage.role, userMessage.content]
            ]);
        } finally {
            setIsLoading(false);
            abortFuncs.current = abortFuncs.current.filter(a => a !== abortController);
        }

        return abortController.abort();
    };

    const clearChat = () => {
        lastQuestionRef.current = "";
        setActiveCitation(undefined);
        setAnswers([]);
    };

    const stopGenerating = () => {
        abortFuncs.current.forEach(a => a.abort());
        setIsLoading(false);
    }

    useEffect(() => chatMessageStreamEnd.current?.scrollIntoView({ behavior: "smooth" }), [isLoading]);

    const onShowCitation = (citation: DocumentResult, index: number) => {
        setActiveCitation([citation.content, citation.id, citation.title ?? "", citation.filepath ?? "", "", ""]);
        setIsCitationPanelOpen(true);
    };

    const onLikeResponse = (index: number) => {
        let answer = answers[index];
        setFeedbackMessageIndex(index);
        setIsFeedbackPanelOpen(!isFeedbackPanelOpen);
        setAnswers([...answers.slice(0, index), answer, ...answers.slice(index + 1)]);
    };

    const onDislikeResponse = (index: number) => {
        let answer = answers[index];
        setFeedbackMessageIndex(index);
        setIsFeedbackPanelOpen(!isFeedbackPanelOpen);
        setAnswers([...answers.slice(0, index), answer, ...answers.slice(index + 1)]);
    };

    return (
        <div className={styles.container}>
            <div className={mwStyles.commandsContainer}>
                <SettingsButton className={mwStyles.commandButton} onClick={() => setIsConfigPanelOpen(!isConfigPanelOpen)} />
            </div>
            <Stack horizontal className={styles.chatRoot}>
                <div className={styles.chatContainer}>
                    {!lastQuestionRef.current ? (
                        <Stack className={styles.chatEmptyState}>
                            {/* <img
                                src={AzureOpenAILogo}
                                className={styles.chatIcon}
                                aria-hidden="true"
                            /> */}
                            <h1 className={styles.chatEmptyStateTitle}>Ask question to start.</h1>
                            <h2 className={styles.chatEmptyStateSubtitle}><i>"Entering End-User Personally Identifiable Information (EUPII) and Customer Data is strictly forbidden."</i></h2>
                            <img src="/MWLogo.PNG" height="233" width="233"></img>
                        </Stack>
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
                                                    top_docs: answer[3].top_docs
                                                }}
                                                onCitationClicked={c => onShowCitation(c, index)}
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
                                    <div className={styles.chatMessageGpt}>
                                        <Answer
                                            answer={{
                                                answer: "Generating answer...",
                                                thoughts: null,
                                                data_points: [],
                                                top_docs: []
                                            }}
                                            onCitationClicked={() => null}
                                            onLikeResponseClicked={() => null}
                                                onDislikeResponseClicked={() => null}
                                        />
                                    </div>
                                </>
                            )}
                            <div ref={chatMessageStreamEnd} />
                        </div>
                    )}

                    <Stack horizontal className={styles.chatInput}>
                        {isLoading && (
                            <Stack 
                                horizontal
                                className={styles.stopGeneratingContainer}
                                role="button"
                                aria-label="Stop generating"
                                tabIndex={0}
                                onClick={stopGenerating}
                                onKeyDown={e => e.key === "Enter" || e.key === " " ? stopGenerating() : null}
                                >
                                    <SquareRegular className={styles.stopGeneratingIcon} aria-hidden="true"/>
                                    <span className={styles.stopGeneratingText} aria-hidden="true">Stop generating</span>
                            </Stack>
                        )}
                        <BroomRegular
                            className={styles.clearChatBroom}
                            style={{ background: isLoading || answers.length === 0 ? "#BDBDBD" : "radial-gradient(109.81% 107.82% at 100.1% 90.19%, #0F6CBD 33.63%, #2D87C3 70.31%, #8DDDD8 100%)", 
                                     cursor: isLoading || answers.length === 0 ? "" : "pointer"}}
                            onClick={clearChat}
                            onKeyDown={e => e.key === "Enter" || e.key === " " ? clearChat() : null}
                            aria-label="Clear session"
                            role="button"
                            tabIndex={0}
                        />
                        <QuestionInput
                            clearOnSend
                            placeholder="Type a new question..."
                            disabled={isLoading}
                            onSend={question => makeApiRequest(question)}
                        />
                    </Stack>
                    <h6 className={styles.chatEmptyStateSubtitle}><i>Microsoft Confidential</i></h6>
                </div>
                {answers.length > 0 && isCitationPanelOpen && activeCitation && (
                <Stack.Item className={styles.citationPanel}>
                    <Stack horizontal className={styles.citationPanelHeaderContainer} horizontalAlign="space-between" verticalAlign="center">
                        <span className={styles.citationPanelHeader}>Citations</span>
                        <DismissRegular className={styles.citationPanelDismiss} onClick={() => setIsCitationPanelOpen(false)}/>
                    </Stack>
                    <h5 className={styles.citationPanelTitle}>{activeCitation[2]}</h5>
                    <ReactMarkdown className={styles.citationPanelContent} children={activeCitation[0]} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}/>
                </Stack.Item>
            )}
            </Stack>
            <FeedbackPanel
                    isOpen={isFeedbackPanelOpen}
                    onDismiss={() => setIsFeedbackPanelOpen(false)}
                    selectedContentIndex={settings.acs_index ?? ""}
                    feedbackMessageIndex={feedbackMessageIndex}
                    chatMessages={answers}
                    inDomain={settings.in_domain_only ?? false}
                    allowContact={false}
                />
                <SettingsPanel
                    isOpen={isConfigPanelOpen}
                    onSettingsChanged={(newSettings) => {
                        if (settings.acs_index !== newSettings.acs_index) {
                            clearChat();
                        }

                        setSettings(newSettings);
                    }}
                    onDismiss={() => setIsConfigPanelOpen(false)}
                />
        </div>
    );
};

export default Chat;
