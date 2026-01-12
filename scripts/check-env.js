// Script para verificar variables de entorno durante el build
// Ejecutar: node scripts/check-env.js

console.log('🔍 Verificando variables de entorno...\n');

const requiredVars = [
  'VITE_GEMINI_API_KEY',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_ADMIN_PASSWORD'
];

let found = 0;
let missing = 0;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
    found++;
  } else {
    console.log(`❌ ${varName}: NO ENCONTRADA`);
    missing++;
  }
});

console.log(`\n📊 Resumen: ${found} encontradas, ${missing} faltantes`);

if (missing > 0) {
  console.log('\n⚠️  Algunas variables no están configuradas.');
  console.log('   En Cloudflare Pages, asegurate de que las variables estén marcadas como "Available in Build"');
  process.exit(1);
} else {
  console.log('\n✅ Todas las variables están configuradas correctamente');
  process.exit(0);
}
