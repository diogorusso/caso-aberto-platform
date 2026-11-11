import { MenuIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/lib/navigation';
import { bestMatchingHref, navItemIsActive } from '@/lib/navigation';

export default function MobileNav({ items, current }: { items: NavItem[]; current: string }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white" aria-label="Abrir menu">
          <MenuIcon className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(22rem,88vw)] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>CasoAberto</SheetTitle>
          <SheetDescription>Casos, artigos, organização e pesquisa com fontes.</SheetDescription>
        </SheetHeader>
        <nav aria-label="Principal" className="grid gap-5 px-4 pb-8">
          {items.map((item) => (
            <div key={item.href} className="grid gap-1">
              <SheetClose asChild>
                <a
                  href={item.href}
                  aria-current={navItemIsActive(item, current) ? 'page' : undefined}
                  className={cn(
                    'px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-accent',
                    navItemIsActive(item, current) && 'bg-accent',
                  )}
                >
                  {item.label}
                </a>
              </SheetClose>
              {item.children?.length ? (
                <div className="ml-2 grid gap-0.5 border-l border-border pl-2">
                  {item.children.map((child) => {
                    const activeChild = bestMatchingHref(current, item.children ?? []) === child.href;
                    return (
                    <SheetClose asChild key={`${item.href}-${child.href}-${child.label}`}>
                      <a
                        href={child.href}
                        aria-current={activeChild ? 'page' : undefined}
                        className={cn(
                          'px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
                          activeChild && 'bg-accent font-medium text-foreground',
                        )}
                      >
                        {child.label}
                      </a>
                    </SheetClose>
                  )})}
                </div>
              ) : null}
            </div>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
