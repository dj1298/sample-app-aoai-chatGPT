import React, { useState } from 'react';
import Autosuggest, { SuggestionsFetchRequestedParams } from 'react-autosuggest';

const suggestions: string[] = ['How do I configure Teams guest access?', 'How do I configure Teams direct access?', 'How do I configure Teams meeting policies?'];

const AutosuggestComponent: React.FC = () => {
  const [value, setValue] = useState<string>('');
  const [suggestionsList, setSuggestionsList] = useState<string[]>([]);

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
    <Autosuggest
      suggestions={suggestionsList}
      onSuggestionsFetchRequested={onSuggestionsFetchRequested}
      onSuggestionsClearRequested={onSuggestionsClearRequested}
      onSuggestionSelected={onSuggestionSelected}
      getSuggestionValue={suggestion => suggestion}
      renderSuggestion={suggestion => <div>{suggestion}</div>}
      inputProps={inputProps}
    />
  );
};

export default AutosuggestComponent;
