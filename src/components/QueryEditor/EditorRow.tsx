import { css } from '@emotion/css';
import React, { Component } from 'react';
import { withTheme2 } from '@grafana/ui'; // Assuming you export GrafanaTheme2 and withTheme2 from @grafana/ui
import { GrafanaTheme2 } from '@grafana/data';

import Stack from './Stack';

interface EditorRowProps {
  theme: GrafanaTheme2; // Add theme to props for withTheme2 HOC
}

interface EditorRowState {}

class EditorRow extends Component<React.PropsWithChildren<EditorRowProps>, EditorRowState> {
  getStyles = () => {
    const { theme } = this.props;

    return {
      root: css({
        backgroundColor: theme.colors.background.secondary,
        borderRadius: theme.shape.borderRadius(1),
      }),
    };
  };

  render() {
    const { children } = this.props;
    const styles = this.getStyles();

    return (
      <div className={styles.root}>
        <Stack gap={2}>{children}</Stack>
      </div>
    );
  }
}

export default withTheme2(EditorRow);
