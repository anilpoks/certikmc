import { DISTRICTS } from '../data/nepal-data';

export const getLocalizedDistrictName = (name: string, language: 'en' | 'ne'): string => {
  if (!name) return language === 'en' ? '[District]' : '[जिल्ला]';
  if (language === 'en') return name;
  const district = DISTRICTS.find(d => d.name === name);
  return district ? district.nameNe : name;
};

export const getLocalizedMunicipalityName = (districtName: string, muniName: string, language: 'en' | 'ne'): string => {
  if (!muniName) return language === 'en' ? '[Municipality]' : '[नगरपालिका]';
  if (language === 'en') return muniName;
  const district = DISTRICTS.find(d => d.name === districtName);
  const municipality = district?.municipalities.find(m => m.name === muniName);
  return municipality ? municipality.nameNe : muniName;
};
