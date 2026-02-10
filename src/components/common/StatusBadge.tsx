import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusClass = () => {
    switch (status.toUpperCase()) {
      case 'FULL PAID':
        return 'status-paid';
      case 'NEW':
        return 'bg-primary/15 text-primary';
      case 'RECOVERY':
        return 'status-pending';
      case 'DROP':
        return 'status-drop';
      case 'FREEZE':
        return 'status-freeze';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <span className={cn('status-badge', getStatusClass(), className)}>
      {status}
    </span>
  );
}
