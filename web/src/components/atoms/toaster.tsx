import { Toaster as ShadcnToaster } from "@/components/ui/sonner";
import type { ComponentProps } from "react";

export function Toaster(props: ComponentProps<typeof ShadcnToaster>) {
  return <ShadcnToaster {...props} />;
}
