/**
 * Carga y SANEA variables de entorno antes que cualquier otra cosa.
 * Debe importarse PRIMERO (antes de Prisma), porque limpia espacios/saltos
 * que a veces se cuelan al pegar las URLs en paneles como Render y que
 * rompen la validación de Prisma ("must start with postgresql://").
 */
import dotenv from 'dotenv';
dotenv.config();

for (const key of ['DATABASE_URL', 'DIRECT_URL', 'REDIS_URL']) {
  const v = process.env[key];
  if (typeof v === 'string') {
    // Quita comillas envolventes y espacios/saltos de línea.
    process.env[key] = v.trim().replace(/^["']|["']$/g, '').trim();
  }
}
