import {
  extractSectionFolder,
  extractStateCode,
  filterChunksByPersonaState,
  formatSectionFolderLabel,
  groupChunksBySection,
  resolveVariantChunks,
} from '@/components/variant-content/variant-content.fields';
import type { VariantContentFields } from '@/components/variant-content/variant-content.props';
import { getPersonaStateCode } from '@/lib/demo-taxonomy';

describe('variant-content.fields', () => {
  it('formats section folder labels with spaced camelCase', () => {
    expect(formatSectionFolderLabel('07-ClaimsTimelines')).toBe('07-Claims Timelines');
    expect(formatSectionFolderLabel('08-RegulatoryAndCompliance')).toBe(
      '08-Regulatory And Compliance'
    );
  });

  it('extracts section folder and state from Shared Content paths', () => {
    const path =
      '/sitecore/content/progressive/pkm/Home/Shared Content/07-ClaimsTimelines/StateSpecific/FL/KB-AU-1001-FNOL-FL';
    expect(extractSectionFolder(path)).toBe('07-ClaimsTimelines');
    expect(extractStateCode(path)).toBe('FL');
  });

  it('resolves and groups ComponentQuery target items', () => {
    const fields: VariantContentFields = {
      data: {
        datasource: {
          sharedContent: {
            targetItems: [
              {
                id: '1',
                name: 'KB-AU-1001-FNOL-FL',
                path: '/sitecore/content/progressive/pkm/Home/Shared Content/07-ClaimsTimelines/StateSpecific/FL/KB-AU-1001-FNOL-FL',
                content: { jsonValue: { value: '<p>Florida FNOL</p>' } },
              },
              {
                id: '2',
                name: 'KB-AU-1001-FNOL-NC',
                path: '/sitecore/content/progressive/pkm/Home/Shared Content/08-RegulatoryAndCompliance/StateSpecific/NC/KB-AU-1001-FNOL-NC',
                content: { jsonValue: { value: '<p>NC regulatory</p>' } },
              },
            ],
          },
        },
      },
    };

    const chunks = resolveVariantChunks(fields);
    expect(chunks).toHaveLength(2);
    expect(chunks[0].sectionLabel).toBe('07-Claims Timelines');

    const groups = groupChunksBySection(chunks);
    expect(groups).toHaveLength(2);
    expect(groups[0].sectionLabel).toBe('07-Claims Timelines');
    expect(groups[1].sectionLabel).toBe('08-Regulatory And Compliance');
  });

  it('extracts state from item name suffix when path lacks StateSpecific', () => {
    expect(extractStateCode(undefined, 'KB-AU-1001-FNOL-FL')).toBe('FL');
    expect(extractStateCode('/no/state/here', 'KB-HO-1002-WindHail-NC')).toBe('NC');
  });

  it('filters chunks by persona state and shows all when logged out', () => {
    const chunks = [
      {
        id: '1',
        name: 'A-FL',
        path: '.../StateSpecific/FL/A',
        sectionKey: '07',
        sectionLabel: '07',
        stateCode: 'FL',
      },
      {
        id: '2',
        name: 'A-NC',
        path: '.../StateSpecific/NC/A',
        sectionKey: '07',
        sectionLabel: '07',
        stateCode: 'NC',
      },
      {
        id: '3',
        name: 'A-TX',
        path: '.../StateSpecific/TX/A',
        sectionKey: '07',
        sectionLabel: '07',
        stateCode: 'TX',
      },
    ];

    expect(filterChunksByPersonaState(chunks, null)).toHaveLength(3);
    expect(filterChunksByPersonaState(chunks, undefined)).toHaveLength(3);
    expect(filterChunksByPersonaState(chunks, 'FL').map((c) => c.stateCode)).toEqual(['FL']);
    expect(filterChunksByPersonaState(chunks, 'NC').map((c) => c.stateCode)).toEqual(['NC']);
  });

  it('maps demo personas to FL and NC state codes', () => {
    expect(getPersonaStateCode('Internal Agent licensed in FL')).toBe('FL');
    expect(getPersonaStateCode('Claims Specialist licensed in NC')).toBe('NC');
  });
});
