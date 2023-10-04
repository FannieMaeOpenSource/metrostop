export function AppendCard(container, settingsOptionId, headerText) {
  const settingsOptionContainer = container.append('div')
    .attr('id', settingsOptionId)
    .classed('card-container', true);
  const settingsOptionHeaderContainer = settingsOptionContainer.append('div')
    .classed('card-container-header', true);
  settingsOptionHeaderContainer.append('h2')
    .classed('card-container-subtitle', true)
    .text(headerText);
  return settingsOptionContainer;
}
/* Method to append a subtitle along with a description to the feature
   Params @fieldAssignmentContainer is the div that will contain the subtitle and description
*/
export function SubtitleAndDescription(container, subtitle, descr) {
  const titleDiscriptionContainer = container.append('div').classed('card-title-desc-container', true);
  // subTitle
  titleDiscriptionContainer.append('p')
    .classed('subtitle-field-assignment settings-font-family', true)
    .text(subtitle);
  // description
  titleDiscriptionContainer.append('p')
    .classed('description-field-assignment settings-font-family', true)
    .text(descr);
}
