import React, { Component } from 'react';
import { css, cx } from '@emotion/css';
import { InlineFieldRow, InlineField, Input, IconButton, withTheme2 } from '@grafana/ui';
import type { LocalHeader } from '../types';

export type Props = {
  header: LocalHeader;
  onChange: (header: LocalHeader) => void;
  onBlur: () => void;
  onDelete: () => void;
  readOnly: boolean;
  theme: any;  // Add theme to props for withTheme2 HOC
};

const getCommonStyles = () => {
  return {
    inlineFieldNoMarginRight: css({
      marginRight: 0,
    }),
    // This is dirty hack to make configured secret input grow
    inlineFieldWithSecret: css({
      '[class$="layoutChildrenWrapper"]:first-child': {
        flexGrow: 1,
      },
    }),
  };
};

class CustomHeader extends Component<Props> {
  handleInputChange = (field: 'name' | 'value') => (event: React.ChangeEvent<HTMLInputElement>) => {
    const { header, onChange } = this.props;
    onChange({ ...header, [field]: event.currentTarget.value });
  };

  handleReset = () => {
    const { header, onChange } = this.props;
    onChange({ ...header, configured: false, value: '' });
  };

  render() {
    const { header, onBlur, onDelete, readOnly, theme } = this.props;
    const { spacing } = theme;
    const commonStyles = getCommonStyles();

    const styles = {
      container: css({
        alignItems: 'center',
      }),
      headerNameField: css({
        width: '40%',
        marginRight: 0,
        paddingRight: spacing(1),
      }),
      headerValueField: css({
        width: '45%',
        marginRight: 0,
      }),
      removeHeaderBtn: css({
        margin: `0 0 3px 10px`,
      }),
    };

    return (
      <InlineFieldRow className={styles.container}>
        <InlineField
          label="Header"
          labelWidth={9}
          grow
          className={styles.headerNameField}
          htmlFor={`custom-header-${header.id}-name-input`}
          disabled={readOnly}
        >
          <Input
            id={`custom-header-${header.id}-name-input`}
            placeholder="X-Custom-Header"
            value={header.name}
            onChange={this.handleInputChange('name')}
            onBlur={onBlur}
          />
        </InlineField>
        <InlineField
          label="Value"
          labelWidth={9}
          grow
          className={cx(commonStyles.inlineFieldWithSecret, styles.headerValueField)}
          htmlFor={`custom-header-${header.id}-value-input`}
          disabled={readOnly}
        >
          <Input
            id={`custom-header-${header.id}-value-input`}
            placeholder="Header value"
            value={header.value}
            onChange={this.handleInputChange('value')}
            onReset={readOnly ? () => {} : this.handleReset}
            onBlur={onBlur}
          />
        </InlineField>
        <IconButton
          name="trash-alt"
          tooltip="Remove header"
          tooltipPlacement="top"
          className={styles.removeHeaderBtn}
          onClick={onDelete}
          type="button"
          disabled={readOnly}
        />
      </InlineFieldRow>
    );
  }
}

export default withTheme2(CustomHeader);
