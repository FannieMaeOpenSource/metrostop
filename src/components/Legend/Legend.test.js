/**
 * @jest-environment jsdom
 */
import { select,selectAll } from 'd3-selection';
const d3 = { select,selectAll };
import CreateLegend from './Legend';

describe('CreateLegend will ',()=>{
    beforeEach(() => {
        document.body.innerHTML=
        '<svg id="testSVG"'+
        '</svg>';
        const visGroup = d3.select('#testSVG');
        const lastYPos = 10;
        const sectors = [{
            sector_name:"test sector",
            sector_id:1,
            phases:[{
                phase_styles:{
                    phase_color:"blue"
                },
                phase_name:"test phase",
                phase_id:1
            }]
        },
        {
            sector_name:"test sector 2",
            sector_id:2,
            phases:[{
                phase_styles:{
                    phase_color:"red"
                },
                phase_name:"test phase 2",
                phase_id:2
            }]
        },];
        Object.defineProperty(global.SVGElement.prototype, 'getBBox', {
            writable: true,
            value: jest.fn().mockReturnValue({
              x: 0,
              y: 0,
            }),
        });
        CreateLegend(visGroup,lastYPos,sectors);
    });
    
    afterEach(() => {
        d3.select('#testSVG').remove()
    });
    it(' create legend container',() =>{
        expect(d3.select('g')).not.toBeNull();
    });
    it(' have MAP LEGEND as title',() =>{
        expect(d3.select('.text-font-family').text())
                .toBe("MAP LEGEND");
    });
    it(' create sector labels',() =>{
        expect(d3.select('.legend-sector-label').text())
                .toBe("test sector");
    });
    it(' create multiple sector labels',() =>{
        expect(document.querySelectorAll(".legend-sector-label").length)
                .toBe(2);
    });
    it(' create phase labels',() =>{
        expect(document.querySelector(".legend-phase-label").textContent)
                .toBe("test phase");
    });
    it(' create multiple phase labels',() =>{
        expect(document.querySelectorAll(".legend-phase-label")[1].textContent)
                .toBe("test phase 2");
    });
    it(' create phase labels with proper phase color',() =>{
        expect(document.querySelectorAll("g line")[0].getAttribute('stroke'))
                .toBe("blue");
    });
});