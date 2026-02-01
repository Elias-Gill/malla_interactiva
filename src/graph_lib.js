// ================= CONSTANTES DE DIMENSIONES =================

const DIMENSIONS = {
  SEMESTER_WIDTH: 300, // Ancho asignado por semestre
  NODE_START_Y: 80, // Posición vertical inicial de los nodos
  NODE_SPACING_Y: 90, // Separación vertical entre nodos
  NODE_MARGIN: 10, // Margen interno de los nodos
};

// ================= CONSTANTES DE COLORES =================

const COLORS = {
  NODE_TEXT: "#1f2937",
  NODE_BG: "#f9fafb",
  NODE_BORDER: "#6b7280",
  NODE_HIGHLIGHT_BG: "#fef3c7",
  NODE_HIGHLIGHT_BORDER: "#f59e0b",
  NODE_CHILD_BG: "#dbeafe",
  NODE_CHILD_BORDER: "#3b82f6",
  EDGE_NORMAL: "#9ca3af",
  EDGE_HOVER: "#111827",
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
  },
  borderWidth: 2,
  color: {
    background: COLORS.NODE_BG,
    border: COLORS.NODE_BORDER,
    highlight: {
      background: COLORS.NODE_HIGHLIGHT_BG,
      border: COLORS.NODE_HIGHLIGHT_BORDER,
    },
  },
};

const EDGES_COMMON_CONFIG = {
  arrows: "to",
  color: {
    color: COLORS.EDGE_NORMAL,
    opacity: COLORS.EDGE_OPACITY,
    highlight: COLORS.EDGE_HOVER,
  },
  width: 1.5,
  hoverWidth: 3,
};

const SEMESTERS_TITLE_STYLE = {
  y: 20,
  fixed: true,
  physics: false,
  font: {
    size: 18,
    bold: true,
    color: "#374151",
  },
  shape: "text",
};

// ================= ESTILOS DE NODOS =================

const NODE_STYLE_BASE = {
  font: {
    color: COLORS.NODE_TEXT,
    bold: false,
    size: FONTS.NODE_SIZE,
  },
  borderWidth: 2,
  opacity: 1,
};

const NODE_STYLE_DEFAULT = {
  color: {
    background: COLORS.NODE_BG,
    border: COLORS.NODE_BORDER,
  },
  ...NODE_STYLE_BASE,
};

const NODE_STYLE_DEFAULT_FADED = {
  opacity: 0.2,
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
  borderWidth: 3,
  opacity: 1,
};

const NODE_STYLE_PARENT = {
  color: {
    background: COLORS.NODE_HIGHLIGHT_BG,
    border: COLORS.NODE_HIGHLIGHT_BORDER,
  },
  font: {
    ...NODE_STYLE_BASE.font,
    bold: true,
  },
  borderWidth: 3,
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
  borderWidth: 3,
  opacity: 1,
};

// ================= ESTILOS DE ARISTAS (EDGES) =================

const EDGE_STYLE_DEFAULT = {
  color: COLORS.EDGE_NORMAL,
  opacity: COLORS.EDGE_OPACITY,
  width: 1.5,
  hidden: false,
};

const EDGE_STYLE_HOVER = {
  color: COLORS.EDGE_HOVER,
  opacity: 1,
  width: 2.5,
};

const EDGE_STYLE_PARENT = {
  color: COLORS.NODE_HIGHLIGHT_BORDER,
  opacity: 1,
  width: 3,
};

const EDGE_STYLE_CHILD = {
  color: COLORS.NODE_CHILD_BORDER,
  opacity: 1,
  width: 3,
};

// ================= VARIABLES GLOBALES =================

let allSubjects = {};
let nodes;
let edges;
let network;
let semestersCount = 0;

// ===================== PUBLIC API =====================

// Prepara los datos del grafo: nodos y aristas
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

// Renderiza el grafo en el elemento con el ID dado
function renderGraph(elementId) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const options = _createVisOptions();

  network = new vis.Network(element, { nodes, edges }, options);
  _setupNetworkEvents(network, allSubjects, nodes, edges);
  network.fit();
}

// ================= FUNCIONES AUXILIARES =================

// Crea nodos de materias organizados por semestre
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

      // Usar configuración común, añadiendo propiedades específicas por nodo
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

// Crea aristas entre materias según pre-requisitos
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

// Crea los títulos para cada semestre
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

// Opciones para la visualización de vis.js
function _createVisOptions() {
  return {
    interaction: {
      hover: true,
      dragView: true,
      zoomView: true,
    },
    physics: false,
    layout: { hierarchical: false },
    groups: Object.fromEntries(
      Array.from({ length: semestersCount }, (_, i) => [
        `sem${i + 1}`,
        {
          color: {
            background: COLORS.NODE_BG,
            border: COLORS.NODE_BORDER,
            highlight: {
              background: COLORS.NODE_HIGHLIGHT_BG,
              border: COLORS.NODE_HIGHLIGHT_BORDER,
            },
          },
          font: { color: COLORS.NODE_TEXT },
        },
      ]),
    ),
  };
}

// ================= EVENTOS =================

// Configura eventos para el grafo (hover y blur)
function _setupNetworkEvents(net, allSubs, nodesDs, edgesDs) {
  net.on("hoverNode", (params) => {
    const id = params.node;
    const parents = _getAllParents(id, allSubs);
    const children = _getDirectChildren(id, allSubs);
    const relatedNodes = new Set([id, ...parents, ...children]);

    // Preparar todos los updates de nodos
    const nodeUpdates = nodesDs.map((node) => {
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

    // Preparar todas las actualizaciones de estilos de aristas
    const edgeUpdates = edgesDs.map((edge) => {
      const fromInRelated = relatedNodes.has(edge.from);
      const toInRelated = relatedNodes.has(edge.to);

      if (fromInRelated && toInRelated) {
        let style = { ...EDGE_STYLE_HOVER };
        if (edge.to === id && parents.has(edge.from)) {
          style = { ...EDGE_STYLE_PARENT };
        } else if (edge.from === id && children.has(edge.to)) {
          style = { ...EDGE_STYLE_CHILD };
        }
        return {
          id: edge.id,
          color: { color: style.color, opacity: style.opacity },
          width: style.width,
          hidden: false,
        };
      } else {
        return { id: edge.id, hidden: true };
      }
    });

    // Aplicar batch updates (mejor performance)
    nodesDs.update(nodeUpdates);
    edgesDs.update(edgeUpdates);
  });

  net.on("blurNode", () => {
    // Resetear todos los nodos a estilo por defecto
    const allNodeUpdates = nodesDs.map((node) => ({
      id: node.id,
      ...NODE_STYLE_DEFAULT,
    }));

    // Resetear todas las aristas a estilo por defecto
    const allEdgeUpdates = edgesDs.map((edge) => ({
      id: edge.id,
      ...EDGE_STYLE_DEFAULT,
    }));

    nodesDs.update(allNodeUpdates);
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
