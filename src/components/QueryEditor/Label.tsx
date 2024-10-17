import { css, cx } from '@emotion/css';
import React, { Component } from 'react';
import { withTheme2, Icon } from '@grafana/ui'; // Assuming you export GrafanaTheme2 and withTheme2 from @grafana/ui
import { GrafanaTheme2 } from '@grafana/data';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  description?: React.ReactNode;
  category?: React.ReactNode[];
  theme: GrafanaTheme2; // Add theme to props for withTheme2 HOC
}

const getLabelStyles = (theme: GrafanaTheme2) => {
  return {
    label: css`
      label: Label;
      font-size: ${theme.typography.size.sm};
      font-weight: ${theme.typography.fontWeightMedium};
      line-height: 1.25;
      margin-bottom: ${theme.spacing(0.5)};
      color: ${theme.colors.text.primary};
      max-width: 480px;
    `,
    labelContent: css`
      display: flex;
      align-items: center;
    `,
    description: css`
      label: Label-description;
      color: ${theme.colors.text.secondary};
      font-size: ${theme.typography.size.sm};
      font-weight: ${theme.typography.fontWeightRegular};
      margin-top: ${theme.spacing(0.25)};
      display: block;
    `,
    categories: css`
      label: Label-categories;
      display: inline-flex;
      align-items: center;
    `,
    chevron: css`
      margin: 0 ${theme.spacing(0.25)};
    `,
  };
};

class Label extends Component<LabelProps> {
  render() {
    const { children, description, className, category, theme, ...labelProps } = this.props;
    const styles = getLabelStyles(theme);
    const categories = category?.map((c, i) => {
      return (
        <span className={styles.categories} key={`${c}/${i}`}>
          <span>{c}</span>
          <Icon name="angle-right" className={styles.chevron} />
        </span>
      );
    });

    return (
      <div className={cx(styles.label, className)}>
        <label {...labelProps}>
          <div className={styles.labelContent}>
            {categories}
            {children}
          </div>
          {description && <span className={styles.description}>{description}</span>}
        </label>
      </div>
    );
  }
}

export default withTheme2(Label);
