import { select, selectAll } from 'd3-selection';
import { transition } from 'd3-transition';
import { zoomTransform, zoomIdentity } from 'd3-zoom';
import { ClosePanel, OpenPanel } from './Panel/Panel.js';
import Constants from '../../services/Constants.js';
import { ResetExtensions } from '../../controllers/extensions/index.js';

const d3 = {
  select,
  selectAll,
  transition,
  zoomTransform,
  zoomIdentity,
};
let self;

/* Method to zoom out and restore the visualization to its initial scale factor
   Params: @visGroup is the group for the entire visualization
*/
function ZoomOutOnPhaseStop() {
  self.stopClicked = false;
  d3.select('.circle-radiate').attr('visibility', 'hidden');

  /**
   * This selector selects all radiating circles, then checks if they
   * have the intervalID attribute set. If so, it passes the d3 object
   * to the general radiate function, which removes the radiation effect
   * and interval
   */
  document.querySelectorAll('circle[class^="circle-radiate-"]').forEach((stopElem) => {
    const d3StopElem = d3.select(stopElem);
    if (d3StopElem.attr('data-intervalID')) {
      GeneralRadiate({
        d3Obj: d3StopElem,
        strokeWidthInc: 8.5,
        opacity: 0.6,
      });
    }
  });
  d3.selectAll('.activity-line').remove();
  const vizBBox = d3.select('.viz').node().getBBox();
  self.svg
    .transition()
    .duration(1000)
    .call(
      self.zoom.transform,
      d3.zoomIdentity.translate(0, 0).scale((Constants.SVG_WIDTH - 100) / vizBBox.width),
    );
  ResetExtensions();
  ClosePanel();
}
/**
 * Method to create animation of  a circle radiating on the selected stop ( circle )
 * @param {*} circleRadiate - the animated circle related to the stop selected
 */
function RadiateCircle(circleRadiate) {
  if (self.stopClicked) circleRadiate.attr('visibility', 'visible');

  let flag = true;
  circleRadiate.transition().duration(2).attr('stroke-opacity', '.6').attr('fill', 'orange');
  const intervalID = setInterval(() => {
    if (!self.stopClicked) {
      clearInterval(intervalID);
      circleRadiate.attr('stroke-opacity', 0);
      d3.selectAll('.activity-line').remove();
    }
    const strokeWidth = flag
      ? Constants.RADIATE_CIRCLE_RADIUS
      : Constants.RADIATE_CIRCLE_RADIUS + 8.6;
    circleRadiate.transition().duration(500).attr('stroke-width', strokeWidth);
    flag = !flag;
  }, 500);
}

/**
 * Method to increase/decrease the stroke width of a d3 object to create a
 * radiation effect. When the object is first passed to the method, a data-intervalID attribute is
 * set to the intervalID. When the object is passed a second time to the method,
 * the object is checked for this attribute then the interval is turned off and
 * the attribute is removed.
 * @param {*} input - object with d3Obj, strokeWidthInc, and opacity fields.
 */
export function GeneralRadiate(input) {
  const { d3Obj, strokeWidthInc, opacity } = input;
  d3Obj.attr('visibility', 'visible');
  d3Obj.attr('stroke-opacity', opacity);
  let flag = true;
  /**
   * If we pass the function and there is a intervalID attribute
   * then we know we set it previously, so we clear the interval
   */
  if (d3Obj.attr('data-intervalID')) {
    clearInterval(d3Obj.attr('data-intervalID'));
    d3Obj.attr('stroke-width', 0);
    d3Obj.attr('visibility', 'hidden');
    d3Obj.attr('data-intervalID', null);
  } else {
    /**
     * Otherwise we set the interval
     */
    const intervalID = setInterval(() => {
      if (!d3Obj.attr('data-intervalID')) {
        d3Obj.attr('data-intervalID', intervalID);
      }
      let strokeWidth = 0;
      /**
       * Check if the d3 object is a circle, if so
       * use constants
       */
      if (d3Obj.node().tagName === 'circle') {
        strokeWidth = flag
          ? Constants.RADIATE_CIRCLE_RADIUS
          : Constants.RADIATE_CIRCLE_RADIUS + strokeWidthInc;
      } else if (d3Obj.node().tagName === 'rect') {
        /**
         * If d3 object instead is a rectangle, just use stroke
         * width
         */
        strokeWidth = flag ? 0 : strokeWidthInc;
      } else {
        /**
         * General radiate for non circle/rectangle objects
         */
        strokeWidth = flag ? 0 : strokeWidthInc;
      }
      d3Obj.transition().duration(500).attr('stroke-width', strokeWidth);
      flag = !flag;
    }, 500);
  }
}
/* Method to zoom into the visualization on a specific stop ( circle )
   Params: @stop is the stop selected
           @visGroup is the group for the entire visualization
           @circleRadiate is the animated circle related to the stop selected
*/
function ZoomInOnPhaseStop(stop, circleRadiate) {
  const phaseStopXPos = stop.cx;
  const phaseStopYPos = stop.cy;
  const width = Constants.SVG_WIDTH;
  const height = window.innerHeight;
  const zoomFactor = 0.8;
  const raiseGraphScalarUp = (421 / 1000) * height;
  const moveGraph2Left = 360;
  const transition2XPos = phaseStopXPos * -zoomFactor + width / 2 - moveGraph2Left;
  const transition2YPos = phaseStopYPos * -zoomFactor + height / 2 - raiseGraphScalarUp;
  self.svg
    .transition()
    .duration(1000)
    .call(
      self.zoom.transform,
      d3.zoomIdentity.translate(transition2XPos, transition2YPos).scale(zoomFactor),
    );
  self.stopClicked = true;
  OpenPanel(stop, self.ResetView);
  GeneralRadiate({
    d3Obj: circleRadiate,
    strokeWidthInc: 8.5,
    opacity: 0.6,
  });
}

/* Method to increase opacity for all elements except circles for stops */
function FadeGraphExceptCurrentStop(currentStop) {
  d3.selectAll('.fadeable').attr('opacity', 0.08);
  d3.selectAll(`.stop-${currentStop.stop_id}`).attr('opacity', 1);
}
/* Method to decrease opacity for all elements except circles for stops */
function UnFadeGraph() {
  d3.selectAll('.fadeable').attr('opacity', 1);
}
/* Method to create controlls on UI
   Params: @documentBody is the selection object of the body element in html docuemnt
           @objectInstance is the UiService instance being used for the app
*/
export function CreateControls(objectInstance) {
  self = objectInstance;
}
/* Method to zoom out a specific stop in the visual
      Params: @visGroup is the svg grouping of the entire visualization
              @currentStop is the current stop to zoomed into
  */
export function CloseZoomFeature(currentStop) {
  UnFadeGraph();
  ZoomOutOnPhaseStop();
  d3.select(currentStop).attr('fill', 'white');
}
/* Method to zoom into a specific stop in the visual and fade out other areas of graph
      Params: @stop is the current stop to zoom into
              @visGroup is the svg grouping of the entire visualization
              @circleRadiate is the hidden circle on the stop that creates the radiating animation
              @color is the phase/stop color
              @currentStop is the class name (String) of the current stop
  */
export function OpenZoomFeature(stop, circleRadiate, color, currentStop) {
  ZoomInOnPhaseStop(stop, circleRadiate);
  d3.select(currentStop).attr('fill', color);
  FadeGraphExceptCurrentStop(stop);
}
