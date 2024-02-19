import { AssignSectorIds2Stops, Check4MetrostopFields, CleanProcessData, RemoveSpecialChars } from './DataHelper';
import { 
  AssignStopIds,
  FindAndAssignDescendants2Stops,
  CreateActivity,
  FindStopIdUsingStopName,
  ParseStopsRecord,
  ParsePhasesRecord,
  ParseSectorsRecord,
  AssignCoordinates,
} from "./DataHelper";
import { 
  AssignStopIds_arraysDataSet,
  FindAndAssignDescendants2Stops_arraysDataSet,
  CreateActivity_record,
  ParseStopsRecord_record,
  AssignCoordinates_dataset,
  AssignSectorIds2Stops_sectors,
  CleanProcessData_input,
  CleanProcessData_export
} from './DataHelper_TestData';
import { SettingsHelper } from '../components/Settings/SettingsHelper';
import DataStore from './DataStore.js';

// For now we don't really care about the UIController fn
jest.mock("../controllers/UiController", () => {
  DrawMetroStopGraph:()=>true
});

describe('AssignStopIds should ', () => {
  it('correctly add identifiers to stops', () => {
    const output = AssignStopIds(AssignStopIds_arraysDataSet);
    expect(output.filter((stop)=>stop.stop_parent==='')
                  .map((stop)=>stop.stop_id)).toEqual([1,2]);
  });
});
describe('FindAndAssignDescendants2Stops should ', () => {
  it('correctly assign descendant id, which is next stop', () => {
    const output = FindAndAssignDescendants2Stops(FindAndAssignDescendants2Stops_arraysDataSet);
    expect(output.filter((stop)=>stop.stop_name="DNA Replication")[0]
                  .descendant_stop_id).toEqual("2");
  });
});
describe('CreateActivity should ', () => {
  it('use record information to create activity object', () => {
    DataStore.addFields(["phase_color"]);
    const output = CreateActivity(CreateActivity_record,0);
    expect(output.act_name).toEqual("Activators bind to enhancers");
  });
});
describe('FindStopIdUsingStopName should ', () => {
  it('correctly return stop id based on stop name', () => {
    const output = FindStopIdUsingStopName("Initiation I",FindAndAssignDescendants2Stops_arraysDataSet);
    expect(output).toEqual(2);
  });
});
describe('ParseStopsRecord should ', () => {
  it('accurately parse the descendant ids', () => {
    const output = ParseStopsRecord(ParseStopsRecord_record);
    expect(output.descendant_stop_id).toEqual([1,2]);
  });
  it('convert string attr to ints', () => {
    const output = ParseStopsRecord(ParseStopsRecord_record);
    expect(output.cx).toEqual(20);
  });
});
describe('ParsePhasesRecord should ', () => {
  it('return information about current sector', () => {
    const output = ParsePhasesRecord(ParseStopsRecord_record,0);
    expect(output.phase_name).toEqual("Transcription");
  });
});
describe('ParseSectorsRecord should ', () => {
  it('return information about current sector', () => {
    const output = ParseSectorsRecord(ParseStopsRecord_record,0);
    expect(output.sector_name).toEqual("Typical");
  });
});
describe('AssignCoordinates should ', () => {
  it('increase coordinates based on starting pos', () => {
    const output = AssignCoordinates(AssignCoordinates_dataset,10,10);
    expect(output.sectors[0].phases[0].stops[0].cy).toEqual(90);
  });
});
describe('AssignSectorIds2Stops should ', () => {
  const output = AssignSectorIds2Stops(AssignSectorIds2Stops_sectors);
  it('properly set sector_id attribute', () => {
    let allStops = [];
    output[0].phases.forEach((phase)=>{
        allStops = allStops.concat(phase.stops);
    });
    expect(allStops.map((stop)=>stop.phase_id)).toEqual([1,2]);
  });
});
describe('Check4MetrostopFields should ', () => {
  let output;
  beforeEach(()=>{
    const settingsHelper = SettingsHelper();
    settingsHelper.setDefaultFields();
    DataStore.addFields(settingsHelper.getFields());
    const sampleRow={
      "sector_name": "Typical",
      "phase_name": "Replication",
      "stop_parent": null,
      "stop_name": "DNA Replication",
      "cx": 0,
      "cy": 0,
      "description": "DNA Replication",
      "starting_event": "Initiation",
      "ending_event": "DNA replication termination",
      "stop_stakeholder": null,
      "stop_path": null,
      "Related Proteins": null,
      "phase_color": "#3498DB",
      "stop_has_line": "yes",
      "stop_label_position": "up",
      "Notes": null
    };
    output = Check4MetrostopFields(sampleRow);
    console.log(output);
  })
  it('confirm all required fields are present', () => {
    expect(output.foundAllRequiredFields).toEqual(false);
  });
  it('confirm found required fields', () => {
    const expectedRequiredFields={
      "sector_name": {
          "foundField": true
      },
      "phase_name": {
          "foundField": true
      },
      "stop_name": {
          "foundField": true
      },
      "stop_parent": {
          "foundField": true
      },
      "cx": {
          "foundField": true
      },
      "cy": {
          "foundField": true
      },
      "starting_event": {
          "foundField": true
      },
      "ending_event": {
          "foundField": true
      },
      "stop_path": {
          "foundField": true
      },
      "phase_color": {
          "foundField": true
      },
      "stop_has_line": {
          "foundField": true
      },
      "stop_label_position": {
          "foundField": true
      }
  };
    expect(output.requiredFields).toEqual(expectedRequiredFields);
  });
  it('correctly find missing fields', () => {
    console.log(output.missingFieldsFound);
    expect(output.missingFieldsFound).toEqual(["Related Proteins"]);
  });
});
describe('CleanProcessData should ', () => {
  it('properly clean data', () => {
    const output = CleanProcessData(CleanProcessData_input);
    expect(output).toEqual(CleanProcessData_export);
  });
});
