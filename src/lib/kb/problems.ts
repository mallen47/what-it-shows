// What a merged ticket really holds: one row per problem, read from the report and its tenant.
// causes.ts places a report by tenant and channel. That misses one problem: reports whose date
// moves by a day, not a swap. The desk already marks those (desk-notes.json, oneDayMove).
import { causeOf, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'shift' | 'unplaced';

export const PROBLEMS: Record<Problem, string> = {
  parser: 'the shared parser reads day-first dates month first',
  hint: 'the booking-v3 form hints MM/DD/YYYY to day-first tenants',
  shift: 'dates move by one day across time zones',
  unplaced: 'no tenant on file: not placed',
};

export function problemOf(r: Report, t: Tenant | undefined, oneDayMove: readonly string[]): Problem {
  if (oneDayMove.includes(r.id)) return 'shift';
  return causeOf(r, t) ?? 'unplaced';
}

export type ProblemRow = { problem: Problem; reports: Report[]; tenants: number; mistagged: number };

// One id, one report; only reports merged into `ticket`; biggest problem first.
export function splitTicket(
  all: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { merged: number; rows: ProblemRow[] } {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const by = new Map<Problem, Report[]>();
  for (const r of merged) {
    const p = problemOf(r, tenantOf(r), oneDayMove);
    by.set(p, [...(by.get(p) ?? []), r]);
  }
  const rows = [...by.entries()]
    .map(([problem, reports]) => ({
      problem,
      reports,
      tenants: new Set(reports.map((r) => r.tenant)).size,
      // Intake guessed from the browser; the tenant decides.
      mistagged: reports.filter((r) => r.meta.intakeTag !== problem).length,
    }))
    .sort((a, b) => b.reports.length - a.reports.length);
  return { merged: merged.length, rows };
}
