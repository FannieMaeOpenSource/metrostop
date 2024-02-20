/**
 * @jest-environment jsdom
 */
import { select,selectAll } from 'd3-selection';
import DataStore from "../../services/DataStore";
import { CloseSettingsPanel, CreateDataSection, CreateEventDataSection, CreateNavBarIconContainer, CreateSettingsPanelContainer, OpenSettingsPanel, ProcessEventData, SettingsHelper } from "./SettingsHelper";
import { ProcessUploadedMetrostopData_input, ProcessUploadedMetrostopData_output } from './SettingsHelper_testObj';
const d3 = { select,selectAll };

// Mock out fns we are not testing
jest.mock("../../controllers/UiController", () => ({
    __esModule: true,
    default: {
        DrawMetroStopGraph:jest.fn(() => 42)
    },
}));
jest.mock("../Controls/Panel/Panel", () => ({
    __esModule: true,
    default: jest.fn(() => 42),
    CreatePanel:jest.fn(() => "test"),
}));
jest.mock("./UploadDataButton/UploadDataButton", () => ({
    __esModule: true,
    default: jest.fn(() => 42),
    CreateUploadButton:jest.fn(() => "test"),
}));
describe('ProcessEventData should ', () => {
it('store event data to datastore', () => {
    const testRecords=[
        {
            description:"this is an event!",
            event:"test event"
        }
    ]
    ProcessEventData(testRecords);
    expect(DataStore.getEvent("test event").description).toEqual("this is an event!");
    });
});
describe('CreateSettingsPanelContainer will ',()=>{
    beforeEach(() => {
        document.body.innerHTML=
        '<div class="vis-body"></div>';
    });
    it(' add settings panel container to vis-body',() =>{
        CreateSettingsPanelContainer();
        expect(document.querySelector(".vis-body #settings-panel")).not.toBeNull();
    });
});
describe('OpenSettingsPanel will ',()=>{
    beforeEach(() => {
        document.body.innerHTML=
        '<div class="vis-body"><div id="settings-panel"></div></div>';
        OpenSettingsPanel();
        setTimeout(() => {}, 1100);
    });
    afterEach(() => {
        d3.select('.vis-body').remove()
    });
    it(' shift settings panel such so that it is visible',() =>{
        expect(document.querySelector('#settings-panel').style['overflow-y']).toEqual('scroll ');
    });
});
describe('CloseSettingsPanel will ',()=>{
    beforeEach(() => {
        document.body.innerHTML=
        '<div class="vis-body">'+
        '<div id="settings-panel">'+
        '<div id="settings-menu"></div>'+
        '<div id="settings-close-btn"></div>'+
        '</div>'+
        '</div>';
        OpenSettingsPanel();
        setTimeout(() => {}, 1100);
        CloseSettingsPanel();
    });
    afterEach(() => {
        d3.select('.vis-body').remove()
    });
    it('removes settings menu',() =>{
        expect(document.querySelector('#settings-menu')).toBeNull();
    });
    it('hide settings panel',() =>{
        expect(document.querySelector('#settings-panel').style['overflow-y']).toEqual('');
    });
});
describe('CreateEventDataSection will ',()=>{
    beforeEach(() => {
        document.body.innerHTML=
        '<div class="vis-body">'+
        '<div id="settings-panel">'+
        '</div>'+
        '</div>';
        CreateEventDataSection(d3.select('#settings-panel'));
    });
    afterEach(() => {
        d3.select('.vis-body').remove()
    });
    it('append upload container',() =>{
        expect(document.querySelector('#event-data-upload-container')).not.toBeNull();
    });
    it('append button container',() =>{
        expect(document.querySelector('#event-settings-bttn-container')).not.toBeNull();
    });
});
describe('CreateDataSection will ',()=>{
    let settingsHelper;
    beforeEach(() => {
        document.body.innerHTML=
        '<div class="vis-body">'+
        '<div id="settings-panel">'+
        '</div>'+
        '</div>';
        settingsHelper=SettingsHelper();
        settingsHelper.CreateDataSection(d3.select('#settings-panel'));
    });
    afterEach(() => {
        d3.select('.vis-body').remove()
    });
    it('append upload container',() =>{
        expect(document.querySelector('#data-upload-container')).not.toBeNull();
    });
    it('append button container',() =>{
        expect(document.querySelector('#settings-bttn-container')).not.toBeNull();
    });
});
describe('SettingsHelper will',()=>{
    let settingsHelper;
    beforeEach(() => {
        settingsHelper=SettingsHelper();
        document.body.innerHTML=
        '<div class="vis-body">'+
        '<div id="settings-panel">'+
        '</div>'+
        '</div>';
    });
    afterEach(() => {
        d3.select('.vis-body').remove()
    });
    it('set default fields',() =>{
        const expected = [
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
        settingsHelper.setDefaultFields();
        expect(settingsHelper.getFields()).toEqual(expected);
    });
    it('set fields variable',() =>{
        settingsHelper.setFields("test");
        expect(settingsHelper.getFields()).toEqual("test");
    });
    it('set missingFieldsFound variable',() =>{
        settingsHelper.setMissingFieldsFound("test");
        expect(settingsHelper.getMissingFieldsFound()).toEqual("test");
    });
    it('set FieldsFound variable',() =>{
        settingsHelper.setFieldsFound("test");
        expect(settingsHelper.getFieldsFound()).toEqual("test");
    });
    it('process uploaded metrostop data and save to data store',() =>{
        settingsHelper.setDefaultFields();
        DataStore.addFields(settingsHelper.getFields());
        settingsHelper.ProcessUploadedMetrostopData(ProcessUploadedMetrostopData_input);
        expect(DataStore.getData()).not.toBeNull();
    });
    it('append setting content including title text',() =>{
        settingsHelper.AppendSettingsContent(d3.select('#settings-panel'));
        expect(document.querySelector('p').textContent)
        .toEqual('Manage general settings for the metro stop here. These settings are data model specific and will apply to the dataset input');
    });
    it('append nav bar icon container',() =>{
        document.body.innerHTML=
        '<div class="vis-body">'+
        '<div id="nav-bar-icons-container"></div>'+
        '</div>';
        settingsHelper.AppendSettingsMenuIcon()
        expect(document.querySelector('i').getAttribute('class'))
        .toEqual('fas fa-cog fa-settings-icon');
    });
});
describe('CreateNavBarIconContainer will ',()=>{
    it(' add nav bar icons container to navbar',() =>{
        document.body.innerHTML=
        '<div class="navbar"></div>';
        CreateNavBarIconContainer();
        expect(document.querySelector("#nav-bar-icons-container")).not.toBeNull();
    });
});