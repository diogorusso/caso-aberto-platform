import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const variantForStatus = {
  nao_recomendamos: 'brand',
  cautela: 'warning',
  recomendamos: 'success',
} as const;

type VerdictStatus = keyof typeof variantForStatus;

export default function VerdictStatusBadge({
  status,
  label,
  className,
}: {
  status: string;
  label: string;
  className?: string;
}) {
  const variant = variantForStatus[status as VerdictStatus] ?? 'outline';
  return <Badge variant={variant} className={cn('uppercase tracking-[0.065em]', className)}>{label}</Badge>;
}
