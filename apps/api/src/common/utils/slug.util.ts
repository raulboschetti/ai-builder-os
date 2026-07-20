/**
 * Convierte un texto libre en un slug URL-safe.
 * Ej: "Clínica Dental García" -> "clinica-dental-garcia"
 */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Genera un slug único añadiendo un sufijo corto si hace falta.
 * `exists` debe devolver true si el slug ya está en uso.
 */
export async function generateUniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const root = slugify(base) || 'org';
  let candidate = root;
  let attempt = 0;

  while (await exists(candidate)) {
    attempt += 1;
    candidate = `${root}-${Math.random().toString(36).slice(2, 6)}`;

    if (attempt > 10) {
      candidate = `${root}-${Date.now()}`;
      break;
    }
  }

  return candidate;
}
