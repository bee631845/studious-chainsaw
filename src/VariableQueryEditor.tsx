import React, { ChangeEvent, PureComponent } from 'react';
import { SLSDataSourceOptions, SLSQuery } from './types';

import { InlineFormLabel } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { SLSDataSource } from './datasource';
import MonacoQueryField from 'SLS-monaco-editor/MonacoQueryField';
import MonacoQueryFieldOld from 'SLS-monaco-editor/MonacoQueryFieldOld';
import { version } from 'const';
import { SLSQueryEditor } from 'QueryEditor';
// const { FormField } = LegacyForms;

type Props = QueryEditorProps<SLSDataSource, SLSQuery, SLSDataSourceOptions>;

export class SLSVariableQueryEditor extends PureComponent<Props> {
  onQueryTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, query: event.target.value });
  };

  onQueryTextChangeString = (value: string) => {
    const { onChange, query } = this.props;
    onChange({ ...query, query: value });
  };

  onQueryTextChangeWithRunQuery = (value: string) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, query: value });
    // executes the query
    onRunQuery();
  };

  render() {
    const { query } = this.props.query;

    return (
      <>
        <div className="gf-form gf-form--grow flex-shrink-1 min-width-15">
          {/* <FormField
            style={{ fontFamily: 'Menlo, monospace' }}
            labelWidth={6}
            inputWidth={30}
            value={query}
            onChange={this.onQueryTextChange}
            label="query"
          /> */}
          <InlineFormLabel width={6} className="query-keyword">
            Query
          </InlineFormLabel>
          {version === '' ||
          version.startsWith('8.0') ||
          version.startsWith('8.1') ||
          version.startsWith('8.2') ||
          version.startsWith('7') ? (
            // <input
            //   className="gf-form-input"
            //   value={query}
            //   onChange={this.onQueryTextChange}
            //   onBlur={this.onQueryTextChange}
            //   style={{ fontFamily: 'Menlo, monospace' }}
            // ></input>
            <div style={{ width: "100%" }}>
              <MonacoQueryFieldOld
                onChange={this.onQueryTextChangeWithRunQuery}
                onRunQuery={this.onQueryTextChangeWithRunQuery}
                onBlur={this.onQueryTextChangeString}
                initialValue={query ?? ''}
                languageProvider={{} as any}
                history={[]}
                placeholder={''}
                disableMultiLine={true}
              />
            </div>
          ) : (
            <MonacoQueryField
              onChange={this.onQueryTextChangeString}
              onRunQuery={this.onQueryTextChangeWithRunQuery}
              onBlur={this.onQueryTextChangeString}
              initialValue={query ?? ''}
              languageProvider={{} as any}
              history={[]}
              placeholder={''}
            />
          )}
        </div>
      </>
    );
  }
}




export function SLSVariableQueryEditorWapper (props: Props) {
  return <SLSQueryEditor {...props} isVariable />
}
