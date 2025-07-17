import moment from 'moment';

export function buildQueryParams(lazyParams, dateFilterColumn = null) {
    const params = [];
    let queryFilters = "";

    const page = lazyParams.first / lazyParams.rows;
    params.push(`start=${page * lazyParams.rows}`);
    params.push(`limit=${lazyParams.rows}`);
      
    if (lazyParams.sortField) {
      const order = lazyParams.sortOrder === 1 ? 'asc' : 'desc';
      params.push(`sort=${lazyParams.sortField}|${order}`);
    }

    let filterParams = []; 
    if (lazyParams.filters) {
      Object.keys(lazyParams.filters).forEach((key) => {
        const value = lazyParams.filters[key]?.value;
        if (value !== null && value !== undefined && value !== '') {
          if(key != 'start_date' && key != 'end_date'  && key != 'time_stamp') {
            if(lazyParams.filters[key]?.matchMode == 'equals') {
              filterParams.push(`${encodeURIComponent(key)}|${encodeURIComponent(value)}`);
            } else if (lazyParams.filters[key]?.matchMode == 'contains') {
              filterParams.push(`${encodeURIComponent(key)}|like|${encodeURIComponent(value)}`);
            }
          } else if(key == 'start_date') {
            filterParams.push(`${dateFilterColumn}|gteq|${encodeURIComponent(moment(value).format('YYYY-MM-DD'))}`);
          } else if(key == 'end_date') {
            filterParams.push(`${dateFilterColumn}|lteq|${encodeURIComponent(moment(value).format('YYYY-MM-DD'))}`);
          } else if(key == 'time_stamp') {
            filterParams.push(`${dateFilterColumn}|gteq|${encodeURIComponent(moment(value).format('YYYY-MM-DD'))},${dateFilterColumn}|lteq|${encodeURIComponent(moment(value).add(1, 'days').format('YYYY-MM-DD'))}`);
          }
        }
      });
      params.push(`filters=${filterParams.join(',')}`);
    }

    return params.join('&');

  }
  