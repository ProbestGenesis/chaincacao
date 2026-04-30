"use client"

import { FileText, CheckCircle } from 'lucide-react';

interface Certificate {
  label: string;
  value: string;
}

interface Phase3Props {
  certificates: Certificate[];
}

export function Phase3Certification({ certificates }: Phase3Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:gap-2 flex-wrap">
      {certificates.map((cert, index) => (
        <div
          key={index}
          className="flex-1 min-w-xs bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3"
        >
          <div className="flex-shrink-0">
            {index === 0 ? (
              <FileText className="w-5 h-5 text-green-700 dark:text-green-400" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-700 dark:text-green-400" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase mb-1">
              {cert.label}
            </p>
            <p className="font-semibold text-foreground">{cert.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
