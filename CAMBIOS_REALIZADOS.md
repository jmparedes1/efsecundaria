# Cambios realizados

- Se ha eliminado la contraseña compartida que estaba incluida en el JavaScript. La nueva contraseña común se escribe en el panel y no se guarda en el código.
- Se ha eliminado el bloqueo local de cinco minutos, que no aportaba seguridad real.
- Se ha sustituido la portada de casi 200 KB por archivos separados y mantenibles.
- El catálogo de 32 recursos está en `resources.json`.
- Se ha creado `admin.html` para activar, desactivar, editar y añadir recursos.
- Se ha añadido un modo Firebase opcional basado en el plan Spark.
- El modo Firebase admite cuentas pendientes o activas y administradores.
- El profesor puede registrar un correo o una lista completa de correos desde la pestaña **Alumnado**.
- El alta masiva elimina duplicados, comprueba los correos y muestra el resultado de cada cuenta.
- Se han añadido reglas de Firestore cerradas por defecto.
- Los favoritos se sincronizan con Firebase cuando hay una cuenta activa.
- Se han eliminado el contador externo CountAPI y la fecha de actualización escrita a mano.
- Se ha conservado el logo original de PREMIR.
- Se han añadido etiquetas, foco visible, navegación con teclado y reducción de movimiento.
- Se ha creado un diseño adaptable para ordenador, tableta y móvil.
- Al abrir un recurso, su dirección no se añade a la barra del navegador.
- El botón de apertura ampliada usa una ventana flotante dentro de PREMIR, sin mostrar otra barra de direcciones.
- Se ha bloqueado el menú del botón derecho en el portal y en los recursos alojados dentro de PREMIR.
- Se ha reservado el dominio gratuito `https://ef-premir.web.app` y se ha añadido la configuración de Firebase Hosting.

## Límite de la solución gratuita

Los HTML de los recursos siguen alojados en un repositorio y una web públicos. Firebase controla la entrada al portal y la visibilidad del catálogo, pero no puede impedir el acceso directo a esos archivos públicos. La protección completa necesita mover los archivos a un almacenamiento privado o servirlos desde un backend autenticado.

El bloqueo del botón derecho evita el menú habitual, pero no es una protección anticopia completa: un usuario con conocimientos técnicos todavía puede usar las herramientas del navegador u otros métodos.
