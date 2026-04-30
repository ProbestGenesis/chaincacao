"use client"

import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface TimelinePhaseProps {
  phaseNumber: number;
  phaseName: string;
  date: string;
  icon: ReactNode;
  completed?: boolean;
  children: ReactNode;
}

export function TimelinePhase({
  phaseNumber,
  phaseName,
  date,
  icon,
  completed = true,
  children,
}: TimelinePhaseProps) {
  return (
    <div className="flex gap-6 relative mb-12">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        {/* Icon circle */}
        <div
          className={clsx(
            'w-12 h-12 rounded-full flex items-center justify-center mb-4 flex-shrink-0',
            completed ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'
          )}
        >
          <div className={clsx('w-6 h-6', completed ? 'text-green-700 dark:text-green-300' : 'text-gray-400')}>
            {icon}
          </div>
        </div>
        {/* Vertical line to next phase (hidden on last phase via CSS) */}
        <div className="w-1 flex-1 bg-gray-200 dark:bg-gray-700 mb-4" style={{ minHeight: '200px' }} />
      </div>

      {/* Content */}
      <div className="flex-1 pt-2">
        <div className="flex flex-col gap-1 mb-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Phase {String(phaseNumber).padStart(2, '0')}
          </div>
          <h3 className="text-xl font-bold text-foreground">{phaseName}</h3>
          <p className="text-sm text-muted-foreground">{date}</p>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
