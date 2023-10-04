let data = [];

const PopupDataStore = {
  setData: (localData) => {
    data = localData;
  },
  addData: (newEntry) => {
    data.push(newEntry);
  },
  getData: () => data,
  modifyDataByMessage: (message, key, newData) => {
    const index = data.filter((obj) => obj.message === message)[0].id;
    data[index][key] = newData;
  },
  checkIfStoredPopup: (message) => data.filter((obj) => obj.message === message).length === 0,
};
export default PopupDataStore;
