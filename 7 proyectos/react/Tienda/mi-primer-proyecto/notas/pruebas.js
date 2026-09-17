//function saludar(nombre) {
//    return `hola, ${nombre}!`;
//}
//
//console.log(saludar ("mani"));

//const saludar = (nombre) => {
//    return `hola, ${nombre}!`;
//};
//
//const saludar2 = (nombre) => `hola, ${nombre}!`;
//
//const cuadrado = numero => numero * numero;
//
//const SaludoGen = () => "hola Mani";
//
//console.log(saludar("camila"));
//
//console.log(saludar2("Sergio"));
//
//console.log(cuadrado(8));
//
//console.log(SaludoGen());

//function saludar(nombre = "invitado") {
//return `Hola, ${nombre}`;
//}
//saludar(); // "Hola, invitado"
//
//function sumarTodo(...numeros) { // "rest parameter": junta argumentos en un array
//  return numeros.reduce((total, n) => total + n, 0);
//}
//console.log(sumarTodo(1, 2, 3, 4)); // 10

//function procesar (numero, callback){
//    return callback(numero);
//}
//
//procesar(5, (n) => n * 2);
//
//function multiplicador (factor){
//    return function (numero){
//        return numero * factor;
//    };
//}
//
//const duplicar = multiplicador(2);
//console.log(duplicar);
//duplicar(5);


//let global = "soy global";
//
//function ejemplo () {
//  let local = "soy local";
//  console.log(global); //Accesible
//  console.log(local); //Accesible
//}
//
////ejemplo();
////console.log(local); //Is dont defined out here

function CrearContador() {
  let cuenta = 0;

  return function (){
    cuenta++;
    return cuenta;
  };
}

const contador1 = CrearContador();
contador1();
contador1();

while 
console.log(contador1());

const contador2 =  CrearContador();
console.log(contador2());