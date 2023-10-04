/* Method to draw upload button with handlers */
function AppendButton(bttnTextId, buttonContainer, text) {
  const button = buttonContainer.append('div').attr('id', 'metrostop-bttn');
  // bttnText
  button.append('p').text(text).attr('id', bttnTextId).classed('text-font-family', true);
  return button;
}
export default AppendButton;
