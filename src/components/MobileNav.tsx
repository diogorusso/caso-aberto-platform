import { MenuIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface Item { label: string; href: string }

export default function MobileNav({ items, current }: { items: Item[]; current: string }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white" aria-label="Abrir menu">
          <MenuIcon className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(20rem,85vw)]">
        <SheetHeader>
          <SheetTitle>CasoAberto</SheetTitle>
          <SheetDescription>Casos documentados, empresas e fontes públicas.</SheetDescription>
        </SheetHeader>
        <nav aria-label="Principal" className="grid gap-1 px-4">
          {items.map((item) => (
            <SheetClose asChild key={item.href}>
              <a
                href={item.href}
                aria-current={current.startsWith(item.href) ? 'page': undefined}
                className={cn(
                  'px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent',
                  current.startsWith(item.href) && 'bg-accent font-semibold',
                )}
              >
                {item.label}
              </a>
            </SheetClose>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
