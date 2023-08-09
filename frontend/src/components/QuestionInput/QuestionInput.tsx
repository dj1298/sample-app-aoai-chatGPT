import { useState } from "react";
import { Stack, TextField } from "@fluentui/react";
import { SendRegular } from "@fluentui/react-icons";
import Send from "../../assets/Send.svg";
import styles from "./QuestionInput.module.css";
import AutosuggestComponent from "./AutoSuggest";

import Autosuggest, { SuggestionsFetchRequestedParams } from 'react-autosuggest';
const suggestions: string[] = ['How do I configure Teams guest access?', 'How do I configure Teams direct access?', 'How do I configure Teams meeting policies?'];

interface Props {
    onSend: (value: string) => void;
    disabled: boolean;
    placeholder?: string;
    clearOnSend?: boolean;
}

export const QuestionInput = ({ onSend, disabled, placeholder, clearOnSend }: Props) => {
    const [question, setQuestion] = useState<string>("");
    const [value, setValue] = useState<string>('');
    const [suggestionsList, setSuggestionsList] = useState<string[]>([]);

    const sendQuestion = () => {
        if (disabled || !value.trim()) {
            return;
        }

        onSend(value);

        if (clearOnSend) {
            setValue("");
        }
    };

    const onEnterPress = (ev: React.KeyboardEvent<Element>) => {
        if (ev.key === "Enter" && !ev.shiftKey) {
            ev.preventDefault();
            sendQuestion();
        }
    };

    const onQuestionChange = (_ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setValue(newValue || "");

    };

    const sendQuestionDisabled = disabled || !value.trim();
    

    const getSuggestions = (inputValue: string): string[] => {
        return suggestions.filter(suggestion =>
            suggestion.toLowerCase().includes(inputValue.toLowerCase())
        );
    };

    const onSuggestionsFetchRequested = ({ value }: SuggestionsFetchRequestedParams) => {
        setSuggestionsList(getSuggestions(value));
    };

    const onSuggestionsClearRequested = () => {
        setSuggestionsList([]);
    };

    const onSuggestionSelected = (_event: React.FormEvent, { suggestionValue }: { suggestionValue: string }) => {
        // Handle the selected suggestion here
        setValue(suggestionValue);
    };

    const inputProps = {
        value,
        onChange: (_event: React.FormEvent, { newValue }: { newValue: string }) => {
        setValue(newValue);
        }
    };





    return (
        <Stack horizontal className={styles.questionInputContainer}>
            <TextField
                className={styles.questionInputTextArea}
                placeholder={placeholder}
                multiline
                resizable={false}
                borderless
                value={value}
                onChange={onQuestionChange}
                onKeyDown={onEnterPress}
            />
            <div className={styles.questionInputSendButtonContainer} 
                role="button" 
                tabIndex={0}
                aria-label="Ask question button"
                onClick={sendQuestion}
                onKeyDown={e => e.key === "Enter" || e.key === " " ? sendQuestion() : null}
            >
                { sendQuestionDisabled ? 
                    <SendRegular className={styles.questionInputSendButtonDisabled}/>
                    :
                    <img src={Send} className={styles.questionInputSendButton}/>
                }
            </div>
            <div className={styles.questionInputBottomBorder} />
            
            <Autosuggest 
                suggestions={suggestionsList}
                onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                onSuggestionsClearRequested={onSuggestionsClearRequested}
                onSuggestionSelected={onSuggestionSelected}
                getSuggestionValue={suggestion => suggestion}
                renderSuggestion={suggestion => <div>{suggestion}</div>}
                inputProps={inputProps}
            />
        </Stack>
    );
};
