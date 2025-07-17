// customPaginatorTemplate.js
import React from 'react';

export const myPaginatorTemplate = {
  layout: 'RowsPerPageDropdown PrevPageLink PageLinks NextPageLink CurrentPageReport',
  RowsPerPageDropdown: (options) => {
    return <div className="my-paginator-left">{options.element}</div>;
  },
  CurrentPageReport: (options) => {
    const report = `Showing ${options.first} to ${options.last} of ${options.totalRecords} entries`;
    return <div className="my-paginator-right">{report}</div>;
  }
};
