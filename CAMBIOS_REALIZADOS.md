# Cambios realizados

- Se ha eliminado la contraseña compartida incluida en el JavaScript.
- Se ha eliminado el bloqueo local de cinco minutos, que no aportaba seguridad real.
- Se ha sustituido la portada de casi 200 KB por archivos separados y mantenibles.
- El catálogo de 32 recursos está en `resources.json`.
- Se ha creado `admin.html` para activar, desactivar, editar y añadir recursos.
- Se ha añadido un modo Firebase opcional basado en el plan Spark.
- El modo Firebase admite cuentas pendientes o activas y administradores.
- Se han añadido reglas de Firestore cerradas por defecto.
- Los favoritos se sincronizan con Firebase cuando hay una cuenta activa.
- Se han eliminado el contador externo CountAPI y la fecha de actualización escrita a mano.
- El logo se sirve desde el propio repositorio y no desde una web ajena.
- Se han añadido etiquetas, foco visible, navegación con teclado y reducción de movimiento.
- Se ha creado un diseño adaptable para ordenador, tableta y móvil.
- Se han añadido enlaces directos estables mediante `#identificador-del-recurso`.
- Se ha conservado el visor central y el botón para abrir cada recurso aparte.

## Límite de la solución gratuita

Los HTML de los recursos siguen alojados en un repositorio y una web públicos. Firebase controla la entrada al portal y la visibilidad del catálogo, pero no puede impedir el acceso directo a esos archivos públicos. La protección completa necesita mover los archivos a un almacenamiento privado o servirlos desde un backend autenticado.

