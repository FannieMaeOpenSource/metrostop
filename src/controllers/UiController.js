/* Author: Andre Barajas
   Date: 01-11-2021
   Purpose: Class to handle any User Interface manipulation
*/
// TODO: this file is too long, can we split it up? there is one 1000 line method in here
import { RenderExtension, ResetExtensions } from './extensions/index.js';
import {
  GetArrowsNeeded4Path,
  CheckLineDirection,
  GetWidth4Label,
  GetHeight4Label,
} from '../services/Utilities.js';
import {
  CreateProcessHierarchy,
  AssignCoordinates,
  VerticalLink_x,
  VerticalLink_y,
  VerticalLinkStart_x,
  VerticalLinkStart_y,
  Rectangles_x,
  Rectangles_y,
  Labels_x,
  Labels_y,
} from '../services/DataHelper.js';
import {
  CloseZoomFeature,
  OpenZoomFeature,
  CreateLegend,
  CreateControls,
  UpdateActivityInfoInPanel,
  ShowToolTip4Event,
} from '../components/index.js';
import {
  DrawLabelsInNodes,
  DrawTreeRectangles,
  AddSharedChildrenLinks,
  ConnectStopsWithPath,
  DisablePointerEvents4StopsExceptCurrent,
  GetWidthsOfSectorLabels,
  LocalFindStopData,
} from './UiHelper.js';
import Constants from '../services/Constants.js';
import DataStore from '../services/DataStore.js';
import { ZoomInPopupContainer, ZoomOutPopupContainer } from '../components/Popup/Popup.js';
import { GeneralRadiate } from '../components/Controls/Controls.js';

let vis;

const { d3 } = window;

/* Method to set view tofocus on a particular stop
          Params: @stop is the current stop selected
                  @circleRadiate is the circle that radiates behind the stop circle
                  @color is the coor of the current phase/stop
                  @currentStop is the stop selected currently
      */
function SetView(stop, circleRadiate, color, currentStop) {
  DisablePointerEvents4StopsExceptCurrent(stop);
  OpenZoomFeature(stop, circleRadiate, color, currentStop);
}

function HandleZoom(e) {
  d3.select('svg g').attr('transform', e.transform);
}

/**
 * Method to find all stops with descendants which will need a path drawn between them
 * @param {Object} visGroup - group for entire visualization
 */
function DrawPaths(visGroup) {
  const dataSet = DataStore.getData();
  dataSet.sectors.forEach((sector) => {
    const sectorId = sector.sector_id;
    sector.phases.forEach((phase) => {
      const phaseId = phase.phase_id;
      phase.stops.forEach((stop) => {
        const startX = stop.cx;
        const startY = stop.cy;
        const color = phase.phase_styles.phase_color;
        if (stop.descendant_stop_id.length > 0) {
          stop.descendant_stop_id.forEach((descId) => {
            stop.color = phase.phase_styles.phase_color;
            const currentDescendant = LocalFindStopData(descId, dataSet);
            const endX = currentDescendant.cx;
            const currDescId = currentDescendant.stop_id;
            const endY = currentDescendant.cy;
            const startCoordinates = [startX, startY];
            const endCoordinates = [endX, endY];
            ConnectStopsWithPath(startCoordinates, endCoordinates, visGroup, color, stop, [
              sectorId,
              phaseId,
              currDescId,
            ]);
          });
        }
      });
    });
  });
}

class UiControllerClass {
  constructor() {
    this._svg = null;
    this._stopClicked = false;
    this._lastYPosition = 0;
    this._intervalsStatus = {};
  }

  /* eslint-disable lines-between-class-members */
  get svg() {
    return this._svg;
  }
  set svg(val) {
    this._svg = val;
  }

  get stopClicked() {
    return this._stopClicked;
  }
  set stopClicked(val) {
    this._stopClicked = val;
  }

  get lastYPosition() {
    return this._lastYPosition;
  }
  set lastYPosition(val) {
    this._lastYPosition = val;
  }

  get intervalsStatus() {
    return this._intervalsStatus;
  }
  set intervalsStatus(val) {
    this._intervalsStatus = val;
  }
  /* eslint-enable */
  zoom = d3.zoom().on('zoom', HandleZoom);

  /* Method to Generate the visualization svg on html document */
  CreateSvg() {
    d3.select('.visual').remove();
    const visualContainer = d3.select('.vis-body').append('div').classed('visual', true);
    const localsvg = visualContainer
      .append('svg')
      .attr('id', 'loan-lifecycle-view')
      .attr('viewBox', `0 0 ${Constants.SVG_WIDTH} ${Constants.SVG_HEIGHT}`);
    const defs = localsvg.append('defs');
    const marker = defs
      .append('marker')
      .attr('id', 'direction_arrow')
      .attr('refX', 2)
      .attr('refY', 2)
      .attr('orient', 'auto')
      .attr('markerWidth', 9)
      .attr('markerHeight', 9)
      .attr('markerUnits', 'strokeWidth');
    marker
      .append('path')
      .attr('stroke', 'white')
      .attr('fill', 'none')
      .attr('d', 'M0, 0, L4,2 0, 4')
      .attr('stroke-width', 0.7);

    this.svg = localsvg;
    this.svg.call(this.zoom);
  }

  /* Method to reset view to original size
        Params: @visGroup current selection of elements in visual
                @currentStop is the stop selected currently
    */
  ResetView(currentStop) {
    d3.select('#svg-system-context-container').remove();
    d3.select('#system-context-container').remove();
    CloseZoomFeature(currentStop);
    d3.selectAll('.stop-circle').attr('pointer-events', 'auto');
    ZoomOutPopupContainer();
    ResetExtensions();
    vis.RadiateLifeCyclePath(d3.selectAll('.starting-point'), false, 0);
  }

  /* Method to terminate all active threads currently animating life cycle path */
  DisAllowRadiateLifeCycleThreads() {
    const threadIds2Terminate = Object.keys(this.intervalsStatus);
    threadIds2Terminate.forEach((threadId) => {
      clearInterval(threadId);
      delete this.intervalsStatus[threadId];
    });
  }

  /* Method to transition stop circle size and color and find next descendants from current stop.
       This Method will also terminate any threads that are finished working and will restart
       the animation when all paths are completed
       Params: @stops is an array of stops (circles) to begin with
               @stopInvterval is a boolean value to determine if a thread needs to be terminated
               @intervalId is the id of the interval thread active
     */
  AllowRadiateLifeCycleThreads(stops, stopInterval, intervalId) {
    if (stopInterval) {
      clearInterval(intervalId);
      delete this.intervalsStatus[intervalId];
    }
    stops
      .transition()
      .duration(100)
      .attr('stroke', 'white')
      .attr('fill', (d) => d.color)
      .attr('r', Constants.PHASE_STOP_CIRCLE_RADIUS + 4);
    stops
      .transition()
      .delay(899)
      // .duration(100)
      .attr('r', Constants.PHASE_STOP_CIRCLE_RADIUS)
      .attr('stroke', (d) => d.color)
      .attr('fill', (d) => {
        const descendants = d.descendant_stop_id;
        if (descendants.length > 0) {
          descendants.forEach((descendantId) => {
            this.ShowPaths2Descendants(d, descendantId);
          });
        }
        return 'white';
      });
    if (Object.keys(this.intervalsStatus).length === 0) {
      this.RadiateLifeCyclePath(d3.selectAll('.starting-point'), false, 0);
    }
  }

  /* Method to either stop all threads in Radiate lifecycle path animation because
      a stop has been clicked or allow them to continue
       Params: @stops is an array of stops (circles) to begin with
               @stopInvterval is a boolean value to determine if a thread needs to be terminated
               @intervalId is the id of the interval thread active
    */
  RadiateLifeCyclePath(stops, stopInterval, intervalId) {
    if (this.stopClicked) this.DisAllowRadiateLifeCycleThreads();
    else this.AllowRadiateLifeCycleThreads(stops, stopInterval, intervalId);
  }

  /* Method to highlight each arrow inside a path from one stop to its descendant stops
       @stop is the current parent stop
       @descId is the ID of the descendant stop relative to the parent stop
    */
  ShowPaths2Descendants(stop, descId) {
    let amountOfArrows;
    let index = 0;
    const dataSet = DataStore.getData();
    const descStop = LocalFindStopData(descId, dataSet);

    if (descStop.cy === stop.cy) {
      const currDistance = descStop.cx - stop.cx;
      amountOfArrows = GetArrowsNeeded4Path(currDistance);
    } else if (descStop.cx === stop.cx) {
      const currDistance = descStop.cy - stop.cy;
      amountOfArrows = GetArrowsNeeded4Path(currDistance);
    }

    const intervalID = setInterval(() => {
      if (this.stopClicked || amountOfArrows === index - 1) {
        this.RadiateLifeCyclePath(d3.select(`.stop-circle-${descId}`), true, intervalID);
      } else {
        const path = d3
          .select(`#stops-connection-path-${stop.stop_id}-${descId}-${index + 1}`)
          .transition()
          .duration(100)
          .attr('stroke-width', 3);
        path.transition().duration(100).attr('stroke-width', 1.3);
        index += 1;
      }
    }, 150);
    if (this.intervalsStatus[intervalID] === undefined) {
      this.intervalsStatus[intervalID] = true;
    }
  }

  /*  Method triggered when a stop is clicked on. Either a zoom in or out to the stop will occur
        Params: @stop is a single stop( circle ) on the visualization
                @color is the color of the stop in a phase
                @visGroup is the entire visualization containing all sectors and they're contents
                @circleRadiate is the pulsating circle present upon zooming into a stop
                @currentStop is the class name ( String ) of the stop ( circle ) clicked
    */
  /**
   *
   * @param {*} stop
   * @param {*} color
   * @param {*} circleRadiate
   * @param {*} currentStop
   */
  PhaseStopCircleClicked(stop, color, circleRadiate, currentStop) {
    if (this.stopClicked) {
      this.ResetView(currentStop);
    } else {
      SetView(stop, circleRadiate, color, currentStop);
      ZoomInPopupContainer();
    }
  }

  /**
   * Method to draw all stops ( circles ) in a particular phase, given an array of stops.
   * A stop consists of two circles, label and a line.
   * @param {Object} visGroup - the entire visualization containing all sectors and their contents
   * @param {string} sectorId - the id ( String ) for the current sector
   * @param {string} phaseId - the id ( String ) for the current phase
   * @param {Object} currentPhase - an object containing data related to the phase, including stops
   */
  CreatePhaseStops(sectorId, phaseId, currentPhase) {
    const dataSet = DataStore.getData();

    // radiateCircles
    d3.select(`.phase-${phaseId}`)
      .selectAll('.circle-radiate')
      .data(currentPhase.stops)
      .join('circle')
      .attr('class', (d) => `circle-radiate-${d.stop_id} stop-${d.stop_id} circle fadeable`)
      .attr('r', Constants.PHASE_STOP_CIRCLE_RADIUS)
      .attr('stroke', currentPhase.phase_styles.phase_color)
      .classed('stop', true)
      .attr('fill', currentPhase.phase_styles.phase_color)
      .attr('stroke-opacity', '.6')
      .attr('pointer-events', 'auto')
      .attr('visibility', 'hidden')
      .attr('cx', (d) => d.cx)
      .attr('cy', (d) => d.cy);
    // currentPhaseStopCircles
    d3.select(`.phase-${phaseId}`)
      .selectAll('.stop-circle')
      .data(currentPhase.stops)
      .join('circle')
      .attr(
        'class',
        (d) => `stop-circle-${d.stop_id} stop-${d.stop_id}  stop-circle circle fadeable`,
      )
      .classed('stop', true)
      .classed('starting-point', (d) => d.is_beginning_stop)
      .attr('r', Constants.PHASE_STOP_CIRCLE_RADIUS)
      .attr('stroke', currentPhase.phase_styles.phase_color)
      .attr('stroke-width', 1)
      .attr('fill', 'white')
      .attr('pointer-events', 'auto')
      .attr('cx', (d) => {
        const xPos = d.cx;
        d.phase_name = currentPhase.phase_name;
        d.cx = xPos;
        d.sector_id = sectorId;
        d.phase_id = phaseId;
        d.color = currentPhase.phase_styles.phase_color;
        return d.cx;
      })
      .attr('cy', (d) => {
        const sectorData = dataSet.sectors;
        const firstPhase = sectorData[sectorData.length - 1].phases[0];
        if (
          sectorData[sectorData.length - 1].sector_id === sectorId
          && firstPhase.phase_id === phaseId
          && firstPhase.stops[0].stop_id === d.stop_id
        ) {
          this.lastYPosition = d.cy;
        }
        return d.cy;
      })
      .on('click', (event, d) => {
        const circleRadiate = d3.select(`.circle-radiate-${d.stop_id}`);
        this.PhaseStopCircleClicked(
          d,
          currentPhase.phase_styles.phase_color,
          circleRadiate,
          `.stop-circle-${d.stop_id}`,
        );
        if (d.stop_activities.length > 0 && this.stopClicked) {
          this.DrawTree4Activities(d, `.phase-${phaseId}`);
        }
      })
      .on('mouseover', (event, d) => {
        if (!this.stopClicked) {
          d3.select(`.stop-circle-${d.stop_id}`)
            .transition()
            .duration(200)
            .attr('stroke', (d) => d.color)
            .attr('fill', 'white')
            .attr('stroke-width', 4);
        }
      })
      .on('mouseout', (event, d) => {
        if (!this.stopClicked) {
          d3.select(`.stop-circle-${d.stop_id}`)
            .transition()
            .duration(200)
            .attr('r', Constants.PHASE_STOP_CIRCLE_RADIUS)
            .attr('stroke-width', 1)
            .attr('fill', 'white')
            .attr('stroke', (d) => d.color);
        }
      });
    // phaseStopLines
    d3.select(`.phase-${phaseId}`)
      .selectAll('.stop-line')
      .data(currentPhase.stops)
      .join('line')
      .attr('class', (d) => `stop-${d.stop_id}`)
      .attr('class', (d) => `stop-${d.stop_id} fadeable`)
      .attr('stroke', currentPhase.phase_styles.phase_color)
      .classed('stop-line', true)
      .attr('stroke-width', 1)
      .classed('stop', true)
      .attr('visibility', (d) => (d.stop_styles.stop_has_line === 'yes' ? 'visible' : 'hidden'))
      .attr('x1', (d) => d.cx)
      .attr('y1', (d) => {
        const lineDirection = CheckLineDirection(d.stop_styles.stop_label_position);

        const phaseStopStartYPos = lineDirection === 2
          ? d.cy - Constants.PHASE_STOP_CIRCLE_RADIUS
          : d.cy + Constants.PHASE_STOP_CIRCLE_RADIUS;
        return phaseStopStartYPos;
      })
      .attr('x2', (d) => d.cx)
      .attr('y2', (d) => {
        let lineDirection;
        if (d.stop_styles.stop_has_line === 'yes') {
          lineDirection = CheckLineDirection(d.stop_styles.stop_label_position);
        }
        const phaseStopFinalYPos = lineDirection === 2
          ? d.cy - 25 - Constants.PHASE_STOP_CIRCLE_RADIUS
          : d.cy + 25 + Constants.PHASE_STOP_CIRCLE_RADIUS;
        return phaseStopFinalYPos;
      });
    // phaseLabels
    d3.select(`.phase-${phaseId}`)
      .selectAll('.stop-line-label')
      .data(currentPhase.stops)
      .join('text')
      .attr('class', (d) => `stop-${d.stop_id} fadeable`)
      .classed('stop-line-label', true)
      .attr('fill', '#616161')
      .attr('font-weight', 400)
      .attr('font-size', 11)
      .attr('font-family', "'Source Sans Pro', 'Verdana', Arial, sans-serif")
      .text((d) => d.stop_name)
      .attr('x', (d) => d.cx + 4)
      .attr('y', (d) => {
        const lineDirection = CheckLineDirection(d.stop_styles.stop_label_position);
        const phaseStopFinalYPos = lineDirection === 2
          ? d.cy - 25 - Constants.PHASE_STOP_CIRCLE_RADIUS + 7
          : d.cy + 25 + Constants.PHASE_STOP_CIRCLE_RADIUS - 4;
        return phaseStopFinalYPos;
      });
  }

  /**
   * Method to create groups for each phase in a sector
   * @param {string} sectorClassName - class name of sector
   * @param {number} sectorId - is the id ( integer ) of the sector
   * @param {Object} currentSector - is the sector currently being drawn
   * @param {number} yPos - the Y position value ( Integer ) for the current sector
   * @param {number} startingXPos - is the X position value ( Integer ) for the current sector
   * @param {Object} visGroup - is the group for the entire visualization
   */
  CreateSectorPhases(sectorClassName, sectorId, currentSector) {
    // phaseGroup
    d3.select(sectorClassName)
      .selectAll('phase')
      .data(currentSector.phases)
      .join('g')
      .attr('class', (d) => `phase-${d.phase_id}`)
      .classed('phase', (d) => {
        this.CreatePhaseStops(sectorId, d.phase_id, d);
        return true;
      });
  }

  AdjustNodesXPos2Account4Width(nodes, nodePadding) {
    const treeHeight = nodes[0].height;
    const nodesByHeight = {};
    for (let i = 0; i <= treeHeight; i++) {
      nodesByHeight[i] = [];
      const currNodes = nodes.filter((node) => node.height == i);
      currNodes.forEach((localNode) => {
        nodesByHeight[i].push(localNode.data.id);
      });
    }

    const treeHeightKeys = Object.keys(nodesByHeight).reverse();
    treeHeightKeys.forEach((key, i) => {
      const currTreeHeight = parseInt(key);
      if (currTreeHeight != treeHeight && currTreeHeight != treeHeight - 1) {
        const nodesAtCurrHeight = nodes.filter((localNode) => localNode.height == currTreeHeight);

        const nodeWithParentAtHeightMinus1 = nodesAtCurrHeight.filter(
          (localNode) => localNode.parent.height == currTreeHeight + 1,
        )[0];
        const { parent } = nodeWithParentAtHeightMinus1;
        const parentWidth = GetWidth4Label(this.svg, parent.data.name) + nodePadding;
        let nodeIdsNeededXPosAdjustment = [...nodesByHeight[currTreeHeight]];
        for (let j = currTreeHeight - 1; j >= 0; j--) {
          nodeIdsNeededXPosAdjustment = [...nodeIdsNeededXPosAdjustment, ...nodesByHeight[j]];
        }
        nodes.forEach((node) => {
          if (nodeIdsNeededXPosAdjustment.includes(node.data.id)) {
            node.y += parentWidth;
          }
        });
      }
    });
  }

  /**
   * Method to use d3.js Tree to draw activities as a hierarchy
   * @param {Object} stop - current stop that was selected
   * @param {Object} phase - current phase for stop that was selected
   */
  DrawTree4Activities(stop, phase) {
    const { render: renderSettings } = DataStore.getSettings();
    const hierarchy = CreateProcessHierarchy(stop);
    const activitiesGroup = d3
      .select(phase)
      .append('g')
      .attr('class', `tree-group stop-${stop.id}`);
    const treePaddingDown = 38;
    const rectHeight = 10;
    const nodePadding = 3;
    const finalEvenY = 0;
    const nodeTextPadding = 7.5;
    let sourceOrTargetNode = 0;
    const stopRadius = Constants.PHASE_STOP_CIRCLE_RADIUS;
    const treeStartingPoint = stop.cx + stopRadius + treePaddingDown - rectHeight;

    const tree = d3
      .cluster()
      .nodeSize([5, 50])
      // .size([availableWidth, availableHeight ])
      .separation((a, b) =>
        // const leftNodeNameWordCount = a.data.name.split(' ').length;
        // const rightNodeNameWordCount = b.data.name.split(' ').length;
        // if (a.parent === b.parent) {
        //   if (leftNodeNameWordCount > 3 || rightNodeNameWordCount > 3) return 30;
        //   return 20;
        // }
        // if (leftNodeNameWordCount > 3 || rightNodeNameWordCount > 3) return 31;
        // return 21;
        (a.parent == b.parent ? 8 : 4));

    const root = d3.hierarchy(hierarchy).count();
    const MAX_TREE_HEIGHT = root.height;
    const treeData = tree(root);
    d3.scaleOrdinal(d3.schemeCategory10).domain(d3.extent(root.descendants(), (n) => n.depth));
    const nodes = treeData.descendants();
    if (root.height > 1) this.AdjustNodesXPos2Account4Width(nodes, nodePadding);
    const links = treeData.links();
    const nodesWithMaxTreeHeightMinus1 = nodes.filter((node) => node.height == MAX_TREE_HEIGHT - 1);

    const startNode2FirstDepthDistance = nodesWithMaxTreeHeightMinus1[0].y;
    AddSharedChildrenLinks(links, nodes);
    const FindFurthestYPos = (localNodes) => {
      let yPos;
      localNodes.forEach((node, i) => {
        if (i === 0) yPos = node.y;
        else if (node.y > yPos) {
          yPos = node.y;
        }
      });
      return yPos;
    };
    const lastYPos = FindFurthestYPos(nodes) + 60;

    const FindFurthestXPos = (localNodes) => {
      let xPos;
      localNodes.forEach((node, i) => {
        if (i === 0) xPos = node.x;
        else if (node.x > xPos) {
          xPos = node.x;
        }
      });
      return xPos;
    };
    const lastXPos = FindFurthestXPos(nodes) + 60;

    const GetNodeXPos = (d, i) => {
      const nodeWidth = GetWidth4Label(this.svg, d.data.name) + nodePadding;

      const xPosi = d.x;
      const returnVal = xPosi - nodeWidth / 2;
      return returnVal;
    };
    const xMargin = GetNodeXPos(nodes[0], 1) - stop.cx + stopRadius - 2.8;
    // const padding = 1;
    const verticalLink = d3
      .linkHorizontal() // linkVertical()
      .x((d) => {
        // Skylar refactor -> completed
        const params = {
          d,
          startNode2FirstDepthDistance,
          sourceOrTargetNode,
          nodePadding,
          th: this,
          treeStartingPoint,
          nodeTextPadding,
        };
        const { sourceOrTargetNodeUpdate, ret } = VerticalLink_x(params);
        sourceOrTargetNode = sourceOrTargetNodeUpdate;
        return ret;
      })
      .y((d) => {
        // Skylar refactor -> completed
        const params = { d, stop };
        const returnVal = VerticalLink_y(params);
        d.newX = returnVal;
        return returnVal; // return returnVal;
      });
    let evenX = 0;
    let evenY = 0;
    let prevX;
    let prevY;

    const verticalLinkStart = d3
      .linkVertical()
      .x((d) => {
        // Skylar refactor -> completed
        const params = {
          evenY,
          stop,
          d,
          treePaddingDown,
          prevY,
        };
        const ret = VerticalLinkStart_x(params);
        evenY = ret.evenY;
        prevY = ret.prevY;
        return prevY;
      })
      .y((d) => {
        // Skylar refactor -> completed
        const params = {
          evenX,
          prevX,
          d,
          xMargin,
        };
        const ret = VerticalLinkStart_y(params);
        evenX = ret.evenX;
        prevX = ret.prevX;
        return prevX;
      });
    const FindLargestWidthOfLabels = (localNodes) => {
      let currBiggestWidth = 0;
      localNodes.forEach((node) => {
        const hasChildren = node.data.children && node.data.children.length > 0;
        const hasSharedChildren = node.data.shared_children && node.data.shared_children.length > 0;
        const isFinalLeaf = !(hasChildren || hasSharedChildren);
        if (isFinalLeaf) {
          const currNodeAsText = activitiesGroup
            .append('text')
            .text(node.data.name)
            .attr('font-size', 6);
          const sizeOfNode = currNodeAsText.node().getBBox().width;
          if (sizeOfNode > currBiggestWidth) currBiggestWidth = sizeOfNode;
          currNodeAsText.remove();
        }
      });
      return currBiggestWidth;
    };
    const InsertEndingLeaf = (localNodes, localLinks, localLastYPos) => {
      const leafNodes = [];
      const biggestWidthSize = FindLargestWidthOfLabels(localNodes);
      localNodes.forEach((node) => {
        const hasChildren = node.data.children && node.data.children.length > 0;
        const hasSharedChildren = node.data.shared_children && node.data.shared_children.length > 0;
        const isFinalLeaf = !(hasChildren || hasSharedChildren);
        if (isFinalLeaf) {
          const { values } = node.data;
          leafNodes.push({
            x: node.x,
            y: node.y,
            data: { values },
          });
        }
      });
      leafNodes.forEach((node) => {
        localLinks.push({
          source: {
            x: node.x,
            y: node.y,
            data: {
              name: node.data.values.act_name,
              values: node.data.values,
            },
          },
          target: {
            x: stop.cx + xMargin,
            y: localLastYPos + biggestWidthSize,
            data: { name: 'End' },
          },
        });
      });
      localNodes.push({
        x: stop.cx + xMargin,
        y: localLastYPos + biggestWidthSize,
        data: { values: 'End', name: 'End' },
      });
    };

    InsertEndingLeaf(nodes, links, lastYPos);
    const treeLinesStrokeWidth = 1.5;
    const firstDelay = 0;
    const firstDuration = 300;
    const stop2TreeLine = activitiesGroup
      .append('line')
      .classed('activity-line', true)
      .attr('stroke-width', treeLinesStrokeWidth)
      .attr('stroke', stop.color)
      .attr('x1', stop.cx + stopRadius)
      .attr('x2', stop.cx + stopRadius)
      .attr('y1', stop.cy)
      .attr('y2', stop.cy);

    stop2TreeLine
      .transition()
      .delay(firstDelay)
      .duration(firstDuration)
      .attr('x2', treeStartingPoint);

    stop2TreeLine.lower();
    let delayCountLines = 2;
    let delayTimeLines = delayCountLines * firstDuration;

    const delayCountRectangles = 2;
    const delayTimeRectangles = delayCountRectangles * firstDuration;
    const HighLightTooltip = (d) => {
      d3.select(`.tooltip-rect-${d.data.id}`).transition().duration(1).attr('stroke-width', 1.1);
    };
    const UnHighLightTooltip = (d) => {
      d3.select(`.tooltip-rect-${d.data.id}`).transition().duration(1).attr('stroke-width', 0.2);
    };

    const yMargin = treePaddingDown + stop.cy + 5.5;

    const arrows = this.svg
      .append('defs')
      .append('marker')
      .attr('id', 'act-arrow')
      .attr('class', 'activity-line')
      .attr('viewBox', '0 -10 15 15')
      .attr('refX', 0)
      .attr('refY', 0)
      .attr('markerWidth', 10)
      .attr('markerHeight', 10)
      .attr('markerUnits', 'userSpaceOnUse')
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0, -5 L10, 0 L0,5Z')
      .style('fill', stop.color);

    const lines = activitiesGroup
      .selectAll('path')
      .data(links)
      .join('path')
      .classed('activity-line tree-link', true)
      .attr('d', (d) => {
        d.source.xMargin = xMargin;
        d.target.xMargin = xMargin;
        return verticalLinkStart(d);
      });
    lines
      .transition()
      .delay(() => {
        const currentDelay = delayTimeLines;
        delayCountLines += 1;
        delayTimeLines = delayCountLines * firstDuration;
        return currentDelay;
      })
      .duration(firstDuration)
      .attr('fill', 'none')
      .attr('stroke-width', treeLinesStrokeWidth)
      .attr('stroke', stop.color)
      .attr('stroke-dasharray', (d) => {
        try {
          const currTargetData = d.target.data;
          const currSourceData = d.source.data;
          if (
            (currTargetData
              && currTargetData.values
              && currTargetData.values.act_path_type === 'Optional')
            || (currSourceData
              && currSourceData.values
              && currSourceData.values.act_path_type === 'Optional')
          ) {
            return '10 1.2';
          }
          return null;
        } catch (error) {
          return null;
        }
      })
      .attr('d', verticalLink)
      .attr('marker-end', 'url(#act-arrow');

    lines
      .on('mouseover', (event, d) => ShowToolTip4Event(d, phase, xMargin, yMargin, lastYPos))
      .on('mouseout', () => d3.select('.tool-tip').remove());

    const treeStartEndRadius = 9;
    const startingCircle = activitiesGroup
      .datum(nodes[0])
      .append('circle')
      .attr('id', 'circle-start-tree')
      .attr('class', (d, i) => `activity-line tree-node tree-node-${i} tooltip-rect-${d.data.id}`)
      .attr('r', treeStartEndRadius)
      .attr('fill', (d) => {
        const color = d3.color(stop.color);
        const darkerColor = color.darker(2);
        return darkerColor;
      })
      .attr('cx', (d, i) => {
        const position = d.y + yMargin - (i === 0 ? 5 : 0);
        d.newNodeY = position;
        return d.y + treeStartingPoint + treeStartEndRadius; // return position;
      })
      .attr('cy', (d, i) => {
        const returnVal = GetNodeXPos(d, i);
        const position = returnVal - xMargin;
        d.newNodeX = position;
        return d.x + stop.cy; // return position;
      });
    let endNodeDist;
    let startNodeFinalXPos;
    const rectangles = activitiesGroup
      .selectAll('rect')
      .data(nodes)
      .join('rect')
      .attr('class', (d, i) => `activity-line tree-node tree-node-${i} tooltip-rect-${d.data.id}`)
      .attr('width', 0)
      .attr('height', 0)
      .attr('rx', 5)
      .attr('x', (d, i) => {
        // Skylar refactor -> completed
        const params = {
          d,
          startNode2FirstDepthDistance,
          yMargin,
          treeStartingPoint,
          startNodeFinalXPos,
          i,
        };
        const ret = Rectangles_x(params);
        d.newNodeY = ret.position;
        startNodeFinalXPos = ret.startNodeFinalXPos;
        d.screenXPos = ret.returnVal;
        return ret.returnVal; // return position;
      })
      .attr('y', (d, i) => {
        // Skylar refactor -> completed
        const params = {
          d,
          xMargin,
          stop,
          rectHeight,
          returnVal: GetNodeXPos(d, i),
        };
        const ret = Rectangles_y(params);
        d.newNodeX = ret.position;
        d.screenYPos = ret.ret;
        return ret.ret; // return position;
      });
    const params = {
      firstDuration,
      nodePadding,
      rectHeight,
      delayTimeRectangles,
      delayCountRectangles,
      stopColor: stop.color,
    };
    DrawTreeRectangles(this.svg, rectangles, params);

    const labels = activitiesGroup
      .selectAll('text.act-label')
      .data(nodes)
      .join('text')
      .text((d) => d.data.name)
      .attr('font-size', 6)
      .attr('class', 'act-label text-font-family activity-line')
      .attr('x', (d, i) => {
        // Skylar Refactor -> completed
        const params = {
          d,
          i,
          startNode2FirstDepthDistance,
          yMargin,
          th: this,
          treeStartingPoint,
          nodeTextPadding,
        };
        const ret = Labels_x(params);
        d.newLabelY = ret.finalY;
        d.screenXPos = ret.ret;
        return ret.ret; // return finalY;
      })
      .attr('y', (d, i) => {
        // Skylar refactor -> completed
        const params = {
          returnVal: GetNodeXPos(d, i),
          i,
          d,
          nodes,
          xMargin,
          stop,
          rectHeight,
        };
        const ret = Labels_y(params);
        d.newLabelX = ret.finalX;
        d.screenYPos = ret.ret;
        return ret.ret; // return d.y + yMargin;
      })
      .attr('visibility', 'hidden');
    const endingCircle = activitiesGroup
      .datum(nodes[rectangles.size() - 1])
      .append('circle')
      .attr('id', 'circle-start-tree')
      .attr('class', (d, i) => `activity-line tree-node tree-node-${i} tooltip-rect-${d.data.id}`)
      .attr('r', treeStartEndRadius)
      .attr('fill', (d) => {
        const color = d3.color(stop.color);
        const darkerColor = color.darker(2);
        return darkerColor;
      })
      .attr('cx', (d, i) => {
        const addDistanceIfPointIsEndNode = d.data.name === 'End' ? startNode2FirstDepthDistance : 0;
        const finalY = yMargin + d.y + GetHeight4Label(this.svg, d.data.name) - 0.4 - (i === 0 ? 5 : 0);
        d.newLabelY = finalY;
        const returnVal = d.y
          + addDistanceIfPointIsEndNode
          + treeStartingPoint
          - 5.5
          + nodeTextPadding
          - (i == rectangles.size() - 1 ? 1 : 0)
          + treeStartEndRadius;
        return returnVal; // return finalY;

        // const position = d.y + yMargin - (i === 0 ? 5 : 0);
        // d.newNodeY = position;
        // return d.y + treeStartingPoint + treeStartEndRadius;// return position;
      })
      .attr('cy', (d, i) => {
        const returnVal = GetNodeXPos(d, i);
        const position = returnVal - xMargin;
        d.newNodeX = position;
        return d.x + stop.cy; // return position;
      });
    DrawLabelsInNodes(labels, delayTimeRectangles).then(() => {
      setTimeout(() => {
        rectangles.on('click', (event, d) => {
          //  RotateActivityTree(rectHeight, lines, rectangles, labels);
          RenderExtension(renderSettings.sub_process.extension, {
            stop,
            process: d.data.values,
            position: { treeNodeXPos: d.screenXPos, treeNodeYPos: d.screenYPos },
            attr: renderSettings.sub_process.data,
          });
          UpdateActivityInfoInPanel(d.data.values);
        });
        labels.on('click', (event, d) => {
          /**
           * If a item is clicked in the process, we should change the visibility
           * of all radiating rectangles to hidden AND make sure they are not radiating
           */
          this.MarkRectanglesHiddenStopRadiate();
          const possibleRadiatingRect = document.querySelector(`#radiating-rect-${d.data.id}`);
          if (!possibleRadiatingRect) {
            /**
             * If no div with this id, then we have to add the new rectangle
             * to be radiated
             */
            const color = d3.color(stop.color);
            const darkerColor = color.darker(2);
            const nonRadiatingRect = document.querySelector(`.tooltip-rect-${d.data.id}`);
            const nonRadiatingRectWidth = parseInt(nonRadiatingRect.getAttribute('width'));
            const xPos = nonRadiatingRect.getAttribute('x');
            const yPos = nonRadiatingRect.getAttribute('y');
            const radiatingRect = activitiesGroup
              .insert('rect', `.tooltip-rect-${d.data.id}`) // insert new rect BEFORE .tooltip-rect-${d.data.id}
              .attr('class', 'radiating-rect activity-line')
              .attr('id', `radiating-rect-${d.data.id}`)
              .attr('x', xPos)
              .attr('y', yPos)
              .attr('width', nonRadiatingRectWidth)
              .attr('height', 10)
              .attr('rx', 5)
              .attr('stroke', darkerColor)
              .attr('visibility', 'hidden')
              .attr('stroke-width', 0);
            GeneralRadiate({
              d3Obj: radiatingRect,
              strokeWidthInc: 8,
              opacity: 0.5,
            });
          } else {
            /**
             * If there is a div with the id, we can just radiate that
             */
            const d3RadiatingRect = d3.select(possibleRadiatingRect);
            GeneralRadiate({
              d3Obj: d3RadiatingRect,
              strokeWidthInc: 8,
              opacity: 0.5,
            });
          }
          RenderExtension(renderSettings.sub_process.extension, {
            stop,
            process: d.data.values,
            position: { treeNodeXPos: d.screenXPos, treeNodeYPos: d.screenYPos },
            attr: renderSettings.sub_process.data,
          });
          UpdateActivityInfoInPanel(d.data.values);
        });
      }, delayTimeRectangles + 1000);
    });
    /**
     * This sets an interval to check the rectangles to make sure
     * they're expanded before adding event listeners
     */
    if (nodes.length >= 3) {
      setTimeout(() => {
        const intervalID = setInterval(() => {
          let all_expanded = true;
          document
            .querySelectorAll('rect[class^="activity-line tree-node tree-node-"]')
            .forEach((rect) => {
              if (rect.getAttribute('width') === '0') {
                all_expanded = false;
              }
            });
          if (all_expanded) {
            clearInterval(intervalID);
            rectangles
              .on('mouseover', (event, d) => HighLightTooltip(d))
              .on('mouseout', (event, d) => UnHighLightTooltip(d));
            labels
              .on('mouseover', (event, d) => HighLightTooltip(d))
              .on('mouseout', (event, d) => UnHighLightTooltip(d));
          }
        }, 2000);
      }, delayCountRectangles + 1000);
    }
    labels.raise();
    arrows.raise();
  }

  /**
   * The purpose of this method is to mark all rectangles
   * for radiating as hidden and then stop their radiation
   */
  MarkRectanglesHiddenStopRadiate() {
    const allRadiatingRect = document.querySelectorAll('.radiating-rect');
    allRadiatingRect.forEach((radiatingRect) => {
      const d3RadiatingRect = d3.select(radiatingRect);
      if (d3RadiatingRect.attr('data-intervalID')) {
        GeneralRadiate({
          d3Obj: d3RadiatingRect,
          strokeWidthInc: 8,
          opacity: 0.5,
        });
      }
      d3RadiatingRect.attr('visibility', 'hidden');
    });
  }

  /**
   * Method to draw the entire visualization.
   * Grouping sectors, phases and stops into respective areas
   */
  DrawMetroStopGraph() {
    CreateControls(this);
    let dataSet = DataStore.getData();
    this.CreateSvg();
    const textWidths = GetWidthsOfSectorLabels(dataSet.sectors, this.svg);
    // let setXPos;
    const startingXPos = 100;
    const startingYPos = 80;
    const maxWidth = d3.max(textWidths);
    const setXPos = startingXPos + maxWidth + 20;
    dataSet = AssignCoordinates(dataSet, setXPos, startingYPos);
    const visGroup = this.svg.append('g').attr('class', 'viz');
    DataStore.setData(dataSet);

    visGroup
      .selectAll('g.sector')
      .data(dataSet.sectors)
      .join((enter) => {
        d3.selectAll('.temp-text').remove();
        DrawPaths(visGroup);
        enter
          .append('g')
          .attr('class', (d) => ` sector sector-${d.sector_id}`)
          .append('text')
          .attr('class', 'fadeable')
          .attr('font-size', '14px')
          .attr('font-weight', 400)
          .attr('fill', '#b3b3b3')
          .classed('text-font-family', true)
          .attr('y', (d, i) => (i === 0 ? i * (Constants.SVG_HEIGHT / dataSet.sectors.length - 50) + startingYPos : 380))
          .attr('x', (d, i) => startingXPos + (maxWidth - textWidths[i]))
          .text((d) => {
            this.CreateSectorPhases(`.sector-${d.sector_id}`, d.sector_id, d);
            return d.sector_name;
          });
      });
    const vizBBox = d3.select('.viz').node().getBBox();
    this.svg
      .transition()
      .duration(1000)
      .call(
        this.zoom.transform,
        d3.zoomIdentity.translate(0, 0).scale((Constants.SVG_WIDTH - 100) / vizBBox.width),
      );
    CreateLegend(visGroup, this.lastYPosition, dataSet.sectors);
    this.RadiateLifeCyclePath(d3.selectAll('.starting-point'), false, 0);
  }
}

const UiController = new UiControllerClass();
vis = UiController;
export default UiController;
