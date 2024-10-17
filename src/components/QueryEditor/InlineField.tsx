import { cx, css } from '@emotion/css';
import React, { Component, HTMLAttributes } from 'react';

import {  withTheme2, ReactUtils, PopoverContent, InlineLabel } from '@grafana/ui'; // Assuming you export withTheme2 from @grafana/ui
import { GrafanaTheme2 } from '@grafana/data';
import  FieldValidationMessage  from './FieldValidationMessage';

export interface FieldProps extends HTMLAttributes<HTMLDivElement> {
  /** Form input element, i.e Input or Switch */
  children: React.ReactElement;
  /** Label for the field */
  label?: React.ReactNode;
  /** Description of the field */
  description?: React.ReactNode;
  /** Indicates if field is in invalid state */
  invalid?: boolean;
  /** Indicates if field is in loading state */
  loading?: boolean;
  /** Indicates if field is disabled */
  disabled?: boolean;
  /** Indicates if field is required */
  required?: boolean;
  /** Error message to display */
  error?: React.ReactNode;
  /** Indicates horizontal layout of the field */
  horizontal?: boolean;
  /** make validation message overflow horizontally. Prevents pushing out adjacent inline components */
  validationMessageHorizontalOverflow?: boolean;

  className?: string;
  /**
   *  A unique id that associates the label of the Field component with the control with the unique id.
   *  If the `htmlFor` property is missing the `htmlFor` will be inferred from the `id` or `inputId` property of the first child.
   *  https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label#attr-for
   */
  htmlFor?: string;
}

export interface Props extends Omit<FieldProps, 'css' | 'horizontal' | 'description' | 'error'> {
  /** Content for the label's tooltip */
  tooltip?: PopoverContent;
  /** Custom width for the label as a multiple of 8px */
  labelWidth?: number | 'auto';
  /** Make the field's child to fill the width of the row. Equivalent to setting `flex-grow:1` on the field */
  grow?: boolean;
  /** Make the field's child shrink with width of the row. Equivalent to setting `flex-shrink:1` on the field */
  shrink?: boolean;
  /** Make field's background transparent */
  transparent?: boolean;
  /** Error message to display */
  error?: string | null;
  htmlFor?: string;
  /** Make tooltip interactive */
  interactive?: boolean;
  theme: GrafanaTheme2; // Add theme to props for withTheme2 HOC
}

class InlineField extends Component<Props> {
  static defaultProps = {
    labelWidth: 'auto' as any,
  };

  getStyles = () => {
    const { theme, grow, shrink } = this.props;
    return {
      container: css`
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        text-align: left;
        position: relative;
        flex: ${grow ? 1 : 0} ${shrink ? 1 : 0} auto;
        margin: 0 ${theme.spacing(0.5)} ${theme.spacing(0.5)} 0;
      `,
      childContainer: css`
        flex: ${grow ? 1 : 0} ${shrink ? 1 : 0} auto;
      `,
      fieldValidationWrapper: css`
        margin-top: ${theme.spacing(0.5)};
      `,
    };
  };

  render() {
    const {
      children,
      label,
      tooltip,
      labelWidth,
      invalid,
      loading,
      disabled,
      className,
      htmlFor,
      grow,
      shrink,
      error,
      transparent,
      interactive,
      ...htmlProps
    } = this.props;

    const styles = this.getStyles();
    const inputId = htmlFor ?? ReactUtils?.getChildId?.(children);

    const labelElement =
      typeof label === 'string' ? (
        <InlineLabel
          interactive={interactive}
          width={labelWidth}
          tooltip={tooltip}
          htmlFor={inputId}
          transparent={transparent}
        >
          {label}
        </InlineLabel>
      ) : (
        label
      );

    return (
      <div className={cx(styles.container, className)} {...htmlProps}>
        {labelElement}
        <div className={styles.childContainer}>
          {React.cloneElement(children, { invalid, disabled, loading })}
          {invalid && error && (
            <div className={cx(styles.fieldValidationWrapper)}>
              <FieldValidationMessage>{error}</FieldValidationMessage>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default withTheme2(InlineField);
