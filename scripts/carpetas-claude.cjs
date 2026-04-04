const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.join(__dirname, ".."); // raíz del proyecto
const DEST_DIR = path.join(ROOT_DIR, "claude_files");

if (!fs.existsSync(DEST_DIR)) {
  fs.mkdirSync(DEST_DIR);
}

const INCLUDE_DIRS = ["app", "components", "core", "stores", "utils"];
const INCLUDE_FILES = ["INSTALL.md", "package.json", "readme.md", "todo.md"];

function copyFilesFlat(src, dest) {
  try {
    const items = fs.readdirSync(src);
    for (const item of items) {
      const fullPath = path.join(src, item);
      
      // Verificar si el archivo existe antes de hacer stat
      if (!fs.existsSync(fullPath)) {
        console.log("No existe:", fullPath);
        continue;
      }
      
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        copyFilesFlat(fullPath, dest); // recursivo
      } else {
        const destPath = path.join(dest, item);
        try {
          fs.copyFileSync(fullPath, destPath);
          console.log("Copiado:", fullPath, "→", destPath);
        } catch (err) {
          console.log("Error al copiar:", fullPath, "-", err.message);
        }
      }
    }
  } catch (err) {
    console.log("Error al leer directorio:", src, "-", err.message);
  }
}

// copiar archivos de carpetas (plano)
for (const dir of INCLUDE_DIRS) {
  const srcPath = path.join(ROOT_DIR, dir);
  if (fs.existsSync(srcPath)) {
    copyFilesFlat(srcPath, DEST_DIR);
  }
}

// copiar archivos raíz
for (const file of INCLUDE_FILES) {
  const srcPath = path.join(ROOT_DIR, file);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, path.join(DEST_DIR, file));
    console.log("Copiado archivo raíz:", file);
  }
}
