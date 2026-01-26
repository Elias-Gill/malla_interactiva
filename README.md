# Curriculum Graph (Cytoscape.js)

Visualizador de mallas curriculares universitarias basado en **Cytoscape.js**, con disposición
por semestres en columnas y relaciones de correlatividad entre materias.

El objetivo del proyecto es:

* Leer una malla académica desde un **JSON**
* Renderizar un **grafo dirigido**
* Organizar las materias por **semestre**
* Permitir **interacción** (click + modal con información)
* Mantener el código desacoplado para reutilizarlo como **librería**

## Tecnologías utilizadas

* **Cytoscape.js** – motor de grafos
* **JavaScript ES Modules**
* **HTML + CSS** (sin framework UI por ahora)

Se utiliza Vite para simplificar el entorno de desarrollo.

## Cómo correr el proyecto

### Requisitos

* Node.js 18+ recomendado
* npm

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

Vite levantará el servidor en:

```
http://localhost:5173/
```

Abrí esa URL en el navegador.

---

## Estructura del proyecto

```
curriculum-graph/
├─ index.html              # Entry point (requerido por Vite)
├─ package.json
├─ src/
│  ├─ index.js             # Bootstrap de la app
│  ├─ graph/
│  │  ├─ initGraph.js      # Inicialización de Cytoscape
│  │  └─ loadCurriculum.js # Función que convierte JSON → grafo
│  └─ data/
│     └─ curriculum.example.json
```

### Filosofía

* `graph/` contiene código reutilizable (pensado como librería)
* `data/` contiene únicamente datos
* `index.js` solo como entry point de pruebas

## Flujo de funcionamiento

1. `index.html` define el contenedor del grafo
2. `index.js`:
   * importa el JSON
   * inicializa Cytoscape
   * carga el curriculum
   * 
3. `loadCurriculum.js`:
   * transforma materias en **nodes**
   * transforma correlatividades en **edges**
4. Cytoscape:
   * renderiza el grafo
   * aplica layout por columnas (semestres)

## Estructura del JSON de malla curricular

Archivo ejemplo:
`src/data/curriculum.example.json`

```json
{
  "career": {
    "id": "cs",
    "name": "Ingeniería Informática"
  },
  "subjects": [
    {
      "id": "alg1",
      "name": "Álgebra I",
      "semester": 1,
      "description": "Álgebra básica para ingeniería",
      "prerequisites": []
    },
    {
      "id": "alg2",
      "name": "Álgebra II",
      "semester": 2,
      "description": "Álgebra lineal",
      "prerequisites": ["alg1"]
    },
    {
      "id": "prog1",
      "name": "Programación I",
      "semester": 1,
      "description": "Introducción a la programación",
      "prerequisites": []
    },
    {
      "id": "prog2",
      "name": "Programación II",
      "semester": 2,
      "description": "Programación estructurada",
      "prerequisites": ["prog1"]
    }
  ]
}
```

### Campos de cada materia

| Campo           | Tipo     | Descripción                  |
| --------------- | -------- | ---------------------------- |
| `id`            | string   | Identificador único          |
| `name`          | string   | Nombre visible               |
| `semester`      | number   | Semestre (columna)           |
| `description`   | string   | Información extendida        |
| `prerequisites` | string[] | IDs de materias correlativas |

## Layout por semestres

* Cada **semestre es una columna**
* La posición X se calcula como:

```
x = semester * columnWidth
```

Esto permite:

* lectura clara de progresión académica
* fácil customización futura (layout propio)

## Próximos pasos naturales

* Layout automático por filas dentro del semestre
* Modal real en vez de `alert`
* Exportación como librería standalone
* Integración con Tailwind / temas
