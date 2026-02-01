# Curriculum Graph (vis.js)

Visualizador de mallas curriculares universitarias basado en **vis.js**, con disposición por
semestres en columnas y relaciones de correlatividad entre materias.

El objetivo del proyecto es:

* Leer una malla académica desde un **JSON**
* Renderizar un **grafo dirigido**
* Organizar las materias por **semestre**
* Permitir **interacción** (hover para destacar relaciones)
* Mantener el código desacoplado para reutilizarlo como **librería**

## Tecnologías utilizadas

* **vis.js** – motor de grafos y redes
* **JavaScript ES Modules**
* **Vite** para entorno de desarrollo

## Estructura del proyecto

```
curriculum-graph/
├── index.html              # Página de ejemplo para pruebas
├── README.md
└── src
    ├── data
    │   └── example-curriculum.json  # Ejemplo de malla curricular
    └── graph_lib.js                 # Biblioteca principal del grafo
```

## Cómo correr el proyecto

### Requisitos

* Node.js 18+
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

## Uso de la librería

La librería `graph_lib.js` expone dos funciones principales:

```javascript
// 1. Preparar los datos del grafo
prepareGraphData(curriculumData);

// 2. Renderizar el grafo en un elemento del DOM con el id proporcionado
renderGraph('graph-container');
```

Ejemplo completo:

```html
<div id="graph-container" style="width: 100%; height: 600px;"></div>
<script type="module">
  import curriculumData from './data/IIN.json' assert { type: 'json' };
  import { prepareGraphData, renderGraph } from './src/graph_lib.js';
  
  prepareGraphData(curriculumData);
  renderGraph('graph-container');
</script>
```

## Colaboración - Cómo agregar una nueva malla curricular

### 1. Preparación inicial

1. **Forkea** el repositorio a tu cuenta de GitHub
2. **Clona** tu fork localmente:
   ```bash
   git clone https://github.com/TU_USUARIO/curriculum-graph.git
   cd curriculum-graph
   ```

### 2. Crear el archivo JSON de la malla

Cada carrera debe tener su propio archivo JSON con las siglas de la carrera en `src/data/`:

**Reglas importantes para el archivo JSON:**
- **Nombre del archivo**:
  Debe llamarse `SIGLAS.json` usando las siglas oficiales de la carrera (ej:
  `IIN.json`, `LCIK.json`, `PED.json`)
- **Coherencia de identificadores**:
  + El campo `id` dentro de `career` debe coincidir exactamente con las siglas del nombre del
    archivo
  + `totalSemestres` debe reflejar el número real de semestres que dura la carrera
- **Identificación de materias**:
  + Cada materia debe tener un **ID único** que es la clave del objeto dentro de `subjects`
  + El ID debe seguir este formato:
    - Todo en **minúsculas**
    - Sin **acentos** ni caracteres especiales
    - Con espacios simples
    - Números pasarlos a romanos en **mayúsculas** para niveles (I, II, III, IV, V, etc.)
    - Para electivas/optativas:
      `"electiva I"`, `"optativa II"`, etc. **Ejemplos de IDs correctos:**
        * `"matematica I"`
        * `"fisica II"`
        * `"analisis matematico III"`
        * `"electiva I"`
        * `"optativa II"`
- **Correlatividades**:
  + Los `prerequisites` son arrays de IDs de materias que deben cursarse previamente
  + Todos los IDs referenciados en `prerequisites` deben existir en la malla
  + Para materias sin prerrequisitos, usar array vacío `[]`
- **Creditos**:
  + `required_credits` representa los creditos necesarios para habilitar una materia
  + `credits` representa los creditos que dicha materia suma al ser completada
- **Organización**:
  + Mantener las materias ordenadas por semestre dentro del JSON
  + Asegurar que `semester` sea un número entre 1 y `totalSemestres`

**Ejemplo del Formato Requerido:**

```json
{
  "career": {
    "id": "IIN",
    "name": "Ingeniería Informática",
    "totalSemesters": 3,
    "totalCredits": 300
  },

  "subjects": {
    "matematica I": {
      "name": "Matemática I",
      "semester": 1,
      "credits": 5,
      "required_credits": 5,
      "weekly_hours": 5, 
      "desc": "Álgebra básica, conjuntos, funciones y sistemas de ecuaciones.",
      "prerequisites": []
    },

    ... mas materias

    "matematica II": {
      "name": "Programación I",
      "semester": 2,
      "weekly_hours": 5, 
      "credits": 4,
      "required_credits": 5,
      "desc": "Mas matematica aburrida",
      "prerequisites": ["matematica I"]
    },
  }
}
```


### 3. Probar localmente

1. Puedes modificar `index.html`, pero **esos cambios no los subas en el commit**:
2. Ejecuta `npm run dev` y verifica que:
   - Todas las materias se muestran
   - Los prerrequisitos están correctamente conectados
   - No hay errores en la consola

### 4. Crear Pull Request

1. **Agrega y commitea** tus cambios:
   ```bash
   git add src/data/IIN.json
   git commit -m "Agrega malla curricular de Ingeniería Informática (IIN)"
   ```
2. **Sube los cambios** a tu fork:
   ```bash
   git push origin agregar-malla-IIN
   ```
3. **Ve a GitHub** y crea un Pull Request desde tu fork hacia el repositorio original.
4. Agrega un **screenshot** de la malla que acabas de cargar dentro de la descripcion del PR.

### 5. Relacionar con Issue

**IMPORTANTE:** Cada PR debe tener un Issue asociado.
Dichos issues ya se encontraran generados en el repositorio, tu debes hacer referencia a estos
issues de la siguiente manera.

En tu Pull Request, en la descripción del PR, menciona el Issue que resuelves:

> Esta PR agrega la malla curricular de Ingeniería Informática.
> 
> - Agrega archivo IIN.json con 42 materias
> - Cubre 10 semestres académicos
> - Incluye todas las correlatividades
> 
> Resolves #12          <-- La parte importante!!!

Para mas informacion puedes leer este
[articulo](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue).

## Proceso de revisión

Una vez creado el PR, un maintainer revisará y aprobará el merge si todo está correcto.

Si hay correcciones necesarias, se te pedirá en un comentario dentro del PR.
Realiza los cambios en tu fork y súbelos; el PR se actualizará automáticamente.

## Notas importantes

- **No modifiques** `graph_lib.js` a menos que sepas lo que haces
- Los archivos JSON deben ser válidos
- Mantén las materias ordenadas por semestre dentro del JSON
- Verifica que todos los prerrequisitos referenciados existan en la malla
- Si una materia no tiene prerrequisitos, usa array vacío `[]`

## Problemas comunes y soluciones

### "ID de prerrequisito no encontrado"
Verifica que el ID en `prerequisites` coincida exactamente con el ID de la materia (incluyendo
mayúsculas/minúsculas).

### "Materia fuera de rango de semestres"
Asegúrate que `semester` no sea mayor que `totalSemestres`.

### "El grafo no se renderiza"
Revisa la consola del navegador para errores y verifica que:
- El JSON es válido
- El contenedor del grafo existe en el DOM
- Vis.js está cargado correctamente
- Actualizaste el `index.html` correctamente
