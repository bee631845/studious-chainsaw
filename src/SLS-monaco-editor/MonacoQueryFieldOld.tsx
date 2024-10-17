import { Button, CodeEditor, Monaco, MonacoEditor } from '@grafana/ui';
import React, { useCallback, useRef, useState } from 'react';
import { Props } from './MonacoQueryFieldProps';

export class Deferred<T = any> {
  resolve?: (reason?: T | PromiseLike<T>) => void;
  reject?: (reason?: any) => void;
  promise: Promise<T>;

  constructor() {
    this.resolve = undefined;
    this.reject = undefined;

    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve as any;
      this.reject = reject;
    });
    Object.freeze(this);
  }
}

interface MonacoPromise {
  editor: MonacoEditor;
  monaco: Monaco;
}

const QueryField: React.FC<Props & { disableMultiLine?: boolean }> = ({
  initialValue: query,
  onChange,
  disableMultiLine,
}) => {
  const monacoPromiseRef = useRef<Deferred<MonacoPromise>>();
  const [queryHeight, setQueryHeight] = useState<number>(30);
  const handleEditorMount = useCallback((editor: MonacoEditor, monaco: Monaco) => {
    monacoPromiseRef.current?.resolve?.({ editor, monaco });
  }, []);

  return (
    <div style={{ width: '100%' }}>
      <div style={{ width: 'calc(100% - 65px)', display: 'inline-block', fontSize: '14px' }}>
        <CodeEditor
          value={query}
          language="sql"
          height={queryHeight}
          width="100%"
          showMiniMap={false}
          onBlur={onChange}
          onSave={onChange}
          onEditorDidMount={handleEditorMount}
          monacoOptions={{ contextmenu: true, codeLens: true, overviewRulerBorder: true }}
        />
      </div>
      {!disableMultiLine && (
        <div style={{ width: '60px', height: '100%', display: 'inline-block', float: 'right' }}>
          <Button
            icon="angle-up"
            variant="secondary"
            size="sm"
            disabled={queryHeight === 30}
            onClick={() => {
              setQueryHeight(queryHeight - 30);
            }}
          />
          <Button
            icon="angle-down"
            variant="secondary"
            size="sm"
            disabled={queryHeight === 120}
            onClick={() => {
              setQueryHeight(queryHeight + 30);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default QueryField;
