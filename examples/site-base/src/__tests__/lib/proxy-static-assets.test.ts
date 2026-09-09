import { isStaticAssetPath } from '@/lib/static-asset-path';

describe('isStaticAssetPath', () => {
  it('treats nested public physician photos as static files', () => {
    expect(isStaticAssetPath('/lcmc/physicians/craig-j-conard-md.jpg')).toBe(true);
    expect(isStaticAssetPath('/lcmc/physicians/placeholder-physician-01.jpg')).toBe(true);
  });

  it('does not treat Sitecore page routes as static files', () => {
    expect(isStaticAssetPath('/lcmc/en/Find-a-Provider')).toBe(false);
    expect(isStaticAssetPath('/For-Patients/Patient-Appointments')).toBe(false);
  });
});
