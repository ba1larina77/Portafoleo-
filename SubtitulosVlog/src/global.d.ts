// require.context de webpack (lo usa src/lib/datos.ts para leer los .txt en vivo)
interface ContextoWebpack {
  keys(): string[];
  (clave: string): unknown;
}
declare namespace NodeJS {
  interface Require {
    context(carpeta: string, recursivo: boolean, filtro: RegExp): ContextoWebpack;
  }
}
