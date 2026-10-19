export type Confidence = 'exact' | 'family';

export type Profile = {
  slug: string;
  name: string;
  brand: 'AC' | 'AS' | 'LE';
  brandName: string;
  partNumber: string;
  sku: string;
  confidence: Confidence;
  processor: string;
  graphics: string;
  memory: string;
  storage: string;
};

/**
 * Sourced gaming-laptop configurations. Research profiles, not live listings:
 * no prices, no stock claims, no retailer listings.
 */
export const profiles: Profile[] = [
  {
    slug: 'acer-nitro-v-anv15-51-58s2',
    name: 'Nitro V 15',
    brand: 'AC',
    brandName: 'Acer',
    partNumber: 'ANV15-51-58S2',
    sku: 'NH.QNDEM.006',
    confidence: 'exact',
    processor: 'Intel Core i5-13420H',
    graphics: 'NVIDIA GeForce RTX 2050',
    memory: '8 GB DDR5',
    storage: '512 GB',
  },
  {
    slug: 'asus-tuf-a15-fa507nur',
    name: 'TUF Gaming A15 (2023)',
    brand: 'AS',
    brandName: 'ASUS',
    partNumber: 'FA507NUR',
    sku: 'FA507NUR',
    confidence: 'family',
    processor: 'AMD Ryzen 7 7435HS',
    graphics: 'NVIDIA GeForce RTX 4050 Laptop GPU',
    memory: 'Configuration varies',
    storage: 'Not specified',
  },
  {
    slug: 'lenovo-loq-15irx9-83dv007gin',
    name: 'LOQ 15IRX9',
    brand: 'LE',
    brandName: 'Lenovo',
    partNumber: '83DV007GIN',
    sku: '83DV007GIN',
    confidence: 'exact',
    processor: 'Intel Core i5-13450HX',
    graphics: 'NVIDIA GeForce RTX 4050',
    memory: '16 GB DDR5-4800 SO-DIMM · 1 × 16 GB',
    storage: '512 GB',
  },
  {
    slug: 'lenovo-loq-15irx9-83dv0002id',
    name: 'LOQ 15IRX9',
    brand: 'LE',
    brandName: 'Lenovo',
    partNumber: '83DV0002ID',
    sku: '83DV0002ID',
    confidence: 'exact',
    processor: 'Intel Core i7-14700HX',
    graphics: 'NVIDIA GeForce RTX 4060',
    memory: '16 GB DDR5-5600 SO-DIMM · 1 × 16 GB',
    storage: '512 GB',
  },
];

export const brandFilters = [
  { value: 'all', label: 'All brands' },
  { value: 'AC', label: 'Acer' },
  { value: 'AS', label: 'ASUS' },
  { value: 'LE', label: 'Lenovo' },
];

export const confidenceFilters = [
  { value: 'all', label: 'All evidence' },
  { value: 'exact', label: 'Exact configuration' },
  { value: 'family', label: 'Model family' },
];
