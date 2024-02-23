import {
  FindStopIdUsingStopName,
  CreateActivity,
  ParseStopsRecord,
  ParsePhasesRecord,
  ParseSectorsRecord,
  AssignStopIds,
  FindAndAssignDescendants2Stops,
  RemoveSpecialChars,
  AssignSectorIds2Stops,
  Check4MetrostopFields
} from './DataHelper.js';

import DataStore from './DataStore.js';
import { AppendPopup } from '../components/Popup/Popup.js';

// TODO: cleanup this method, remove component references from here,
// this is a data service, not a controller
function GenerateDataSet(arraysDataSet) {
  DataStore.setData({});
  let sectorIDCounter = 1;
  let phaseIDCounter = 1;
  let activityIDCounter = 1;
  const sectors = [];
  const sectorsTable = {};
  const phasesTable = {};
  const stopsTable = {};
  const activitiesTable = {};
  const acts2stop = [];
  const stops2phase = [];
  const phases2sector = [];
  const convertedArraysDataSet = FindAndAssignDescendants2Stops(AssignStopIds(arraysDataSet));
  convertedArraysDataSet.forEach((record) => {
    if (record.sector_name !== undefined && record.sector_name !== '') {
      // if activity is not empty
      if (record.is_activity !== undefined) {
        // save activity data
        activitiesTable[activityIDCounter] = CreateActivity(record, activityIDCounter);
        try {
          acts2stop.push({
            // eslint-disable-next-line max-len
            [activityIDCounter]: FindStopIdUsingStopName(
              record.stop_parent,
              convertedArraysDataSet,
            ),
          });
        } catch {
          AppendPopup(
            'Row in input data where stop_parent does not match any stop_name.',
            'Error with stop_parent column in dataset',
            '',
            true,
          );
        }
        const { starting_event: startingEvent, ending_event: endingEvent } = record;
        if (startingEvent !== '' && DataStore.getEvent(startingEvent) === undefined) {
          DataStore.addEvent(startingEvent, { exists: true, description: '' });
        }
        if (endingEvent !== '' && DataStore.getEvent(endingEvent) === undefined) {
          DataStore.addEvent(endingEvent, { exists: true, description: '' });
        }
        activityIDCounter += 1;
      } // else activity is empty
      // if stop doesn't exist
      if (stopsTable[record.stop_id] === undefined && record.is_activity === undefined) {
        stopsTable[record.stop_id] = ParseStopsRecord(record);
        stops2phase.push({ [record.stop_id]: record.phase_name });
        // HandleStoringStop(record, stopsTable, stops2phase);
      }
      // if phase doesn't exist
      if (phasesTable[record.phase_name] === undefined) {
        phasesTable[record.phase_name] = ParsePhasesRecord(record, phaseIDCounter);
        phases2sector.push({ [record.phase_name]: record.sector_name });
        phaseIDCounter += 1;
      }
      // save phase data
      // if sector doesn't exist
      if (sectorsTable[record.sector_name] === undefined) {
        // save sector data
        sectorsTable[record.sector_name] = ParseSectorsRecord(record, sectorIDCounter);
        sectors.push({ [sectorIDCounter]: record.sector_name });
        sectorIDCounter += 1;
      }
    }
  });
  const activitiesFound = Object.keys(activitiesTable).length;
  const stopsFound = Object.keys(stopsTable).length;
  const phasesFound = Object.keys(phasesTable).length;
  // save activities to respective stop
  for (let i = 1; i <= activitiesFound; i += 1) {
    const actId = parseInt(Object.keys(acts2stop[i - 1])[0], 10);
    const stopId = parseInt(Object.values(acts2stop[i - 1])[0], 10);

    stopsTable[stopId].stop_activities.push(activitiesTable[actId]);
  }
  // save stops to respective phase
  for (let i = 1; i <= stopsFound; i += 1) {
    const stopId = parseInt(Object.keys(stops2phase[i - 1])[0], 10);
    const phaseId = Object.values(stops2phase[i - 1])[0];
    phasesTable[phaseId].stops.push(stopsTable[stopId]);
  }
  // save phases to respective sector
  for (let i = 1; i <= phasesFound; i += 1) {
    const phaseId = Object.keys(phases2sector[i - 1])[0];
    const sectorId = Object.values(phases2sector[i - 1])[0];

    sectorsTable[sectorId].phases.push(phasesTable[phaseId]);
  }
  let finalData = [];
  for (let i = 1; i <= sectors.length; i += 1) {
    // const sectorId = Object.keys(sectors[i - 1])[0];
    const sectorName = Object.values(sectors[i - 1])[0];

    finalData.push(sectorsTable[sectorName]);
  }
  finalData = AssignSectorIds2Stops(finalData);
  DataStore.setData({ sectors: finalData });
  // Shows error popup if new starting event is not any previous
  // ending event, leading to diagram being rendered as disconnected
  // graphs
  for (const key in phasesTable) {
    // keep track of all ending events
    const allEndingEvents = [];
    phasesTable[key].stops.forEach((s) => {
      if (allEndingEvents.length !== 0) {
        // if the new start event is not a previously seen ending event
        // an error popup is created
        if (!allEndingEvents.includes(s.starting_event)) {
          AppendPopup(
            `Starting event ${s.starting_event} is not an ending event for any other stop, diagram may render incorrectly.`,
            'Error with starting event column in dataset',
            '',
            true,
          );
        }
      }
      allEndingEvents.push(s.ending_event);
    });
  }
}
function StoreEventData(parsedData) {
  parsedData.forEach((record) => {
    if (record.event !== '') {
      const descr = RemoveSpecialChars(record.description);
      DataStore.addEvent(record.event, {
        exists: true,
        description: descr,
      });
    }
  });
}
function StoreAttrData(attr, parsedData) {
  DataStore.setAttrData(attr, parsedData);
}
function StoreSettings(settings) {
  DataStore.addSettings(settings);
}
function StoreFields(fields) {
  DataStore.addFields(fields);
}

/* Method to processdata
           Params: @arraysDataSet is the dataset in arrays. Where each element in array is an object
        */
function ConsumeDataUpdated(arraysDataSet) {
  const finishCheck = Check4MetrostopFields(arraysDataSet[0]);
  if(!(finishCheck.foundAllRequiredFields)){
    console.error('Error: Found Fields With No Match');
  }
  return finishCheck;
}
export {
  GenerateDataSet, StoreEventData, StoreAttrData, StoreSettings, StoreFields,ConsumeDataUpdated
};
