import {
  findNamedLcmcPhysicianPhoto,
  resolveLcmcPhysicianPhoto,
} from '@/lib/lcmc-physician-photos';

describe('lcmc-physician-photos', () => {
  it('matches Craig Conard from the live LCMC profile name variants', () => {
    expect(findNamedLcmcPhysicianPhoto('Craig J. Conard, MD')?.src).toBe(
      '/lcmc/physicians/craig-j-conard-md.jpg'
    );
    expect(findNamedLcmcPhysicianPhoto('Craig Conard')?.src).toBe(
      '/lcmc/physicians/craig-j-conard-md.jpg'
    );
  });

  it('does not assign another doctor’s identifiable photo to a demo catalog name', () => {
    expect(findNamedLcmcPhysicianPhoto('Gabrielle Moreau')).toBeUndefined();
    expect(findNamedLcmcPhysicianPhoto('Camille Landry')).toBeUndefined();
    const moreau = resolveLcmcPhysicianPhoto({ fullName: 'Gabrielle Moreau' });
    expect(moreau.isNamedMatch).toBe(false);
    expect(moreau.src).toMatch(/^\/lcmc\/physicians\/placeholder-physician-\d{2}\.jpg$/);
  });

  it('prefers a Sitecore image src over named and placeholder photos', () => {
    const resolved = resolveLcmcPhysicianPhoto({
      fullName: 'Craig J. Conard',
      imageField: { value: { src: 'https://edge.example/media/conard.jpg', alt: 'Authored' } },
    });
    expect(resolved.src).toBe('https://edge.example/media/conard.jpg');
    expect(resolved.isNamedMatch).toBe(false);
  });
});
