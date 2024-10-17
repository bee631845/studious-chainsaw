import { css, cx } from '@emotion/css';
import React, { Component } from 'react';

import { GrafanaTheme2, colorManipulator } from '@grafana/data';
import { getFocusStyles, getMouseFocusStyles } from './RadioButtonGroup/RadioButton';
import { Icon, IconName, IconSize, IconType, PopoverContent, Tooltip, withTheme2 } from '@grafana/ui';

export type IconButtonVariant = 'primary' | 'secondary' | 'destructive';

export interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Name of the icon **/
  name: IconName;
  /** Icon size */
  size?: IconSize;
  /** Type of the icon - mono or default */
  iconType?: IconType;
  /** Tooltip content to display on hover */
  tooltip?: PopoverContent;
  /** Position of the tooltip */
  tooltipPlacement?: TooltipPlacement;
  /** Variant to change the color of the Icon */
  variant?: IconButtonVariant;
  /** Text available only for screen readers. Will use tooltip text as fallback. */
  ariaLabel?: string;
  /** Theme object injected by withTheme2 HOC */
  theme: GrafanaTheme2;
  innerRef?: React.Ref<HTMLButtonElement>;
}

class IconButton_ extends Component<Props> {
  static defaultProps = {
    size: 'md' as any,
    variant: 'secondary' as any,
  };

  getStyles = () => {
    const { theme, size, variant } = this.props;
    const pixelSize = getSvgSize(size || 'md');
    const hoverSize = Math.max(pixelSize / 3, 8);
    let iconColor = theme.colors.text.primary;

    if (variant === 'primary') {
      iconColor = theme.colors.primary.text;
    } else if (variant === 'destructive') {
      iconColor = theme.colors.error.text;
    }

    return {
      button: css`
        width: ${pixelSize}px;
        height: ${pixelSize}px;
        background: transparent;
        border: none;
        color: ${iconColor};
        padding: 0;
        margin: 0;
        outline: none;
        box-shadow: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        position: relative;
        border-radius: ${theme.shape.borderRadius()};
        z-index: 0;
        margin-right: ${theme.spacing(0.5)};

        &[disabled],
        &:disabled {
          cursor: not-allowed;
          color: ${theme.colors.action.disabledText};
          opacity: 0.65;
          box-shadow: none;
        }

        &:before {
          content: '';
          display: block;
          opacity: 1;
          position: absolute;
          transition-duration: 0.2s;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          z-index: -1;
          bottom: -${hoverSize}px;
          left: -${hoverSize}px;
          right: -${hoverSize}px;
          top: -${hoverSize}px;
          background: none;
          border-radius: 50%;
          box-sizing: border-box;
          transform: scale(0);
          transition-property: transform, opacity;
        }

        &:focus,
        &:focus-visible {
          ${getFocusStyles(theme)}
        }

        &:focus:not(:focus-visible) {
          ${getMouseFocusStyles(theme)}
        }

        &:hover {
          color: ${iconColor};

          &:before {
            background-color: ${variant === 'secondary'
              ? theme.colors.action.hover
              : colorManipulator.alpha(iconColor, 0.12)};
            border: none;
            box-shadow: none;
            opacity: 1;
            transform: scale(0.8);
          }
        }
      `,
      icon: css`
        vertical-align: baseline;
        display: flex;
      `,
    };
  };

  render() {
    const {
      name,
      size = 'md',
      iconType,
      tooltip,
      tooltipPlacement,
      ariaLabel,
      className,
      variant = 'secondary',
      theme,
      ...restProps
    } = this.props;

    const styles = this.getStyles();
    const tooltipString = typeof tooltip === 'string' ? tooltip : '';

    const button = (
      <button ref={this.props.innerRef} aria-label={ariaLabel || tooltipString} {...restProps} className={cx(styles.button, className)}>
        <Icon name={name} size={size} className={styles.icon} type={iconType} />
      </button>
    );

    if (tooltip) {
      return (
        <Tooltip content={tooltip} placement={tooltipPlacement}>
          {button}
        </Tooltip>
      );
    }

    return button;
  }
}



export const IconButton = withTheme2(IconButton_);

/* Transform string with px to number and add 2 pxs as path in svg is 2px smaller */
export function getSvgSize(size: IconSize) {
  switch (size) {
    case 'xs':
      return 12;
    case 'sm':
      return 14;
    case 'md':
      return 16;
    case 'lg':
      return 18;
    case 'xl':
      return 24;
    case 'xxl':
      return 36;
    case 'xxxl':
      return 48;
  }
}

export type TooltipPlacement =
  | 'auto-start'
  | 'auto'
  | 'auto-end'
  | 'top-start'
  | 'top'
  | 'top-end'
  | 'right-start'
  | 'right'
  | 'right-end'
  | 'bottom-end'
  | 'bottom'
  | 'bottom-start'
  | 'left-end'
  | 'left'
  | 'left-start';
