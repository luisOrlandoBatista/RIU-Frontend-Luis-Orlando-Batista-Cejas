export enum Universe {
  MARVEL = 'Marvel',
  DC = 'DC',
  OTHER = 'Other',
}

export interface Hero {
  id: string;
  name: string;
  heroName: string;
  power: string;
  universe: Universe;
}

export interface PageResult {
  data: Hero[];
  total: number;
}
