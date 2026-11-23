# Subtítulos para vlogs (Remotion)

Agrega **solo subtítulos animados** a un vlog ya editado. No cambia nada más: misma resolución, fps, duración, y el audio se copia sin tocar.
**Nada se renderiza sin tu visto bueno.**

## Instalación (una vez)

```bash
npm install
```

No hace falta instalar ffmpeg ni Python. whisper.cpp y el modelo `medium` ya están en `.whisper/`
(si cambias a `large-v3` en `config.ts`, se descarga solo la primera vez, ~3 GB).

## Flujo paso a paso

1. **Pon tu vlog** en `input/`, por ejemplo `input/paseo.mp4`.

2. **Transcribe y revisa:**
   ```bash
   npm run subtitular -- paseo
   ```
   Transcribe con Whisper (usando `glosario.txt`), aplica `correcciones.json`, crea
   `subtitulos/paseo.txt` y abre Remotion Studio con ese video. **No renderiza.**

3. **Edita `subtitulos/paseo.txt`** con cualquier editor y guarda. Studio se actualiza solo.
   ```
   00:12.40 - 00:13.85 | TE VOY A CONTAR
   ```
   - Cambia, agrega o borra palabras. Si cambias cuántas palabras hay, el tiempo de la línea se reparte según el largo de cada palabra.
   - **Dividir:** pasa parte del texto a una línea nueva justo debajo, sin tiempos.
   - **Unir:** deja una sola línea con el inicio de la primera y el fin de la segunda.
   - **Quitar:** borra la línea entera. Las líneas con `#` se ignoran.
   - Puedes cambiar los tiempos a mano; si no los tocas, se usan los de Whisper.
   - Si algo está mal escrito, Studio y la terminal te dicen la línea y el problema.
   - Arriba a la izquierda del Studio ves el estado: errores, *Sin aprobar* o *✓ Aprobado* (esa etiqueta no sale en el video).

4. **Aprueba:**
   ```bash
   npm run aprobar -- paseo
   ```
   Guarda un hash del `.txt` en `aprobados.json` y te **propone** correcciones para
   `correcciones.json` y palabras para `glosario.txt` según lo que corregiste. Solo se agrega lo que elijas.

5. **Renderiza (lo haces tú):**
   ```bash
   npm run render -- paseo
   ```
   Sale en `out/paseo.mp4`. Se niega si el video no está aprobado o si el `.txt` cambió después de aprobarlo
   (en ese caso, vuelve al paso 4).

## Opciones de `subtitular`

| Opción | Qué hace |
| --- | --- |
| `--regenerar` | Crea el `.txt` de nuevo (el tuyo queda en `.txt.bak`) |
| `--retranscribir` | Vuelve a pasar Whisper, por ejemplo tras ampliar el glosario |
| `--modelo large-v3` | Usa otro modelo solo esta vez |
| `--sin-studio` | No abre Remotion Studio |

Si ya existe el `.txt`, `subtitular` **nunca** lo pisa: solo abre Studio.

## Archivos

- `config.ts`: colores, fuente, tamaño, posición, palabras por grupo, animación y calidad.
- `glosario.txt`: nombres y palabras que Whisper debe reconocer (una por línea).
- `correcciones.json`: `"lo que escribe Whisper": "lo correcto"`, por ejemplo `"haber": "a ver"`.
- `captions/<nombre>.raw.json`: transcripción cruda (no se vuelve a transcribir).
- `captions/<nombre>.base.json`: datos del video y tiempos por palabra. No lo edites.
- `subtitulos/<nombre>.txt`: **el que editas tú**.
- `aprobados.json`: lo escribe `npm run aprobar`.
