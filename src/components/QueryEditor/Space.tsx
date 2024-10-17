import { css, cx } from '@emotion/css';
import React, { Component } from 'react';
import { GrafanaTheme2 } from '@grafana/data';
import { withTheme2 } from '@grafana/ui';

export interface SpaceProps {
  v?: number;
  h?: number;
  layout?: 'block' | 'inline';
  theme: GrafanaTheme2; // Add theme to props for withTheme2 HOC
}

/**
 * @deprecated use the Space component from @grafana/ui instead. Available starting from @grafana/ui@10.4.0
 */
class Space extends Component<SpaceProps> {
  static defaultProps = {
    v: 0,
    h: 0,
    layout: 'block' as any,
  };

  getStyles = () => {
    const { theme, v, h, layout } = this.props;
    return {
      wrapper: css([
        {
          paddingRight: theme.spacing(h ?? 0),
          paddingBottom: theme.spacing(v ?? 0),
        },
        layout === 'inline' && {
          display: 'inline-block',
        },
        layout === 'block' && {
          display: 'block',
        },
      ]),
    };
  };

  render() {
    const styles = this.getStyles();
    return <span className={cx(styles.wrapper)} />;
  }
}

export default withTheme2(Space);
