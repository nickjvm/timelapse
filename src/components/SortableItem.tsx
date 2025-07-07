import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import cn from '@/utils/cn';

export default function SortableItem({ id, children, className, ...props }: { id: string, className?: string } & React.PropsWithChildren) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} {...props} className={cn('cursor-grab', className, isDragging && 'cursor-grabbing z-100')}>
      {children}
    </div>
  );
}