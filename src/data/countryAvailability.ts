// Countries available for each category
export const studyCountries = [
  'United Kingdom',
  'United States',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Netherlands',
  'Spain',
  'Sweden',
  'Switzerland',
  'Italy',
  'Japan',
  'South Korea',
  'Ireland',
  'New Zealand'
];

export const tourismCountries = [
  // Europe
  'Spain', 'France', 'Germany', 'Italy', 'Portugal', 'Greece',
  'Sweden', 'Norway', 'Finland', 'Denmark', 'Iceland', 'Ireland',
  'United Kingdom', 'Austria', 'Switzerland', 'Belgium',
  'Netherlands', 'Luxembourg', 'Estonia', 'Latvia', 'Lithuania',
  // Asia
  'China', 'India', 'Japan', 'South Korea', 'Indonesia',
  'Thailand', 'Vietnam', 'Malaysia', 'Philippines', 'Singapore',
  'Cambodia', 'Laos', 'Dubai',
  // North America
  'United States', 'Canada',
  // South America
  'Mexico', 'Costa Rica', 'Panama', 'Colombia', 'Venezuela',
  'Ecuador', 'Peru', 'Bolivia', 'Chile', 'Argentina', 'Brazil',
  // Africa
  'South Africa', 'Egypt', 'Kenya', 'Morocco', 'Tunisia',
  'Rwanda', 'Mauritius', 'Botswana', 'Namibia', 'Ghana',
  'Nigeria', 'Tanzania', 'Uganda', 'Senegal', 'Ethiopia',
  'Ivory Coast'
];

export const getContinentForCountry = (country: string): string => {
  const continents: { [key: string]: string } = {
    'Spain': '🇪🇺', 'France': '🇪🇺', 'Germany': '🇪🇺', 'Italy': '🇪🇺',
    'Portugal': '🇪🇺', 'Greece': '🇪🇺', 'Sweden': '🇪🇺', 'Norway': '🇪🇺',
    'Finland': '🇪🇺', 'Denmark': '🇪🇺', 'Iceland': '🇪🇺', 'Ireland': '🇪🇺',
    'United Kingdom': '🇪🇺', 'Austria': '🇪🇺', 'Switzerland': '🇪🇺', 'Belgium': '🇪🇺',
    'Netherlands': '🇪🇺', 'Luxembourg': '🇪🇺', 'Estonia': '🇪🇺', 'Latvia': '🇪🇺',
    'Lithuania': '🇪🇺',

    'China': '🌏', 'India': '🌏', 'Japan': '🌏', 'South Korea': '🌏',
    'Indonesia': '🌏', 'Thailand': '🌏', 'Vietnam': '🌏', 'Malaysia': '🌏',
    'Philippines': '🌏', 'Singapore': '🌏', 'Cambodia': '🌏', 'Laos': '🌏',
    'Dubai': '🌏',

    'United States': '🌎', 'Canada': '🌎', 'Mexico': '🌎', 'Costa Rica': '🌎',
    'Panama': '🌎', 'Colombia': '🌎', 'Venezuela': '🌎', 'Ecuador': '🌎',
    'Peru': '🌎', 'Bolivia': '🌎', 'Chile': '🌎', 'Argentina': '🌎',
    'Brazil': '🌎',

    'South Africa': '🌍', 'Egypt': '🌍', 'Kenya': '🌍', 'Morocco': '🌍',
    'Tunisia': '🌍', 'Rwanda': '🌍', 'Mauritius': '🌍', 'Botswana': '🌍',
    'Namibia': '🌍', 'Ghana': '🌍', 'Nigeria': '🌍', 'Tanzania': '🌍',
    'Uganda': '🌍', 'Senegal': '🌍', 'Ethiopia': '🌍', 'Ivory Coast': '🌍',
  };
  return continents[country] || '🌐';
};
