import { HistoryItem } from '@grafana/data';

export type Props = {
  initialValue: string;
  languageProvider: any;
  history: Array<HistoryItem<any>>;
  placeholder: string;
  onRunQuery: (value: string) => void;
  onBlur: (value: string) => void;
  onChange: (value: string) => void;
};
