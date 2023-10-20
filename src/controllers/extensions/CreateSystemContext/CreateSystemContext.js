// import dataset from '../../../../data/data.js';
import {
  AdjustLinkDuringSimulation,
  RemoveGraphElements,
  RemoveTableElements,
  AnimateSCNodesTreeNode2BottomOfScreen,
} from './CreateSystemContextHelper.js';
import { CreateTable, DownloadTable } from '../../../components/DataTable/DataTable.js';
import DataTableDataStore from '../../../components/DataTable/DataTableDataStore.js';
import SystemContextDataStore from '../../CreateSystemContext/SystemContextDataStore.js';
// TODO: replace this with a generic addError message; how these are displayed is up to the core system (do this everywhere)
import { AppendPopup } from '../../../components/Popup/Popup.js';
import DataStore from '../../../services/DataStore.js';

const { d3 } = window;
// decouple this part
let dataset;
const SVG_DIMENSIONS = { WIDTH: 800, HEIGHT: 800 };
let svg;
let svgWasCreated = false;
let containerWasCreated = false;
let systemContextViz;
let showChartVisual = false;
let scIconsRendered = false;
let settings = {};
// let systemContextSimulation;
function TurnOffSCVars() {
  svgWasCreated = false;
  containerWasCreated = false;
}
function InitForces(sim, stop) {
  const {
    systemContextSimulation, assetLinks, assetNodes, position,
  } = sim;
  // .force('charge', d3.forceManyBody().strength(-280))
  // .force('y', d3.forceY().y(position.treeNodeYPos))
  const border = document.getElementById('scd-borderline');
  /**
   * start x -> stop.cx + 50 ish
   */
  systemContextSimulation
    .force('x', d3.forceX().x(sim.targetXPos))
    .force('y', d3.forceY().y(sim.targetYPos))
    .force('radial', d3.forceRadial())
    .force('collide', d3.forceCollide())
    // .force('charge', d3.forceManyBody())
    .force('link', d3.forceLink());
}
function UpdateForces(sim) {
  const {
    systemContextSimulation,
    assetLinks,
    assetNodes,
    forces,
    stop,
    position,
    targetXPos,
    targetYPos,
  } = sim;
  systemContextSimulation.force(
    'link',
    d3
      .forceLink(forces.link.enabled ? assetLinks : 0)
      .id((d) => d.id)
      .distance(130),
  );
  systemContextSimulation.force('radial', d3.forceRadial().radius(800, 800).strength(0.1));
  systemContextSimulation.force('collide', d3.forceCollide(forces.collide.enabled ? 0 : 7));
  systemContextSimulation.force(
    'x',
    d3
      .forceX(assetNodes)
      .x((d) => targetXPos + forces.forceXIncrement.increment)
      .strength(0.22),
  );
  systemContextSimulation.force(
    'y',
    d3
      .forceY(assetNodes)
      .y((d) => {
        const upIncrement = targetYPos - forces.forceYIncrement.increment - 30;
        const downIncrement = targetYPos + forces.forceYIncrement.increment;
        // debrand
        const position = forces.forceYIncrement.enabled
          ? d[settings.scd_settings.node_settings.grouping_attribute]
            == settings.scd_settings.node_settings.top_class
            ? downIncrement
            : upIncrement
          : targetYPos;
        return position;
      })
      .strength(0.79),
  );
  systemContextSimulation.force(
    'charge',
    forces.forceManyBody.enabled ? d3.forceManyBody().strength(-400) : null,
  );
  //   if (sim.primaryNode != d.id) console.log('found');
  //   return sim.forces.forceManyBody.enabled
  //              && sim.primaryNode != d.id ? -30 : 0;
  // }));
}
function InitSimulation(sim) {
  // let { systemContextSimulation, assetNodes } = sim;
  sim.systemContextSimulation = d3.forceSimulation(sim.assetNodes);
}
function DrawForceDiagram4SystemContext(scData) {
  const { position, stop } = scData;
  const simulation = SystemContextDataStore.getData();
  let sCNodesWillOriginate4rmTreeNode = true;
  let notNormalOnTickSimulation = true;
  const MAX_WEIGHT = d3.max(simulation.assetLinks.map((link) => link.weight));
  const MAX_INFLUENCE = d3.max(simulation.assetNodes.map((node) => node.influence));
  const linksWidthScale = d3.scaleLinear().domain([0, MAX_WEIGHT]).range([2.4, 3.3]);
  if (!svgWasCreated) {
    svg = d3.select('.tree-group');
    systemContextViz = svg;
    svgWasCreated = true;
  }

  // debrand
  const groupYPositionScale = d3
    .scaleOrdinal()
    .domain(settings.scd_settings.node_settings.grouping_classes)
    .range([120, 120, 250, 610, 528]);
  const groupXPositionScale = d3
    .scaleOrdinal()
    .domain(settings.scd_settings.node_settings.grouping_classes)
    .range([16, 1660, 600, 1430, 380]);
  function CreateSimulation() {
    InitSimulation(simulation);
    InitForces(simulation, stop);
    UpdateForces(simulation);

    simulation.systemContextSimulation.alphaMin(0.09);
    let firstTimeSCNodesAreUnderTree = true;
    simulation.systemContextSimulation.on('tick', () => {
      const currAlpha = OnTick();
      if (currAlpha < simulation.systemContextSimulation.alphaMin()) {
        if (firstTimeSCNodesAreUnderTree) {
          simulation.forces.link.enabled = true;
          simulation.forces.forceManyBody.enabled = true;
          simulation.forces.collide.enabled = false;
          simulation.initialSimulation = false;
          simulation.forces.forceYIncrement.enabled = true;
          simulation.forces.forceYIncrement.increment = 100;
          simulation.forces.labels.enabled = true;
          UpdateNodesLinks();
          UpdateForces(simulation);

          simulation.systemContextSimulation.alpha(1).restart();
          firstTimeSCNodesAreUnderTree = false;
        }
      }
    });
  }
  CreateSimulation();
  const linksLineGenerator = d3.line().curve(d3.curveCardinal);
  // debrand
  const groupColorScale = d3
    .scaleOrdinal()
    .domain(settings.scd_settings.node_settings.grouping_classes)
    .range([
      'rgb(255, 127, 14)',
      'rgb(31, 119, 180)',
      'rgb(148, 103, 189)',
      'rgb(214, 39, 40)',
      'rgb(44, 160, 44)',
    ]);
  const nodeDragging = (simulation) => {
    const startDrag = (event, d) => {
      if (!d.active) {
        simulation.alphaTarget(0.99).restart();
      }

      d.fx = event.x;
      d.fy = event.y;
    };

    const dragging = (event, d) => {
      d.fx = event.x;
      d.fy = event.y;
    };

    const endDrag = (event, d) => {
      /// FadeSystem(nodes, links, nodeLabelsTextContainer);

      if (!d.active) {
        simulation.alphaTarget(0);
      }

      d.fx = null;
      d.fy = null;
    };

    return d3.drag().on('start', startDrag).on('drag', dragging).on('end', endDrag);
  };
  UpdateNodesLinks();
  const graphNodes = systemContextViz
    .selectAll('.vertex')
    .data(simulation.assetNodes)
    .join('circle')
    .classed('vertex scd-graph', true)
    .attr('id', (d) => `node-${d.system.split(' ').join('-')}`)
    .style('fill', (d) => d3.color(groupColorScale(d.system_type)).brighter(1))
    .style('stroke', (d) => d3.color(groupColorScale(d.system_type)).darker(2))
    .classed('component-fade', (d) => !!(d.asset_type != 'asset' && !d.component_button_clicked))
    .classed('component', (d) => d.asset_type != 'asset')
    .attr('cx', (d) => position.treeNodeXPos) // SVG_DIMENSIONS.WIDTH / 2)
    .attr('cy', (d) => position.treeNodeYPos) // SVG_DIMENSIONS.HEIGHT / 2)
    .attr('r', 7);
  graphNodes.call(nodeDragging(simulation.systemContextSimulation));

  const fontLabelScale = d3.scaleLinear().domain([0, MAX_INFLUENCE]).range([8, 12]);

  let currentNode;
  let currentLink;
  function OnTick() {
    d3.selectAll('path.link').attr('d', (d) => AdjustLinkDuringSimulation(linksLineGenerator, d));
    const DelayMethod = (d, i) => (i == 0 ? 1 : i); // Animation delay to make nodes look like they're following a straight line 1 after another
    if (sCNodesWillOriginate4rmTreeNode && simulation.initialSimulation) {
      d3.selectAll('.vertex').attr('cx', position.treeNodeXPos).attr('cy', position.treeNodeYPos);
      sCNodesWillOriginate4rmTreeNode = false;
    } else if (notNormalOnTickSimulation && simulation.initialSimulation) {
      AnimateSCNodesTreeNode2BottomOfScreen(140, DelayMethod);
      notNormalOnTickSimulation = false;
    } else if (simulation.initialSimulation) {
      AnimateSCNodesTreeNode2BottomOfScreen(111, DelayMethod);
    } else {
      AnimateSCNodesTreeNode2BottomOfScreen(null, null);
    }
    const toolTip = d3.select('.tool-tip');

    if (currentNode) {
      currentLink = null;
      const toolTipRadius = currentNode.r.baseVal.value;
      const toolTipXPosition = currentNode.cx.baseVal.value + toolTipRadius;
      const toolTipYPosition = currentNode.cy.baseVal.value + toolTipRadius;

      toolTip.attr('transform', `translate(${toolTipXPosition}, ${toolTipYPosition})`);
    }
    if (currentLink) {
      const toolTipXPosition = currentLink.source.x + 10;
      const toolTipYPosition = currentLink.source.y;

      toolTip.attr('transform', `translate(${toolTipXPosition}, ${toolTipYPosition})`);
    }
    return simulation.systemContextSimulation.alpha();
  }
  // UpdateNodesLinks();
  function UpdateNodesLinks() {
    const graphLinks = systemContextViz
      .selectAll('path.link')
      .data(simulation.assetLinks)
      .join('path')
      .classed('link scd-graph', true)
      .attr('stroke', (d) => (d.is_component == true ? 'yellow' : '#999'))
      .attr('id', (d) => d.id)
      .attr('stroke-width', 0.5)
      .attr('fill', 'none')
      .style('opacity', simulation.forces.link.enabled ? 1 : 0);
    // graphNodes.raise();
    const nodesScale = d3.scaleLinear().domain([0, MAX_INFLUENCE]).range([3, 25]);
    const nodeLabelsTextContainer = systemContextViz
      .selectAll('.node-label')
      .data(simulation.assetNodes)
      .join('text')
      .classed('component', (d) => d.asset_type != 'asset')
      .classed('node-label scd-graph', true)
      .text((d) => d.system)
      .attr('font-size', (d) => 8)
      .attr('fill', 'black')
      .style('opacity', simulation.forces.labels.enabled ? 1 : 0)
      .style('font-weight', 'lighter')
      .attr('transform', (d) => {
        const currentScale = nodesScale(d.influence);
        const xPosition = currentScale + 6;
        const yPosition = currentScale + 4;
        return `translate(${xPosition}, ${yPosition})`;
      });
    nodeLabelsTextContainer.raise();
  }

  simulation.systemContextSimulation.on('end', () => {
    console.log('dragin end '); // isUserDragging = false;
  }); //* ******************************needs checking ************************* */
  // simulation.systemContextSimulation.alphaTarget(0).restart();
}
function DrawSCBorderLabels(stop) {
  const simulation = SystemContextDataStore.getData();
  const targetXPositionUpdated = simulation.targetXPos - 200;
  const targetYDiff = 300;
  const treeGroup = d3.select('.tree-group');
  const border = treeGroup
    .append('line')
    .classed('scd-graph', true)
    .attr('fill', settings.scd_settings.show_border == 'False' ? 'white' : 'blue')
    .attr('stroke', settings.scd_settings.show_border == 'False' ? 'white' : 'blue')
    .attr('stroke-width', 2)
    .attr('id', 'border-scd-d3-border')
    .attr('x1', targetXPositionUpdated - targetYDiff) // positioning of the border -> want where nodes are
    .attr('y1', simulation.targetYPos)
    .attr('x2', targetXPositionUpdated + targetYDiff)
    .attr('y2', simulation.targetYPos)
    .attr('stroke-dasharray', '2, 2');
  let labelsVals = [];
  if (settings.scd_settings) {
    labelsVals = [
      settings.scd_settings.labels.top_label,
      settings.scd_settings.labels.bottom_label,
    ];
  } else {
    // debrand
    labelsVals = ['', ''];
  }
  const targetXLabel = targetXPositionUpdated - targetYDiff;
  const targetYLabel = simulation.targetYPos;
  /**
   * x and y are swapped bc the label is rotated
   */
  const labels = treeGroup
    .selectAll('.labels-scd-d3-border')
    .data(labelsVals)
    .join('text')
    .classed('labels-scd-d3-border', true)
    .classed('scd-graph', true)
    .text((d) => d)
    .attr('y', targetXLabel - 35)
    .attr('fill', 'black');
  const all_text = document.querySelectorAll('.labels-scd-d3-border');
  all_text.forEach((t, i) => {
    const d3Obj = d3.select(t);
    const lengthText = t.getComputedTextLength();
    d3Obj.attr('x', i === 1 ? -targetYLabel - lengthText - 30 : -targetYLabel + 30);
  });
}
function DrawSChartVisual(scData) {
  const {
    links, nodes, position, primaryNode, stop,
  } = scData;
  SystemContextDataStore.setData({
    systemContextSimulation: null,
    assetNodes: nodes,
    assetLinks: links,
    initialSimulation: true,
    primaryNode,
    position,
    targetXPos: stop.cx + 500,
    targetYPos: stop.cy + 430 - 100,
    forces: {
      forceYIncrement: {
        enabled: false,
        increment: 0,
      },
      forceXIncrement: {
        enabled: false,
        increment: 0,
      },
      forceManyBody: {
        enabled: false,
      },
      radial: {
        enables: true,
      },
      collide: {
        enabled: true,
      },
      link: {
        enabled: false,
      },
      labels: {
        enabled: false,
      },
    },
  });
  DrawSCBorderLabels(stop); // this draws the border
  DrawForceDiagram4SystemContext(scData);
}
function AppendSCTable(scData) {
  const { nodes, links } = scData;
  const body = document.getElementById('app-body');
  const tableContainer = document.createElement('div');
  tableContainer.setAttribute('id', 'scd-data-table');
  const records = [];
  const FindAssetNameNType = (nodeId) => {
    // debrand
    let output_array;
    nodes.forEach((node) => {
      if (node.id == nodeId) {
        output_array = settings.table_settings.node_settings.fields.map((field) => node[field]);
      }
    });
    return output_array;
  };
  links.forEach((link) => {
    // Switching to SCD will alter scData and make
    // these fields an object with information about
    // each node
    let sourceID;
    let targetID;
    if (typeof link.source === 'string') {
      sourceID = link.source;
      targetID = link.target;
    } else {
      sourceID = link.source.id;
      targetID = link.target.id;
    }
    const prodDetails = FindAssetNameNType(sourceID);
    const consDetails = FindAssetNameNType(targetID);

    // debrand
    const records_input = [];
    records_input.push(...prodDetails);
    records_input.push(...consDetails);
    records_input.push(...settings.table_settings.link_settings.fields.map((field) => link[field]));
    records.push(records_input);
  });
  console.log({ records });
  DataTableDataStore.setData(records);
  CreateTable(tableContainer, getTableHeaders(), records);
  body.appendChild(tableContainer);
}

async function loadSCDSettings() {
  try {
    const settingsResponse = await fetch(
      new URL('/src/controllers/extensions/CreateSystemContext/settings.json', import.meta.url),
    );
    const settingsData = await settingsResponse.json();
    return settingsData;
  } catch {
    return {};
  }
}

async function CreateSystemContext({
  stop, process, position, attr,
}) {
  if (Object.keys(settings).length === 0) {
    settings = await loadSCDSettings();
  }
  showChartVisual = false;
  dataset = DataStore.getAttrData(attr);

  // the key for l3 assets is pulled from the settings menu
  const l3_key = Object.keys(DataStore.getSettings().process_attr);
  // debrand
  const assets = process.attributes[l3_key];
  const assetsFound = [];
  const tempDsObject = structuredClone(dataset);
  console.log({ assets });
  const links = tempDsObject.links.filter((link) => {
    const { target, source } = link;

    if (assets.includes(source) || assets.includes(target)) {
      if (!assetsFound.includes(source)) {
        assetsFound.push(source);
      }
      if (!assetsFound.includes(target)) {
        assetsFound.push(target);
      }
      return true;
    }
    return false;
  });
  const nodes = tempDsObject.nodes.filter((node) => assetsFound.includes(node.id));
  if (nodes.length > 0) {
    if (!containerWasCreated) {
      containerWasCreated = true;
    }

    const scData = {
      links,
      nodes,
      position,
      assets,
      stop,
    };
    if (!scIconsRendered) AddSCIcons(scData);
    else {
      CreateEventListener4SCToggle(scData);
      /**
       * If the icon is already rendered, make sure it shows the correct
       * icon to toggle to node view since it starts at table
       */
      const icon = document.querySelector('#diagram-toggle-icon-clickable i');
      icon.setAttribute('class', 'fas fa-project-diagram');
      /**
       * Change the size of the icon container when add the reset icon
       */
      document.querySelector('#icons-container').style = 'height:20%';
      document.querySelector('.icons-scd-containers').style = 'height:33%';
    }
    // console.log({ scData });
    // DataTableDataStore.setData(scData);
    /**
     * If the table is already open, will not be removed when switching
     * between stops, so have to check for it
     */
    if (document.querySelector('#scd-data-table')) RemoveTableElements();
    ToggleTableNSCDiagram(scData);
    // d3.select('#system-context-container').transition().duration(700).style('width', '45%');
    //
  } else {
    console.log('ERROR: IT Asset ', assets, ' Not Found');
    // reset showChartVisual
    showChartVisual = true;
    AppendPopup(
      'WARNING: IT Asset not found - make sure a there is a "attr_related_it_assets" or "related_it_assets" column in process dataset.',
      'Warning with no it assets found',
      '',
      'warning',
    );
  }
}
function ToggleTableNSCDiagramIcon() {
  const icon = document.querySelector('#diagram-toggle-icon-clickable i');
  if (icon.getAttribute('class') === 'fas fa-project-diagram') {
    icon.setAttribute('class', 'fas fa-table');
    /**
     * Change the size of the icon container when remove the reset icon
     */
    document.querySelector('#reset-icon-clickable').remove();
    document.querySelector('#icons-container').style = 'height:12%';
    document.querySelector('.icons-scd-containers').style = 'height:50%';
  } else {
    icon.setAttribute('class', 'fas fa-project-diagram');
    /**
     * Change the size of the icon container when add the reset icon
     */
    document.querySelector('#icons-container').style = 'height:20%';
    document.querySelector('.icons-scd-containers').style = 'height:33%';
  }
}
function CreateEventListener4SCToggle(scData) {
  d3.select('#diagram-toggle-icon-clickable').on('click', () => {
    ToggleTableNSCDiagramIcon();
    ToggleTableNSCDiagram(scData, !showChartVisual);
  });
}
function getTableHeaders() {
  const headers = [];
  headers.push(
    ...settings.table_settings.node_settings.fields_plaintext.map(
      (field) => `${settings.table_settings.node_settings.source_name_table} ${field}`,
    ),
  );
  headers.push(
    ...settings.table_settings.node_settings.fields_plaintext.map(
      (field) => `${settings.table_settings.node_settings.target_name_table} ${field}`,
    ),
  );
  headers.push(
    ...settings.table_settings.link_settings.fields_plaintext.map(
      (field) => `${settings.table_settings.link_settings.link_name_table} ${field}`,
    ),
  );
  return headers;
}
function AddSCIcons(scData) {
  const body = document.getElementById('app-body');
  const switchIconContainer = document.createElement('div');
  switchIconContainer.setAttribute('id', 'icons-container');

  switchIconContainer.innerHTML = `<div id="download-icon-clickable" class="icons-scd-containers"> <i id="download-icon-clickable" class="fas fa-file-download"> </i> </div> 
                                   <div id="diagram-toggle-icon-clickable" class="icons-scd-containers"> <i id="diagram-toggle-icon-clickable" class="fas fa-project-diagram"> </i> </div>`;
  body.appendChild(switchIconContainer);
  CreateEventListener4SCToggle(scData);
  scIconsRendered = true;
  /**
   * This event listener parses through scData to replicate the table as a
   * 2D array, then parses the array to output as a csv which it saves
   * on the client-side
   */
  // debrand
  // const headers = [
  //   'Producer',
  //   'Producer ID',
  //   'Producer Type',
  //   'Interface',
  //   'Interface ID',
  //   'Interface Status',
  //   'Interface Description',
  //   'Consumer',
  //   'Consumer ID',
  //   'Consumer Type',
  // ];

  console.log(`headers: ${getTableHeaders()}`);

  d3.select('#download-icon-clickable').on('click', () => DownloadTable(getTableHeaders()));
}
function ToggleTableNSCDiagram(scData, tableOrVisual = true) {
  showChartVisual = !showChartVisual;
  if (tableOrVisual === true) {
    RemoveGraphElements();
    AppendSCTable(scData);
  } else {
    RemoveTableElements();
    DrawSChartVisual(scData);
  }
}

/**
 * The purpose of this method is to remove the table or
 * diagram when the view is zoomed out of the specific metrostop
 * this method is called in UIController
 */
function RemoveTableNSCDiagram() {
  const sysContextIcons = document.querySelector('#icons-container');
  scIconsRendered = false;
  if (sysContextIcons) {
    sysContextIcons.remove();
  }
  if (showChartVisual === true) {
    RemoveTableElements();
  } else {
    RemoveGraphElements();
  }
}
const ResetSystemContext = () => {
  TurnOffSCVars();
  RemoveTableNSCDiagram();
};
const SystemContext = {
  Render: CreateSystemContext,
  Reset: ResetSystemContext,
};
export default SystemContext;
