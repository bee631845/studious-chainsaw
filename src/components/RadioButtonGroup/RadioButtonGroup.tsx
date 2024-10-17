import { css, cx } from '@emotion/css';
import { uniqueId } from 'lodash';
import React, { Component, createRef } from 'react';

import { GrafanaTheme2, SelectableValue } from '@grafana/data';
import { Icon, withTheme2 } from '@grafana/ui'; // Assuming you export GrafanaTheme2 and withTheme2 from @grafana/ui

import { RadioButtonSize, RadioButton } from './RadioButton';

interface RadioButtonGroupProps<T> {
  value?: T;
  id?: string;
  disabled?: boolean;
  disabledOptions?: T[];
  options: Array<SelectableValue<T>>;
  onChange?: (value: T) => void;
  onClick?: (value: T) => void;
  size?: RadioButtonSize;
  fullWidth?: boolean;
  className?: string;
  autoFocus?: boolean;
  theme: GrafanaTheme2; // Add theme to props for withTheme2 HOC
}

class RadioButtonGroup<T> extends Component<RadioButtonGroupProps<T>> {
  static defaultProps = {
    size: 'md' as any,
    fullWidth: false,
    autoFocus: false,
  };

  activeButtonRef = createRef<HTMLInputElement>();

  handleOnChange = (option: SelectableValue) => {
    return () => {
      if (this.props.onChange) {
        this.props.onChange(option.value);
      }
    };
  };

  handleOnClick = (option: SelectableValue) => {
    return () => {
      if (this.props.onClick) {
        this.props.onClick(option.value);
      }
    };
  };

  componentDidMount() {
    if (this.props.autoFocus && this.activeButtonRef.current) {
      this.activeButtonRef.current.focus();
    }
  }

  getStyles = () => {
    const { theme } = this.props;
    return {
      radioGroup: css({
        display: 'inline-flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        border: `1px solid ${theme.components.input.borderColor}`,
        borderRadius: theme.shape.borderRadius(),
        padding: '2px',
      }),
      fullWidth: css({
        display: 'flex',
      }),
      icon: css`
        margin-right: 6px;
      `,
      img: css`
        width: ${theme.spacing(2)};
        height: ${theme.spacing(2)};
        margin-right: ${theme.spacing(1)};
      `,
    };
  };

  render() {
    const {
      options,
      value,
      disabled,
      disabledOptions,
      size,
      id,
      className,
      fullWidth,
    } = this.props;

    const internalId = id ?? uniqueId('radiogroup-');
    const groupName = internalId;
    const styles = this.getStyles();

    return (
      <div className={cx(styles.radioGroup, fullWidth && styles.fullWidth, className)}>
        {options.map((o, i) => {
          const isItemDisabled = disabledOptions && o.value && disabledOptions.includes(o.value);
          return (
            <RadioButton
              size={size}
              disabled={isItemDisabled || disabled}
              active={value === o.value}
              key={`o.label-${i}`}
              aria-label={o.ariaLabel}
              onChange={this.handleOnChange(o)}
              onClick={this.handleOnClick(o)}
              id={`option-${o.value}-${internalId}`}
              name={groupName}
              description={o.description}
              fullWidth={fullWidth}
              inputRef={value === o.value ? this.activeButtonRef : undefined}
            >
              {o.icon && <Icon name={o.icon as any} className={styles.icon} />}
              {o.imgUrl && <img src={o.imgUrl} alt={o.label} className={styles.img} />}
              {o.label} {o.component ? <o.component /> : null}
            </RadioButton>
          );
        })}
      </div>
    );
  }
}

export default withTheme2(RadioButtonGroup);
