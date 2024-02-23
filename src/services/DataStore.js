let data = {};
const attrData = {};
let events = {};
const detailedEvents = {};
let settings = {};
let fields = [];
let processCSV={};

const DataStore = {
  setData: (localData) => {
    data = localData;
  },
  getData: () => data,

  setEvents: (localEvents) => {
    events = localEvents;
  },
  getEvents: () => events,

  addEvent: (key, localEvent) => {
    detailedEvents[key] = localEvent;
  },
  getEvent: (key) => detailedEvents[key],

  setAttrData: (attrName, localAttrData) => {
    attrData[attrName] = localAttrData;
  },
  getAttrData: (attrName) => attrData[attrName],

  addSettings: (localSettings) => {
    settings = localSettings || {};
  },
  getSettings: () => settings,

  addFields: (localFields) => {
    fields = localFields;
  },
  getFields: () => fields,
  getProcessCSV:()=>processCSV,
  addProcessCSV:(data)=> {
    processCSV=data;
  }
};
Object.freeze(DataStore);

export default DataStore;
