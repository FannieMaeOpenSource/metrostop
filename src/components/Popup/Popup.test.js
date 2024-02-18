/**
 * @jest-environment jsdom
 */
import { 
    AppendPopup,
    AppendPopupContainer,
    AppendPopupNotificationIcon,
    ZoomInPopupContainer,
    ZoomOutPopupContainer } from "./Popup";
import { select } from 'd3-selection';
import PopupDataStore from "./PopupDataStore";
const d3 = { select };

describe('AppendPopupContainer will ',()=>{
    beforeEach(() => {
        document.body.innerHTML=
        '<div class="testContainer"'+
        '</div>';
    });
    
    afterEach(() => {
        d3.select('.testContainer').remove()
    });
    it('create container for popups',() =>{
        const testContainer = d3.select('.testContainer');
        AppendPopupContainer(testContainer);
        expect(d3.select('#popup-container'))
            .not
            .toBeNull();
    });
});
describe('AppendPopup will ',()=>{
    beforeEach(() => {
        document.body.innerHTML=
        '<div class="testContainer"'+
        '</div>';
        const testContainer = d3.select('.testContainer');
        AppendPopupContainer(testContainer);
    });
    
    afterEach(() => {
        d3.select('.testContainer').remove()
    });
    it('create popup div',() =>{
        AppendPopup("This is a test popup",
        "Test popup",
        "fa-house",
        "normal");
        expect(d3.select('#popup'))
            .not
            .toBeNull();
    });
    it('add close icon to div',() =>{
        AppendPopup("This is a test popup",
        "Test popup",
        "fa-house",
        "normal");
        expect(d3.select('#popup-close'))
            .not
            .toBeNull();
    });
    it('add correct text to popup',() =>{
        AppendPopup("This is a test popup",
        "Test popup",
        "fa-house",
        "normal");
        expect(document.querySelectorAll('#popup p')[1].textContent)
            .toBe("This is a test popup");
    });
    it('create warning popup',() =>{
        AppendPopup("This is a test popup",
        "Test popup",
        "",
        "warning");
        expect(document.querySelector('#popup i').getAttribute("class"))
            .toBe("fas fa-exclamation-triangle");
    });
    it('create error popup',() =>{
        AppendPopup("This is a test popup",
        "Test popup",
        "",
        "error");
        expect(document.querySelector('#popup i').getAttribute("class"))
            .toBe("fas fa-exclamation-circle");
    });
    it('save popup info to datastore',() =>{
        AppendPopup("This is a test popup",
        "Test popup",
        "",
        "error");
        expect(PopupDataStore.getData()[0].message)
            .toBe("This is a test popup");
    });
});
describe('AppendPopupNotificationIcon will ',()=>{
    beforeEach(() => {
        document.body.innerHTML=
        '<div class="testContainer"'+
        '</div>';
        const testContainer = d3.select('.testContainer');
        AppendPopupNotificationIcon(testContainer);
    });
    
    afterEach(() => {
        d3.select('.testContainer').remove()
    });
    it('add notification icon to container',() =>{
        expect(document.querySelector('#notification-icon').getAttribute("class"))
            .toBe("fas fa-bell");
    });
});