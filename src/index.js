// Entry point de ejemplo de como usar esta libreria
import { createCurriculumGraph } from "./graph/createGraph.js";
import curriculum from "./data/example-curriculum.json";

const container = document.getElementById("graph");

createCurriculumGraph({
    container,
    curriculum,
    onNodeClick: subject => {
        console.log(subject);
        alert(
            `${subject.label}\n\nSemestre: ${subject.semester}\n\n${subject.description}`
        );
    }
});
