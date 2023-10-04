import { select } from 'd3-selection';
import { max, sum } from 'd3-array';

const d3 = {
  select,
  max,
  sum,
};

/* Method to find the mid point between 2 points
       Params: @sourceXPos is the source node x position
               @sourceYPos is the source node y position
               @targetXPos is the target node x position
               @targetYPos is the target node y position
    */
const FindMidPoint4Path = (sourceXPos, sourceYPos, targetXPos, targetYPos) => {
  let xMidPoint;
  let xDistance;
  if (sourceXPos > targetXPos) {
    xDistance = sourceXPos - targetXPos;
    const half = xDistance / 2;
    xMidPoint = sourceXPos - half;
  } else if (sourceXPos === targetXPos) {
    xMidPoint = sourceXPos;
  } else {
    xDistance = targetXPos - sourceXPos;
    const half = xDistance / 2;
    xMidPoint = targetXPos - half;
  }
  const half = (targetYPos - sourceYPos) / 2;
  const yMidPoint = targetYPos - half;
  return [xMidPoint, yMidPoint];
};

/* Method to get the correct starting event to display in tooltip
                   Params: @link is the current link being hovered over
                           @lastYPos is the last y position on y axis of stop node
                */
const GetStartingEvent = (link, lastYPos) => {
  let event;
  console.log(link.source.data.values);
  if (link.target.y === lastYPos) {
    event = link.source.data.values.act_ending_event;
  } else {
    event = link.target.data.values.act_starting_event;
  }
  return event;
};
/* Method to show a tooltip reading the starting event for a target in the tree visual
       Params: @link is the current link that was hovered over
               @phase is the class name of the current phase the stop exists in
               @xMargin is the margin on the x axis of the screen where the tree is being displayed
               @yMargin is the margin on the y axis of the screen where the tree is being displayed
    */
const ShowToolTip4Event = (link, phase, xMargin, yMargin, lastYPos) => {
  const { target } = link;
  const { source } = link;

  const toolTip = d3
    .select(phase)
    .append('g')
    .classed('tool-tip', true)
    .attr('pointer-events', 'none');

  const toolTipContainer = toolTip
    .append('rect')
    .attr('fill', '#eee')
    .attr('stroke', '#333')
    .attr('rx', 4)
    .attr('fill-opacity', 0.7);

  const titleXPos = 2;
  const titleYPos = 9;
  const toolTipTitle = toolTip
    .append('text')
    .text('Event')
    .classed('text-font-family', true)
    .attr('font-size', 9)
    .attr('font-weight', 'bold')
    .attr('x', titleXPos)
    .attr('y', titleYPos);
  const event = GetStartingEvent(link, lastYPos);

  const toolTipStartingEvenValue = toolTip
    .append('text')
    .text(event)
    .classed('text-font-family', true)
    .attr('font-size', 8)
    .attr('x', titleXPos + 2)
    .attr('y', titleYPos + 10);
  const eventDimensions = toolTipStartingEvenValue.node().getBBox();
  const titleDimensions = toolTipTitle.node().getBBox();
  const titleWidth = titleDimensions.width;
  const titleHeight = titleDimensions.height;
  const eventValueWidth = eventDimensions.width;
  const eventValueHeight = eventDimensions.height;
  const maxWidth = d3.max([titleWidth, eventValueWidth]);
  const sumOfHeights = d3.sum([titleHeight, eventValueHeight]);
  toolTipContainer.attr('width', maxWidth + 6).attr('height', sumOfHeights + 4);

  const sourceXPos = source.x - xMargin;
  const sourceYPos = source.y + yMargin;
  const targetXPos = target.x - xMargin;
  const targetYPos = target.y + yMargin;
  const xYCoordinates = FindMidPoint4Path(sourceXPos, sourceYPos, targetXPos, targetYPos);

  toolTip.attr('transform', `translate(${xYCoordinates[0]}, ${xYCoordinates[1]})`);
};
export default ShowToolTip4Event;
