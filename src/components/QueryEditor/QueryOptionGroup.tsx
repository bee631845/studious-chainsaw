import { css } from '@emotion/css';
import React, { Component } from 'react';
import { getValueFormat, GrafanaTheme2 } from '@grafana/data';
import { config } from '@grafana/runtime';
import { Icon, Tooltip, withTheme2 } from '@grafana/ui';
import { Collapse } from '../Collapse';

import Stack from './Stack';

export type QueryStats = {
  bytes: number;
  // The error message displayed in the UI when we cant estimate the size of the query.
  message?: string;
};

interface Props {
  title: string;
  collapsedInfo: string[];
  queryStats?: QueryStats | null;
  children: React.ReactNode;
  theme: GrafanaTheme2; // Add theme to props for withTheme2 HOC
}

interface State {
  isOpen: boolean;
}

class QueryOptionGroup extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isOpen: false,
    };
  }

  toggleOpen = () => {
    this.setState((prevState) => ({ isOpen: !prevState.isOpen }));
  };

  getStyles = () => {
    const { theme } = this.props;
    return {
      collapse: css({
        backgroundColor: 'unset',
        border: 'unset',
        marginBottom: 0,

        ['> button']: {
          padding: theme.spacing(0, 1),
        },
      }),
      wrapper: css({
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
      }),
      title: css({
        flexGrow: 1,
        overflow: 'hidden',
        fontSize: theme.typography.bodySmall.fontSize,
        fontWeight: theme.typography.fontWeightMedium,
        margin: 0,
      }),
      description: css({
        color: theme.colors.text.secondary,
        fontSize: theme.typography.bodySmall.fontSize,
        fontWeight: theme.typography.bodySmall.fontWeight,
        paddingLeft: theme.spacing(2),
        gap: theme.spacing(2),
        display: 'flex',
      }),
      body: css({
        display: 'flex',
        gap: theme.spacing(2),
        flexWrap: 'wrap',
      }),
      stats: css({
        margin: '0px',
        color: theme.colors.text.secondary,
        fontSize: theme.typography.bodySmall.fontSize,
      }),
      tooltip: css({
        marginRight: theme.spacing(0.25),
      }),
    };
  };

  render() {
    const { title, children, collapsedInfo, queryStats } = this.props;
    const { isOpen } = this.state;
    const styles = this.getStyles();

    return (
      <div className={styles.wrapper}>
        <Collapse
          className={styles.collapse}
          collapsible
          isOpen={isOpen}
          onToggle={this.toggleOpen}
          label={
            <Stack gap={0}>
              <h6 className={styles.title}>{title}</h6>
              {!isOpen && (
                <div className={styles.description}>
                  {collapsedInfo.map((x, i) => (
                    <span key={i}>{x}</span>
                  ))}
                </div>
              )}
            </Stack>
          }
        >
          <div className={styles.body}>{children}</div>
        </Collapse>
        {/**TODO: This is Loki logic that should eventually be moved to Loki */}
        {queryStats && config.featureToggles.lokiQuerySplitting && (
          <Tooltip content="Note: the query will be split into multiple parts and executed in sequence. Query limits will only apply each individual part.">
            <Icon tabIndex={0} name="info-circle" className={styles.tooltip} size="sm" />
          </Tooltip>
        )}

        {queryStats && <p className={styles.stats}>{generateQueryStats(queryStats)}</p>}
      </div>
    );
  }
}

export default withTheme2(QueryOptionGroup);

const generateQueryStats = (queryStats: QueryStats) => {
  if (queryStats.message) {
    return queryStats.message;
  }

  return `This query will process approximately ${convertUnits(queryStats)}.`;
};

const convertUnits = (queryStats: QueryStats): string => {
  const { text, suffix } = getValueFormat('bytes')(queryStats.bytes, 1);
  return text + suffix;
};
