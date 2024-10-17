import { css, CSSObject } from '@emotion/css';
import React, { Component } from 'react';
import { withTheme2 } from '@grafana/ui'; // Assuming you export GrafanaTheme2 and withTheme2 from @grafana/ui
import { GrafanaTheme2 } from '@grafana/data';

import { StringSelector } from '@grafana/e2e-selectors';

interface RadioButtonProps {
  size?: RadioButtonSize;
  disabled?: boolean;
  name?: string;
  description?: string;
  active: boolean;
  id: string;
  onChange: () => void;
  onClick: () => void;
  fullWidth?: boolean;
  'aria-label'?: StringSelector;
  children?: React.ReactNode;
  theme: GrafanaTheme2; // Add theme to props for withTheme2 HOC
  inputRef?: React.RefObject<HTMLInputElement>;
}

export type RadioButtonSize = 'sm' | 'md';

class RadioButton_ extends Component<RadioButtonProps> {
  // inputRef = React.createRef<HTMLInputElement>();

  getStyles = () => {
    const { theme, size, fullWidth } = this.props;
    const { fontSize, height, padding } = getPropertiesForButtonSize(size || 'md', theme);

    const textColor = theme.colors.text.secondary;
    const textColorHover = theme.colors.text.primary;
    // remove the group inner padding (set on RadioButtonGroup)
    const labelHeight = height * theme.spacing.gridSize - 4 - 2;

    return {
      radio: css`
        position: absolute;
        opacity: 0;
        z-index: -1000;

        &:checked + label {
          color: ${theme.colors.text.primary};
          font-weight: ${theme.typography.fontWeightMedium};
          background: ${theme.colors.action.selected};
          z-index: 3;
        }

        &:focus + label,
        &:focus-visible + label {
          ${getFocusStyles(theme)};
        }

        &:focus:not(:focus-visible) + label {
          ${getMouseFocusStyles(theme)}
        }

        &:disabled + label {
          color: ${theme.colors.text.disabled};
          cursor: not-allowed;
        }
      `,
      radioLabel: css`
        display: inline-block;
        position: relative;
        font-size: ${fontSize};
        height: ${labelHeight}px;
        // Deduct border from line-height for perfect vertical centering on windows and linux
        line-height: ${labelHeight}px;
        color: ${textColor};
        padding: ${theme.spacing(0, padding)};
        border-radius: ${theme.shape.borderRadius()};
        background: ${theme.colors.background.primary};
        cursor: pointer;
        z-index: 1;
        flex: ${fullWidth ? `1 0 0` : 'none'};
        text-align: center;
        user-select: none;
        white-space: nowrap;

        &:hover {
          color: ${textColorHover};
        }
      `,
    };
  };

  render() {
    const {
      children,
      active,
      disabled,
      onChange,
      onClick,
      id,
      name,
      description,
      inputRef,
      'aria-label': ariaLabel,
    } = this.props;

    const styles = this.getStyles();

    return (
      <>
        <input
          type="radio"
          className={styles.radio}
          onChange={onChange}
          onClick={onClick}
          disabled={disabled}
          id={id}
          checked={active}
          name={name}
          aria-label={ariaLabel}
          ref={inputRef}
        />
        <label className={styles.radioLabel} htmlFor={id} title={description}>
          {children}
        </label>
      </>
    );
  }
}

export const  RadioButton = withTheme2(RadioButton_);

// Utility functions

export function getMouseFocusStyles(theme: GrafanaTheme2): CSSObject {
  return {
    outline: 'none',
    boxShadow: `none`,
  };
}

export function getFocusStyles(theme: GrafanaTheme2): CSSObject {
  return {
    outline: '2px dotted transparent',
    outlineOffset: '2px',
    boxShadow: `0 0 0 2px ${theme.colors.background.canvas}, 0 0 0px 4px ${theme.colors.primary.main}`,
    transitionTimingFunction: `cubic-bezier(0.19, 1, 0.22, 1)`,
    transitionDuration: '0.2s',
    transitionProperty: 'outline, outline-offset, box-shadow',
  };
}

function getPropertiesForButtonSize(size: any, theme: GrafanaTheme2) {
  switch (size) {
    case 'sm':
      return {
        padding: 1,
        fontSize: theme.typography.size.sm,
        height: theme.components.height.sm,
      };

    case 'lg':
      return {
        padding: 3,
        fontSize: theme.typography.size.lg,
        height: theme.components.height.lg,
      };
    case 'md':
    default:
      return {
        padding: 2,
        fontSize: theme.typography.size.md,
        height: theme.components.height.md,
      };
  }
}
