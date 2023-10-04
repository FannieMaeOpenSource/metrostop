let dataTable = [];
let filteredDataTable = [];
const DataTableDataStore = {
  setData: (localData) => {
    dataTable = [];
    localData.forEach((record) => {
      dataTable.push(Object.values(record));
    });
    filteredDataTable = dataTable;
  },
  getData: () => dataTable,

  filterData: (columnFilter, entryFilter) => {
    filteredDataTable = dataTable;
    const tempTable = [];
    filteredDataTable.forEach((row) => {
      if (row[columnFilter] === entryFilter) {
        tempTable.push(row);
      }
    });
    filteredDataTable = tempTable;
  },
  getFilteredData: () => filteredDataTable,
  setFilteredData: () => {
    filteredDataTable = dataTable;
  },
};

export default DataTableDataStore;
