import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const EmailInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, ...props }, ref) => {
  return (
    <Input
      type="email"
      pattern="^[^@]+@[^@]+\.[^@]+$"
      title="Vui lòng nhập đúng định dạng email!"
      className={cn(className)}
      ref={ref}
      {...props}
    />
  );
});
EmailInput.displayName = "EmailInput";

export { EmailInput };
