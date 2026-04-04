// renombrar-iconos-2.mjs
import fs from "fs";
import path from "path";

const mapping = {
  "icon8.png": "Mandarina del Mal.png",
  "icon6.png": "Viejo Trippy.png",
  "icon1.png": "Cucaracha Premium.png",
  "icon18.png": "Margarita del Inframundo.png",
  "icon9.png": "Aracnida de Lujo.png",
  "icon2.png": "Kraken de Tierra.png",
  "icon13.png": "Petunia Poseída.png",
  "icon11.png": "Culebra con Hambre Existencial.png",
  "icon21.png": "Ghost Rider de Barrio.png",
  "icon26.png": "Alien de Heladera.png",
  "icon23.png": "Mineral Alucinante.png",
  "icon24.png": "Slime con Sombrero.png",
  "icon47.png": "Fénix de Descuento.png",
  "icon46.png": "Canguro Depresivo.png",
  "icon36.png": "Tanque con Ansiedad.png",
  "icon44.png": "Enanito del Bosque Sangriento.png",
  "icon45.png": "Jack el Resacoso.png",
  "icon17.png": "Brocoli del Mal.png",
  "icon12.png": "Seta con Trauma.png",
  "icon28.png": "Slime Tragón.png",
  "icon31.png": "Peludo del Subsuelo.png"
};

const carpetas = [
  "C:/Users/User/Desktop/Proyectos/ControlGames/AFK-GAME/assets/sprites/monsters/PNG/Background",
  "C:/Users/User/Desktop/Proyectos/ControlGames/AFK-GAME/assets/sprites/monsters/PNG/Transperent"
];

function renombrar(carpeta) {
  for (const [viejo, nuevo] of Object.entries(mapping)) {
    const rutaVieja = path.join(carpeta, viejo);
    const rutaNueva = path.join(carpeta, nuevo);

    if (fs.existsSync(rutaVieja)) {
      fs.renameSync(rutaVieja, rutaNueva);
      console.log(`✔ ${viejo} → ${nuevo}`);
    } else {
      console.log(`✘ No encontrado: ${viejo} en ${carpeta}`);
    }
  }
}

carpetas.forEach(renombrar);
