import { selectAll } from 'd3-selection';

const d3 = { selectAll };

function HighLightGraphSection(id) {
  d3.selectAll(id).classed('highlight-phase-sector', true);
}
function UnHighLightGraphSection(id) {
  d3.selectAll(id).classed('highlight-phase-sector', false);
}
/* Method to draw label for a sector on the legend
   Params: @container is the group for the entire legend
           @sectorName is the text value ( String ) for the sector name
           @xPos is the x position value ( Integer ) for the label
           @yPos is the y position value ( Integer ) for the label
*/
function DrawSectorLabelOnLegend(container, sectorName, xPos, yPos, sectorId) {
  const fontSize = 14;
  const sectorLabel = container
    .append('text')
    .text(sectorName)
    .classed('legend-sector-label', true)
    .attr('transform', `translate(${xPos}, ${yPos})`)
    .attr('font-size', fontSize)
    .classed('text-font-family', true);
  sectorLabel
    .on('mouseover', () => {
      sectorLabel.attr('font-size', 15);
      HighLightGraphSection(`.section-sector-${sectorId}`);
    })
    .on('mouseout', () => {
      sectorLabel.attr('font-size', fontSize);
      UnHighLightGraphSection(`.section-sector-${sectorId}`);
    });
}
/* Method to draw a line and label for a phase
   Params: @container is the group for the entire legend
           @currentPhaseColor color for the phase
           @currentPhaseName is the text value ( String ) for the name of the phase
           @xPosWIncrement  is the x position value ( Integer )
           @lastYPos is the last known y position value ( Integer )
*/
function DrawColorWithPhaseLabelOnLegend(
  container,
  currentPhaseColor,
  currentPhaseName,
  phaseId,
  xPosWIncrement,
  lastYPos,
) {
  const yPos = lastYPos + 20;
  const lineStrokeWidth = 5;
  const fontSize = 13.5;
  const phaseStroke = container
    .append('line')
    .attr('stroke', currentPhaseColor)
    .attr('stroke-width', lineStrokeWidth)
    .attr('x1', xPosWIncrement)
    .attr('y1', yPos)
    .attr('x2', xPosWIncrement + 20)
    .attr('y2', yPos);

  const strokeWidth = phaseStroke.node().getBBox().width;

  const phaseLabel = container
    .append('text')
    .attr('font-size', 13.5)
    .classed('legend-phase-label', true)
    .text(currentPhaseName)
    .attr('transform', `translate(${xPosWIncrement + strokeWidth + 10}, ${yPos + 3})`)
    .classed('text-font-family', true);

  phaseStroke
    .on('mouseover', () => {
      phaseStroke.attr('stroke-width', lineStrokeWidth + 1);
      phaseLabel.attr('font-size', fontSize + 1);
      HighLightGraphSection(`.section-phase-${phaseId}`);
    })
    .on('mouseout', () => {
      phaseStroke.attr('stroke-width', lineStrokeWidth);
      phaseLabel.attr('font-size', fontSize);
      UnHighLightGraphSection(`.section-phase-${phaseId}`);
    });
  phaseLabel
    .on('mouseover', () => {
      phaseLabel.attr('font-size', fontSize + 1);
      phaseStroke.attr('stroke-width', lineStrokeWidth + 1);
      HighLightGraphSection(`.section-phase-${phaseId}`);
    })
    .on('mouseout', () => {
      phaseLabel.attr('font-size', fontSize);
      phaseStroke.attr('stroke-width', lineStrokeWidth);
      UnHighLightGraphSection(`.section-phase-${phaseId}`);
    });
}
/* Method to draw the entire legend
   Params: @visGroup is the group for the entire visualization
*/
function CreateLegend(visGroup, lastYPosition, sectors) {
  const legendStartYPos = lastYPosition + 70;
  const legendContainer = visGroup
    .append('g')
    .attr('transform', `translate(35, ${legendStartYPos})`)
    .classed('fadeable', true);
  const legendBackDrop = legendContainer
    .append('rect')
    .attr('transform', 'translate(0, 0)')
    .attr('rx', 15)
    .attr('ry', 15)
    .classed('legend-container', true);
  let lastYPos = 14;
  legendContainer
    .append('text')
    .text('MAP LEGEND')
    .classed('text-font-family', true)
    .attr('transform', `translate(10, ${lastYPos + 1} )`);

  lastYPos += 20;
  let xPos = 10;
  sectors.forEach((sector) => {
    const currentSectorName = sector.sector_name;
    const sectorId = sector.sector_id;
    DrawSectorLabelOnLegend(legendContainer, currentSectorName, xPos, lastYPos, sectorId);
    sector.phases.forEach((phase, j) => {
      const currentPhaseColor = phase.phase_styles.phase_color;
      const currentPhaseName = phase.phase_name;
      const currentYPos = lastYPos + j * 20;
      const phaseId = phase.phase_id;
      DrawColorWithPhaseLabelOnLegend(
        legendContainer,
        currentPhaseColor,
        currentPhaseName,
        phaseId,
        xPos,
        currentYPos,
      );
    });
    const currentTotalWidh = legendContainer.node().getBBox().width;
    xPos = currentTotalWidh + 20;
  });
  const totalWidth = legendContainer.node().getBBox().width;
  const totalHeight = legendContainer.node().getBBox().height;
  legendBackDrop.attr('width', totalWidth + 20).attr('height', totalHeight + 23);
}
export default CreateLegend;
