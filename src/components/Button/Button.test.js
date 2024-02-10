/**
 * @jest-environment jsdom
 */
import { select } from 'd3-selection';
const d3 = { select };
import AppendButton from './Button.js';

describe('AppendButton will ',()=>{
    it('add button to container',() =>{
        document.body.innerHTML=
        '<div class="testContainer"'+
        '</div>';
        const testContainer = d3.select('.testContainer');
        AppendButton('newButtonId',testContainer,"Misc Text");
        expect(d3.select('#newButtonId')).not.toBeNull();
    });
});