import { Info } from "lucide-react";

export function DemoBanner() {
  return (
    <div className="flex w-full justify-center border-b bg-gradient-to-r from-blue-600 via-sky-600 to-slate-400 px-4 py-2 text-center text-sm text-white">
      <div className="mx-auto flex max-w-4xl items-center justify-center gap-2">
        <Info className="h-4 w-4 flex-shrink-0" />
        <span className="font-medium">🚀 DMT STORE</span>
        <span className="hidden sm:flex">| Premium shopping experience</span>
      </div>
    </div>
  );
}
