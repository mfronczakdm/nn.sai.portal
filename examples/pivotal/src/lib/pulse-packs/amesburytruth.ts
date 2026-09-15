import type { PulseSitePack } from './types';

/**
 * AmesburyTruth Pulse pack — Home-scoped Edge retrieval under quanex/amesburytruth/Home.
 * Citation IDs from docs/ai/manifests/sitecore-manifest.yaml → amesburytruth-ia-tree.
 * Content must be published to Experience Edge to appear in Pulse.
 */
export const amesburytruthPulsePack: PulseSitePack = {
  siteName: 'amesburytruth',
  brandName: 'AmesburyTruth',
  homePath: '/sitecore/content/quanex/amesburytruth/Home',
  homeRootId: '{A57ED898-AA1D-46E6-B7CF-7C7804688EC8}',
  enableStatePersona: false,
  typeLabels: {
    product: 'Product',
    'knowledge-article': 'Resource',
    'people-and-teams': 'Team',
    'shared-content': 'Related',
    other: 'Hardware',
    default: 'Page',
  },
  starterPrompts: [
    'What casement and awning window hardware do you offer?',
    'I need sliding door handle sets and mortise locks.',
    'Show me pile weatherseals and door sweeps.',
    'Where can I find extrusion products like glazing bead and nailing fin?',
    'How do I get warranty info, technical notes, or careers?',
  ],
  intents: [
    {
      id: 'window-hardware',
      matchAny: [
        ['window', 'hardware'],
        ['casement'],
        ['awning'],
        ['hung', 'sliding'],
        ['powerlink'],
        ['operator'],
        ['tilt', 'latch'],
        ['skylight'],
      ],
      citationItemIds: [
        '{F88066D7-8523-449D-BA4A-B47FAD953042}', // Window Hardware
        '{07CD2182-CFEA-4459-A266-70C1E5C1057D}', // Casement Awning
        '{6A2D7363-BB00-4154-A7B1-86C93D80C810}', // PowerLink
        '{F66C1AE3-4536-4FF5-ACF5-17167E71E562}', // Operators
        '{9D8B5590-423E-4581-9164-B2E1265A6B1E}', // Hung Sliding
      ],
    },
    {
      id: 'door-hardware',
      matchAny: [
        ['door', 'hardware'],
        ['sliding', 'door'],
        ['hinged'],
        ['handle', 'set'],
        ['mortise'],
        ['tru', 'lock'],
        ['lift', 'slide'],
      ],
      citationItemIds: [
        '{1E363D0F-E485-489B-B358-3DE8D735B25A}', // Door Hardware
        '{605A7FF5-1C32-49F3-A964-4DED45B9E431}', // Sliding
        '{C95C7630-2C11-4840-AA71-9F36E566B22D}', // Handle Sets (Sliding)
        '{CD40C6ED-AD06-4FC9-A021-5DD527AFCDC6}', // Mortise Locks
        '{D04D9943-2CED-4FB8-A300-97B1C83A0895}', // Hinged
        '{63628394-5403-460C-BBBE-A5B371ED14CE}', // Tru-Lock
      ],
    },
    {
      id: 'weatherseals',
      matchAny: [
        ['weatherseal'],
        ['pile'],
        ['door', 'seal'],
        ['window', 'seal'],
        ['sweep'],
        ['kerf'],
        ['dust', 'plug'],
      ],
      citationItemIds: [
        '{B692617F-621F-4C4D-BBC8-E03D3FCEB044}', // Weatherseals
        '{8885A099-56D9-409B-819B-D176A874F434}', // Pile
        '{C91F4D12-1B51-48EC-9EFF-CC6477A2503E}', // Kerf Pile
        '{0F8A08C5-9D14-4164-A3DA-72C9421AEBBC}', // Door Seals
        '{C9374692-796D-4688-A497-5B29A9A07261}', // Sweeps
      ],
    },
    {
      id: 'extrusions',
      matchAny: [
        ['extrusion'],
        ['glazing', 'bead'],
        ['nailing', 'fin'],
        ['backer', 'rod'],
        ['custom', 'extrusion'],
      ],
      citationItemIds: [
        '{F02E079E-0242-43F9-9A86-391F5687D475}', // Extrusions
        '{83757372-0EFB-436B-8E51-F5AD0293A57B}', // Glazing Bead
        '{051C2AFC-1F30-4D0A-A605-A90D3617BAF1}', // Nailing Fin
        '{D0821BD8-3488-4C69-A4A5-57F9F4B5B73D}', // Backer Rod
        '{BB87352A-AE0F-46BE-A363-6FEEAB7B78F7}', // Custom
      ],
    },
    {
      id: 'resources-about-careers',
      matchAny: [
        ['warrant'],
        ['technical', 'note'],
        ['resource'],
        ['career'],
        ['sustainabilit'],
        ['contact'],
        ['recall'],
        ['faq'],
      ],
      citationItemIds: [
        '{5A73AE7F-B2A8-4F0E-BAEE-49B8B233DE17}', // Resources
        '{BA599C50-B03C-4555-AE7F-52C0302682EC}', // Warranty Information
        '{1D1F8F1C-0841-405A-B9D5-B68038759C35}', // Technical Notes
        '{05677274-FBD9-4639-85D0-830872525EAD}', // Careers
        '{3A818DD2-63A3-4C70-A844-5DDD980B35FA}', // Contact Us
      ],
    },
  ],
};
