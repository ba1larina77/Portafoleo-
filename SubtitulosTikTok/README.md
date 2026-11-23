# Subtítulos TikTok (Remotion)

Toma un video ya editado en CapCut (fondo + narración con voz de IA) y le agrega encima:
título animado, subtítulos animados coloreados según la voz (hombre / mujer),
palabras clave resaltadas, barra de progreso y un "whoosh". Todo sale de transcribir el audio.

## Instalación (una sola vez)

Necesitas Node.js 18 o superior. **No** hace falta instalar ffmpeg ni Python.

```bash
npm install
```

La primera vez que proceses un video se descargan whisper.cpp y el modelo `medium` (~1.5 GB) en `.whisper/`.

## Flujo

1. **CapCut** → exporta en vertical 1080x1920, **sin subtítulos**, en MP4.
2. Copia el archivo a `input/`, por ejemplo `input/historia1.mp4`.
3. (Opcional) Revisa el resultado en Remotion Studio:
   ```bash
   npm run studio
   ```
   Transcribe lo que falte y abre el Studio con una composición por video.
4. Renderiza:
   ```bash
   npm run render -- historia1
   ```
   o todos los videos de `input/` que aún no estén en `out/`:
   ```bash
   npm run render:all
   ```
5. **TikTok** → sube `out/historia1.mp4`. Tiene la misma resolución, fps, duración y audio que el original.

## Qué hace automáticamente

| Paso | Resultado |
|---|---|
| Transcripción (Whisper, español, palabra por palabra) | `captions/<nombre>.json`: se reutiliza y no se vuelve a transcribir |
| Voz de hombre / mujer (tono F0 por frase) | Azul / rosa. Si hay dos voces claramente distintas, el umbral se ajusta solo; si no, se usa `umbralHz` (165 Hz) |
| Título | Primera frase, hasta la primera pausa de más de 400 ms o el primer `.` / `?` |
| Palabras clave | Números, nombres propios y la lista de `config.ts` salen en blanco y más grandes |

## Correcciones manuales

- **Texto mal transcrito:** edita el campo `text` en `captions/<nombre>.json`. Puedes usar signos de puntuación: ayudan a detectar frases y no se muestran.
- **Título o voces:** crea `overrides/<nombre>.json` (hay un ejemplo en `overrides/ejemplo.json`):
  ```json
  {
    "palabrasTitulo": 7,
    "umbralHz": 170,
    "voces": [{ "desde": 12.5, "hasta": 20, "voz": "mujer" }]
  }
  ```
  Todos los campos son opcionales. Los tramos de `voces` se dan en segundos y mandan sobre la detección automática.
  Con `npm run studio` abierto, estos archivos se vigilan y se aplican solos; si no ves el cambio, recarga la página.

## Configuración (`config.ts`)

Aquí están los colores, la fuente (Montserrat Black o ExtraBold), los tamaños, las palabras por grupo, la posición (60 % de la altura), las zonas seguras de TikTok, el umbral de tono, el modelo de Whisper (`medium` o `large-v3`) y los extras: barra de progreso, whoosh y lista de palabras clave. Cada extra se activa o desactiva por separado.
Los cambios se ven al instante en el Studio. Solo `whisper.modelo` requiere volver a transcribir: borra `captions/<nombre>.json`.

El whoosh es `assets/sfx/whoosh.wav`, generado con `npm run whoosh`. Puedes reemplazarlo por otro archivo y cambiar `extras.whoosh.archivo`.

## Carpetas

```
input/      videos de CapCut (entrada)
captions/   transcripciones (editables)
overrides/  correcciones manuales opcionales
out/        videos finales
assets/sfx/ efectos de sonido
public/     generado automáticamente (no editar)
.cache/     audio extraído (se puede borrar)
```
