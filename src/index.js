import cargarInterfaz from "./interface.js";
import crearCliente from "braulio-core";

window.onload = function(e) {
   const client = crearCliente("config.json", {
      clientId: clientId,
      apiKey: apiKey,
      hosted_domain: hosted_domain
   });
   cargarInterfaz(client);
   client.init();
}
