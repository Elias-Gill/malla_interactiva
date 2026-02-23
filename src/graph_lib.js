// ================= CONSTANTES DE DIMENSIONES =================

const DIMENSIONS = {
  SEMESTER_WIDTH: 300, // Ancho asignado por semestre
  NODE_START_Y: 80, // Posición vertical inicial de los nodos
  NODE_SPACING_Y: 90, // Separación vertical entre nodos
  NODE_MARGIN: 10, // Margen interno de los nodos
  NODE_MAX_WIDTH: 220, // ≈ 28–32 caracteres dependiendo de la fuente
};

// ================= CONSTANTES DE COLORES =================

const COLORS = {
  NODE_TEXT: "#1f2937",
  NODE_BG_ODD: "#f591b2", // semestres impares (1,3,5...)
  NODE_BG_EVEN: "#9dc6ac", // semestres pares   (2,4,6...)
  NODE_BORDER: "#6b7280",

  NODE_HIGHLIGHT_BG: "#b9aeda",
  NODE_HIGHLIGHT_BORDER: "#6b7280",

  NODE_CHILD_BG: "#60a5fa",
  NODE_CHILD_BORDER: "#6b7280",

  NODE_PARENT_BG: "#fbbf24",
  NODE_PARENT_BORDER: "#6b7280",

  EDGE_NORMAL: "#232323",
  EDGE_OPACITY: 0.8,
};

// ================= CONSTANTES DE FUENTES =================

const FONTS = {
  NODE_SIZE: 14,
  NODE_FACE: "Inter, Arial, sans-serif",
};

// ============== CONFIGURACIÓN BASE PARA NODOS Y ARISTAS ==============

const NODE_COMMON_CONFIG = {
  shape: "box",
  fixed: true,
  physics: false,
  margin: DIMENSIONS.NODE_MARGIN,
  font: {
    size: FONTS.NODE_SIZE,
    face: FONTS.NODE_FACE,
    color: COLORS.NODE_TEXT,
    multi: true, // permite multilínea
  },
  borderWidth: 1,
  widthConstraint: {
    maximum: DIMENSIONS.NODE_MAX_WIDTH, // fuerza wrap
  },
};

const EDGES_COMMON_CONFIG = {
  arrows: {
    to: {
      enabled: true,
      scaleFactor: 0.8,
      type: "arrow",
      color: COLORS.EDGE_NORMAL, // Color fijo para la flecha
    },
  },
  color: {
    color: COLORS.EDGE_NORMAL,
    opacity: COLORS.EDGE_OPACITY,
    highlight: COLORS.EDGE_NORMAL,
    hover: COLORS.EDGE_NORMAL, // Añadir estado hover explícito
    inherit: false, // Importante: evitar herencia de colores
  },
  width: 1,
  hoverWidth: 1,
  selectionWidth: 0, // Evitar cambio de ancho al seleccionar
};

const SEMESTERS_TITLE_STYLE = {
  y: 10,
  fixed: true,
  physics: false,
  font: {
    size: 28,
    bold: true,
    color: "#374151",
  },
  shape: "text",
};

// ================= ESTILOS DE NODOS (para hover / parent / child) =================

const NODE_STYLE_BASE = {
  font: {
    color: COLORS.NODE_TEXT,
    bold: false,
    size: FONTS.NODE_SIZE,
  },
  borderWidth: 1, // valor fijo para todos los estados
  opacity: 1,
};

const NODE_STYLE_DEFAULT_FADED = {
  opacity: 0.12,
};

const NODE_STYLE_HOVER = {
  color: {
    background: COLORS.NODE_HIGHLIGHT_BG,
    border: COLORS.NODE_HIGHLIGHT_BORDER,
  },
  font: {
    ...NODE_STYLE_BASE.font,
    bold: true,
    size: FONTS.NODE_SIZE + 2,
  },
  // borderWidth ya viene de NODE_STYLE_BASE → no se sobreescribe
  opacity: 1,
};

const NODE_STYLE_PARENT = {
  color: {
    background: COLORS.NODE_PARENT_BG,
    border: COLORS.NODE_PARENT_BORDER,
  },
  font: {
    ...NODE_STYLE_BASE.font,
    bold: true,
  },
  opacity: 1,
};

const NODE_STYLE_CHILD = {
  color: {
    background: COLORS.NODE_CHILD_BG,
    border: COLORS.NODE_CHILD_BORDER,
  },
  font: {
    ...NODE_STYLE_BASE.font,
    bold: true,
  },
  // borderWidth ya viene de NODE_STYLE_BASE
  opacity: 1,
};

// ================= VARIABLES GLOBALES =================

let allSubjects = {};
let nodes;
let edges;
let network;
let semestersCount = 0;

// ===================== PUBLIC API =====================

function prepareGraphData(data) {
  semestersCount = data.career.totalSemesters;

  const subjectsBySemester = _groupSubjectsBySemester(
    data.subjects,
    semestersCount,
  );
  const semesterTitles = _createSemesterTitles();

  const created = _createSubjectNodes(subjectsBySemester);
  allSubjects = created.allSubjects;

  nodes = new vis.DataSet([...semesterTitles, ...created.nodesArray]);
  edges = new vis.DataSet(_createEdges(allSubjects));
}

function renderGraph(elementId) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const options = _createVisOptions();

  network = new vis.Network(element, { nodes, edges }, options);
  _setupNetworkEvents(network, allSubjects, nodes, edges);
  network.fit();
}

// ================= FUNCIONES AUXILIARES =================

function _createSubjectNodes(semesters) {
  const allSubjectsLocal = {};
  const nodesArray = [];

  for (let sem = 1; sem <= semestersCount; sem++) {
    const subjects = semesters[sem];
    const ids = Object.keys(subjects).sort((a, b) =>
      subjects[a].name.localeCompare(subjects[b].name),
    );

    const xBase = (sem - 1) * DIMENSIONS.SEMESTER_WIDTH;

    ids.forEach((id, i) => {
      const subject = subjects[id];

      allSubjectsLocal[id] = {
        ...subject,
        sem,
        pre: subject.prerequisites || [],
      };

      nodesArray.push({
        id,
        label: subject.name,
        group: `sem${sem}`,
        x: xBase,
        y: DIMENSIONS.NODE_START_Y + i * DIMENSIONS.NODE_SPACING_Y,
        ...NODE_COMMON_CONFIG,
      });
    });
  }

  return { allSubjects: allSubjectsLocal, nodesArray };
}

function _createEdges(allSubjectsLocal) {
  const edgesArray = [];

  for (const [id, subject] of Object.entries(allSubjectsLocal)) {
    for (const pre of subject.pre) {
      edgesArray.push({
        from: pre,
        to: id,
        ...EDGES_COMMON_CONFIG,
      });
    }
  }

  return edgesArray;
}

function _createSemesterTitles() {
  const titles = [];

  for (let i = 1; i <= semestersCount; i++) {
    titles.push({
      id: `title-sem-${i}`,
      label: `Semestre ${i}`,
      x: (i - 1) * DIMENSIONS.SEMESTER_WIDTH,
      ...SEMESTERS_TITLE_STYLE,
    });
  }

  return titles;
}

function _createVisOptions() {
  const groups = {};

  for (let i = 1; i <= semestersCount; i++) {
    const isEven = i % 2 === 0;
    groups[`sem${i}`] = {
      color: {
        background: isEven ? COLORS.NODE_BG_EVEN : COLORS.NODE_BG_ODD,
        border: COLORS.NODE_BORDER,
        highlight: {
          background: COLORS.NODE_HIGHLIGHT_BG,
          border: COLORS.NODE_HIGHLIGHT_BORDER,
        },
        hover: {
          background: COLORS.NODE_HIGHLIGHT_BG,
          border: COLORS.NODE_HIGHLIGHT_BORDER,
        },
      },
      font: { color: COLORS.NODE_TEXT },
    };
  }

  return {
    interaction: {
      hover: true,
      dragView: true,
      zoomView: true,
    },
    physics: false,
    layout: { hierarchical: false },
    groups,
    edges: {
      arrows: {
        to: {
          enabled: true,
          color: COLORS.EDGE_NORMAL, // Color fijo para flechas en opciones globales
        },
      },
      color: {
        color: COLORS.EDGE_NORMAL,
        highlight: COLORS.EDGE_NORMAL,
        hover: COLORS.EDGE_NORMAL,
        inherit: false, // Doble seguridad: no heredar colores
      },
    },
  };
}

// ================= EVENTOS =================

function _setupNetworkEvents(net, allSubs, nodesDs, edgesDs) {
  const isSemesterTitle = (nodeId) => String(nodeId).startsWith("title-sem-");

  net.on("hoverNode", (params) => {
    const id = params.node;
    if (isSemesterTitle(id)) return;

    const parents = _getAllParents(id, allSubs);
    const children = _getDirectChildren(id, allSubs);
    const relatedNodes = new Set([id, ...parents, ...children]);

    const nodeUpdates = nodesDs.map((node) => {
      if (isSemesterTitle(node.id)) return { id: node.id };

      if (node.id === id) {
        return { id: node.id, ...NODE_STYLE_HOVER };
      } else if (parents.has(node.id)) {
        return { id: node.id, ...NODE_STYLE_PARENT };
      } else if (children.has(node.id)) {
        return { id: node.id, ...NODE_STYLE_CHILD };
      } else {
        return { id: node.id, ...NODE_STYLE_DEFAULT_FADED };
      }
    });

    const edgeUpdates = edgesDs.map((edge) => {
      const fromRelated = relatedNodes.has(edge.from);
      const toRelated = relatedNodes.has(edge.to);
      const isHidden = !(fromRelated && toRelated);

      const style = { ...EDGES_COMMON_CONFIG };

      return {
        id: edge.id,
        color: style.color,
        width: style.width,
        hidden: isHidden,
      };
    });

    nodesDs.update(nodeUpdates.filter((u) => Object.keys(u).length > 1));
    edgesDs.update(edgeUpdates);
  });

  net.on("blurNode", () => {
    const allNodeUpdates = nodesDs.map((node) => {
      if (isSemesterTitle(node.id)) return { id: node.id };
      return {
        id: node.id,
        ...NODE_STYLE_BASE,
        opacity: 1,
      };
    });

    const style = { ...EDGES_COMMON_CONFIG };

    const allEdgeUpdates = edgesDs.map((edge) => ({
      id: edge.id,
      color: style.color,
      width: style.width,
      hidden: false,
    }));

    nodesDs.update(allNodeUpdates.filter((u) => Object.keys(u).length > 1));
    edgesDs.update(allEdgeUpdates);
  });
}

// ================= FUNCIONES PARA NODOS RELACIONADOS =================

// Búsqueda recursiva para obtener todos los pre-requisitos de un nodo. Utiliza "depth first
// search" para buscar los ancestros del nodo seleccionado.
function _getAllParents(id, allSubs, visited = new Set()) {
  if (visited.has(id)) return new Set();
  visited.add(id);

  const parents = new Set();

  const subject = allSubs[id];
  if (!subject || !subject.pre) return parents;

  for (const preId of subject.pre) {
    parents.add(preId);
    const grandParents = _getAllParents(preId, allSubs, visited);
    for (const gp of grandParents) parents.add(gp);
  }

  return parents;
}

// Obtiene todos los nodos que tengan como pre-requisito al nodo seleccionado
function _getDirectChildren(id, allSubs) {
  const children = new Set();

  for (const [sid, subj] of Object.entries(allSubs)) {
    if (subj.pre.includes(id)) children.add(sid);
  }

  return children;
}

// Agrupa las materias por semestre
function _groupSubjectsBySemester(subjects, count) {
  const grouped = {};
  for (let i = 1; i <= count; i++) grouped[i] = {};

  for (const [id, subject] of Object.entries(subjects)) {
    if (grouped[subject.semester]) {
      grouped[subject.semester][id] = subject;
    }
  }

  return grouped;
}
