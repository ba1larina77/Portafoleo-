# Portafoleo

Repositorio personal: mezcla de apps de uso diario, apuntes de universidad y ejercicios de código.

## Panel Personal

[`panel/index.html`](panel/index.html) reúne las apps de uso diario en un solo lugar, sin modificar su código:

- **Impulso** ([`calendario/`](calendario/index.html)) — agenda anti-procrastinación
- **Finanzas** ([`finanzas/`](finanzas/index.html)) — finanzas personales
- **Inglés** ([`Ingles/`](Ingles/Learnenglish.html)) — tracker de progreso + [guía de gramática](Ingles/Estructura.md)
- **Libros** ([`Books/`](Books/Mbooks.html)) — librería de lectura

Acceso directo en el escritorio: **Panel Personal** (abre las 4 apps en una ventana sin barra de navegador).

`portafoleo2/` es el portafolio **público** (CV) y queda fuera del panel a propósito — audiencia distinta (reclutadores, no uso personal).

## Código y apuntes (se abren en editor, no en el panel)

| Carpeta | Contenido |
|---|---|
| [`NotalU/`](NotalU/) | Apuntes de clases (Auditoría, Constitución, Estadística, Ingeniería de Software 3, Sistemas Distribuidos, Ley 1273, matemáticas) |
| [`Phase 1/`](Phase%201/) | Ejercicios de algoritmos y estructuras de datos en Python, por patrón |
| [`7 proyectos/`](7%20proyectos/) | Prácticas de React (incluye proyecto Vite "Tienda") |
| [`c/`](c/) | Ejercicios de C++ |
| [`PosgrestSQL/`](PosgrestSQL/) | Diagrama ER (PlantUML) |
| [`edits/`](edits/) | Proyecto de edición de video (Remotion / React+TS) |

## Estructura del `.gitignore`

Ya no se ignoran carpetas completas. Solo se ignora lo que no debe versionarse en ningún proyecto: `node_modules/`, carpetas de build (`dist/`, `build/`, `out/`), binarios compilados (`*.exe`, `*.o`, `*.obj`) y basura de sistema operativo.
