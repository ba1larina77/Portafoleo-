## JavaScript 

Es un lenguaje de programación interpretado dinámico(significa que realiza gran parte de sus tareas y decisiones —como asignar tipos a las variables, cambiar estructuras de objetos o añadir funciones—durante la ejecución del programa) y multiparadigma (soporta programación orienta a objetos y funcional).

JavaScript sigue el estándar ECMAScript (ES). Cuando escuches "ES6" o "ES2015", se refieren a una versión del estándar que introdujo let, const, arrow functions, clases, módulos, etc. Desde entonces, sale una nueva versión cada año (ES2016, ES2017...). React usa JavaScript moderno (ES6+) todo el tiempo.

## 1.Variables var, let, const

var nombre = "Ana";     // forma antigua, evita usarla
let edad = 25;          // valor que puede cambiar
const PI = 3.1416;      // valor que NO puede reasignarse

**Importante**: const no significa que el valor sea "inmutable" en todos los casos. Si const guarda un objeto o array, su contenido sí se puede modificar, solo no puedes reasignar la variable a otro objeto/array distinto.

**En react moderno se usa muchos <const> pocar veces <let> y casi nunca <var>**

## 2. Tipos de datos

1. Primitivos

let texto = "Hola mundo";        // string
let numero = 42;                 // number (JS no distingue enteros de decimales)
let decimal = 3.14;              // number
let esVerdadero = true;          // boolean
let indefinido;                  // undefined (variable declarada sin valor)
let vacio = null;                // null (ausencia intencional de valor)
let id = Symbol("id");           // symbol (poco común, identificadores únicos)
let numeroGrande = 123456789012345678901234567890n; // bigint

2. Objeto

let arreglo = [1, 2, 3];                  // array (es un tipo de objeto)
let objeto = { clave: "valor" };          // objeto literal
let funcion = function () {};             // las funciones también son objetos
let fecha = new Date();                   // Date

## Conversion:

"5" + 3;      // "53"  → el + con un string concatena
"5" - 3;      // 2     → el - fuerza conversión a número
"5" * "2";    // 10
true + 1;     // 2     → true se convierte en 1
false + 1;    // 1

# Para convertir explicitamente

Number("42");     // 42
String(42);       // "42"
Boolean(0);       // false
Boolean("");      // false
Boolean("hola");  // true

**<falsy> y <truthy> son valores que no son booleanos pero se comportan como tal**

# Comparaciones

5 == "5";    // true  → compara valor, convierte tipos (evítalo)
5 === "5";   // false → compara valor Y tipo (usa siempre este)
5 !== "5";   // true
5 > 2;       // true
5 <= 5;      // true

# Logicos 

true && false;   // false (AND)
true || false;   // true  (OR)
!true;           // false (NOT)

// Muy usado en React para renderizado condicional:
const estaLogueado = true;
**estaLogueado && console.log("Bienvenido"); // se ejecuta solo si es true**

# Operadores modernos utiles

// Nullish coalescing: usa el valor de la derecha SOLO si la izquierda es null o undefined
let usuario = null;
let nombre = usuario ?? "Invitado"; // "Invitado"

// Optional chaining: accede a propiedades anidadas sin que explote si algo no existe
const persona = { direccion: { ciudad: "Bogotá" } };
console.log(persona.direccion?.ciudad);      // "Bogotá"
console.log(persona.telefono?.numero);       // undefined (no lanza error)

**?? devuelve el lado derecho de la sentencia siempre y cuando el lado izquiero sea null**
**? es como un if, devuelve izquierda si cumple, derecha si no**

## Estrcuturas de control if/else

const edad = 20;

if (edad >= 18) {
  console.log("Es mayor de edad");
} else if (edad >= 13) {
  console.log("Es adolescente");
} else {
  console.log("Es niño");
}

## operador ternario (muy usado en react para renderizado condicional)

const mensaje = edad >= 18 ? "mayor de edad" : "menor de edad";

# switch

const dia = "lunes";

switch (dia) {
  case "lunes":
    console.log("Inicio de semana");
    break;
  case "viernes":
    console.log("¡Casi fin de semana!");
    break;
  default:
    console.log("Día normal");
}

# Bucles

// for clásico
for (let i = 0; i < 5; i++) {
  console.log(i); // 0,1,2,3,4
}

// while
let i = 0;
while (i < 5) {
  console.log(i);
  i++;
}

// for...of → recorre VALORES de un array/string (el más usado hoy en día)
const frutas = ["manzana", "pera", "uva"];
for (const fruta of frutas) {
  console.log(fruta);
}

// for...in → recorre CLAVES de un objeto (menos común, cuidado al usarlo en arrays)
const persona = { nombre: "Ana", edad: 25 };
for (const clave in persona) {
  console.log(clave, persona[clave]);
}

## Funciones

# Declaración de funciones:

funtion saludar(nombre) {
    return `hola, ${nombre}!`;
}

saludar ("mani");

# Expresion de funcion

const saludar = function (nombre) {
  return `Hola, ${nombre}!`;
};

# Arrow functions (funcion flecha)

const saludar = (nombre) => {
  return `Hola, ${nombre}!`;
};

// Si el cuerpo es una sola expresión, puedes omitir { } y return:
const saludar2 = (nombre) => `Hola, ${nombre}!`;

// Con un solo parámetro, los paréntesis son opcionales:
const cuadrado = numero => numero * numero;

// Sin parámetros:
const saludoGenerico = () => "¡Hola!";

**Arrow functions son la forma estandar de escribir <componentes> y <manejadores> de eventos en React.**

const Boton = () => {
  const manejarClic = () => {
    console.log("¡Clic!");
  };

  return <button onClick={manejarClic}>Haz clic</button>;
};

# Scope ans clousures

The scope determines where a variable is accessible.

---

let global = "soy global";

function ejemplo () {
  let local = "soy local";
  console.log(global); //Accesible
  console.log(glogabl); //Accesible
}

ejemplo();
console.log(local); //Is dont defined out here

<Normal scope of any programming language>

---
with let/const, each block {} (if, for, function) create his own scope.

if (true) {
  let x = 10;
}
console.log(x); // ❌ Error, x no existe fuera del bloque

# Clousures

A clousure occurs when a function "remember" the varibles to the environment  where was create, even after the enviroment finish to executing. That is one of the most important JS concepts.

`function CrearContador() {
  let cuenta = 0;

  return function (){
    cuenta++;
    return cuenta;
  };
}

const contador1 = CrearContador();
contador1();














**Preguntas**
 Diferencia entre declaracion y expresion de funcion