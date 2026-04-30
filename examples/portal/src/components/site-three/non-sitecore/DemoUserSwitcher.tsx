'use client';

import { useEffect, useState } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DEMO_TAXONOMY_CHANGE_EVENT, DEMO_TAXONOMY_STORAGE_KEY } from '@/lib/demo-taxonomy';

const DEMO_USERS = [
  { label: 'User 1 - Maintenance Engineer', taxonomy: 'Maintenance Engineer' },
  { label: 'User 2 - Engineering Consultant', taxonomy: 'Engineering Consultant' },
  { label: 'User 3 - Plant Technician', taxonomy: 'Plant Technician' },
] as const;

export function DemoUserSwitcher() {
  const [taxonomy, setTaxonomy] = useState('');

  useEffect(() => {
    const storedTaxonomy = window.localStorage.getItem(DEMO_TAXONOMY_STORAGE_KEY) ?? '';
    setTaxonomy(storedTaxonomy);
  }, []);

  const handleValueChange = (value: string) => {
    setTaxonomy(value);
    window.localStorage.setItem(DEMO_TAXONOMY_STORAGE_KEY, value);
    window.dispatchEvent(new CustomEvent(DEMO_TAXONOMY_CHANGE_EVENT, { detail: { taxonomy: value } }));
  };

  return (
    <Select value={taxonomy || undefined} onValueChange={handleValueChange}>
      <SelectTrigger className="h-10 w-[15rem]">
        <SelectValue placeholder="Login" />
      </SelectTrigger>
      <SelectContent align="end">
        {DEMO_USERS.map((user) => (
          <SelectItem key={user.taxonomy} value={user.taxonomy}>
            {user.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
