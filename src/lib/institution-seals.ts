import data from '../data/institution-seals.json';

export type InstitutionChannel = {
  id: string;
  name: string;
  short: string;
  href: string;
  logo: string;
  alt: string;
  role?: string;
  note?: string;
  logo_source?: string;
};

export type InstitutionState = {
  uf: string;
  name: string;
  featured?: boolean;
  channels: InstitutionChannel[];
};

export const institutionSeals = data;

export function roleLabel(role?: string): string {
  switch (role) {
    case 'peticao':
      return 'Petição';
    case 'enquete':
      return 'Enquete';
    case 'consulta':
      return 'Consulta';
    case 'procon':
      return 'Procon';
    case 'tj':
      return 'Tribunal';
    case 'defensoria':
      return 'Defensoria';
    case 'governo':
      return 'Governo';
    case 'prefeitura':
      return 'Prefeitura';
    default:
      return 'Oficial';
  }
}

export function bannerChannels(): InstitutionChannel[] {
  const byId = new Map((data.federal as InstitutionChannel[]).map((c) => [c.id, c]));
  const ids = (data as { banner_ids?: string[] }).banner_ids || [];
  return ids.map((id) => byId.get(id)).filter((c): c is InstitutionChannel => Boolean(c));
}

export function allChannels(): InstitutionChannel[] {
  return [
    ...(data.federal as InstitutionChannel[]),
    ...(((data as { participation?: InstitutionChannel[] }).participation) || []),
    ...(data.states as InstitutionState[]).flatMap((s) => s.channels),
  ];
}
