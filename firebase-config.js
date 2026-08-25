// MODO "local": funciona gratis y sin Firebase. El catálogo se lee de resources.json.
// MODO "firebase": activa cuentas, panel en tiempo real y sincronización de favoritos.
export const APP_CONFIG = {
  mode: "local",
  firebaseSdkVersion: "12.17.1",
  firebase: {
    apiKey: "",
    authDomain: "",
    projectId: "",
    appId: ""
  }
};
