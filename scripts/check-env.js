// Script para verificar variables de entorno durante el build
// Ejecutar: node scripts/check-env.js

console.log('🔍 Verificando variables de entorno...\n');

const requiredVars = [
  'VITE_GEMINI_API_KEY',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_ADMIN_PASSWORD'
];

const optionalVars = [
  'VITE_RESEND_API_KEY'
];

let found = 0;
let missing = 0;

console.log('📋 Variables requeridas:');
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

console.log('\n📋 Variables opcionales:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`⚠️  ${varName}: NO ENCONTRADA (opcional)`);
  }
});

console.log(`\n📊 Resumen: ${found}/${requiredVars.length} variables requeridas encontradas, ${missing} faltantes`);

if (missing > 0) {
  console.log('\n⚠️  Algunas variables requeridas no están configuradas.');
  console.log('   En Cloudflare Pages, asegurate de que las variables estén marcadas como "Available in Build"');
  process.exit(1);
} else {
  console.log('\n✅ Todas las variables requeridas están configuradas correctamente');
  process.exit(0);
}
