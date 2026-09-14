import type { Physician } from '@/lib/sitecore/types';
import { initialsFromName, physicianDisplayName } from '@/lib/utils';

export function PhysicianAvatar({ physician, size = 'md' }: { physician: Physician; size?: 'md' | 'lg' }) {
  const label = physicianDisplayName(physician.name, physician.credentials);
  const dimension = size === 'lg' ? 'h-40 w-40 text-4xl' : 'h-24 w-24 text-2xl';

  if (physician.photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={physician.photoUrl}
        alt=""
        className={`${dimension} rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`${dimension} flex items-center justify-center rounded-full bg-lcmc-teal font-bold text-white`}
    >
      {initialsFromName(label)}
    </div>
  );
}
