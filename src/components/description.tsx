import React, { PureComponent } from 'react';
import './style.css';

type Props = {
  dataSourceName: string;
  docsLink: string;
  hasRequiredFields?: boolean;
  className?: string;
};

export class DataSourceDescription extends PureComponent<Props> {
  render() {
    const { dataSourceName, docsLink, hasRequiredFields = true } = this.props;

    return (
      <div className={'description-container'}>
        <p className={'description-text'}>
          Before you can use the {dataSourceName} data source, you must configure it below or in the config file. For
          detailed instructions,
          <a href={docsLink} target="_blank" rel="noreferrer">
            view the documentation
          </a>
          .
        </p>
        {hasRequiredFields && (
          <p className={'description-text'}>
            <i>Fields marked with * are required</i>
          </p>
        )}
      </div>
    );
  }
}
