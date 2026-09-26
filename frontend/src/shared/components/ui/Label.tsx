import React from 'react';
import { cn } from '@/shared/utils/cn';

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label // NOSONAR (typescript:S6853): passthrough generico; todos los usos proveen htmlFor + control con id.
      ref={ref}
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ml-1',
        className
      )}
      {...props}
    />
  )
);

Label.displayName = 'Label';
