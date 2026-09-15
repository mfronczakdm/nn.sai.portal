'use client';
import { useMemo } from 'react';
import { SearchField } from './models';

/**
 * Parses the component search field
 */
export const useSearchField = (value: string) => {
  const { searchIndex, fieldsMapping } = useMemo((): SearchField => {
    try {
      return JSON.parse(value) as SearchField;
    } catch (error) {
      console.error('Error parsing search field', error);
      return { searchIndex: '', fieldsMapping: {} };
    }
  }, [value]);

  return { searchIndex, fieldsMapping };
};
