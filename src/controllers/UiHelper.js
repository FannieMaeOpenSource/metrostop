import { GetArrowsNeeded4Path, GetWidth4Label } from '../services/Utilities.js';
import Constants from '../services/Constants.js';

const { d3 } = window;

/**
 * Method to store data related to the arrows in the paths connecting each stop
 * @param {Object} pathData
 * @param {number} xPos1
 * @param {number} yPos1
 * @param {boolean} isHorizontal
 * @param {boolean} isVertical
 * @param {number} arrowCount
 * @param {Object} stop
 * @returns Object
 */
const UpdateArrowPathData = (
  pathData,
  xPos1,
  yPos1,
  isHorizontal,
  isVertical,
  arrowCount,
  stop,
) => ({
  ...pathData,
  start_x: xPos1,
  start_y: yPos1,
  is_vertical: isVertical,
  is_horizontal: isHorizontal,
  arrow_count: arrowCount,
  stop_start_x: stop.cx,
  stop_start_y: stop.cy,
  color: stop.color,
});

/**
 * Draw Labels In Nodes
 * @param {*} labels
 * @param {*} delayTimeRectangles
 * @returns Promise
 */
function DrawLabelsInNodes(labels, delayTimeRectangles) {
  labels
    .transition()
    .delay(delayTimeRectangles)
    .attr('fill', 'white')
    .attr('visibility', 'visible');
  return Promise.resolve('Success');
}
/**
 * Draw Tree Rectangles
 * @param {*} rectangles
 * @param {*} params
 */
function DrawTreeRectangles(svg, rectangles, params) {
  const {
    firstDuration, nodePadding, rectHeight, stopColor,
  } = params;
  let { delayTimeRectangles, delayCountRectangles } = params;
  // const colorScale = arguments[4];
  const color = d3.color(stopColor);
  const darkerColor = color.darker(2);
  rectangles
    .transition()
    .delay(() => {
      const currentDelay = delayTimeRectangles;
      delayCountRectangles += 1;
      delayTimeRectangles = delayCountRectangles * firstDuration;
      return currentDelay;
    })
    .duration(firstDuration)
    .attr('stroke', darkerColor)
    .attr('fill', darkerColor)
    .attr('stroke-width', 1)
    .attr('width', (d, i) => (i == 0 || i == rectangles.size() - 1 ? null : GetWidth4Label(svg, d.data.name) + nodePadding))
    .attr('height', (d, i) => (i == 0 || i == rectangles.size() - 1 ? null : rectHeight));
}
/**
 * Method to draw arrow shapes to a path in between stops
 * @param {Object} group - the group for the whole visualizatio
 * @param {number[]} startCoordinates - the starting x,y values to starting drawing line
 * @param {number[]} endCoordinates - the ending x,y values to end drawing line
 * @param {number} increment - the distance value ( Integer ) between each arrow
 * @param {number} amountOfArrowsPerPath - the count value ( Integer ) of arrows for a path
 * @param {boolean} useX - the value indicating whether the path is vertical or horizontally
 * @param {*} stop -
 * @param {*} descId -
 */
function AddArrows2Path(
  group,
  startCoordinates,
  endCoordinates,
  increment,
  amountOfArrowsPerPath,
  useX,
  stop,
  descId,
) {
  let localIncrement = increment;
  const startX = startCoordinates[0];
  const endX = endCoordinates[0];
  const startY = startCoordinates[1];
  const endY = endCoordinates[1];
  let arrowPathId = 0;
  let arrowCount = amountOfArrowsPerPath;
  if (amountOfArrowsPerPath < 0) {
    arrowCount *= -1;
  }
  const LineGenerator = d3.line().curve(d3.curveCardinal);
  let prevXPos0;
  let prevXPos1;
  let prevYPos0;
  let prevYPos1;
  prevXPos0 = startX;
  prevYPos0 = startY;
  let data;
  // const arrowCount = amountOfArrowsPerPath;
  // const stopColor = stop.color;

  for (let i = 0; i < arrowCount; i += 1) {
    let line;
    data = {
      stop_name: stop.stop_name,
      stop_id: stop.stop_id
    };
   // console.log('stop name ', data)
   
    if (useX && ( startY == endY)) { //moving horizontally
      if (i === arrowCount - 1) {
        prevXPos1 -= Constants.PHASE_STOP_CIRCLE_RADIUS * 2;
      }
      const currIncrement = localIncrement + localIncrement * i;
      //check if path is moving in the left direction or right. If left decrement else increment
      prevXPos1 = (startX < endX ? (startX + currIncrement) : (startX - currIncrement));
      line = LineGenerator([
        [prevXPos0, startY],
        [prevXPos1, endY],
      ]);
      data = UpdateArrowPathData(data, prevXPos0, prevYPos0, true, false, arrowCount, stop);
      prevYPos0 = startY;
      prevYPos1 = endY;
      prevXPos0 = prevXPos1;
    } else if (!useX && (startX == endX)){ //moving vertically
      // TODO: ask Andre about below re-assignment
      if (localIncrement < 0) {
        localIncrement *= -1;
      }
      if (i === arrowCount - 1) {
        prevYPos1 -= Constants.PHASE_STOP_CIRCLE_RADIUS * 2;
      }
      const currIncrement = localIncrement + localIncrement * i;
      prevYPos1 = (startY < endY ? (startY + currIncrement) : (startY - currIncrement));
      prevXPos1 = endX;
      line = LineGenerator([
        [prevXPos0, prevYPos0],
        [prevXPos1, prevYPos1],
      ]);
      data = UpdateArrowPathData(data, prevXPos0, prevYPos0, false, true, arrowCount, stop);
      prevYPos0 = prevYPos1;
    } else { //moving diagnolly
      if (i === arrowCount - 1) {
        prevYPos1 -= Constants.PHASE_STOP_CIRCLE_RADIUS * 2;
        prevXPos1 -= Constants.PHASE_STOP_CIRCLE_RADIUS * 2;
      }
      const currIncrement = localIncrement + localIncrement * i;
      // prevYPos1 = (startY < endY ? (startY + currIncrement) : (startY - currIncrement));
      // prevXPos1 = (startX < endX ? (startX + currIncrement) : (startX - currIncrement));
      prevYPos1 = startY - currIncrement  - (4 *  Constants.PHASE_STOP_CIRCLE_RADIUS);
      prevXPos1 = startX + currIncrement  + (2 *  Constants.PHASE_STOP_CIRCLE_RADIUS);
      line = LineGenerator([
        [prevXPos0, prevYPos0],
        [prevXPos1, prevYPos1],
      ]);
      data = UpdateArrowPathData(data, prevXPos0, prevYPos0, false, true, arrowCount, stop);
      prevYPos0 = prevYPos1;
      prevXPos0 = prevXPos1;
    }
    // currentArrow
    group
      .append('path')
      .datum(data)
      .attr('id', `stops-connection-path-${stop.stop_id}-${descId}-${i + 1}`)
      .attr('class', `fadeable stops-connection-path connection-arrow-${arrowPathId + 1}`)
      .attr('stroke', 'none')
      .attr('stroke-width', 1.3)
      .attr('opacity', 0.88)
      .attr('fill', 'none')
      .attr('marker-end', 'url(#direction_arrow)')
      .attr('d', line);

    arrowPathId += 1;
  }
}

/**
 * Method to draw a path ( Line ) between all stops and their descendants
 * @param {number[]} startCoordinates - the starting x,y values to starting drawing line
 * @param {number[]} endCoordinates - the ending x,y values to end drawing line
 * @param {Object} visGroup - the group for the entire visualization
 * @param {string} color - the color of the current phase
 * @param {*} stop -
 * @param {*} ids -
 */
function ConnectStopsWithPath(startCoordinates, endCoordinates, visGroup, color, stop, ids) {
  const startXPos = startCoordinates[0];
  const endXPos = endCoordinates[0];
  const startYPos = startCoordinates[1];
  const endYPos = endCoordinates[1];
  const phaseRoad = visGroup
    .append('line')
    .datum(stop)
    .attr('stroke', color)
    .classed(`fadeable section-phase-${ids[1]} section-sector-${ids[0]}`, true)
    .attr('id', () => `path-${stop.stop_id}`)
    .attr('stroke-width', Constants.PHASE_STOP_CIRCLE_RADIUS)
    .attr('fill', 'none')
    .attr('x1', startXPos)
    .attr('y1', startYPos)
    .attr('x2', startXPos)
    .attr('y2', startYPos);
  phaseRoad
    .transition()
    .duration(900)
    .attr('x1', startXPos)
    .attr('y1', startYPos)
    .attr('x2', endXPos)
    .attr('y2', endYPos);
  let point1;
  let point0;
  let useX = true;
  // Check if the path is drawn horizontally or vertically.
  // If vertically, set useX to false. Else useX to true
  let totalDistance;
  if (startXPos === endXPos) {
    point1 = endYPos;
    point0 = startYPos;
    totalDistance = point1 - point0;
    useX = false;
  } else if (startYPos == endYPos) {
    point1 = endXPos;
    point0 = startXPos;
    totalDistance = point1 - point0;
  }else { //if not horizontal/vertical path then use pathagorean theorem to find distance
    let xDistance, yDistance;
    if (endXPos > startXPos) xDistance = endXPos - startXPos - ( Constants.PHASE_STOP_CIRCLE_RADIUS * 4)
    else xDistance = startXPos - endXPos - ( Constants.PHASE_STOP_CIRCLE_RADIUS * 4);
    if (endYPos > startYPos) yDistance = endYPos - startYPos - ( Constants.PHASE_STOP_CIRCLE_RADIUS * 4)
    else yDistance = startYPos - endYPos - ( Constants.PHASE_STOP_CIRCLE_RADIUS * 4);
    totalDistance = Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
  }
  
  const amountOfArrowsPerPath = GetArrowsNeeded4Path(totalDistance);
  const increment = totalDistance / amountOfArrowsPerPath;
  const newStartCoordinates = [startXPos, startYPos];
  const newEndCoordinates = [endXPos, endYPos];
  AddArrows2Path(
    visGroup,
    newStartCoordinates,
    newEndCoordinates,
    increment,
    amountOfArrowsPerPath,
    useX,
    stop,
    ids[2],
  );
}

/**
 * Method to add the link data to the links array, where a link consists of starting and
 * ending x and y coordinates. i.e. (x1, y1) and (x2, y2)
 * @param {Object[]} links - array of link connections between nodes that are related
 * @param {Object[]} nodes - array of nodes in the tree
 */
function AddSharedChildrenLinks(links, nodes) {
  const findTargetNode = (child) => nodes.find((localnode) => localnode.data.name === child.name);
  nodes.forEach((node) => {
    if (node.data.shared_children.length > 0) {
      const children = node.data.shared_children;
      children.forEach((child) => {
        links.push({
          source: node,
          target: findTargetNode(child),
        });
      });
    }
  });
}

/* Method to disable all stops pointer events except the current stop selected
  Params: @stop is the current stop selected
  */
function DisablePointerEvents4StopsExceptCurrent(stop) {
  d3.selectAll('.stop-circle').attr('pointer-events', 'none');
  d3.select(`.stop-circle-${stop.stop_id}`).attr('pointer-events', 'auto');
}

/**
 * Method to draw a grid where the visualization will be shown on screen for developement purposes
 */
function CreateGrid() {
  //* *************************GRID  */
  const gridGroup = d3.select('svg').append('g');
  const exes = d3.range(0, Constants.SVG_WIDTH + 1, 50).map((d) => [
    [d, 0],
    [d, Constants.SVG_HEIGHT],
  ]);
  const wyes = d3.range(0, Constants.SVG_HEIGHT + 1, 50).map((d) => [
    [0, d],
    [Constants.SVG_WIDTH, d],
  ]);
  const line = d3.line();

  gridGroup
    .selectAll('.grid')
    .data(d3.merge([exes, wyes]))
    .join('path')
    .attr('class', 'grid')
    .attr('d', line)
    .attr('stroke', 'black')
    .style('stroke-width', (d) => (d[0][0] === Constants.SVG_WIDTH / 2 || d[1][1] === Constants.SVG_HEIGHT / 2 ? 3 : 1));
  //* ****************************** */
}

/* Method to width of a label
     Params: @ui is the visualization class instance
  */
function GetWidthsOfSectorLabels(sectors, svg) {
  const textWidths = [];
  sectors.forEach((d) => {
    const text = svg
      .append('text')
      .text(d.sector_name)
      .attr('class', 'temp-text')
      .attr('font-size', '14px')
      .attr('font-weight', 400)
      .classed('text-font-family', true)
      .attr('visibility', 'hidden');
    const textWidth = text.node().getBBox().width;

    textWidths.push(textWidth);
  });
  return textWidths;
}
/* Method to find data for a specific stop
    Params: @descId is the target stop id ( Integer )
*/
const LocalFindStopData = (descId, dataSet) => {
  let descData;
  let foundDescFlag = false;
  dataSet.sectors.forEach((sector) => {
    if (!foundDescFlag) {
      sector.phases.forEach((phase) => {
        if (!foundDescFlag) {
          phase.stops.forEach((stop) => {
            if (stop.stop_id === descId) {
              descData = stop;
              foundDescFlag = true;
            }
          });
        }
      });
    }
  });
  return descData;
};

export {
  DrawLabelsInNodes,
  DrawTreeRectangles,
  AddSharedChildrenLinks,
  ConnectStopsWithPath,
  DisablePointerEvents4StopsExceptCurrent,
  CreateGrid,
  GetWidthsOfSectorLabels,
  LocalFindStopData,
};
