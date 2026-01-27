// FIX: los colores que tiene ahora son horribles
const COLORS = {
  TITLE_BACKGROUND: "transparent",
  TITLE_BORDER: "transparent",
  TITLE_TEXT: "#27272a",

  NODE_BACKGROUND: "#ffffff",
  NODE_BORDER: "#b4b1ba",
  NODE_TEXT: "#27272a",

  HOVER_PRIMARY_BACKGROUND: "#f5a191",
  HOVER_PRIMARY_BORDER: "#f1a262",
  HOVER_PRIMARY_TEXT: "#27272a",

  HOVER_PARENT_BACKGROUND: "#aca1cf",
  HOVER_PARENT_BORDER: "#b9aeda",
  HOVER_PARENT_TEXT: "#27272a",

  HOVER_CHILD_BACKGROUND: "#90b99f",
  HOVER_CHILD_BORDER: "#9dc6ac",
  HOVER_CHILD_TEXT: "#27272a",

  EDGE_NORMAL: "#b4b1ba",
  EDGE_HOVER: "#f5a191",
  EDGE_PARENT: "#aca1cf",
  EDGE_CHILD: "#90b99f",
  EDGE_OPACITY: 0.7,
};

// TODO: hacer que se puedan cambiar las opciones
const DIMENSIONS = {
  SEMESTER_WIDTH: 300,
  TITLE_Y_POSITION: -180,
  NODE_START_Y: -60,
  NODE_SPACING_Y: 180,
  NODE_MARGIN: 12,
};

const FONTS = {
  TITLE_SIZE: 18,
  TITLE_FACE: "Arial, sans-serif",
  NODE_SIZE: 13,
  NODE_FACE: "Arial, sans-serif",
  HOVER_SIZE: 14,
};

const ANIMATION = {
  TOOLTIP_DELAY: 200,
  FIT_DURATION: 800,
};

function renderGraph(data, elementId) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const semestersCount = Object.keys(data.semesters).length;

  // Crear nodos para títulos de semestres
  const semesterTitles = createSemesterTitles(semestersCount);

  // Crear nodos y mapa de todas las materias
  const { allSubjects, nodesArray } = createSubjectNodes(
    data.semesters,
    semestersCount,
  );

  // Combinar todos los nodos
  const nodes = new vis.DataSet([...semesterTitles, ...nodesArray]);

  // Crear aristas entre nodos
  const edges = new vis.DataSet(createEdges(allSubjects));

  // Configurar opciones de vis.js para la red
  const optionsVis = createVisOptions(semestersCount);

  // Inicializar red
  const network = new vis.Network(element, { nodes, edges }, optionsVis);

  // Funciones auxiliares para padres e hijos
  const getAllParents = createGetAllParents(allSubjects);
  const getAllChildren = createGetAllChildren(allSubjects);

  // Manejo de eventos para hover, blur y click
  setupNetworkEvents(
    network,
    allSubjects,
    nodes,
    edges,
    getAllParents,
    getAllChildren,
  );

  // Ajustar vista inicial y doble click para resetear zoom
  setupInitialView(network, semestersCount);
  network.fit();
}

// --- FUNCIONES AUXILIARES ---

// Crear nodos de títulos de semestres
function createSemesterTitles(semestersCount) {
  const titles = [];
  for (let sem = 1; sem <= semestersCount; sem++) {
    titles.push({
      id: -sem,
      label: `Semestre ${sem}`,
      group: "title",
      fixed: { x: true, y: true },
      physics: false,
      x: (sem - 1) * DIMENSIONS.SEMESTER_WIDTH,
      y: DIMENSIONS.TITLE_Y_POSITION,
      font: {
        size: FONTS.TITLE_SIZE,
        color: COLORS.TITLE_TEXT,
        face: FONTS.TITLE_FACE,
        bold: true,
        vadjust: 0,
      },
    });
  }
  return titles;
}

// Crear nodos de materias y mapa para acceso rápido
function createSubjectNodes(semesters, semestersCount) {
  const allSubjects = {};
  const nodesArray = [];

  for (let sem = 1; sem <= semestersCount; sem++) {
    const semesterSubjects = semesters[sem];
    const subjectIds = Object.keys(semesterSubjects);

    // Ordenar materias por nombre
    subjectIds.sort((a, b) =>
      semesterSubjects[a].name.localeCompare(semesterSubjects[b].name),
    );

    const xBase = (sem - 1) * DIMENSIONS.SEMESTER_WIDTH;

    for (let i = 0; i < subjectIds.length; i++) {
      const subjectId = subjectIds[i];
      const subject = semesterSubjects[subjectId];

      allSubjects[subjectId] = {
        ...subject,
        sem: sem,
      };

      const y = DIMENSIONS.NODE_START_Y + i * DIMENSIONS.NODE_SPACING_Y;

      nodesArray.push({
        id: subjectId,
        label: subject.name,
        // title: "",
        group: `sem${sem}`,
        shape: "box",
        x: xBase,
        y: y,
        fixed: { x: true, y: true },
        physics: false,
        margin: DIMENSIONS.NODE_MARGIN,
        font: {
          size: FONTS.NODE_SIZE,
          color: COLORS.NODE_TEXT,
          face: FONTS.NODE_FACE,
        },
        borderWidth: 2,
      });
    }
  }

  return { allSubjects, nodesArray };
}

// Crear aristas basadas en prerequisitos
function createEdges(allSubjects) {
  const edgesArray = [];
  for (const [subjectId, subject] of Object.entries(allSubjects)) {
    const prerequisites = subject.pre;
    if (prerequisites && prerequisites.length) {
      for (const preId of prerequisites) {
        edgesArray.push({
          from: preId,
          to: subjectId,
          arrows: "to",
          color: {
            color: COLORS.EDGE_NORMAL,
            opacity: COLORS.EDGE_OPACITY,
            highlight: COLORS.EDGE_HOVER,
          },
        });
      }
    }
  }
  return edgesArray;
}

// Crear configuración de opciones para vis.js
function createVisOptions(semestersCount) {
  const options = {
    physics: false,
    interaction: {
      hover: true,
      multiselect: false,
      navigationButtons: true,
      zoomView: true,
      tooltipDelay: ANIMATION.TOOLTIP_DELAY,
    },
    groups: {
      title: {
        color: {
          background: COLORS.TITLE_BACKGROUND,
          border: COLORS.TITLE_BORDER,
          highlight: {
            background: COLORS.TITLE_BACKGROUND,
            border: COLORS.TITLE_BORDER,
          },
        },
        font: {
          size: FONTS.TITLE_SIZE,
          color: COLORS.TITLE_TEXT,
          face: FONTS.TITLE_FACE,
          bold: true,
          vadjust: 0,
        },
        shape: "text",
        margin: 8,
      },
    },
    edges: {
      arrows: {
        to: {
          enabled: true,
          scaleFactor: 1.5,
          type: "arrow",
        },
      },
      color: {
        color: COLORS.EDGE_NORMAL,
        opacity: COLORS.EDGE_OPACITY,
        highlight: COLORS.EDGE_HOVER,
      },
      width: 2,
      hoverWidth: 2.5,
    },
    nodes: {
      borderWidth: 2,
      borderWidthSelected: 3,
      font: {
        face: FONTS.NODE_FACE,
        color: COLORS.NODE_TEXT,
      },
      shapeProperties: { useBorderWithImage: true },
      shadow: {
        enabled: true,
        color: "rgba(0,0,0,0.1)",
        size: 5,
        x: 2,
        y: 2,
      },
    },
  };

  // Configuraciones para todos los grupos (semestres)
  for (let i = 1; i <= semestersCount; i++) {
    options.groups[`sem${i}`] = {
      color: {
        background: COLORS.NODE_BACKGROUND,
        border: COLORS.NODE_BORDER,
        highlight: {
          background: COLORS.HOVER_PARENT_BACKGROUND,
          border: COLORS.HOVER_PARENT_BORDER,
        },
        hover: {
          background: COLORS.NODE_BACKGROUND,
          border: COLORS.NODE_BORDER,
        },
      },
      shape: "box",
      font: { color: COLORS.NODE_TEXT },
    };
  }

  return options;
}

// Crear función para obtener todos los padres (prerequisitos) recursivamente
function createGetAllParents(allSubjects) {
  return function getAllParents(nodeId, visited = new Set()) {
    if (visited.has(nodeId)) return [];
    visited.add(nodeId);

    const parents = [];
    const subject = allSubjects[nodeId];

    if (subject && subject.pre) {
      for (const parentId of subject.pre) {
        if (!parents.includes(parentId)) {
          parents.push(parentId);
          parents.push(...getAllParents(parentId, visited));
        }
      }
    }
    return [...new Set(parents)];
  };
}

// Crear función para obtener todos los hijos recursivamente
function createGetAllChildren(allSubjects) {
  return function getAllChildren(nodeId, visited = new Set()) {
    if (visited.has(nodeId)) return [];
    visited.add(nodeId);

    const children = [];
    for (const [subjectId, subject] of Object.entries(allSubjects)) {
      if (
        subject.pre &&
        subject.pre.includes(nodeId) &&
        !children.includes(subjectId)
      ) {
        children.push(subjectId);
        children.push(...getAllChildren(subjectId, visited));
      }
    }
    return [...new Set(children)];
  };
}

// Configurar eventos para la red (hover, blur, click)
function setupNetworkEvents(
  network,
  allSubjects,
  nodes,
  edges,
  getAllParents,
  getAllChildren,
) {
  let currentHoverNode = null;
  let highlightedNodes = [];

  // Guardar estilos originales para restaurar
  const originalNodeStyles = {};
  const originalEdgeStyles = {};

  // Al crear nodos y edges, guardamos sus estilos originales
  nodes.forEach((node) => {
    originalNodeStyles[node.id] = {
      color: node.color || null,
      font: node.font || null,
      borderWidth: node.borderWidth || 2,
    };
  });
  edges.forEach((edge) => {
    originalEdgeStyles[edge.id] = {
      color: edge.color || {
        color: COLORS.EDGE_NORMAL,
        opacity: COLORS.EDGE_OPACITY,
      },
      width: edge.width || 2,
    };
  });

  network.on("hoverNode", (params) => {
    const nodeId = params.node;
    if (nodeId < 0) return;
    if (nodeId === currentHoverNode) return;
    currentHoverNode = nodeId;

    const parents = getAllParents(nodeId);
    const children = getAllChildren(nodeId);
    const allRelatedNodes = [nodeId, ...parents, ...children];
    highlightedNodes = allRelatedNodes;

    const nodeUpdates = [];
    const edgeUpdates = [];

    for (const relatedNodeId of allRelatedNodes) {
      if (relatedNodeId === nodeId) {
        nodeUpdates.push({
          id: relatedNodeId,
          color: {
            background: COLORS.HOVER_PRIMARY_BACKGROUND,
            border: COLORS.HOVER_PRIMARY_BORDER,
          },
          font: {
            color: COLORS.HOVER_PRIMARY_TEXT,
            bold: true,
            size: FONTS.HOVER_SIZE,
          },
          borderWidth: 3,
        });
      } else if (parents.includes(relatedNodeId)) {
        nodeUpdates.push({
          id: relatedNodeId,
          color: {
            background: COLORS.HOVER_PARENT_BACKGROUND,
            border: COLORS.HOVER_PARENT_BORDER,
          },
          font: {
            color: COLORS.HOVER_PARENT_TEXT,
            bold: true,
          },
          borderWidth: 3,
        });
      } else if (children.includes(relatedNodeId)) {
        nodeUpdates.push({
          id: relatedNodeId,
          color: {
            background: COLORS.HOVER_CHILD_BACKGROUND,
            border: COLORS.HOVER_CHILD_BORDER,
          },
          font: {
            color: COLORS.HOVER_CHILD_TEXT,
            bold: true,
          },
          borderWidth: 3,
        });
      }
    }

    for (const edge of edges.get()) {
      const fromIsRelated = allRelatedNodes.includes(edge.from);
      const toIsRelated = allRelatedNodes.includes(edge.to);

      if (fromIsRelated && toIsRelated) {
        let edgeColor = COLORS.EDGE_HOVER;

        // Arista padre directo → nodo actual: naranja (padre)
        if (edge.to === nodeId && parents.includes(edge.from)) {
          edgeColor = COLORS.EDGE_PARENT;
        }
        // Arista nodo actual → hijo directo: verde (hijo)
        else if (edge.from === nodeId && children.includes(edge.to)) {
          edgeColor = COLORS.EDGE_CHILD;
        }

        edgeUpdates.push({
          id: edge.id,
          color: {
            color: edgeColor,
            opacity: 1.0,
          },
          width: 3,
        });
      }
    }

    if (nodeUpdates.length) nodes.update(nodeUpdates);
    if (edgeUpdates.length) edges.update(edgeUpdates);
  });

  network.on("blurNode", () => {
    if (!currentHoverNode) return;

    // Restaurar estilos originales
    const resetNodes = highlightedNodes.map((nodeId) => {
      const original = originalNodeStyles[nodeId] || {};
      return {
        id: nodeId,
        color: original.color || null,
        font: original.font || {
          color: COLORS.NODE_TEXT,
          bold: false,
          size: FONTS.NODE_SIZE,
        },
        borderWidth: original.borderWidth || 2,
      };
    });

    const resetEdges = edges.get().map((edge) => {
      const original = originalEdgeStyles[edge.id] || {};
      return {
        id: edge.id,
        color: original.color || {
          color: COLORS.EDGE_NORMAL,
          opacity: COLORS.EDGE_OPACITY,
        },
        width: original.width || 2,
      };
    });

    nodes.update(resetNodes);
    edges.update(resetEdges);

    currentHoverNode = null;
    highlightedNodes = [];
  });

  network.on("click", (params) => {
    if (params.nodes.length === 1) {
      const nodeId = params.nodes[0];
      if (nodeId < 0) return;

      const subject = allSubjects[nodeId];
      if (subject) {
        const message = `${subject.name} (${nodeId})\n\n${subject.desc}\n\nSemestre: ${subject.sem}`;
        alert(message);
      }
    }
  });
}

// Ajustar vista inicial y comportamiento de doble click para zoom
function setupInitialView(network, semestersCount) {
  if (semestersCount > 5) {
    const initialScale = Math.min(
      1,
      800 / (semestersCount * DIMENSIONS.SEMESTER_WIDTH),
    );
    network.moveTo({
      position: {
        x: ((semestersCount - 1) * DIMENSIONS.SEMESTER_WIDTH) / 2,
        y: 0,
      },
      scale: initialScale * 0.8,
    });
  }

  network.on("doubleClick", () => {
    network.fit({
      animation: {
        duration: ANIMATION.FIT_DURATION,
        easingFunction: "easeInOutQuad",
      },
    });
  });
}
