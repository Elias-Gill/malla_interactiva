import cytoscape from "cytoscape";
import { applySemesterLayout } from "./layout.js";

export function createCurriculumGraph({
    container,
    curriculum,
    onNodeClick
}) {
    if (!container) {
        throw new Error("container is required");
    }

    if (!curriculum?.subjects) {
        throw new Error("invalid curriculum data");
    }

    const elements = [];

    // Nodes
    curriculum.subjects.forEach(subject => {
        elements.push({
            data: {
                id: subject.id,
                label: subject.name,
                semester: subject.semester,
                description: subject.description
            }
        });
    });

    // Edges (prerequisites)
    curriculum.subjects.forEach(subject => {
        (subject.prerequisites || []).forEach(prereqId => {
            elements.push({
                data: {
                    source: prereqId,
                    target: subject.id
                }
            });
        });
    });

    const cy = cytoscape({
        container,
        elements,
        style: [
            {
                selector: "node",
                style: {
                    "label": "data(label)",
                    "text-valign": "center",
                    "text-halign": "center",
                    "background-color": "#2563eb",
                    "color": "#ffffff",
                    "text-wrap": "wrap",
                    "text-max-width": 120,
                    "width": 140,
                    "height": 60,
                    "font-size": 12
                }
            },
            {
                selector: "edge",
                style: {
                    "width": 2,
                    "line-color": "#9ca3af",
                    "target-arrow-color": "#9ca3af",
                    "target-arrow-shape": "triangle",
                    "curve-style": "bezier"
                }
            }
        ],
        layout: { name: "preset" }
    });

    applySemesterLayout(cy);

    if (onNodeClick) {
        cy.on("tap", "node", evt => {
            onNodeClick(evt.target.data());
        });
    }

    return cy;
}
