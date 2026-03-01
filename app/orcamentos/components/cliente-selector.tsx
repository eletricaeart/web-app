"use client";

import { Check, CaretUpDown } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

// Interface para definir a estrutura do cliente esperado
interface Cliente {
  id: string | number;
  name: string;
  [key: string]: any; // Permite outras propriedades vindas do hook useEASync
}

// Interface para as propriedades do componente
interface ClienteSelectorProps {
  clientes: Cliente[];
  onSelect: (cliente: Cliente) => void;
  selectedName: string;
}

export function ClienteSelector({
  clientes,
  onSelect,
  selectedName,
}: ClienteSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full h-14 justify-between bg-white border-none shadow-sm rounded-2xl px-4 text-slate-600 hover:bg-slate-50"
        >
          {selectedName ? selectedName : "Pesquisar cliente cadastrado..."}
          <CaretUpDown size={18} className="ml-2 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[calc(100vw-3rem)] p-0 border-none shadow-2xl rounded-2xl">
        <Command className="rounded-2xl">
          <CommandInput placeholder="Digite o nome..." className="h-12" />
          <CommandList>
            <CommandEmpty>Cliente não encontrado.</CommandEmpty>
            <CommandGroup>
              {clientes.map((cliente) => (
                <CommandItem
                  key={cliente.id}
                  value={cliente.name}
                  onSelect={() => {
                    onSelect(cliente);
                    setOpen(false);
                  }}
                  className="h-12 px-4"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedName === cliente.name
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  {cliente.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
