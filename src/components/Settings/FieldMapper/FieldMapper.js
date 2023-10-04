import { select, selectAll } from 'd3-selection';
import AppendButton from '../../Button/Button.js';
import * as card from '../../Card/Card.js';

const d3 = { select, selectAll };
const noAssignmentString = 'No Assignment';

let draggableField;
let draggableFieldDimensions = [];
const noAssignmentId = `field-value-${noAssignmentString.replace(' ', '-')}`;

// function SaveMappedFields(requiredFields, metaDataFields) {
//   const fieldsMapped = document.getElementsByClassName('metrostop-data-model');
//   fieldsMapped.map((field) => {
//     if (field.getAttribute('value') !== 'No-Assignment') {
//       const val = field.getAttribute('value');
//       const key = requiredFields[val];
//       if (key === undefined) {
//         requiredFields[val] = { foundField: true };
//       }
//       if (field.childElementCount > 1) {
//         const datasetField = field
//           .getElementsByClassName('field-mapper-assign-area')[0].getAttribute('value');
//         if (datasetField !== undefined) {
//           requiredFields[val].value = datasetField;
//         }
//       }
//     }
//     return null;
//   });
//   //   for (const field of fieldsMapped) {

//   //   }
//   const fieldsNotAssigned = document.getElementsByClassName('unknown-field');
//   if (fieldsNotAssigned.length > 0) {
//     fieldsNotAssigned.map((fieldNotMapped) => {
//       metaDataFields.push(fieldNotMapped.getAttribute('value'));
//       return null;
//     });
//   }
// // let fieldsNotMapped = document.getElementsByClassName("missing-fields-li").
// //   getElementsByClassName("fiel-mapper-assign-area");
// }

function AppendSaveButton(fieldAssignmentContainer, fields) {
  const saveBttnId = 'field-assignment-save-bttn';
  const bttnContainer = fieldAssignmentContainer
    .append('div')
    .attr('id', 'field-assignment-save-bttn-container');
  const saveBtn = AppendButton(saveBttnId, bttnContainer, 'Save');
  saveBtn
    .on('mouseover', () => d3.select(`#${saveBttnId}`).style('color', 'white'))
    .on('mouseout', () => d3.select(`#${saveBttnId}`).style('color', '#05314D'));
}

/* Method to append all Metro stop fields to list
   Params: @fieldAssignmentContainer is the div container that will hold the list using flex box
           @field is the text field name from data stop model
           @is1stOrLast is a boolean to determine if a field is the 1st in the list or last
           @firstOrLast is an integer value to determine the index of the field in the array.
*/
function AppendDataField2Container(fieldAssignmentContainer, field, is1stOrLast, firstOrLast) {
  //
  const fieldId = field.replace(' ', '-');
  const currentField = fieldAssignmentContainer
    .append('div')
    .classed('data-field metrostop-data-model', true)
    .attr('id', `field-value-${fieldId}`)
    .attr('value', `${fieldId}`);
  const currentFieldParagraph = currentField
    .append('p')
    .classed('data-field-text text-font-family', true)
    .text(`${field}`);
  if (is1stOrLast) {
    if (firstOrLast === 0) currentFieldParagraph.style('border-top-width', '1px');
    else currentFieldParagraph.style('border-bottom-width', '1px');
  }

  currentField
    .on('dragover', (e) => {
      e.preventDefault();
    })
    .on('dragenter', (e) => {
      e.target.style.border = '1px dashed #033160';
    })
    .on('dragleave', (e) => {
      e.target.style.border = 'none';
    })
    .on('drop', (e) => {
      const currentNode = e.target;
      currentNode.style.border = 'none';
      const alreadyMapped = currentNode.childElementCount > 1;
      const isInNoAssignContainer = currentNode.className.includes('field-mapper-assign-area');
      if (
        !currentNode.className.includes('data-field-text')
        && !isInNoAssignContainer
        && !alreadyMapped
      ) {
        const [width, height] = draggableFieldDimensions;
        draggableField.style.width = width;
        draggableField.style.height = height;
        currentNode.appendChild(draggableField);
        d3.select(`#list-item-${draggableField.getAttribute('value')}`).remove();
      } else if (isInNoAssignContainer && !alreadyMapped) {
        const dragField = draggableField.getAttribute('value');
        d3.select(`#list-item-${dragField}`).remove();
        const li = d3
          .select('.missing-fields-ul')
          .append('li')
          .classed('missing-fields-li text-font-family field-mapper-assign-area', true)
          .attr('id', `list-item-${dragField}`);
        li.node().appendChild(draggableField);
      }
    });
}

/* Method to append a table with fields from metrostop data model
   Params: @fieldMapperContentContainer is the div container that will hold the table contents
           @fields is the array of fields from the metrostop data model
*/
function AppendTable2MidSection(container, fields) {
  const mappingContainer = container.append('div').attr('id', 'mapping-list-container');

  let is1stOrLast = true;
  const totalFieldCount = fields.length;
  fields.forEach((field, i) => {
    let firstOrLast;
    if (i > 0 && i < totalFieldCount - 1) is1stOrLast = false;
    else {
      if (i === 0) firstOrLast = 0;
      else firstOrLast = 1;
      is1stOrLast = true;
    }
    AppendDataField2Container(mappingContainer, field, is1stOrLast, firstOrLast);
  });
} /* Method to append the middle section for field-assignemnt-content div parent
   Params: @fieldMapperContentContainer is the div that will hold the table
           @fields is the list of fields from metrostop data model
*/
function AppendMiddleSection(fieldMapperContentContainer, fields) {
  const midSection = fieldMapperContentContainer
    .append('div')
    .classed('mid-section-field-assignment', true);

  AppendTable2MidSection(midSection, fields);
}

/* Method to append the last section for fields with no assignment
   Params: @fields is a list of fields from metro stop data model
           @fieldMapperContentContainer is the container div element that will hold the content
*/
function AppendNoAssignmentSection(fieldMapperContentContainer) {
  //   const noAssignmentFields = [];
  AppendDataField2Container(fieldMapperContentContainer, noAssignmentString, false, 0);
}

/* Method to draw a line for drag icon using svg
   Params: @svg is the svg element being used to draw
           @x1 is the start x coordinate
           @y1 is the start y coordinate
           @x2 is the ending x coordinate
           @y2 is the ending y coordinate
*/
export function AppendLine2Svg(svg, x1, y1, x2, y2) {
  svg.append('line').attr('x1', x1).attr('y1', y1).attr('x2', x2)
    .attr('y2', y2);
}
/* Method to append 6 lines and generate svg for a drag icon
     Params: @currentMissingField is the element that will hold the svg in
  */
function AppendDragIcon(currentMissingField) {
  const svgDrag = currentMissingField
    .append('svg')
    .classed('drag-icon', true)
    .attr('viewBox', '0 0 24 24');
  AppendLine2Svg(svgDrag, 8, 6, 21, 6);
  AppendLine2Svg(svgDrag, 8, 12, 21, 12);
  AppendLine2Svg(svgDrag, 8, 18, 21, 18);
  AppendLine2Svg(svgDrag, 3, 6, 3.01, 6);
  AppendLine2Svg(svgDrag, 3, 12, 3.01, 12);
  AppendLine2Svg(svgDrag, 3, 18, 3.01, 18);
}

function AppendLabelWithDragIcon(container, field, isUnkown) {
  const labelContainer = container
    .append('div')
    .classed(
      `list-item-container ${isUnkown ? 'unknown-field' : ''}  field-mapper-assign-area`,
      true,
    )
    .attr('value', field)
    .attr('draggable', true);
  // currentLabel
  labelContainer
    .append('div')
    .classed('drag-label field-mapper-assign-area settings-font-family', true)
    .text(field);
  AppendDragIcon(labelContainer);
  labelContainer
    .on('dragstart', (e) => {
      const currentNode = e.target;
      draggableField = currentNode;
      draggableFieldDimensions[0] = draggableField.clientWidth;
      draggableFieldDimensions[1] = draggableField.clientHeight;
      setTimeout(() => {
        currentNode.style.display = 'none';
      }, 0);
    })
    .on('dragend', (e) => {
      const currentNode = e.target;
      currentNode.style.border = 'none';
      draggableField = null;
      draggableFieldDimensions = [null, null];
      setTimeout(() => {
        currentNode.style.display = 'flex';
      }, 0);
    });
}

/* Method to generate the field mapping option to the settings menu
   Params: @body is the body element node for the html document
           @UiInstance is the current UI object instance

*/
export function CreateFieldMappingSection(container, fields) {
  const fieldMapperContainerId = 'field-assignment-container';
  const fieldMapperHeaderText = 'Data Fields and Mapping';
  const fieldAssignmentContainer = card.AppendCard(
    container,
    fieldMapperContainerId,
    fieldMapperHeaderText,
  );
  const fieldMapperContentContainer = fieldAssignmentContainer
    .append('div')
    .classed('field-assignment-content', true);

  const subTitle = 'Available Fields';
  const description = 'Only fields in your dataset will appear in the No Assignment list. Match those fields to the Metrostop fields.';
  card.SubtitleAndDescription(fieldMapperContentContainer, subTitle, description);
  AppendMiddleSection(fieldMapperContentContainer, fields);
  AppendNoAssignmentSection(fieldMapperContentContainer);
  AppendSaveButton(fieldAssignmentContainer, fields);
}

/* Method to append the no assignment container with its child elements
   Params: @noAssignmentFields is an array of fields found to have no assignment
           @container is the div container that will hold the element in the dom
*/
export function AppendUnknownFields2NoAssignmentSection(noAssignmentFields, fieldsFound) {
  d3.selectAll('.fields-2-map').remove();
  d3.selectAll('.list-item-container').remove();

  // listitemContainers.remove();
  const missingFieldContainer = d3.select(`#${noAssignmentId}`).append('div');
  missingFieldContainer
    .classed('fields-2-map text-font-family field-mapper-assign-area', true)
    .attr('draggable', true);
  const list = missingFieldContainer
    .append('ul')
    .classed('missing-fields-ul field-mapper-assign-area', true);
  noAssignmentFields.forEach((field) => {
    const currentListItem = list
      .append('li')
      .classed('missing-fields-li text-font-family field-mapper-assign-area', true)
      .attr('id', `list-item-${field}`);
    AppendLabelWithDragIcon(currentListItem, field, true);
  });
  fieldsFound.forEach((field) => {
    const rowContainer = d3.select(`#field-value-${field}`);
    AppendLabelWithDragIcon(rowContainer, field, false);
  });
}
