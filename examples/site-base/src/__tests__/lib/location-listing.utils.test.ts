import {
  isLcmcDataLocationsRef,
  isLcmcOurLocationsPageRef,
  locationListingPublishHint,
  looksLikeHospitalLocation,
  resolveLocationListingFolderRef,
  LCMC_DATA_LOCATIONS_ID,
  LCMC_OUR_LOCATIONS_PAGE_ID,
} from '@/lib/location-listing.utils';

describe('location-listing.utils', () => {
  it('recognizes the Data/Locations folder id and path', () => {
    expect(isLcmcDataLocationsRef('76041887-6e16-4844-ad13-366bc2e32265')).toBe(true);
    expect(isLcmcDataLocationsRef('/sitecore/content/lcmc/lcmc/Data/Locations')).toBe(true);
  });

  it('recognizes the Our Locations page id and path', () => {
    expect(isLcmcOurLocationsPageRef(LCMC_OUR_LOCATIONS_PAGE_ID)).toBe(true);
    expect(isLcmcOurLocationsPageRef('/sitecore/content/lcmc/lcmc/Home/Our Locations')).toBe(true);
    expect(
      isLcmcOurLocationsPageRef(
        '/sitecore/content/lcmc/lcmc/Home/Our Locations/East Jefferson General Hospital'
      )
    ).toBe(true);
  });

  it('resolves the Our Locations page to the Data/Locations folder', () => {
    expect(resolveLocationListingFolderRef(LCMC_OUR_LOCATIONS_PAGE_ID)).toBe(LCMC_DATA_LOCATIONS_ID);
    expect(resolveLocationListingFolderRef(LCMC_DATA_LOCATIONS_ID)).toBe(LCMC_DATA_LOCATIONS_ID);
  });

  it('tells authors to publish Data/Locations and the 16 children', () => {
    expect(locationListingPublishHint()).toContain(
      '/sitecore/content/lcmc/lcmc/Data/Locations'
    );
    expect(locationListingPublishHint()).toContain('16 LCMC Hospital Location children');
  });

  it('treats sitemap pages without location fields as not hospital locations', () => {
    expect(looksLikeHospitalLocation({})).toBe(false);
    expect(
      looksLikeHospitalLocation({
        locationTitle: { jsonValue: { value: 'East Jefferson General Hospital' } },
        latitude: { jsonValue: { value: '29.9967' } },
      })
    ).toBe(true);
  });
});
