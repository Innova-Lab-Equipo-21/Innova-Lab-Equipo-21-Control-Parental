// ==============================================================================
// Proyecto: BA Protege+
// Componente: Script de automatización de copia de APK
// Archivo: frontend/scripts/copy-apk.js
// Descripción: Copia el APK generado (app-debug.apk) hacia la carpeta de la landing
//              (frontend/landing/assets/apk/ba-protege-release.apk).
// ==============================================================================

const fs = require('fs');
const path = require('path');

const sourceApk = path.resolve(__dirname, '../android/app/build/outputs/apk/debug/app-debug.apk');
const targetDir = path.resolve(__dirname, '../landing/assets/apk');
const targetApk = path.resolve(targetDir, 'ba-protege-release.apk');

if (!fs.existsSync(sourceApk)) {
  console.warn(`⚠️ [BA Protege+] No se encontró el APK de origen en:`);
  console.warn(`   ${sourceApk}`);
  console.warn(`   Asegúrate de haber ejecutado la compilación primero (npm run build:apk o ./gradlew assembleDebug).`);
  process.exit(1);
}

try {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  fs.copyFileSync(sourceApk, targetApk);
  const stats = fs.statSync(targetApk);
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
  const dateFormatted = new Date(stats.mtime).toLocaleTimeString();

  console.log(`🚀 [BA Protege+] ¡APK copiada exitosamente a la landing!`);
  console.log(`   Destino: ${targetApk}`);
  console.log(`   Tamaño:  ${sizeMb} MB | Última modificación: ${dateFormatted}`);
} catch (error) {
  console.error(`❌ [BA Protege+] Error al copiar el APK:`, error.message);
  process.exit(1);
}
