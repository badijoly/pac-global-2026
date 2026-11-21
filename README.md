# Programa Acción Climática 2026 - Dashboard Global Consolidado

Plataforma analítica e interactiva de evaluación de aprendizajes y ganancia normalizada del **Programa Acción Climática 2026**, implementado en 15 establecimientos educacionales de la Región de Antofagasta, Chile.

**Sitio web en vivo**: [https://badijoly.github.io/pac-global-2026/](https://badijoly.github.io/pac-global-2026/)

---

## 1. Alcance y Cohorte Evaluada

El universo consolidado unifica los datos de la **Línea Verde** (biodiversidad terrestre, humedales y cielos oscuros) y la **Línea Azul** (biodiversidad marina y reducción de contaminación por plásticos):

- **Establecimientos Educacionales**: 15 colegios y liceos (7 Línea Verde + 8 Línea Azul).
- **Muestra Total de Evaluaciones Pareadas ($N$)**: 259 evaluaciones verificadas y auditadas folio a folio.
- **Estudiantes Únicos**: 143 estudiantes.
- **Rendimiento Favorable Global**: **85.7%** (222 de 259 participantes mejoraron o mantuvieron sus puntajes).
- **Línea Base Inicial Promedio (PRE)**: **55.8%**.
- **Nivel Logrado Final Promedio (POST)**: **71.1%**.
- **Avance Promedio Neto ($\Delta$)**: **+15.3%**.
- **Ganancia Normalizada de Hake Global ($G$)**: **0.35** (Zona de Ganancia Media según Richard Hake: $0.30 \le g < 0.70$, impacto educativo sustantivo).

---

## 2. Metodología de Homologación de Escalas

Para permitir un análisis unificado sin sesgos estadísticos debido a la longitud y naturaleza de los instrumentos:

1. **Línea Verde (5 Preguntas)**: Cuestionario de opción múltiple con escala discreta 0 a 5. Se homologa como:
   $$\text{Logro} (\%) = \left(\frac{\text{Puntaje Obtenido}}{5.0}\right) \times 100\%$$

2. **Línea Azul - Hito 3 Challwa (9 Puntos)**: Rúbrica analítica tridimensional de competencia marina (Escala 0 a 9). Se homologa como:
   $$\text{Logro} (\%) = \left(\frac{\text{Puntaje Rúbrica}}{9.0}\right) \times 100\%$$

3. **Línea Azul - Hito 4 Desierto Azul (4 Puntos)**: Rúbrica integrada de terreno y residuos (Escala 0 a 4). Se homologa como:
   $$\text{Logro} (\%) = \left(\frac{\text{Puntaje Rúbrica}}{4.0}\right) \times 100\%$$

4. **Invarianza de la Ganancia de Hake ($g$)**:
   $$g = \frac{\% \text{POST} - \% \text{PRE}}{100\% - \% \text{PRE}}$$
   Al ser una medida adimensional de ganancia relativa sobre el aprendizaje potencial, anula el efecto techo y permite comparar directamente grupos con diferentes niveles basales e instrumentos.

---

## 3. Funcionalidades del Dashboard

- **Filtros Dinámicos**:
  - Filtro por Establecimiento (15 colegios).
  - Filtro por Rol: Todos, Sólo Estudiantes, Sólo Profesores/Docentes.
  - Filtro por Género: Todos, Femenino, Masculino.
- **Gráficos Reactivos**:
  - Comparativa de Estado Inicial (% PRE) vs. Estado Final (% POST) por equipo escolar.
  - Evolución diferenciada por género (Femenino vs. Masculino).
- **Tabla Detallada con Búsqueda en Vivo**: Desglose escuela por escuela con badges por línea, número de evaluaciones, tasas favorables y niveles de Hake.

---

*Desarrollado para el Programa Acción Climática 2026 · Antofagasta, Chile.*
