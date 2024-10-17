import React, { ReactNode, PureComponent } from 'react';
import { IconName } from '@grafana/ui';
import { IconButton } from './IconButton';
import './style.css';

export type Props = {
  title: string;
  description?: ReactNode;
  isCollapsible?: boolean;
  isInitiallyOpen?: boolean;
  kind?: 'section' | 'sub-section';
  className?: string;
  children: ReactNode;
};

export class ConfigSection extends PureComponent<Props> {
  state = {
    isOpen: true,
  };
  render() {
    const { children, title, description, isCollapsible = false, kind = 'section' } = this.props;
    const { isOpen } = this.state;
    const iconName: IconName = isOpen ? 'angle-up' : 'angle-down';
    const isSubSection = kind === 'sub-section';
    const collapsibleButtonAriaLabel = `${isOpen ? 'Collapse' : 'Expand'} section ${title}`;

    return (
      <div className={'config-section'}>
        <div className={'header'}>
          {kind === 'section' ? <h3 className={'title'}>{title}</h3> : <h6 className={'subtitle'}>{title}</h6>}
          {isCollapsible && (
            <IconButton
              name={iconName}
              onClick={() => this.setState({ isOpen: !isOpen })}
              type="button"
              size="xl"
              aria-label={collapsibleButtonAriaLabel}
            />
          )}
        </div>
        {description && (
          <p
            className={'description-text'}
            style={{
              marginTop: isSubSection ? '2px' : '4px',
              fontFamily: 'Inter, Helvetica, Arial, sans-serif',
              fontSize: '0.8rem',
            }}
          >
            {description}
          </p>
        )}
        {isOpen && <div style={{ marginTop: '16px' }}>{children}</div>}
      </div>
    );
  }
}
