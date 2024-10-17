import React, { Component } from 'react';
import { css } from '@emotion/css';
import { Button, withTheme2 } from '@grafana/ui';
import CustomHeader from './custom-header';
import type { HeaderWithValue, LocalHeader } from '../types';
import { ConfigSection } from '../components/configSection';

export type Props = {
  headers: HeaderWithValue[];
  onChange: (headers: HeaderWithValue[]) => void;
  readOnly: boolean;
  theme: any;  // Add theme to props for withTheme2 HOC
};

type State = {
  headers: LocalHeader[];
};

class CustomHeaders extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      headers: props.headers.map((header) => ({
        ...header,
        id: uniqueId(),
      })),
    };
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.headers !== prevProps.headers) {
      this.setState((prevState) => {
        let changed = false;
        const newHeaders = prevState.headers.map<LocalHeader>((header) => {
          const configured = this.props.headers.find((h) => h.name === header.name)?.configured;
          if (typeof configured !== 'undefined' && header.configured !== configured) {
            changed = true;
            return { ...header, configured };
          }
          return header;
        });

        if (changed) {
          return { headers: newHeaders };
        }

        return prevState;
      });
    }
  }

  onHeaderAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    this.setState(
      (prevState) => ({
        headers: [...prevState.headers, { id: uniqueId(), name: '', value: '', configured: false }],
      }),
      this.triggerChange
    );
  };

  onHeaderChange = (id: string, header: LocalHeader) => {
    this.setState(
      (prevState) => ({
        headers: prevState.headers.map((h) => (h.id === id ? { ...header } : h)),
      }),
      this.triggerChange
    );
  };

  onHeaderDelete = (id: string) => {
    this.setState(
      (prevState) => {
        const index = prevState.headers.findIndex((h) => h.id === id);
        if (index === -1) {
          return prevState;
        }
        const newHeaders = [...prevState.headers];
        newHeaders.splice(index, 1);
        return { headers: newHeaders };
      },
      this.triggerChange
    );
  };

  onBlur = () => {
    this.triggerChange();
  };

  triggerChange = () => {
    const { headers } = this.state;
    this.props.onChange(
      headers.map(({ name, value, configured }) => ({
        name,
        value,
        configured,
      }))
    );
  };

  render() {
    const { readOnly, theme } = this.props;
    const { headers } = this.state;
    const { spacing } = theme;

    const styles = {
      container: css({
        marginTop: spacing(3),
      }),
      addHeaderButton: css({
        marginTop: spacing(1.5),
      }),
    };

    return (
      <div className={styles.container}>
        <ConfigSection
          title="HTTP headers"
          description="Pass along additional context and metadata about the request/response for Metricstore(PromQL)"
          isCollapsible={false}
          isInitiallyOpen
          kind="sub-section"
        >
          <div>
            {headers.map((header) => (
              <CustomHeader
                key={header.id}
                header={header}
                onChange={(header) => this.onHeaderChange(header.id, header)}
                onDelete={() => this.onHeaderDelete(header.id)}
                onBlur={this.onBlur}
                readOnly={readOnly}
              />
            ))}
          </div>
          <div className={styles.addHeaderButton}>
            <Button icon="plus" variant="secondary" fill="outline" onClick={this.onHeaderAdd} disabled={readOnly}>
              {headers.length === 0 ? 'Add header' : 'Add another header'}
            </Button>
          </div>
        </ConfigSection>
      </div>
    );
  }
}

export default withTheme2(CustomHeaders);

function uniqueId(): string {
  return Math.random().toString(16).slice(2);
}
