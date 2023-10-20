function AdjustLinkDuringSimulation(linksLineGenerator, currentLink) {
  const middlePoint = [
    (currentLink.source.x + currentLink.target.x) / 2,
    (currentLink.source.y + currentLink.target.y) / 2,
  ];

  if (currentLink.overlay > 0) {
    const currentDistance = Math.sqrt(
      (currentLink.target.x - currentLink.source.x) ** 2
        + (currentLink.target.y - currentLink.source.y) ** 2,
    );

    const slopeX = (currentLink.target.x - currentLink.source.x) / currentDistance;
    const slopeY = (currentLink.target.y - currentLink.source.y) / currentDistance;

    const sharpnessOfCurve = 8;

    middlePoint[0] += slopeY * sharpnessOfCurve;
    middlePoint[1] -= slopeX * sharpnessOfCurve;
  }

  const curvedLine = linksLineGenerator([
    [currentLink.source.x, currentLink.source.y],
    middlePoint,
    [currentLink.target.x, currentLink.target.y],
  ]);
  return curvedLine;
}
function RemoveGraphElements() {
  d3.selectAll('.scd-graph').remove();
}
function RemoveTableElements() {
  d3.select('#scd-data-table').remove();
}
function AnimateSCNodesTreeNode2BottomOfScreen(durationVal, DelayMethod) {
  d3.selectAll('.node-label').attr('transform', (d) => `translate(${d.x + 9} , ${d.y})`);
  d3.selectAll('.vertex')
    .transition()
    .duration(durationVal)
    .delay(DelayMethod)
    .attr('cx', (d) => d.x)
    .attr('cy', (d) => d.y);
}

export {
  AnimateSCNodesTreeNode2BottomOfScreen,
  AdjustLinkDuringSimulation,
  RemoveGraphElements,
  RemoveTableElements,
};
