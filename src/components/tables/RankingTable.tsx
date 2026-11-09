import VerdictStatusBadge from '@/components/VerdictStatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

export interface RankingRow {
  key: string;
  status: string;
  statusLabel: string;
  name: string;
  location: string;
  href: string;
  scope: string;
  caseCount: number;
  reviewed: string;
  current: boolean;
}

export default function RankingTable({ rows }: { rows: RankingRow[] }) {
  return (
    <div className="border bg-card shadow-sm">
      <Table className="min-w-[40rem]">
        <TableHeader>
          <TableRow className="bg-muted/60 hover:bg-muted/60">
            <TableHead>Faixa</TableHead>
            <TableHead>Empresa / unidade</TableHead>
            <TableHead>Escopo</TableHead>
            <TableHead className="text-right">Casos</TableHead>
            <TableHead>Revisão</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((e) => (
            <TableRow key={e.key} className={cn(e.current && 'bg-brand-soft hover:bg-brand-soft')} aria-current={e.current ? 'true': undefined}>
              <TableCell><VerdictStatusBadge status={e.status} label={e.statusLabel} /></TableCell>
              <TableCell className="whitespace-normal">
                <a href={e.href} className="font-semibold no-underline hover:underline">{e.name}</a>
                <small className="block text-xs text-muted-foreground">{e.location}</small>
              </TableCell>
              <TableCell>{e.scope}</TableCell>
              <TableCell className="text-right tabular-nums">{e.caseCount}</TableCell>
              <TableCell className="tabular-nums">{e.reviewed}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
