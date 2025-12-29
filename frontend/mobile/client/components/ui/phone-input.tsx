import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PhoneInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, ...props }, ref) => {
  return (
    <Input
      type="tel"
      pattern="^(0|\+?84)[0-9]{8,10}$"
      title="Vui lòng nhập đúng định dạng số điện thoại!"
      className={cn(className)}
      ref={ref}
      {...props}
    />
  );
});
PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
