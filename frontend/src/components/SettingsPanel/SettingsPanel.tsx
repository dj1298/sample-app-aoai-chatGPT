import { Checkbox, DefaultButton, Dropdown, IDropdownOption, Panel } from "@fluentui/react";
import { useState } from "react";
import { Settings } from "../../api/mw.models";

import styles from "./SettingsPanel.module.css";

export interface ISettingsPanelProps {
  isOpen: boolean;
  onSettingsChanged: (settings: Settings) => void;
  onDismiss: () => void;
}

const acsIndexOptions: IDropdownOption[] = [
  { key: "m365index", text: "M365 Combined Index" },
  { key: "commerceindex", text: "Commerce Index" },
  { key: "exchangeoutlookindex", text: "Exchange Outlook Index" },
  { key: "mdoindex", text: "MDO Index" },
  { key: "odspindex", text: "ODSP Index" },
  { key: "purviewindex", text: "Purview Index" },
  { key: "teamsindex", text: "Teams Index" },
];

export const SettingsPanel : React.FC<ISettingsPanelProps> = ({ isOpen, onSettingsChanged, onDismiss }) => {
  const [enableInDomainOnly, setEnableInDomainOnly] = useState<boolean>(true);
  const [acsIndex, setacsIndex] = useState<string>("m365index");

  const onACSIndexDropDownChanged = (
    _event: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption | undefined,
    _index?: number | undefined
  ): void => {
    if (option) {
      setacsIndex(option.key.toString());
    }
  };

  const onInDomainOnlyChanged = (
    _ev?: React.FormEvent<HTMLElement | HTMLInputElement>,
    checked?: boolean
  ) => {
    setEnableInDomainOnly(checked || false);
  };

  return (
    <Panel
      headerText="Configure Resources"
      isOpen={isOpen}
      isBlocking={false}
      onDismiss={onDismiss}
      closeButtonAriaLabel="Close"
      onRenderFooterContent={() => (
        <DefaultButton onClick={onDismiss}>
          Close
        </DefaultButton>
      )}
      isFooterAtBottom={true}
    >
      <Dropdown
        className={styles.chatSettingsSeparator}
        selectedKey={acsIndex}
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
    </Panel>
  );
};
