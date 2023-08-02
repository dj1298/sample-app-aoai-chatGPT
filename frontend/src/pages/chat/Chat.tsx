import { useRef, useState, useEffect } from "react";
import { Stack } from "@fluentui/react";
import { BroomRegular, DismissRegular, SquareRegular, ShieldLockRegular, ErrorCircleRegular } from "@fluentui/react-icons";

import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm'
import rehypeRaw from "rehype-raw"; 

import styles from "./Chat.module.css";
import Azure from "../../assets/Azure.svg";
import AzureOpenAILogo from "../../assets/AzureOpenAILogo.svg";
import CSSGPT10_250_250 from "../../assets/CSSGPT10_250_250.jpg"
import mwStyles from "./Chat.mw.module.css";

import {
    ChatMessage,
    ConversationRequest,
    conversationApi,
    Citation,
    ToolMessageContent,
    ChatResponse,
    getUserInfo,
    Diagnostic
} from "../../api";
import { Answer } from "../../components/Answer";
import { QuestionInput } from "../../components/QuestionInput";
import { AcsIndex, Settings } from "../../api/mw.models";
import { FeedbackPanel } from "../../components/FeedbackPanel/FeedbackPanel";
import { SettingsPanel } from "../../components/SettingsPanel/SettingsPanel";
import { SettingsButton } from "../../components/SettingsButton";
import { DiagnosticButton} from "../../components/DiagnosticButton"
import { DiagnosticPanel } from "../../components/DiagnosticPanel/DiagnosticPanel";
import { MwFooter } from "../../components/MwFooter/MwFooter";


const Chat = () => {
    const [isFeedbackPanelOpen, setIsFeedbackPanelOpen] = useState(false);
    const [feedbackMessageIndex, setFeedbackMessageIndex] = useState(-1);
    const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
    const [settings, setSettings] = useState<Settings>({
        acs_index: AcsIndex.M365Combined,
        in_domain_only: true,
    });

    const lastQuestionRef = useRef<string>("");
    const chatMessageStreamEnd = useRef<HTMLDivElement | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showLoadingMessage, setShowLoadingMessage] = useState<boolean>(false);
    const [activeCitation, setActiveCitation] = useState<[content: string, id: string, title: string, filepath: string, url: string, metadata: string]>();
    const [isCitationPanelOpen, setIsCitationPanelOpen] = useState<boolean>(false);
    const [isDiagnosticPanelOpen, setIsDiagnosticPanelOpen] = useState(false);
    const [answers, setAnswers] = useState<ChatMessage[]>([]);
    const abortFuncs = useRef([] as AbortController[]);
    const [showAuthMessage, setShowAuthMessage] = useState<boolean>(true);
    
    const getUserInfoList = async () => {
        const userInfoList = await getUserInfo();
        if (userInfoList.length === 0 && window.location.hostname !== "127.0.0.1") {
            setShowAuthMessage(true);
        }
        else {
            setShowAuthMessage(false);
        }
    }

    const makeApiRequest = async (question: string) => {
        lastQuestionRef.current = question;

        setIsLoading(true);
        setShowLoadingMessage(true);
        const abortController = new AbortController();
        abortFuncs.current.unshift(abortController);

        const userMessage: ChatMessage = {
            role: "user",
            content: question
        };

        const request: ConversationRequest = {
            messages: [...answers.filter((answer) => answer.role !== "error"), userMessage],
            settings: settings,
        };

        let result = {} as ChatResponse;
        try {
            const response = await conversationApi(request, abortController.signal);
            if (response?.body) {
                
                const reader = response.body.getReader();
                let runningText = "";
                while (true) {
                    const {done, value} = await reader.read();
                    if (done) break;

                    var text = new TextDecoder("utf-8").decode(value);
                    const objects = text.split("\n");
                    objects.forEach((obj) => {
                        try {
                            runningText += obj;
                            result = JSON.parse(runningText);
                            setShowLoadingMessage(false);
                            setAnswers([...answers, userMessage, ...result.choices[0].messages]);
                            runningText = "";
                        }
                        catch { }
                    });
                }
                setAnswers([...answers, userMessage, ...result.choices[0].messages]);
            }
            
        } catch ( e )  {
            if (!abortController.signal.aborted) {
                console.error(result);
                let errorMessage = "An error occurred. Please try again. If the problem persists, please contact the site administrator.";
                if (result.error?.message) {
                    errorMessage = result.error.message;
                }
                else if (typeof result.error === "string") {
                    errorMessage = result.error;
                }
                setAnswers([...answers, userMessage, {
                    role: "error",
                    content: errorMessage
                }]);
            } else {
                setAnswers([...answers, userMessage]);
            }
        } finally {
            setIsLoading(false);
            setShowLoadingMessage(false);
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
        setShowLoadingMessage(false);
        setIsLoading(false);
    }

    useEffect(() => {
        getUserInfoList();
    }, []);

    useEffect(() => chatMessageStreamEnd.current?.scrollIntoView({ behavior: "smooth" }), [showLoadingMessage]);

    const onShowCitation = (citation: Citation) => {
        setActiveCitation([citation.content, citation.id, citation.title ?? "", citation.filepath ?? "", citation.url ?? "", ""]);
        setIsCitationPanelOpen(true);
    };

    const onShowDiagnostic = (diagnostic: Diagnostic) => {
        setIsDiagnosticPanelOpen(true);
    }

    const parseCitationFromMessage = (message: ChatMessage) => {
        if (message.role === "tool") {
            try {
                const toolMessage = JSON.parse(message.content) as ToolMessageContent;
                return toolMessage.citations;
            }
            catch {
                return [];
            }
        }
        return [];
    }

    const parseDiagnosticsFromMessage = (message: ChatMessage) => {
        if (message.role === "tool") {
            try {
                const toolMessage = JSON.parse(message.content) as ToolMessageContent;
                return toolMessage.diagnostics;
            }
            catch {
                return [];
            }
        }
        return [];
    }

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
        <div className={styles.container} role="main">
             <div className={mwStyles.commandsContainer}>
                <SettingsButton className={mwStyles.commandButton} onClick={() => setIsConfigPanelOpen(!isConfigPanelOpen)} />
                <DiagnosticButton className={mwStyles.commandButton} onClick={() => setIsDiagnosticPanelOpen(!isDiagnosticPanelOpen)} />
            </div>
            {showAuthMessage ? (
                <Stack className={styles.chatEmptyState}>
                    <ShieldLockRegular className={styles.chatIcon} style={{color: 'darkorange', height: "200px", width: "200px"}}/>
                    <h1 className={styles.chatEmptyStateTitle}>Authentication Not Configured</h1>
                    <h2 className={styles.chatEmptyStateSubtitle}>
                        This app does not have authentication configured. Please add an identity provider by finding your app in the 
                        <a href="https://portal.azure.com/" target="_blank"> Azure Portal </a>
                        and following 
                         <a href="https://learn.microsoft.com/en-us/azure/app-service/scenario-secure-app-authentication-app-service#3-configure-authentication-and-authorization" target="_blank"> these instructions</a>.
                    </h2>
                    <h2 className={styles.chatEmptyStateSubtitle} style={{fontSize: "20px"}}><strong>Authentication configuration takes a few minutes to apply. </strong></h2>
                    <h2 className={styles.chatEmptyStateSubtitle} style={{fontSize: "20px"}}><strong>If you deployed in the last 10 minutes, please wait and reload the page after 10 minutes.</strong></h2>
                </Stack>
            ) : (
                <Stack horizontal className={styles.chatRoot}>
                    <div className={styles.chatContainer}>
                        {!lastQuestionRef.current ? (
                            <Stack className={styles.chatEmptyState}>
                                <h1 className={styles.chatEmptyStateTitle}>Ask a question to start.</h1>
                                <h2 className={styles.chatEmptyStateSubtitle}><i>"Entering End-User Personally Identifiable Information (EUPII) and Customer Data is strictly forbidden."</i></h2>
                                <img src={CSSGPT10_250_250} height="250" width="250"></img>
                            </Stack>
                        ) : (
                            <div className={styles.chatMessageStream} style={{ marginBottom: isLoading ? "40px" : "0px"}} role="log">
                                {answers.map((answer, index) => (
                                    <>
                                        {answer.role === "user" ? (
                                            <div className={styles.chatMessageUser} tabIndex={0}>
                                                <div className={styles.chatMessageUserMessage}>{answer.content}</div>
                                            </div>
                                        ) : (
                                            answer.role === "assistant" ? <div className={styles.chatMessageGpt}>
                                                <Answer
                                                    answer={{
                                                        answer: answer.content,
                                                        citations: parseCitationFromMessage(answers[index - 1]),
                                                        diagnostics: parseDiagnosticsFromMessage(answers[index - 1]),
                                                    }}
                                                    onCitationClicked={c => onShowCitation(c)}
                                                    onDiagnosticClicked={d => onShowDiagnostic(d)}
                                                    onLikeResponseClicked={() => onLikeResponse(index)}
                                                    onDislikeResponseClicked={() => onDislikeResponse(index)}
                                                />
                                            </div> : answer.role === "error" ? <div className={styles.chatMessageError}>
                                                <Stack horizontal className={styles.chatMessageErrorContent}>
                                                    <ErrorCircleRegular className={styles.errorIcon} style={{color: "rgba(182, 52, 67, 1)"}} />
                                                    <span>Error</span>
                                                </Stack>
                                                <span className={styles.chatMessageErrorContent}>{answer.content}</span>
                                            </div> : null
                                        )}
                                    </>
                                ))}
                                {showLoadingMessage && (
                                    <>
                                        <div className={styles.chatMessageUser}>
                                            <div className={styles.chatMessageUserMessage}>{lastQuestionRef.current}</div>
                                        </div>
                                        <div className={styles.chatMessageGpt}>
                                            <Answer
                                                answer={{
                                                    answer: "Generating answer...",
                                                    citations: [],
                                                    diagnostics: [],
                                                }}
                                                onCitationClicked={() => null}
                                                onDiagnosticClicked={() => null}
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
                            <div
                                role="button"
                                tabIndex={0}
                                onClick={clearChat}
                                onKeyDown={e => e.key === "Enter" || e.key === " " ? clearChat() : null}
                                aria-label="Clear session"
                                >
                                <BroomRegular
                                    className={styles.clearChatBroom}
                                    style={{ background: isLoading || answers.length === 0 ? "#BDBDBD" : "radial-gradient(109.81% 107.82% at 100.1% 90.19%, #0F6CBD 33.63%, #2D87C3 70.31%, #8DDDD8 100%)", 
                                            cursor: isLoading || answers.length === 0 ? "" : "pointer"}}
                                    aria-hidden="true"
                                />
                            </div>
                            <QuestionInput
                                clearOnSend
                                placeholder="Type a new question..."
                                disabled={isLoading}
                                onSend={question => makeApiRequest(question)}
                            />
                        </Stack>
                        <MwFooter />
                    </div>
                    {answers.length > 0 && isCitationPanelOpen && activeCitation && (
                    <Stack.Item className={styles.citationPanel} tabIndex={0} role="tabpanel" aria-label="Citations Panel">
                        <Stack horizontal className={styles.citationPanelHeaderContainer} horizontalAlign="space-between" verticalAlign="center">
                            <span className={styles.citationPanelHeader}>Citations</span>
                            <DismissRegular className={styles.citationPanelDismiss} onClick={() => setIsCitationPanelOpen(false)}/>
                        </Stack>
                                {activeCitation[4] ? (
                                    <a href={activeCitation[4]} target="_blank">
                                        <h5 className={styles.citationPanelTitle} tabIndex={0}>{activeCitation[2]}</h5>
                                    </a>
                                ) : (
                                    <h5 className={styles.citationPanelTitle} tabIndex={0}>{activeCitation[2]}</h5>
                                )}
                        <div tabIndex={0}> 
                        <ReactMarkdown 
                            linkTarget="_blank"
                            className={styles.citationPanelContent}
                            children={activeCitation[0]} 
                            remarkPlugins={[remarkGfm]} 
                            rehypePlugins={[rehypeRaw]}
                        />
                        </div>
                        
                    </Stack.Item>
                )}
                </Stack>
            )}
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
            <DiagnosticPanel
                isOpen={isDiagnosticPanelOpen}
                onDismiss={() => setIsDiagnosticPanelOpen(false)}
            />
        </div>
    );
};

export default Chat;
