export function applySemesterLayout(cy, columnWidth = 220, rowHeight = 100) {
    const semesterMap = new Map();

    cy.nodes().forEach(node => {
        const semester = node.data("semester");

        if (!semesterMap.has(semester)) {
            semesterMap.set(semester, []);
        }

        semesterMap.get(semester).push(node);
    });

    semesterMap.forEach((nodes, semester) => {
        nodes.forEach((node, index) => {
            node.position({
                x: semester * columnWidth,
                y: index * rowHeight
            });
        });
    });

    cy.fit();
}
