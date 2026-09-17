### HTLM

HTMl es un leguaje que define la estructura y el contenido de una pagina web. Todo documento html tiene la siguiente estructura:
- **head** Que es donde va la metadata, el titulo de la pagina y enlaces a hojas de estilo(css).
- **body** Donde va todo el contenido visible, dentro de este se trabaja con etiquetas semnanticas y    |   estructurales 
como por ejemplo **<h1>**, **<bottom>**, etc...
- **Etiquetas** Tienen jerarquia y distintos tipos de uso, pueden ser contenedores, objetos o simplemente ayudar con el SEO **(Search Engine Optimization)** de la pagina describiendo el proposito del contenido.

### Etiquetas HTML más usadas

## Estructura del documento

<html>
<head>
<body>
<title>
<meta>
<link> (para enlazar CSS)

## Estructura semántica de la página

<header> — cabecera
<nav> — navegación
<main> — contenido principal
<section> — sección temática
<article> — contenido independiente, como un post
<aside> — contenido secundario, como una barra lateral
<footer> — pie de página
<div> — contenedor genérico, sin significado semántico

## Texto

<h1> a <h6> — títulos, de mayor a menor jerarquía
<p> — párrafo
<span> — texto en línea sin significado especial
<strong> — negrita con énfasis
<em> — cursiva con énfasis
<br> — salto de línea
<hr> — línea horizontal divisoria

## Listas

<ul> — lista no ordenada
<ol> — lista ordenada
<li> — elemento de la lista

## Enlaces e imágenes

<a href="..."> — enlace
<img src="..." alt="..."> — imagen
Tablas
<table>
<tr> — fila
<td> — celda
<th> — celda de encabezado

## Formularios

<form>
<input>
<textarea> — área de texto
<select> y <option> — menú desplegable
<button>
<label> — etiqueta asociada a un campo

Un concepto clave es que cada etiqueda puede tener atributos, como <id> (identificador unico) o <class> (sirve para agrupar elementos y asi poderles estilos o comportamientos en grupo, sin tener que hacerlo de uno en uno)

### CSS (Cascading Style Sheets)

CSS controla como se ve el HTML: Colores, espacios, posición, tipografía, etc... Se puede aplicar de tres formas
el linea con el atributo <style> en la etiqueta, dentro de una etiqueta <<style>> en el head, o la forma mas común en un archivo .css externo enlazado con <link rel="stylesheet" href="estilos.css">

La sintaxis básica es un selector seguido de declaraciones entre llaves: selector { propiedad: valor; }. Los selectores más usados son por etiqueta **(p { ... })**, por clase **(.mi-clase { ... })** y por id **(#mi-id { ... })**. También existen combinadores y pseudo-clases útiles como :**hover**, :**first-child** o :**nth-child()**.

Box model es un concepto que hace referencia a que todo elemento en un HTML  se representa mediante un caja compuesta por distintos componentes.

Para el layout, hoy en día se usan principalmente dos sistemas: Flexbox, ideal para alinear elementos en una fila o columna (**display: flex**, con propiedades como **justify-content** y **align-items**), y CSS Grid, ideal para layouts bidimensionales más complejos (**display: grid**, con **grid-template-columns** y **grid-template-rows**). Antes se usaba mucho float y position, pero Flexbox y Grid los reemplazaron en la mayoría de los casos.

Otros conceptos útiles: las unidades **(px fijo, % relativo al contenedor, em/rem relativos a tipografía, vh/vw relativos al viewport)**, las media queries para diseño responsive **(@media (max-width: 768px) { ... })**, y variables CSS **(--color-principal: #333; y luego color: var(--color-principal);)**.