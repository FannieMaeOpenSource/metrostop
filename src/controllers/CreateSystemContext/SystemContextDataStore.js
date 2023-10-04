let data = [];

const SystemContextDataStore = {
  // can write test
  setData: (localData) => {
    data = localData;
  },
  // can write test
  getData: () => data,
};
export default SystemContextDataStore;
