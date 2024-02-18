import { select } from 'd3-selection';
import PopupDataStore from "./PopupDataStore";
const d3 = { select };
describe('PopupDataStore will ',()=>{
    beforeEach(() => {
        PopupDataStore.setData([{
            id:0,
            message:"This is a test popup",
            summary:"Test popup",
            icon:"",
            type:"error",
            show:true
        }]);
    });
    it('store a dataset',() =>{
        expect(PopupDataStore.getData()[0].message)
            .toBe("This is a test popup");
    });
    it('add new data to dataset',() =>{
        PopupDataStore.addData({
            id:1,
            message:"This is a second test popup",
            summary:"Test popup 2",
            icon:"",
            type:"error",
            show:true
        });
        expect(PopupDataStore.getData()[1].message)
            .toBe("This is a second test popup");
    });
    it('modify popup data',() =>{
        PopupDataStore.modifyDataByMessage(
            "This is a test popup",
            "show",
            false
        );
        expect(PopupDataStore.getData()[0].show)
            .toBe(false);
    });
});