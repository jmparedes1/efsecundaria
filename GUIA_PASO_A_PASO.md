# Guía muy fácil para publicar y administrar PREMIR

No hace falta saber programar. Haz los pasos despacio y marca cada casilla cuando termines.

## Antes de empezar: una idea importante

Esta versión puede funcionar de dos formas:

- **Modo local:** es el más fácil. No tiene cuentas. Puedes ocultar y añadir tarjetas desde `admin.html`, descargar el catálogo y subirlo a GitHub. Es totalmente gratuito.
- **Modo Firebase:** sigue siendo gratuito mientras uses el plan Spark y sus límites. Tiene cuentas, alumnos pendientes o activos y cambios del catálogo en tiempo real.

En los dos modos los archivos HTML están publicados en GitHub. Ocultar una tarjeta no convierte su archivo en secreto. Una persona que conozca su dirección todavía puede abrirlo.

---

# PARTE 1 · Guardar una copia de la web antigua

1. Abre esta página: `https://github.com/jmparedes1/efsecundaria`
2. Pulsa el botón verde **Code**.
3. Pulsa **Download ZIP**.
4. Guarda ese ZIP en una carpeta llamada `COPIA ANTIGUA`.
5. No borres esa copia. Es tu botón de emergencia.

---

# PARTE 2 · Publicar primero el modo local, que es el más fácil

## Paso 1. Comprueba el modo

1. Abre el archivo `firebase-config.js` con el Bloc de notas.
2. Busca esta línea:

```js
mode: "local",
```

3. Si pone `local`, está bien.
4. Cierra el archivo sin cambiar nada.

## Paso 2. Sube la nueva web a GitHub

1. Entra en `https://github.com/jmparedes1/efsecundaria`.
2. Pulsa **Add file**.
3. Pulsa **Upload files**.
4. Abre en tu ordenador la carpeta de la nueva versión.
5. Selecciona todos sus archivos y la carpeta `assets`.
6. Arrástralos al cuadro grande de GitHub.
7. Espera hasta que termine la carga.
8. En el cuadro que dice **Commit changes**, escribe:

```text
Nueva portada y panel de administración gratuito
```

9. Pulsa el botón verde **Commit changes**.
10. Espera uno o dos minutos.
11. Abre `https://jmparedes1.github.io/efsecundaria/`.
12. Si todavía aparece la página vieja, pulsa `Ctrl + F5`.

## Paso 3. Usa el panel local

1. Abre `https://jmparedes1.github.io/efsecundaria/admin.html`.
2. Verás la lista de recursos.
3. Para ocultar uno, pulsa **Desactivar**.
4. Para mostrarlo otra vez, pulsa **Activar**.
5. Para cambiar el nombre o el enlace, pulsa **Editar**.
6. Para crear uno nuevo, pulsa **Añadir recurso**.

Los cambios todavía viven solo en ese navegador. Falta un último paso.

## Paso 4. Guarda los cambios del panel local

1. Pulsa **Descargar catálogo**.
2. Tu ordenador descargará un archivo llamado `resources.json`.
3. Vuelve al repositorio de GitHub.
4. Abre el archivo `resources.json` que ya existe.
5. Pulsa el dibujo del lápiz o el menú y elige **Upload files** para sustituirlo.
6. Sube el nuevo `resources.json` que acabas de descargar.
7. Pulsa **Commit changes**.
8. Espera uno o dos minutos.
9. Actualiza la web con `Ctrl + F5`.

Ya tienes un panel gratuito, aunque para publicar sus cambios debes sustituir el archivo `resources.json`.

---

# PARTE 3 · Activar Firebase gratuito

Haz esta parte solo cuando el modo local ya funcione.

## Paso 1. Crear el proyecto

1. Abre `https://console.firebase.google.com/`.
2. Entra con tu cuenta de Google.
3. Pulsa **Crear un proyecto** o **Add project**.
4. Escribe un nombre, por ejemplo `premir-recursos`.
5. Cuando pregunte por Google Analytics, elige **No**. No lo necesitamos.
6. Pulsa **Crear proyecto**.
7. Espera hasta que aparezca el botón **Continuar**.
8. Pulsa **Continuar**.

No elijas el plan Blaze. Quédate en el plan gratuito **Spark**.

## Paso 2. Crear la aplicación web

1. En la pantalla principal de Firebase, busca el dibujo `</>`.
2. Pulsa ese dibujo. Significa “aplicación web”.
3. Escribe el nombre `PREMIR Web`.
4. No marques Firebase Hosting. Ya usamos GitHub Pages gratis.
5. Pulsa **Registrar aplicación**.
6. Firebase mostrará un bloque parecido a este:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  appId: "..."
};
```

7. Deja esa página abierta. La usaremos más tarde.

## Paso 3. Activar las cuentas

1. En el menú de Firebase, pulsa **Authentication**.
2. Pulsa **Get started** o **Comenzar**.
3. Abre **Sign-in method** o **Método de acceso**.
4. Pulsa **Email/Password**.
5. Activa solamente la primera opción: **Correo electrónico/contraseña**.
6. Pulsa **Guardar**.
7. En Authentication, abre **Settings** o **Configuración**.
8. Busca **Authorized domains** o **Dominios autorizados**.
9. Pulsa **Add domain**.
10. Escribe exactamente:

```text
jmparedes1.github.io
```

11. Guarda.

## Paso 4. Crear la base de datos

1. En el menú de Firebase, pulsa **Firestore Database**.
2. Pulsa **Create database** o **Crear base de datos**.
3. Elige **Production mode** o **Modo de producción**.
4. Elige una región europea. Si dudas, elige la opción europea que Firebase te recomiende.
5. Pulsa **Enable** o **Habilitar**.
6. Espera hasta ver la base de datos vacía.

## Paso 5. Copiar las reglas de seguridad

1. En Firestore, abre la pestaña **Rules** o **Reglas**.
2. Abre en tu ordenador el archivo `firestore.rules` de esta nueva versión.
3. Selecciona todo su texto con `Ctrl + A`.
4. Cópialo con `Ctrl + C`.
5. Vuelve a Firebase.
6. Borra el texto que aparece en Rules.
7. Pega el texto con `Ctrl + V`.
8. Pulsa **Publish** o **Publicar**.

No uses reglas que digan `allow read, write: if true`. Eso dejaría la base abierta para cualquiera.

## Paso 6. Crear tu cuenta de profesor

1. Vuelve a **Authentication**.
2. Abre la pestaña **Users** o **Usuarios**.
3. Pulsa **Add user**.
4. Escribe tu correo.
5. Escribe una contraseña larga que no uses en otros sitios.
6. Pulsa **Add user**.
7. En la tabla aparecerá tu cuenta.
8. Copia el texto largo de la columna **User UID**. Es como el número de carnet de tu cuenta.

## Paso 7. Decir a Firebase que tú eres el administrador

1. Vuelve a **Firestore Database**.
2. Abre la pestaña **Data** o **Datos**.
3. Pulsa **Start collection** o **Iniciar colección**.
4. En **Collection ID**, escribe:

```text
admins
```

5. Pulsa **Next**.
6. En **Document ID**, pega el UID que copiaste antes.
7. Crea un campo:
   - Nombre: `role`
   - Tipo: `string`
   - Valor: `admin`
8. Pulsa **Save**.

## Paso 8. Conectar la web con Firebase

1. Abre `firebase-config.js` con el Bloc de notas.
2. Cambia:

```js
mode: "local",
```

por:

```js
mode: "firebase",
```

3. Copia los cuatro valores que Firebase te enseñó en el Paso 2.
4. El archivo debe quedar parecido a esto:

```js
export const APP_CONFIG = {
  mode: "firebase",
  firebaseSdkVersion: "12.17.1",
  firebase: {
    apiKey: "EL_VALOR_QUE_TE_DA_FIREBASE",
    authDomain: "EL_VALOR_QUE_TE_DA_FIREBASE",
    projectId: "EL_VALOR_QUE_TE_DA_FIREBASE",
    appId: "EL_VALOR_QUE_TE_DA_FIREBASE"
  }
};
```

5. Guarda el archivo.
6. Sube el nuevo `firebase-config.js` al repositorio de GitHub.
7. Pulsa **Commit changes**.
8. Espera uno o dos minutos.

La configuración web de Firebase puede estar en una página pública. La seguridad está en `firestore.rules`. Nunca subas una cuenta de servicio ni una clave privada.

## Paso 9. Cargar los 32 recursos en Firebase

1. Abre `https://jmparedes1.github.io/efsecundaria/admin.html`.
2. Entra con el correo y la contraseña del profesor.
3. Pulsa **Cargar los 32 recursos**.
4. Espera el mensaje de confirmación.
5. Abre la portada en otra pestaña.
6. Comprueba que aparecen los recursos.

---

# PARTE 4 · Dar acceso al alumnado

## Registrar un solo correo

1. Abre `admin.html`.
2. Pulsa la pestaña **Alumnado**.
3. Marca **Un correo**.
4. Escribe el correo del alumno o alumna.
5. Escribe la contraseña común acordada para el grupo.
6. Pulsa **Registrar alumnado**.
7. Cuando aparezca el símbolo ✓, esa persona ya puede entrar.

## Registrar muchos correos de una vez

1. Abre `admin.html` y pulsa **Alumnado**.
2. Marca **Varios correos**.
3. Pega los correos. Puedes poner uno por línea o separarlos con comas.
4. Escribe una sola vez la contraseña común del grupo.
5. Pulsa **Registrar alumnado**.
6. Espera hasta que cada correo tenga un símbolo ✓ o un mensaje que explique el problema.

La contraseña se utiliza para crear las cuentas, pero no se guarda en el código ni en el navegador.

## Entrar en la web

1. El alumno abre la portada.
2. Escribe el correo que registró el profesor.
3. Escribe la contraseña común.
4. Ya puede ver el catálogo.

---

# PARTE 5 · Quitar acceso a un alumno

1. Abre `admin.html`.
2. Pulsa **Alumnado**.
3. Busca al alumno.
4. Pulsa **Quitar acceso**.
5. El alumno dejará de entrar cuando vuelva a cargar la web.

Si quieres borrar por completo su cuenta:

1. Abre Firebase.
2. Entra en **Authentication → Users**.
3. Abre el menú de ese usuario.
4. Elige **Delete user**.

Quitar acceso desde el panel no borra la cuenta. Es más fácil recuperarla después.

---

# PARTE 6 · Activar o desactivar un recurso

1. Abre `admin.html`.
2. Busca el recurso.
3. Pulsa **Desactivar** para esconderlo de la portada.
4. Pulsa **Activar** para mostrarlo otra vez.

En modo Firebase el cambio se guarda inmediatamente. No hace falta volver a GitHub.

Recuerda: se oculta la tarjeta, pero el HTML sigue siendo público si alguien conoce la dirección exacta.

---

# PARTE 7 · Añadir un recurso nuevo

## Si es un archivo HTML nuevo

1. Sube primero el HTML al repositorio de GitHub.
2. Espera un minuto.
3. Abre `admin.html`.
4. Pulsa **Añadir recurso**.
5. Completa:
   - Nombre: el título que verá el alumno.
   - Identificador: palabras cortas sin espacios, por ejemplo `calentamiento-eso`.
   - Descripción: una frase sencilla.
   - Categoría: elige una.
   - Icono: puedes usar un emoji.
   - Archivo o enlace: por ejemplo `calentamiento-eso.html`.
   - Orden: 10 aparece antes que 20.
6. Deja marcada la casilla **Mostrar este recurso**.
7. Pulsa **Guardar**.

## Si es una página de otra web

En “Archivo o enlace” pega la dirección completa, empezando por `https://`.

Algunas páginas externas no permiten abrirse dentro de un visor. En ese caso se podrá usar el botón **Abrir aparte**.

---

# PARTE 8 · Cómo evitar pagar por accidente

1. Mantén el proyecto en el plan **Spark**.
2. No actives **Cloud Storage**.
3. No actives **Cloud Functions**.
4. No uses acceso por teléfono o SMS.
5. No actives Google Analytics si no lo necesitas.
6. Usa solo:
   - Authentication con correo y contraseña.
   - Firestore Database.
   - GitHub Pages.

Firebase tiene límites gratuitos. Para una web pequeña suelen ser suficientes, pero debes mirar de vez en cuando la pantalla **Usage** o **Uso**.

---

# PARTE 9 · Si algo sale mal

## La página sigue mostrando la versión antigua

1. Espera dos minutos.
2. Pulsa `Ctrl + F5`.
3. Prueba en una ventana privada.

## Firebase dice “permission denied”

1. Comprueba que publicaste el contenido de `firestore.rules`.
2. Comprueba que la colección se llama exactamente `admins`.
3. Comprueba que el documento de administrador tiene como nombre tu UID completo.

## El administrador no puede entrar

1. Comprueba el correo y la contraseña en Authentication.
2. Comprueba el UID del documento `admins`.
3. Comprueba que `jmparedes1.github.io` está en Authorized domains.

## El alumno no aparece en el panel

Pulsa **Actualizar lista**. Si todavía no aparece, vuelve a escribir su correo en **Registrar correos** y revisa el mensaje que sale debajo del formulario.

## Quiero volver atrás

1. Abre el repositorio de GitHub.
2. Pulsa **Commits**.
3. Busca la versión anterior.
4. También puedes usar el ZIP guardado en `COPIA ANTIGUA`.

---

# Lista final para comprobar

- [ ] Guardé una copia ZIP de la web antigua.
- [ ] La portada nueva se abre.
- [ ] Los 32 recursos aparecen.
- [ ] El buscador funciona.
- [ ] Los filtros funcionan.
- [ ] Los favoritos funcionan.
- [ ] `admin.html` se abre.
- [ ] Las reglas de Firestore están publicadas.
- [ ] Mi UID está dentro de la colección `admins`.
- [ ] Probé con una cuenta de alumno.
- [ ] Un correo no registrado no puede ver el catálogo.
- [ ] Un alumno activo sí puede verlo.
- [ ] Un alumno no puede abrir `admin.html`.
