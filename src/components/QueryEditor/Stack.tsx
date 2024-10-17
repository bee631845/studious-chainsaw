import { css } from '@emotion/css';
import React, { Component, CSSProperties } from 'react';
import { withTheme2 } from '@grafana/ui';
import {GrafanaTheme2} from '@grafana/data'

interface StackProps {
  direction?: CSSProperties['flexDirection'];
  alignItems?: CSSProperties['alignItems'];
  wrap?: boolean;
  gap?: number;
  flexGrow?: CSSProperties['flexGrow'];
  theme: GrafanaTheme2; // Add theme to props for withTheme2 HOC
}

/**
 * @deprecated use the Stack component from @grafana/ui instead. Available starting from @grafana/ui@10.2.3
 */
class Stack extends Component<React.PropsWithChildren<StackProps>> {
  static defaultProps = {
    direction: 'row' as any,
    wrap: true,
    gap: 2,
  };

  getStyles = () => {
    const { theme, direction = 'row', wrap = true, alignItems, gap = 2, flexGrow } = this.props;
    return {
      root: css({
        display: 'flex',
        flexDirection: direction,
        flexWrap: wrap ? 'wrap' : undefined,
        alignItems: alignItems,
        gap: theme.spacing(gap),
        flexGrow: flexGrow,
        width: '100%'
      }),
    };
  };

  render() {
    const styles = this.getStyles();
    const { children } = this.props;

    return <div className={styles.root}>{children}</div>;
  }
}

export default withTheme2(Stack);

