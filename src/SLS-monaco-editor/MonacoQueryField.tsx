import { css } from '@emotion/css';
import { debounce } from 'lodash';
import { slsLanguageDefinition } from './language-definition/definition';
import React, { useRef, useEffect } from 'react';
import { useLatest } from 'react-use';
import { v4 as uuidv4 } from 'uuid';

import { GrafanaTheme2 } from '@grafana/data';
import { selectors } from '@grafana/e2e-selectors';
import { useTheme2, ReactMonacoEditor, Monaco, monacoTypes } from '@grafana/ui';

import { Props } from './MonacoQueryFieldProps';
import { getOverrideServices } from './getOverrideServices';
import { completionItemProvider, language, languageConfiguration } from './language-definition/sls';

const options: monacoTypes.editor.IStandaloneEditorConstructionOptions = {
  codeLens: false,
  contextmenu: false,
  fixedOverflowWidgets: true,
  folding: false,
  fontSize: 14,
  lineDecorationsWidth: 8,
  lineNumbers: 'off',
  minimap: { enabled: false },
  overviewRulerBorder: false,
  overviewRulerLanes: 0,
  padding: {
    top: 4,
    bottom: 5,
  },
  renderLineHighlight: 'none',
  scrollbar: {
    vertical: 'hidden',
    verticalScrollbarSize: 8,
    horizontal: 'hidden',
    horizontalScrollbarSize: 0,
  },
  scrollBeyondLastLine: false,
  // suggest: getSuggestOptions(),
  suggestFontSize: 12,
  wordWrap: 'on',
};

// single line and multiline
const EDITOR_HEIGHT_OFFSET = 2;
const SLS_LANG_ID = slsLanguageDefinition.id;

let SLS_SETUP_STARTED = false;

function ensureSLSQL(monaco: Monaco) {
  if (SLS_SETUP_STARTED === false) {
    SLS_SETUP_STARTED = true;
    const { aliases, extensions, mimetypes } = slsLanguageDefinition;
    monaco.languages.register({ id: SLS_LANG_ID, aliases, extensions, mimetypes });
    monaco.languages.setMonarchTokensProvider(SLS_LANG_ID, language);
    monaco.languages.setLanguageConfiguration(SLS_LANG_ID, languageConfiguration);
    // loader().then((mod) => {
    //   monaco.languages.setMonarchTokensProvider(SLS_LANG_ID, mod.language);
    //   monaco.languages.setLanguageConfiguration(SLS_LANG_ID, mod.languageConfiguration);
    // });
  }
}

const getStyles = (theme: GrafanaTheme2, placeholder: string) => {
  return {
    container: css`
      border-radius: ${theme.shape.borderRadius()};
      border: 1px solid ${theme.components.input.borderColor};
    `,
    placeholder: css`
      ::after {
        content: '${placeholder}';
        font-family: ${theme.typography.fontFamilyMonospace};
        opacity: 0.3;
      }
    `,
  };
};

const MonacoQueryField = (props: Props) => {
  const id = uuidv4();

  const overrideServicesRef = useRef(getOverrideServices());
  const containerRef = useRef<HTMLDivElement>(null);
  const { onBlur, onRunQuery, initialValue, placeholder, onChange } = props;

  // const lpRef = useLatest(languageProvider);
  // const historyRef = useLatest(history);
  const onRunQueryRef = useLatest(onRunQuery);
  const onBlurRef = useLatest(onBlur);
  const onChangeRef = useLatest(onChange);

  const autocompleteDisposeFun = useRef<(() => void) | null>(null);

  const theme = useTheme2();
  const styles = getStyles(theme, placeholder);

  useEffect(() => {
    return () => {
      autocompleteDisposeFun.current?.();
    };
  }, []);

  return (
    <div
      aria-label={selectors.components.QueryField.container}
      className={styles.container}
      ref={containerRef}
    >
      <ReactMonacoEditor
        overrideServices={overrideServicesRef.current}
        options={options}
        language="sls"
        value={initialValue}
        beforeMount={(monaco) => {
          ensureSLSQL(monaco);
        }}
        onMount={(editor, monaco) => {
          const isEditorFocused = editor.createContextKey<boolean>('isEditorFocused' + id, false);

          editor.onDidBlurEditorWidget(() => {
            isEditorFocused.set(false);
            onBlurRef.current(editor.getValue());
          });
          editor.onDidFocusEditorText(() => {
            isEditorFocused.set(true);
          });

          const completionProvider = completionItemProvider

          const filteringCompletionProvider: monacoTypes.languages.CompletionItemProvider = {
            ...completionProvider,
            provideCompletionItems: (model, position, context, token) => {
              if (editor.getModel()?.id !== model.id) {
                return { suggestions: [] };
              }
              return completionProvider.provideCompletionItems(model, position, context, token);
            },
          };

          const { dispose } = monaco.languages.registerCompletionItemProvider(
            SLS_LANG_ID,
            filteringCompletionProvider
          );

          autocompleteDisposeFun.current = dispose;

          const updateElementHeight = () => {
            const containerDiv = containerRef.current;
            if (containerDiv !== null) {
              const pixelHeight = editor.getContentHeight();
              containerDiv.style.height = `${pixelHeight + EDITOR_HEIGHT_OFFSET}px`;
              containerDiv.style.width = '100%';
              const pixelWidth = containerDiv.clientWidth;
              editor.layout({ width: pixelWidth, height: pixelHeight });
            }
          };

          editor.onDidContentSizeChange(updateElementHeight);
          updateElementHeight();


          const updateCurrentEditorValue = debounce(() => {
            const editorValue = editor.getValue();
            onChangeRef.current(editorValue);
          }, 300);

          editor.getModel()?.onDidChangeContent(() => {
            updateCurrentEditorValue();
          });

          editor.addCommand(
            monaco.KeyMod.Shift | monaco.KeyCode.Enter,
            () => {
              onRunQueryRef.current(editor.getValue());
            },
            'isEditorFocused' + id
          );

          if (placeholder) {
            const placeholderDecorators = [
              {
                range: new monaco.Range(1, 1, 1, 1),
                options: {
                  className: styles.placeholder,
                  isWholeLine: true,
                },
              },
            ];

            let decorators: string[] = [];

            const checkDecorators: () => void = () => {
              const model = editor.getModel();

              if (!model) {
                return;
              }

              const newDecorators = model.getValueLength() === 0 ? placeholderDecorators : [];
              decorators = model.deltaDecorations(decorators, newDecorators);
            };

            checkDecorators();
            editor.onDidChangeModelContent(checkDecorators);
          }
        }}
      />
    </div>
  );
};


export default MonacoQueryField;
