import { select, selectAll } from 'd3-selection';
import { transition } from 'd3-transition';
import DataStore from '../../../services/DataStore.js';

const d3 = { select, selectAll, transition };

/* Method to append a list item to the ul parent element
   Params: @item is the current item being processed
           @unorderedList is a node element of type ul
           @transition is the delay for a duration of time a transition should take before rendering
*/
function AppendItem(item, unorderedList, transition) {
  const listItem = unorderedList.append('li');
  const currentItem = listItem.append('p').attr('class', 'panel-description act-data');
  currentItem.transition().duration(1);
  currentItem
    .transition()
    .duration(1)
    .delay(transition)
    .attr('class', 'panel-description act-data')
    .text(item);
}
/* Method to traverse a list of items to later be added to a ul element
   Params: @items is  a list of items
           @unorderedList is a node element of type ul
           @transition is the delay for a duration of time a transition should take before rendering
*/
function AppendMultipleListItems(items, unorderedList, transition) {
  items.forEach((item) => {
    AppendItem(item, unorderedList, transition);
  });
}
/* Method to append Activity information to panel
    Params: @act is the current activity selected
            @panelContainer is the div for the entire panel
            @transition is the delay value ( Integer ) to show the text
*/
function AppendActivity2Panel(act, panelContainer, transition, { startingEvent, endingEvent }) {
  d3.selectAll('.act-data').remove();

  const pnlContainer = document.getElementById('panel-primary-container-id');
  pnlContainer.innerHTML += `<p class="panel-subtitle act-data">${act.act_name}</p>
                             <p class="panel-description act-data">${act.act_description}</p>`;

  const settingsData = DataStore.getSettings();
  if (settingsData.general.settings_panel.show_start_end_event === 'true') {
    pnlContainer.innerHTML += `<p class="panel-subtitle act-data">Start Event</p>
                             <p class="panel-description act-data">${act.act_starting_event}</p>
                             <p class="panel-subtitle act-data">End Event</p>
                             <p class="panel-description act-data">${act.act_ending_event}</p>`;
  }

  const attrContainer = panelContainer.append('div').attr('id', 'attr-container');
  const unorderedList = attrContainer.append('ul').attr('class', 'unordered-list-items act-data');
  /**
   * This for loop cycles through entries in the attribute object
   * which is created by parsing through columns and adding any
   * that are not in FIELDS
   */
  const l3_key = Object.keys(DataStore.getSettings().process_attr);
  for (const attr in act.attributes) {
    if (attr == l3_key) {
      continue;
    }
    const tempAttrItem = unorderedList.append('li').attr('class', 'list-items-left activity-attr');
    const tempAttrUnorderedList = tempAttrItem
      .append('ul')
      .attr('class', 'panel-description act-data unordered-list-items');
    const tempAttrListItem = tempAttrUnorderedList.append('li');
    const tempAttrTitle = tempAttrListItem.append('p');
    tempAttrTitle
      .transition()
      .duration(1)
      .delay(transition)
      .attr('class', 'subtitle act-data')
      .text(attr);
    if (Array.isArray(act.attributes[attr])) {
      AppendMultipleListItems(act.attributes[attr], tempAttrUnorderedList, transition);
    } else {
      AppendItem(act.attributes[attr], tempAttrUnorderedList, transition);
    }
  }

  // whiteSpace
  panelContainer
    .append('p')
    .attr('class', 'panel-description act-data')
    .style('margin-bottom', '300px');
}
/* Method to append information related to current stop selected on panel
      Params: @stop current stop selected
              @panel is the div for the panel
  */
function AppendStopDetails2Panel(stop, panel, resetView) {
  const transition = 600;
  const panelHeader = panel
    .append('div')
    .attr('class', 'panel-primary-header')
    .classed('panel-temp-details', true);
  const unorderedList = panelHeader.append('ul').attr('id', 'panel-phase-name');
  const listItem = unorderedList.append('li').attr('id', 'panel-close-bttn');

  const phaseTitle = listItem
    .append('span')
    .text(stop.phase_name)
    .classed('panel-temp-details', true);
  listItem.append('span').text('x').classed('close', true).attr('id', 'close-btn');
  const closeButton = document.getElementById('close-btn');
  closeButton.addEventListener('click', () => {
    resetView(`.stop-circle-${stop.stop_id}`);
  });

  phaseTitle.transition().duration(1).delay(transition);
  phaseTitle
    .transition()
    .duration(1)
    .delay(transition)
    .style('border-bottom', `5px solid ${stop.color}`);

  const panelContainer = panel
    .append('div')
    .attr('id', 'panel-primary-container-id')
    .attr('class', 'panel-primary-container')
    .classed('panel-temp-details', true);

  const stopName = panelContainer
    .append('p')
    .text(stop.stop_name)
    .attr('class', 'panel-info-title');

  const description = panelContainer
    .append('p')
    .text(stop.stop_definition)
    .attr('class', 'panel-description');

  if (stop.stop_borrower_action !== undefined) {
    // *********************************REFACTOR***********************************
    const subTitle = panelContainer.append('p').text('Borrower Action');
    subTitle.transition().duration(1).delay(transition).attr('class', 'panel-subtitle');
    const stopBorrowerAction = panelContainer.append('p').text(stop.stop_borrower_action);
    stopBorrowerAction.transition().duration(1).delay(transition).attr('class', 'stop-description');
  }
  if (stop.stop_activities.length > 0) {
    const stopActivity = stop.stop_activities[0];
    const startEnd = {
      startingEvent: DataStore.getEvent(stopActivity.act_starting_event),
      endingEvent: DataStore.getEvent(stopActivity.act_ending_event),
    };
    AppendActivity2Panel(stopActivity, panelContainer, transition, startEnd);
  }
}

/* Method to create panel element using html */
export function CreatePanel() {
  const panel = d3
    .select('.vis-body')
    .append('div')
    .attr('class', 'panel-info')
    .attr('id', 'entire-panel');
  panel.node().style.width = 0;
  panel.node().style.height = 0;
}
/* Method to open the panel from the right and append stop info
         Params: @stop the current stop that was clicked on, which holds stop data
  */
export function OpenPanel(stop, ResetView) {
  d3.select('.controls').transition().duration(550).style('left', '70%');
  const panel = d3.select('.panel-info');
  panel.transition().duration(1200).style('width', '50%').style('height', '100%');
  AppendStopDetails2Panel(stop, panel, ResetView);
}
/* method to close the panel */
export function ClosePanel() {
  const panel = d3.select('.panel-info');
  panel.transition().duration(950).style('width', '0%').style('height', '0%');
  d3.selectAll('.panel-temp-details').remove();
  d3.select('.controls').transition().duration(1000).delay(400)
    .style('left', '95%');
}
/* Method to update information in panel for an activity
     Params: @stop is the current stop
  */
export function UpdateActivityInfoInPanel(activity) {
  AppendActivity2Panel(activity, d3.select('.panel-primary-container'), 600, {
    startingEvent: DataStore.getEvent(activity.act_starting_event),
    endingEvent: DataStore.getEvent(activity.act_ending_event),
  });
}
