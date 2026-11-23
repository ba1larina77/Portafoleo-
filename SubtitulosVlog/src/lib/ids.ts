// Remotion solo acepta [a-zA-Z0-9-] en el id de una composición.
// Usamos el mismo id para los archivos dentro de public/.
export const idDesdeNombre = (nombre: string): string => {
  const limpio = nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return limpio || "video";
};
