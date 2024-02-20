import { GetWidth4Label, GetHeight4Label } from './Utilities.js';
import DataStore from './DataStore.js';

/* Method to check if a string has multiple elements
    Params: @value the string to check
*/
const IsTokenizable = (value) => value.includes("'");
/* Method to generate array of values from string
    Params: @text is a string containing more that one item
*/
const GetList4rmString = (text) => text.split("'");

const RemoveSpecialChars = (str) => {
  const specialChars = /\r/g; // added 'g' flag for global replacement
  if (specialChars.test(str)) return str.replace(specialChars, '');
  return str;
};
/*  Method to the ID of a stop given a stop name in a dataset which is in array format
    Params: @stopName is the name of the target stop
            @data is the current dataset
*/
// eslint-disable-next-line max-len
const FindStopIdUsingStopName = (stopName, data) => data.find((row) => row.stop_name === stopName).stop_id;

/* Method to Search for descendants of a particular stop
Params: @targetEndingEvent is the target ending event belonging to a particular stop
    @stopID is a target stop
    @records is the array of rows from dataset

*/
const Search4Descendants = (targetEndingEvent, stopID, records) => {
  const descendants = [];
  records.forEach((record) => {
    const currStopId = record.stop_id;
    if (currStopId !== undefined && currStopId !== stopID) {
      const startingEvent = record.starting_event;
      const foundMultipleDescendants = IsTokenizable(startingEvent);

      if (foundMultipleDescendants) {
        const ascendants = startingEvent.split("'");
        ascendants.forEach((asc) => {
          if (asc === targetEndingEvent) {
            const descId = record.stop_id;

            descendants.push(descId);
          }
        });
      } else if (startingEvent === targetEndingEvent) {
        const descId = record.stop_id;

        descendants.push(descId);
      }
    }
  });
  return descendants.join("'");
};
/* Method to find and then assign the descendants for all stops
    Params: @arraysDataSet is the dataset in arrays
*/
const FindAndAssignDescendants2Stops = (arraysDataSet) =>
  // eslint-disable-next-line implicit-arrow-linebreak\
  arraysDataSet.map((record) => {
    const clonedRecord = { ...record };
    const { stop_id: stopID, ending_event: endingEvent } = clonedRecord;
    if (stopID) {
      clonedRecord.descendant_stop_id = Search4Descendants(endingEvent, stopID, arraysDataSet);
    }
    return clonedRecord;
  });

/*  Method to insert new column for stop_id and assign ID's to all stops,
    which is in dataset in arrays format
    Params: @arraysDataSet is the dataset still in arrays
*/
const AssignStopIds = (arraysDataSet) => {
  const listOfKnownStops = {};
  // const stopEndingEvents = {};
  let idIndex = 1;
  return arraysDataSet.map((record) => {
    const localRecord = { ...record };
    const { stop_name: stopName, stop_parent: stopParent } = localRecord;
    const checkIfParentExists = stopParent === '' || stopParent === null;
    if (listOfKnownStops[stopName] === undefined && checkIfParentExists) {
      localRecord.stop_id = idIndex;
      listOfKnownStops[stopName] = idIndex;
      idIndex += 1;
    } else if (stopParent !== '') {
      localRecord.is_activity = true;
    }
    return localRecord;
  });
};

const ParseSectorsRecord = (record, sectorIDCounter) => ({
  sector_id: sectorIDCounter,
  sector_name: record.sector_name,
  phases: [],
});

const ParsePhasesRecord = (record, phaseIDCounter) => ({
  phase_id: phaseIDCounter,
  phase_name: record.phase_name,
  stops: [],
  phase_styles: {
    phase_color: record.phase_color,
  },
});

const ParseStopsRecord = (record) => {
  let foundMultipleDesc = false;
  const multiDesc = [];
  let desc;
  if (record.descendant_stop_id.includes("'")) {
    const ids = record.descendant_stop_id.split("'");
    ids.forEach((id) => multiDesc.push(parseInt(id, 10)));
    foundMultipleDesc = true;
  } else if (record.descendant_stop_id === '') {
    desc = [];
  } else {
    desc = [parseInt(record.descendant_stop_id, 10)];
  }
  return {
    stop_id: parseInt(record.stop_id, 10),
    stop_name: record.stop_name,
    stop_activities: [],
    cx: parseInt(record.cx, 10),
    cy: parseInt(record.cy, 10),
    descendant_stop_id: foundMultipleDesc ? multiDesc : desc,
    stop_styles: {
      stop_has_line: record.stop_has_line,
      stop_label_position: record.stop_label_position,
    },
    starting_event: record.starting_event,
    ending_event: record.ending_event,
    stop_definition: record.description,
  };
};

const CreateActivity = (record, activityIDCounter) => {
  const attr_obj = {};
  const activity_obj = {
    act_id: activityIDCounter,
    act_name: record.stop_name,
    act_description: record.description,
    act_ending_event: record.ending_event,
    act_starting_event: record.starting_event,
    act_path_type: record.stop_path,
    act_meta_data: [],
  };
  const fields = DataStore.getFields();
  for (const key in record) {
    if (!fields.includes(key) && typeof record[key] === 'string') {
      attr_obj[key] = IsTokenizable(record[key]) ? GetList4rmString(record[key]) : record[key];
    }
  }
  activity_obj.attributes = attr_obj;
  return activity_obj;
};
const CreateProcessHierarchy = (stop) => {
  const activities = stop.stop_activities;
  const alreadyAssignedProcesses = {};
  let leafId = 0;
  const ConvertProcessToLeaf = (process) => {
    leafId += 1;
    return {
      id: leafId,
      name: process.act_name,
      values: { ...process },
      is_leaf: false,
      children: [],
      shared_children: [],
      x: 0,
      y: 0,
    };
  };
  const GetLeafForProcess = (parentProcess, allProcesses) => {
    // create leaf object
    const parentLeaf = ConvertProcessToLeaf(parentProcess);
    // run through all sub processes or activities
    allProcesses.forEach((process) => {
      // if we have a match between the incoming process
      // ending event and a subprocess starting event
      if (process.act_starting_event.split("'").includes(parentProcess.act_ending_event)) {
        // if a process is not already assigned
        if (!alreadyAssignedProcesses[process.act_name]) {
          // add process as a child and repeat for each sub-process
          parentLeaf.children.push(GetLeafForProcess(process, allProcesses));
          alreadyAssignedProcesses[process.act_name] = true;
        } else {
          // add process as a shared_child
          parentLeaf.shared_children.push(ConvertProcessToLeaf(process));
        }
      }
    });
    return parentLeaf;
  };
  const stopProcess = {
    act_ending_event: stop.starting_event,
    act_name: 'Start',
  };
  return GetLeafForProcess(stopProcess, activities);
};

/* Method to assign sector id's to stop data */
function AssignSectorIds2Stops(sectors) {
  sectors.forEach((sector) => {
    sector.phases.forEach((phase) => {
      phase.stops.forEach((stop) => {
        stop.sector_id = sector.sector_id;
      });
    });
  });
  return sectors;
}

/* Method to assign final coordinates to the stops
     Params: @startX is the starting x position ( Integer )
             @startingYPos is the starting y position ( Integer )
  */
function AssignCoordinates(dataSet, startX, startingYPos) {
  dataSet.sectors.forEach((sector) => {
    sector.phases.forEach((phase) => {
      phase.stops.forEach((stop) => {
        stop.cx += startX;
        stop.cy += startingYPos;
        stop.is_beginning_stop = stop.cx === startX;
      });
    });
  });
  return dataSet;
}

function VerticalLink_x(params) {
  let {
    d,
    startNode2FirstDepthDistance,
    sourceOrTargetNode,
    nodePadding,
    th,
    treeStartingPoint,
    nodeTextPadding,
  } = params;
  const addDistanceIfPointIsEndNode = d.data.name == 'End' ? startNode2FirstDepthDistance : 0;
  let returnXVal;
  if (sourceOrTargetNode % 2 == 0) {
    // if even = source
    const nodeWidth = GetWidth4Label(th.svg, d.data.name) + nodePadding;
    returnXVal = nodeWidth + d.y + treeStartingPoint + nodeTextPadding;
  } else returnXVal = d.y + treeStartingPoint; // if odd = target
  sourceOrTargetNode += 1;
  return {
    sourceOrTargetNodeUpdate: sourceOrTargetNode,
    ret: returnXVal - 5.5 + addDistanceIfPointIsEndNode,
  };
}

function VerticalLink_y(params) {
  const { d, stop } = params;
  return d.x + stop.cy;
}

function VerticalLinkStart_x(params) {
  let {
    evenY, stop, d, treePaddingDown, prevY,
  } = params;
  if (evenY % 2 === 0) {
    prevY = stop.cy + d.y + treePaddingDown;
    evenY += 1;
    return { evenY, prevY };
  }
  evenY += 1;
  return { evenY, prevY };
}

function VerticalLinkStart_y(params) {
  let {
    evenX, prevX, d, xMargin,
  } = params;
  if (evenX % 2 === 0) {
    prevX = d.x - xMargin;
    evenX += 1;
    return { prevX, evenX };
  }
  evenX += 1;
  return { prevX, evenX };
}

function Rectangles_x(params) {
  let {
    d, startNode2FirstDepthDistance, yMargin, treeStartingPoint, startNodeFinalXPos, i,
  } = params;
  const addDistanceIfPointIsEndNode = d.data.name == 'End' ? startNode2FirstDepthDistance : 0;
  const position = d.y + yMargin - (i === 0 ? 5 : 0);
  const returnVal = d.y + treeStartingPoint - addDistanceIfPointIsEndNode;
  if (d.data.name == 'Start') startNodeFinalXPos = returnVal;
  return { startNodeFinalXPos, position, returnVal };
}

function Rectangles_y(params) {
  const {
    d, xMargin, stop, rectHeight, returnVal,
  } = params;
  const position = returnVal - xMargin;
  return { position, ret: d.x + stop.cy - rectHeight / 2 };
}

function Labels_x(params) {
  const {
    d, i, startNode2FirstDepthDistance, yMargin, th, treeStartingPoint, nodeTextPadding,
  } = params;
  const addDistanceIfPointIsEndNode = d.data.name == 'End' ? startNode2FirstDepthDistance : 0;
  const finalY = yMargin + d.y + GetHeight4Label(th.svg, d.data.name) - 0.4 - (i === 0 ? 5 : 0);
  let startEndPadding = 0;
  if (d.data.name == 'End') startEndPadding = 4;
  if (d.data.name == 'Start') startEndPadding = 1;
  return {
    finalY,
    ret:
      d.y
      + addDistanceIfPointIsEndNode
      + treeStartingPoint
      - 5.5
      + nodeTextPadding
      + startEndPadding,
  };
}

function Labels_y(params) {
  console.log(param);
  let {
    returnVal, i, d, nodes, xMargin, stop, rectHeight,
  } = params;
  if (i === 0 || nodes.length - 1) {
    returnVal += 0.7;
  }
  returnVal += 1;
  const finalX = returnVal - xMargin;
  return { finalX, ret: d.x + stop.cy + 7.1 - rectHeight / 2 };
}

/* Method to traverse a sample row from dataset input to find missing fields
       Params: @sampleRow is one row from the dataset input
    */
function Check4MetrostopFields(sampleRow) {
  const keys = Object.keys(sampleRow);
  let foundAllRequiredFields = true;
  const requiredFields = {
    sector_name: { foundField: false },
    phase_name: { foundField: false },
    stop_name: { foundField: false },
    stop_parent: { foundField: false },
    cx: { foundField: false },
    cy: { foundField: false },
    starting_event: { foundField: false },
    ending_event: { foundField: false },
    stop_path: { foundField: false },
    phase_color: { foundField: false },
    stop_has_line: { foundField: false },
    stop_label_position: { foundField: false },
  };
  const fieldsFound=[];
  const missingFieldsFound = [];
  keys.forEach((key) => {
    let noMatch = true;
    const metroStopFieldKeyValue = requiredFields[key];
    if (metroStopFieldKeyValue !== undefined) requiredFields[key].foundField = true;

    DataStore.getFields().forEach((field) => {
      if (noMatch) {
        if (key === field) {
          fieldsFound.push(key);
          noMatch = false;
        }
      }
    });
    if (noMatch) {
      
      missingFieldsFound.push(key);
      foundAllRequiredFields = false;
    }
  });
  return {
    foundAllRequiredFields,
    missingFieldsFound,
    fieldsFound,
    requiredFields
  };
}

function CleanProcessData(parsedData){
  return parsedData.filter((row) => row.stop_name);
}
export {
  CreateActivity,
  FindStopIdUsingStopName,
  ParseStopsRecord,
  ParsePhasesRecord,
  ParseSectorsRecord,
  AssignStopIds,
  FindAndAssignDescendants2Stops,
  RemoveSpecialChars,
  CreateProcessHierarchy,
  AssignSectorIds2Stops,
  AssignCoordinates,
  VerticalLink_x,
  VerticalLink_y,
  VerticalLinkStart_x,
  VerticalLinkStart_y,
  Rectangles_x,
  Rectangles_y,
  Labels_x,
  Labels_y,
  Check4MetrostopFields,
  CleanProcessData
};
