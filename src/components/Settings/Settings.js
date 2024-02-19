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
import DataStore from '../../services/DataStore.js';
import { CreateNavBarIconContainer, CreateSettingsPanelContainer, SettingsHelper,ProcessEventData } from './SettingsHelper.js';

const d3 = { select };

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
  const settings = DataStore.getSettings();
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
  const settings = await loadSettings();
  CreateSettingsPanelContainer();
  const navBarIconContainer = CreateNavBarIconContainer();
  const settingsHelper = SettingsHelper();
  settingsHelper.setDefaultFields()
  StoreFields(settingsHelper.getFields());
  settingsHelper.AppendSettingsMenuIcon();
  try {
    CreateNavBar(settings.general.navbar.logo, settings.general.navbar.title);
  } catch (err) {
    console.log('Something went wrong!', err);
  }

  const popupContainer = AppendPopupContainer(d3.select('.vis-body'));
  AppendPopupNotificationIcon(navBarIconContainer);
  AppendDefaultPopups();

  const ProcessData = await GetPluginData('process-data.js');
  settingsHelper.ProcessUploadedMetrostopData(ProcessData);
  console.log({ ProcessData });
  const EventData = await GetPluginData('events-data.js');
  console.log({ EventData });
  ProcessEventData(EventData);
  LoadProcessAttrData();
}
