/* Method to compute the amount of arrows in an existing path
       Params: @point1 is the final value
               @point0 is the start value
    */
export const GetArrowsNeeded4Path = (distance) => Math.ceil((0.05 * (distance)));

/* Method to check if the direction of a line for a stop should be up or down
       Params: @val is the value ( String ) for a stop indicating up or down
    */
export const CheckLineDirection = (val) => {
  if (val.includes('up') && val.includes('right')) {
    return 3;
  } if (val.includes('up')) { return 2; }
  return 1;
};

/* Method to get the width of  a text
       Params: @label is the text to get the width of
    */
export const GetWidth4Label = (svg, label) => {
  const labelText = svg.append('text')
    .text(label)
    .attr('font-size', 6)
    .attr('class', 'act-label text-font-family activity-line');
  const labelDimensions = labelText.node().getBBox();
  const { width } = labelDimensions;
  labelText.remove();
  return width;
};

/* Method to get the height of  a text
           Params: @label is the text to get the height of
        */
export const GetHeight4Label = (svg, label) => {
  const labelText = svg.append('text')
    .text(label)
    .attr('font-size', 6)
    .attr('class', 'act-label text-font-family activity-line');
  const labelDimensions = labelText.node().getBBox();
  const { height } = labelDimensions;
  labelText.remove();
  return height;
};
