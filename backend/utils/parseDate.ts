export function parseDateInput(raw?: string | null): Date | null {
  if (!raw) return null;
  const s = raw.trim();

  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const y = Number(iso[1]);
    const m = Number(iso[2]) - 1;
    const d = Number(iso[3]);
    const dt = new Date(Date.UTC(y, m, d));
    return isNaN(dt.getTime()) ? null : dt;
  }

  const euro = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (euro) {
    const d = Number(euro[1]);
    const m = Number(euro[2]) - 1;
    const y = Number(euro[3]);
    const dt = new Date(Date.UTC(y, m, d));
    return isNaN(dt.getTime()) ? null : dt;
  }

  return null;
}
