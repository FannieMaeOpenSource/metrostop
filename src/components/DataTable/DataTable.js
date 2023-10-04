import { select } from 'd3-selection';
import DataTableDataStore from './DataTableDataStore.js';

const d3 = { select };
function AppendResetIcon(headers) {
  const resetIcon = document.createElement('div');
  resetIcon.setAttribute('id', 'reset-icon-clickable');
  resetIcon.setAttribute('class', 'icons-scd-containers');
  resetIcon.innerHTML = '<i class="fas fa-redo-alt"></i>';
  resetIcon.addEventListener('click', () => {
    // remove old table
    d3.select('#scd-data-table').remove();
    // add new table
    const body = document.getElementById('app-body');
    const tableContainer = document.createElement('div');
    tableContainer.setAttribute('id', 'scd-data-table');
    DataTableDataStore.setFilteredData();
    CreateTable(tableContainer, headers, DataTableDataStore.getData());
    body.appendChild(tableContainer);
  });
  const iconsContainer = document.querySelector('#icons-container');
  iconsContainer.appendChild(resetIcon);
}
function CreateTable(container, headers, records) {
  if (!document.querySelector('#reset-icon-clickable')) {
    AppendResetIcon(headers);
  }
  const table = document.createElement('table');
  container.appendChild(table);
  const headerContainer = document.createElement('tr');

  for (let i = 0; i < headers.length; i++) {
    const currentTh = document.createElement('th');
    const header = document.createElement('p');
    header.textContent = headers[i];
    currentTh.appendChild(header);
    const dropdown = document.createElement('div');
    /**
     * Both asset name and asset id are unique values - no need to
     * filter by these values
     */
    if ([0, 2, 5, 7, 9].includes(i)) {
      dropdown.setAttribute('id', 'table-dropdown');
      dropdown.innerHTML = '<i class="fas fa-filter"></i>';
      currentTh.appendChild(dropdown);

      const dropdownContent = document.createElement('div');
      dropdownContent.setAttribute('id', 'table-dropdown-content');
      /**
       * The following code deals with the filter button - filters
       * rows based on unique entries
       * in this instance -> just allows filtering based on producer/consumer
       * type as well as instance type
       */
      let filterEntryLi = [];
      records.forEach((row) => {
        filterEntryLi.push(row[i]);
      });
      filterEntryLi = [...new Set(filterEntryLi)];
      filterEntryLi.forEach((entry) => {
        const filterEntry = document.createElement('a');
        filterEntry.textContent = entry;
        filterEntry.setAttribute('value', entry);
        filterEntry.addEventListener('click', () => {
          // update the filter table array based on thing clicked
          DataTableDataStore.filterData(i, filterEntry.getAttribute('value'));
          // remove old table
          d3.select('#scd-data-table').remove();
          // add new table
          const body = document.getElementById('app-body');
          const tableContainer = document.createElement('div');
          tableContainer.setAttribute('id', 'scd-data-table');
          CreateTable(tableContainer, headers, DataTableDataStore.getFilteredData());
          body.appendChild(tableContainer);
        });
        dropdownContent.appendChild(filterEntry);
      });
      dropdown.appendChild(dropdownContent);
    }
    headerContainer.appendChild(currentTh);
  }

  table.appendChild(headerContainer);
  records.forEach((row) => {
    const recordContainer = document.createElement('tr');
    row.forEach((datapoint, i) => {
      const currentTh = document.createElement('td');
      currentTh.innerHTML = datapoint;
      recordContainer.appendChild(currentTh);
    });
    table.appendChild(recordContainer);
  });
}

function DownloadTable(headers) {
  let csvInfo = 'data:text/csv;charset=utf-8,';
  csvInfo += `${headers.join(',')}\r\n`;
  let out;
  DataTableDataStore.getFilteredData().forEach((row1) => {
    out = [];
    row1.forEach((entry) => {
      out.push(entry.replaceAll(',', ''));
    });
    csvInfo += `${out.join(',')}\r\n`;
  });

  const encodedUri = encodeURI(csvInfo);
  const li = document.createElement('a');
  li.setAttribute('href', encodedUri);
  li.setAttribute('download', 'assetData.csv');
  document.body.appendChild(li);
  li.click();
  li.remove();
}
export { CreateTable, DownloadTable };
