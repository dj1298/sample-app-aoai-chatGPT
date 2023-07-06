import { Checkbox, DefaultButton, Dropdown, IDropdownOption, Panel } from "@fluentui/react";
import { useState } from "react";
import { AcsIndex, Settings } from "../../api/mw.models";

import styles from "./SettingsPanel.module.css";

export interface ISettingsPanelProps {
  isOpen: boolean;
  onSettingsChanged: (settings: Settings) => void;
  onDismiss: () => void;
}

const acsIndexOptions: IDropdownOption[] = [
  { key: AcsIndex.M365Combined, text: "Modern Work Content" },
  { key: AcsIndex.MWOnPrem, text: "Modern Work On-Premises Content" },
];

export const SettingsPanel : React.FC<ISettingsPanelProps> = ({ isOpen, onSettingsChanged, onDismiss }) => {
  const [enableInDomainOnly, setEnableInDomainOnly] = useState<boolean>(true);
  const [acsIndex, setacsIndex] = useState<AcsIndex>(AcsIndex.M365Combined);

  const onACSIndexDropDownChanged = (
    _event: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption | undefined,
    _index?: number | undefined
  ): void => {
    if (option) {
      setacsIndex(option.key as AcsIndex);
    }
  };

  const onInDomainOnlyChanged = (
    _ev?: React.FormEvent<HTMLElement | HTMLInputElement>,
    checked?: boolean
  ) => {
    setEnableInDomainOnly(checked || false);
  };

  const handleDismiss = () => {
    onSettingsChanged({ acs_index: acsIndex, in_domain_only: enableInDomainOnly});
    onDismiss();
  }

  return (
    <Panel
      headerText="Configure Resources"
      isOpen={isOpen}
      isBlocking={true}
      onDismiss={handleDismiss}
      closeButtonAriaLabel="Close"
      onRenderFooterContent={() => (
        <DefaultButton onClick={handleDismiss}>
          Close
        </DefaultButton>
      )}
      isFooterAtBottom={true}
    >
      <Dropdown
        className={styles.chatSettingsSeparator}
        selectedKey={acsIndex}
        options={acsIndexOptions}
        label="Content Catalog"
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
