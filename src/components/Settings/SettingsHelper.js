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

function ProcessEventData(data) {
    StoreEventData(data);
  }

function CreateSettingsPanelContainer(){
    const settingsPanelContainer = d3
      .select('.vis-body')
      .append('div')
      .attr('id', 'settings-panel');
}
// UI rendering
function OpenSettingsPanel() {
    const settingsPanel = d3.select('#settings-panel');
    settingsPanel.transition().duration(1000).style('width', '40%');
    settingsPanel.style('overflow-y', 'scroll ');
  }
  // UI rendering
function CloseSettingsPanel() {
    d3.select('#settings-menu').remove();
    d3.select('#settings-close-btn').remove();
    const settingsPanel = d3.select('#settings-panel');
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
  
function SettingsHelper(){
    let FIELDS = [];
    let missingFieldsFound=[];
    let fieldsFound=[];
    function setDefaultFields(){
        FIELDS = [
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
    }
    function setFields(newFields){
        FIELDS=newFields;
    }
    function getFields(){
        return FIELDS;
    }
    function setMissingFieldsFound(newMissingFieldsFound){
        missingFieldsFound=newMissingFieldsFound;
    }
    function getMissingFieldsFound(){
        return missingFieldsFound;
    }
    function setFieldsFound(newFieldsFound){
        fieldsFound=newFieldsFound;
    }
    function getFieldsFound(){
        return fieldsFound;
    }
    // Data processing
    function ProcessUploadedMetrostopData(parsedData) {
        const data = CleanProcessData(parsedData);
        const fieldInfo = ConsumeDataUpdated(data);
        const foundAllfields=fieldInfo.foundAllRequiredFields;
        missingFieldsFound=fieldInfo.missingFieldsFound;
        fieldsFound = fieldInfo.fieldsFound;
        console.log(missingFieldsFound);
        console.log(fieldsFound);
        if (!foundAllfields) {
            fieldMapper.AppendUnknownFields2NoAssignmentSection(
                missingFieldsFound, fieldsFound
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
    function AppendSettingsMenuIcon() {
        const settingsIcon = d3
          .select('#nav-bar-icons-container')
          .append('i')
          .attr('class', 'fas fa-cog fa-settings-icon');
        settingsIcon.on('click', () => {
          if (d3.select('#settings-panel').node().childNodes.length === 0) {
            OpenSettingsPanel();
            const clostBtn = d3.select('#settings-panel').append('div').attr('id', 'settings-close-btn');
            clostBtn.append('p').text('X');
            AppendSettingsContent(d3.select('#settings-panel'));
            console.log(missingFieldsFound);
            console.log(fieldsFound);
            fieldMapper.AppendUnknownFields2NoAssignmentSection(getMissingFieldsFound(), fieldsFound);
            clostBtn.on('click', () => {
              CloseSettingsPanel();
            });
          } else {
            CloseSettingsPanel();
          }
        });
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
    return {
        ProcessUploadedMetrostopData:(parsedData)=>ProcessUploadedMetrostopData(parsedData),
        setDefaultFields:(data)=>setDefaultFields(data),
        setFields:(data)=>setFields(data),
        getFields:()=>getFields(),
        getMissingFieldsFound:()=>getMissingFieldsFound(),
        setMissingFieldsFound:(data)=>setMissingFieldsFound(data),
        getFieldsFound:()=>getFieldsFound(),
        setFieldsFound:(data)=>setFieldsFound(data),
        AppendSettingsContent:(container)=>AppendSettingsContent(container),
        AppendSettingsMenuIcon:()=>AppendSettingsMenuIcon(),
        CreateDataSection:(container)=>CreateDataSection(container)
    }
}
function CreateNavBarIconContainer(){
    const navBarIconContainer = d3
      .select('.navbar')
      .append('div')
      .attr('id', 'nav-bar-icons-container');
    return navBarIconContainer;
  }
export {
    SettingsHelper,
    CreateSettingsPanelContainer,
    CreateNavBarIconContainer,
    ProcessEventData,
    OpenSettingsPanel,
    CloseSettingsPanel,
    CreateEventDataSection
};