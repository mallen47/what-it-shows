<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import type { Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { PROBLEMS, splitTicket, type Problem } from '#lib/kb/problems';

  // issues: where each problem is tracked now, problem → { label, href }.
  let { ticket, issues = {} }: { ticket: number; issues?: Partial<Record<Problem, { label: string; href: string }>> } =
    $props();

  const split = $derived(splitTicket(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const total = $derived(split.rows.reduce((n, r) => n + r.reports.length, 0));
</script>

<p class="sum">
  <strong>{split.merged}</strong> reports merged into #{ticket} ·
  <strong>{split.rows.length}</strong>
  {split.rows.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>intake tagged otherwise</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each split.rows as row (row.problem)}
      <tr>
        <td><code>{row.problem}</code> {PROBLEMS[row.problem]}</td>
        <td>{row.reports.length}</td>
        <td>{row.tenants}</td>
        <td>{row.mistagged}</td>
        <td>
          {#if issues[row.problem]}<a href={issues[row.problem]?.href}>{issues[row.problem]?.label}</a>{:else}none yet{/if}
        </td>
      </tr>
    {/each}
  </tbody>
  <tfoot>
    <tr><td>total</td><td>{total}</td><td colspan="3">{total === split.merged ? 'every report placed once' : `${split.merged - total} reports missing`}</td></tr>
  </tfoot>
</table>

<style>
  .sum { font-size: 1.1rem; }
  tfoot td { font-weight: 600; }
</style>
