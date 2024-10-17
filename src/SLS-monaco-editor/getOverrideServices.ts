import { monacoTypes } from '@grafana/ui';

function makeStorageService() {
  const strings = new Map<string, string>();

  strings.set('expandSuggestionDocs', true.toString());

  return {
    onDidChangeValue: (data: unknown): void => undefined,
    onDidChangeTarget: (data: unknown): void => undefined,
    onWillSaveState: (data: unknown): void => undefined,

    get: (key: string, scope: unknown, fallbackValue?: string): string | undefined => {
      return strings.get(key) ?? fallbackValue;
    },

    getBoolean: (key: string, scope: unknown, fallbackValue?: boolean): boolean | undefined => {
      const val = strings.get(key);
      if (val !== undefined) {
        return val === 'true';
      } else {
        return fallbackValue;
      }
    },

    getNumber: (key: string, scope: unknown, fallbackValue?: number): number | undefined => {
      const val = strings.get(key);
      if (val !== undefined) {
        return parseInt(val, 10);
      } else {
        return fallbackValue;
      }
    },

    store: (
      key: string,
      value: string | boolean | number | undefined | null,
      scope: unknown,
      target: unknown
    ): void => {
      if (value === null || value === undefined) {
        strings.delete(key);
      } else {
        strings.set(key, value.toString());
      }
    },

    remove: (key: string, scope: unknown): void => {
      strings.delete(key);
    },

    keys: (scope: unknown, target: unknown): string[] => {
      return Array.from(strings.keys());
    },

    logStorage: (): void => {
      console.log('logStorage: not implemented');
    },

    migrate: (): Promise<void> => {
      return Promise.resolve(undefined);
    },

    isNew: (scope: unknown): boolean => {
      return true;
    },

    flush: (reason?: unknown): Promise<void> => {
      return Promise.resolve(undefined);
    },
  };
}

let overrideServices: monacoTypes.editor.IEditorOverrideServices | null = null;

export function getOverrideServices(): monacoTypes.editor.IEditorOverrideServices {
  if (overrideServices === null) {
    overrideServices = {
      storageService: makeStorageService(),
    };
  }

  return overrideServices;
}
