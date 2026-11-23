// Genera un "whoosh" suave sintético en assets/sfx/whoosh.wav (ruido filtrado con barrido).
// Puedes reemplazarlo por cualquier otro archivo y cambiar el nombre en config.ts.

import fs from "node:fs";
import path from "node:path";
import { DIR } from "./herramientas";

const SR = 44100;
const DURACION = 0.9;
const n = Math.round(SR * DURACION);
const izq = new Float32Array(n);
const der = new Float32Array(n);

let semilla = 12345;
const ruido = () => {
  semilla = (semilla * 1664525 + 1013904223) >>> 0;
  return semilla / 2 ** 31 - 1;
};

let bajo1 = 0;
let bajo2 = 0;
let pasoBajo = 0;
for (let i = 0; i < n; i++) {
  const t = i / DURACION / SR; // 0..1
  // Envolvente: sube rápido y se apaga suave
  const env = t < 0.4 ? Math.sin((t / 0.4) * (Math.PI / 2)) ** 2 : Math.exp(-(t - 0.4) * 7);
  // Frecuencia de corte que sube y baja (efecto de "pasar")
  const corte = 250 + 2600 * Math.sin(Math.PI * Math.min(1, t * 1.15));
  const a = 1 - Math.exp((-2 * Math.PI * corte) / SR);
  const x = ruido();
  bajo1 += a * (x - bajo1);
  bajo2 += a * (bajo1 - bajo2);
  pasoBajo += 0.02 * (bajo2 - pasoBajo);
  const banda = bajo2 - pasoBajo; // quita graves retumbantes
  const muestra = banda * env * 0.9;
  const pan = t; // de izquierda a derecha
  izq[i] = muestra * Math.cos((pan * Math.PI) / 2);
  der[i] = muestra * Math.sin((pan * Math.PI) / 2);
}

const pico = Math.max(...izq.map(Math.abs), ...der.map(Math.abs)) || 1;
const datos = Buffer.alloc(n * 4);
for (let i = 0; i < n; i++) {
  datos.writeInt16LE(Math.round((izq[i] / pico) * 0.8 * 32767), i * 4);
  datos.writeInt16LE(Math.round((der[i] / pico) * 0.8 * 32767), i * 4 + 2);
}
const cab = Buffer.alloc(44);
cab.write("RIFF", 0);
cab.writeUInt32LE(36 + datos.length, 4);
cab.write("WAVE", 8);
cab.write("fmt ", 12);
cab.writeUInt32LE(16, 16);
cab.writeUInt16LE(1, 20);
cab.writeUInt16LE(2, 22);
cab.writeUInt32LE(SR, 24);
cab.writeUInt32LE(SR * 4, 28);
cab.writeUInt16LE(4, 32);
cab.writeUInt16LE(16, 34);
cab.write("data", 36);
cab.writeUInt32LE(datos.length, 40);

fs.mkdirSync(DIR.sfx, { recursive: true });
const destino = path.join(DIR.sfx, "whoosh.wav");
fs.writeFileSync(destino, Buffer.concat([cab, datos]));
console.log(`✓ ${destino}`);
