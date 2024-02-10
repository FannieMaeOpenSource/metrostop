/**
 * @jest-environment jsdom
 */
import { select } from 'd3-selection';
const d3 = { select };
import {AppendCard, SubtitleAndDescription} from './Card.js';

describe('AppendCard will ',()=>{
    beforeEach(() => {
        document.body.innerHTML=
        '<div class="testContainer"'+
        '</div>';
    });
    
    afterEach(() => {
        d3.select('.testContainer').remove()
    });
    it('add subtitle and desc to card',() =>{
        const testContainer = d3.select('.testContainer');
        AppendCard(testContainer,'testCardId','testText');
        expect(d3.select('#testCardId'))
            .not
            .toBeNull();
    });
});
describe('SubtitleAndDescription will ',()=>{
    beforeEach(() => {
        document.body.innerHTML=
        '<div class="testContainer"'+
        '<div>';
    });
    
    afterEach(() => {
        d3.select('.testContainer').remove()
    });
    it('add subtitle and desc to card',() =>{
        const testContainer = d3.select('.testContainer');
        SubtitleAndDescription(testContainer,'subtitle text','');
        expect(d3.select('.subtitle-field-assignment').text())
            .toBe('subtitle text');
    });
});