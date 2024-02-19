import { select } from 'd3-selection';
import * as fieldMapper from './FieldMapper/FieldMapper.js';
import CreateUploadButton from './UploadDataButton/UploadDataButton.js';
import * as card from '../Card/Card.js';
import { CreatePanel } from '../Controls/Panel/Panel.js';
import {
  GenerateDataSet,
  StoreEventData,
  StoreAttrData,
  StoreSettings,
  StoreFields,
  ConsumeDataUpdated,
} from '../../services/DataService.js';
import UiController from '../../controllers/UiController.js';
import { AppendPopup, AppendPopupContainer, AppendPopupNotificationIcon } from '../Popup/Popup.js';
import { CleanProcessData } from '../../services/DataHelper.js';

const d3 = { select };
let settingsPanelContainer;
const constants = {
  SETTINGS_PANEL_ID: 'settings-panel',
};
// store data
function ProcessEventData(data) {
  StoreEventData(data);
}

let settings = {};
/**
 * Load a js plugin and return the data
 * Pass CSV parser papa into the plugin
 *
 * @param {*} plugin
 */
async function GetPluginData(plugin) {
  const reqHeader = new Headers();
  const initObject = {
    method: 'HEAD',
    headers: reqHeader,
  };
  try {
    const module = await import(`../../../plugins/${plugin}`);
    const data = await module.default.getData({ Papa: window.Papa });
    return data;
  } catch (err) {
    console.log('Something went wrong!', err);
  }
}


const FIELDS = [
  'sector_name',
  'phase_name',
  'stop_name',
  'stop_parent',
  'cx',
  'cy',
  'description',
  'starting_event',
  'ending_event',
  'stop_stakeholder',
  'stop_path',
  'phase_color',
  'stop_has_line',
  'stop_label_position',
  'Notes',
];
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
let missingFieldsFound = [];
let fieldsFound = [];

/**
 * Loads the settings json
 */
async function loadSettings() {
  try {
    const settingsResponse = await fetch(new URL('/config/settings.json', import.meta.url));
    const settingsData = await settingsResponse.json();
    StoreSettings(settingsData);
    return settingsData;
  } catch {
    return {};
  }
}
/* Method to traverse a sample row from dataset input to find missing fields
       Params: @sampleRow is one row from the dataset input
    */
function Check4MetrostopFields(sampleRow) {
  const keys = Object.keys(sampleRow);
  let foundAllRequiredFields = true;
  keys.forEach((key) => {
    let noMatch = true;
    const metroStopFieldKeyValue = requiredFields[key];
    if (metroStopFieldKeyValue !== undefined) requiredFields[key].foundField = true;

    FIELDS.forEach((field) => {
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
  if (foundAllRequiredFields) return 'Sucess';
  throw new Error('Error: Found Fields With No Match');
}

/* Method to processdata
           Params: @arraysDataSet is the dataset in arrays. Where each element in array is an object
        */
function ConsumeData(arraysDataSet) {
  let foundAllFields;
  try {
    const finishCheck = Check4MetrostopFields(arraysDataSet[0]);

    foundAllFields = true;
  } catch (e) {
    console.error(e);
    foundAllFields = false;
  }
  return foundAllFields;
}

// Data processing
function ProcessUploadedMetrostopData(parsedData) {
  missingFieldsFound = [];
  fieldsFound = [];
  const data = CleanProcessData(parsedData);
  const fieldInfo = ConsumeDataUpdated(data);
  const foundAllfields=fieldInfo.foundAllRequiredFields;
  if (!foundAllfields) {
    fieldMapper.AppendUnknownFields2NoAssignmentSection(
      fieldInfo.missingFieldsFound, fieldInfo.fieldsFound
    );
  }

  const fields = Object.keys(fieldInfo.requiredFields);
  const fieldsCount = fields.length;
  const requiredFields=fieldInfo.requiredFields;
  let trueCount = 0;
  fields.forEach((field) => {
    if (requiredFields[field].foundField === true) trueCount += 1;
  });
  if (trueCount === fieldsCount) {
    GenerateDataSet(data);
    UiController.DrawMetroStopGraph();
    CreatePanel();
  }
}

// UI rendering
function OpenSettingsPanel() {
  const settingsPanel = d3.select(`#${constants.SETTINGS_PANEL_ID}`);
  settingsPanel.transition().duration(1000).style('width', '40%');
  settingsPanel.style('overflow-y', 'scroll ');
}
// UI rendering
export function CloseSettingsPanel() {
  d3.select('#settings-menu').remove();
  d3.select('#settings-close-btn').remove();
  const settingsPanel = d3.select(`#${constants.SETTINGS_PANEL_ID}`);
  settingsPanel.transition().duration(1000).style('width', '23px');
  settingsPanel.style('overflow-y', null);
}

// UI rendering
function CreateEventDataSection(container) {
  const uploadBtnId = 'settings-upload-event-data';
  const headerText = 'Upload Event Dataset';
  const dataUploadContainer = card.AppendCard(container, uploadBtnId, headerText);
  const dataUploadContentContainer = dataUploadContainer
    .append('div')
    .attr('id', 'event-data-upload-container');
  const subTitle = 'Upload Event Data CSV File';
  const description = 'Event data is optional and will be appended to panel as event descriptions. Select the file to upload. Files must be CSV formatted.';
  card.SubtitleAndDescription(dataUploadContentContainer, subTitle, description);
  const bttnContainer = dataUploadContentContainer
    .append('div')
    .attr('id', 'event-settings-bttn-container');
  const bttnTextId = 'upload-event-bttn-text';
  CreateUploadButton(bttnContainer, bttnTextId, ProcessEventData);
}

// UI Rendering
function CreateDataSection(container) {
  const uploadBtnId = 'settings-upload-data';
  const headerText = 'Upload Dataset';
  const dataUploadContainer = card.AppendCard(container, uploadBtnId, headerText);
  const dataUploadContentContainer = dataUploadContainer
    .append('div')
    .attr('id', 'data-upload-container');
  const subTitle = 'Upload Primary Data CSV File';
  const description = 'Select the file to upload. Files must be CSV formatted.';
  card.SubtitleAndDescription(dataUploadContentContainer, subTitle, description);
  const bttnContainer = dataUploadContentContainer
    .append('div')
    .attr('id', 'settings-bttn-container');
  const bttnTextId = 'upload-bttn-text';
  CreateUploadButton(bttnContainer, bttnTextId, ProcessUploadedMetrostopData);
}

// UI Rendering
function AppendSettingsContent(container) {
  const settingsMenuContainer = container.append('div').attr('id', 'settings-menu');

  const settingsTitleContainer = settingsMenuContainer
    .append('div')
    .classed('settings-title settings-font-family', true);
  settingsTitleContainer.append('h1').text('General settings');
  settingsTitleContainer
    .append('p')
    .classed('general-settings-message text-font-family', true)
    .text(
      'Manage general settings for the metro stop here. These settings are data model specific and will apply to the dataset input',
    );
  CreateDataSection(settingsMenuContainer);
  CreateEventDataSection(settingsMenuContainer);
  fieldMapper.CreateFieldMappingSection(settingsMenuContainer, FIELDS);
  // whiteSpace
  settingsMenuContainer.append('div').style('height', '100px');
}

// UI Rendering
export function AppendSettingsMenuIcon() {
  const settingsIcon = d3
    .select('#nav-bar-icons-container')
    .append('i')
    .attr('class', 'fas fa-cog fa-settings-icon');
  settingsIcon.on('click', () => {
    if (d3.select('#settings-panel').node().childNodes.length === 0) {
      OpenSettingsPanel();
      const clostBtn = settingsPanelContainer.append('div').attr('id', 'settings-close-btn');
      clostBtn.append('p').text('X');
      AppendSettingsContent(d3.select(`#${constants.SETTINGS_PANEL_ID}`));
      fieldMapper.AppendUnknownFields2NoAssignmentSection(missingFieldsFound, fieldsFound);
      clostBtn.on('click', () => {
        CloseSettingsPanel();
      });
    } else {
      CloseSettingsPanel();
    }
  });
}

/**
 * Changes title and logo in navbar
 *
 * @param {*} localpath
 * @param {*} title
 */
function CreateNavBar(localpath, title) {
  d3.select('#nav-title').text(title);
  d3.select('#logo-svg').attr('src', `./${localpath}`);
}
async function LoadProcessAttrData() {
  if (settings && settings.process_attr && Object.keys(settings.process_attr).length > 0) {
    await Promise.all(
      Object.keys(settings.process_attr).map(async (attr) => {
        const attrSettings = settings.process_attr[attr];
        const attrData = await GetPluginData(attrSettings.data);
        StoreAttrData(attr, attrData);
      }),
    );
  }
}

export function CreateSettingsPanelContainer(){
  settingsPanelContainer = d3
    .select('.vis-body')
    .append('div')
    .attr('id', constants.SETTINGS_PANEL_ID);
}
export function CreateNavBarIconContainer(){
  const navBarIconContainer = d3
    .select('.navbar')
    .append('div')
    .attr('id', 'nav-bar-icons-container');
  return navBarIconContainer;
}

export function AppendDefaultPopups(){
  AppendPopup(
    'Click the settings icon to configure diagram with new datasets.',
    'Learn about the settings menu',
    'fas fa-cog',
    'normal',
  );
  AppendPopup(
    'Click on a metrostop to learn more about that step in the process.',
    'Learn about the metrostop view',
    'far fa-circle',
    'normal',
  );
}

// Initiate settings menu
export async function CreateSettingsMenu() {
  settings = await loadSettings();
  CreateSettingsPanelContainer();
  const navBarIconContainer = CreateNavBarIconContainer();
  StoreFields(FIELDS);
  AppendSettingsMenuIcon();
  try {
    CreateNavBar(settings.general.navbar.logo, settings.general.navbar.title);
  } catch (err) {
    console.log('Something went wrong!', err);
  }

  const popupContainer = AppendPopupContainer(d3.select('.vis-body'));
  AppendPopupNotificationIcon(navBarIconContainer);
  AppendDefaultPopups();

  const ProcessData = await GetPluginData('process-data.js');
  ProcessUploadedMetrostopData(ProcessData);
  console.log({ ProcessData });
  const EventData = await GetPluginData('events-data.js');
  console.log({ EventData });
  ProcessEventData(EventData);
  LoadProcessAttrData();
}
