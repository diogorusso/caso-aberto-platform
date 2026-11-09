import { useMemo, useState } from 'react';
import type { Report } from '../../lib/cases';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Props { reports: Report[] }

function FilterGroup({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid gap-2">
      <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{label}</span>
      <ToggleGroup type="single" variant="outline" size="sm" aria-label={`Filtrar por ${label.toLowerCase()}`} value={value} onValueChange={(v) => v && onChange(v)} className="flex-wrap justify-start">
        {options.map((o) => <ToggleGroupItem key={o} value={o} className="px-3">{o}</ToggleGroupItem>)}
      </ToggleGroup>
    </div>
  );
}

export default function ReportsExplorer({ reports }: Props) {
  const [theme, setTheme] = useState('Todas');
  const [status, setStatus] = useState('Todos');
  const [year, setYear] = useState('Todos');
  const [query, setQuery] = useState('');
  const themes = useMemo(() => ['Todas', ...new Set(reports.map((r) => r.tema))], [reports]);
  const statuses = useMemo(() => ['Todos', ...new Set(reports.map((r) => r.status))], [reports]);
  const years = useMemo(() => ['Todos', ...[...new Set(reports.map((r) => (r.published_at || r.data || '').slice(0, 4)).filter(Boolean))].sort()], [reports]);
  const filtered = useMemo(() => {
    const needle = query.toLocaleLowerCase('pt-BR').trim();
    return reports.filter((r) => {
      const y = (r.published_at || r.data || '').slice(0, 4);
      const hay = `${r.titulo} ${r.cidade} ${r.resumo} ${r.status} ${r.unit || ''} ${r.location || ''}`;
      return (theme === 'Todas' || r.tema === theme)
        && (status === 'Todos' || r.status === status)
        && (year === 'Todos' || y === year)
        && (!needle || hay.toLocaleLowerCase('pt-BR').includes(needle));
    });
  }, [reports, theme, status, year, query]);

  return (
    <div className="grid gap-6">
      <Card className="py-5">
        <CardContent className="grid gap-5 px-5">
          <div className="grid gap-2">
            <Label htmlFor="search-reports">Buscar por cidade, unidade, assunto ou palavra-chave</Label>
            <Input id="search-reports" type="search" value={query} onChange={(e) => setQuery(e.currentTarget.value)} placeholder="Ex.: Ipanema, atraso, montagem, Fortaleza" className="max-w-xl bg-background" />
          </div>
          <FilterGroup label="Tema" options={themes} value={theme} onChange={setTheme} />
          <FilterGroup label="Status" options={statuses} value={status} onChange={setStatus} />
          <FilterGroup label="Ano" options={years} value={year} onChange={setYear} />
        </CardContent>
      </Card>
      <p aria-live="polite" className="m-0 text-sm text-muted-foreground">{filtered.length} {filtered.length === 1 ? 'registro' : 'registros'}</p>
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((r) => (
          <Card key={r.id} className="gap-3">
            <CardHeader className="gap-2">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                <span>{(r.published_at || r.data).split('-').reverse().join('/')}</span><span>·</span><span>{r.cidade}</span>
                {r.unit ? <><span>·</span><span>{r.unit}</span></> : null}
              </div>
              <Badge variant="secondary">{r.tema}</Badge>
              <CardTitle className="text-lg leading-snug">{r.titulo}</CardTitle>
              <CardDescription className="leading-relaxed">{r.resumo}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-1 text-xs text-muted-foreground">
              <span>Status: {r.status}{r.last_checked_at ? ` · verificado ${r.last_checked_at.split('-').reverse().join('/')}` : ''}</span>
              {r.notes ? <span>{r.notes}</span> : null}
            </CardContent>
            <CardFooter className="mt-auto"><a href={r.url} className="text-link text-sm" target="_blank" rel="noopener noreferrer">Ler fonte original ↗</a></CardFooter>
          </Card>
        ))}
      </div>
      {!filtered.length && (
        <Alert><AlertTitle>Nenhum registro encontrado</AlertTitle><AlertDescription>Tente outra cidade, ano, status ou termo.</AlertDescription></Alert>
      )}
    </div>
  );
}
