import { GenerateDataSet,
    StoreEventData,
StoreAttrData,
StoreFields,
StoreSettings} from "./DataService";
import { GenerateDataSet_arraysDataSet } from "./DataService_TestObj";
import DataStore from "./DataStore";
describe('GenerateDataSet should ', () => {
    beforeEach(() => {
        GenerateDataSet(GenerateDataSet_arraysDataSet);
    });
    it('correctly extract sectors and store data', () => {
        expect(DataStore.getData().sectors.length).toEqual(1);
    });
    it('correctly extract phases and store data', () => {
        let totalPhases = 0;
        DataStore.getData().sectors.forEach((element) => {
            totalPhases+=element.phases.length;
        });
        expect(totalPhases).toEqual(2);
    });
});
describe('StoreEventData should ', () => {
    it('store event data to data store', () => {
        const testRecords=[
            {
                description:"this is an event!",
                event:"test event"
            }
        ]
        StoreEventData(testRecords);
        expect(DataStore.getEvent("test event").description).toEqual("this is an event!");
    });
});
describe('StoreAttrData should ', () => {
    it('store attribute data to data store', () => {
        const testData="attribute info"
        StoreAttrData("a",testData);
        expect(DataStore.getAttrData("a")).toEqual("attribute info");
    });
});
describe('StoreSettings should ', () => {
    it('store settings to data store', () => {
        const testData={name:"settings info"}
        StoreSettings(testData);
        expect(DataStore.getSettings().name).toEqual("settings info");
    });
});
describe('StoreFields should ', () => {
    it('store fields to data store', () => {
        const testData=["one field","two field","red field","blue field"];
        StoreFields(testData);
        expect(DataStore.getFields()[1]).toEqual("two field");
    });
});