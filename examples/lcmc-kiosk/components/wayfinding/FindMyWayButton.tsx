'use client';

import { useEffect, useId, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useKioskI18n } from '@/components/kiosk/LocaleProvider';
import { cn } from '@/lib/utils';
import { LobbyDirectionsMap } from './LobbyDirectionsMap';

type FindMyWayButtonProps = {
  destinationName: string;
  buildingName?: string;
  address?: string;
  className?: string;
};

export function FindMyWayButton({
  destinationName,
  buildingName,
  address,
  className,
}: FindMyWayButtonProps) {
  const { dictionary } = useKioskI18n();
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const clinicLabel = [destinationName, buildingName].filter(Boolean).join(' · ');

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const steps = [
    dictionary.directionStep1,
    dictionary.directionStep2,
    dictionary.directionStep3,
    dictionary.directionArrive(clinicLabel || destinationName),
  ];

  return (
    <>
      <Button variant="primary" className={cn('min-w-[12rem]', className)} onClick={() => setOpen(true)}>
        {dictionary.findMyWay}
      </Button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-lcmc-navy-dark/80 p-4"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="flex max-h-[96vh] w-full max-w-6xl flex-col overflow-auto rounded-3xl bg-white p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-lcmc-teal">{dictionary.directionsTitle}</p>
                <h2 id={titleId} className="text-3xl font-bold text-lcmc-navy">
                  {clinicLabel || destinationName}
                </h2>
                {address ? <p className="mt-1 text-lg text-lcmc-muted">{address}</p> : null}
                <p className="mt-2 text-lg font-semibold text-lcmc-green">{dictionary.estimatedWalk}</p>
              </div>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                {dictionary.closeDirections}
              </Button>
            </div>

            <LobbyDirectionsMap dictionary={dictionary} clinicLabel={destinationName} />

            <ol className="mt-6 grid gap-3 md:grid-cols-2">
              {steps.map((step, index) => (
                <li key={step} className="flex gap-3 rounded-2xl bg-lcmc-cream p-4 text-lg text-lcmc-ink">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lcmc-navy text-lg font-bold text-white">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-center text-sm text-lcmc-muted">{dictionary.demoMapNote}</p>
          </div>
        </div>
      ) : null}
    </>
  );
}
