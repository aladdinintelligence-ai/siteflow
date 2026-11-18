import React from 'react';
import { OrderStatus, VisitStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: OrderStatus | VisitStatus | string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className,
}) => {
  let label = status.replace('_', ' ');
  let colorStyles = 'bg-[#F3F4F6] text-[#4B5563]';

  switch (status) {
    case 'pending':
    case 'scheduled':
      label = 'Pending';
      colorStyles = 'bg-[#FEF3C7] text-[#B45309]';
      break;
    case 'accepted':
      label = 'Accepted';
      colorStyles = 'bg-[#DBEAFE] text-[#2563EB]';
      break;
    case 'dispatched':
    case 'en_route':
      label = 'En Route';
      colorStyles = 'bg-[#DBEAFE] text-[#2563EB]';
      break;
    case 'at_gate':
      label = 'At Gate';
      colorStyles = 'bg-[#FEF3C7] text-[#B45309]';
      break;
    case 'on_site':
      label = 'On Site';
      colorStyles = 'bg-[#DBEAFE] text-[#2563EB] font-medium';
      break;
    case 'verified':
      label = 'Verified';
      colorStyles = 'bg-[#DCFCE7] text-[#16A34A]';
      break;
    case 'completed':
      label = 'Completed';
      colorStyles = 'bg-[#F3F4F6] text-[#4B5563]';
      break;
    case 'disputed':
    case 'flagged':
      label = status === 'disputed' ? 'Disputed' : 'Flagged';
      colorStyles = 'bg-[#FEE2E2] text-[#DC2626] font-medium';
      break;
    case 'declined':
    case 'cancelled':
      label = 'Declined';
      colorStyles = 'bg-[#FEE2E2] text-[#DC2626]';
      break;
    default:
      break;
  }

  const sizeStyles = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-0.5';

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium capitalize rounded-full whitespace-nowrap select-none',
        sizeStyles,
        colorStyles,
        className
      )}
    >
      {label}
    </span>
  );
};
