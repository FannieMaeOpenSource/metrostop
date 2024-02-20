import DataStore from "../../services/DataStore";
import { ProcessEventData } from "./SettingsHelper";

// For now we don't really care about the UIController fn
// jest.mock("../../controllers/UiController", () => {
//     DrawMetroStopGraph:()=>true
//   });

describe('ProcessEventData should ', () => {
it('store event data to datastore', () => {
    ProcessEventData("test");
    expect(DataStore.getEvents()).toEqual("test");
    });
});