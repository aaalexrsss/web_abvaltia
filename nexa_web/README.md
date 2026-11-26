# ABVALTIA — web pública

Alternativa independiente en FastAPI para sustituir la carpeta `nexa_web` cuando el código original no está disponible. Presenta la visión del proyecto en español, usa la paleta indicada y no expone registro, inicio de sesión ni paneles privados.

## Requisitos

- Windows 10 u 11
- Python 3.10 o posterior
- Una conexión a internet para instalar las dependencias

## Ejecutar en Windows

Abre PowerShell en esta carpeta y ejecuta:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn main:app --reload
```

Visita <http://127.0.0.1:8000>. Para detener el servidor, pulsa `Ctrl+C` en PowerShell.

Si colocas esta carpeta dentro del proyecto existente y ejecutas Uvicorn desde la carpeta superior, usa `uvicorn nexa_web.main:app --reload`.

Si PowerShell bloquea la activación del entorno, puedes omitir la activación y ejecutar:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn main:app --reload
```

## Asistente público

Sin `OPENAI_API_KEY` y `OPENAI_MODEL`, el asistente responde desde una base breve de preguntas y respuestas locales; la página lo indica como modo local. Para habilitar respuestas generativas, añade una clave propia y un modelo habilitado para tu cuenta a `.env`; el navegador nunca recibe la clave. Las preguntas se envían al servicio configurado para generar la respuesta, con `store` desactivado en la solicitud. Si el servicio externo no responde, la web vuelve a las respuestas locales. El asistente solo recibe el contexto público de ABVALTIA, no accede a cuentas ni datos de empresas. La ruta del asistente limita cada dirección de cliente a 16 preguntas por minuto en esta instancia.

## Contacto

El formulario no guarda ni transmite datos por sí solo. Para que el botón abra un correo dirigido a ABVALTIA, define `CONTACT_EMAIL` en `.env` con una dirección real. Antes de publicar la web, configura ese canal o reemplaza el formulario por un servicio de contacto que el equipo administre. Si despliegas detrás de un proxy o en varias instancias, configura también un límite de solicitudes en el proxy o en el servicio de alojamiento.

## Estado y alcance

La página deja claro que ABVALTIA está en desarrollo. Predicción de demanda, indicadores, panel privado y app móvil aparecen como ideas futuras por validar; no se presentan como funciones activas. La web no incluye registro, inicio de sesión ni acceso a dashboards.

El único recurso visual recibido fue una imagen de referencia de identidad, no archivos de logo independientes. La página usa una ventana CSS sobre el PNG original para mostrar el monograma que aparece en esa imagen; no se dispone de un SVG o archivo vectorial original. Cuando estén disponibles, se pueden reemplazar el PNG y el recorte por los activos oficiales sin rediseñar el sitio.
