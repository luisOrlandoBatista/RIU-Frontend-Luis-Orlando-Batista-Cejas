export enum Universe {
  MARVEL = 'Marvel',
  DC = 'DC',
  OTHER = 'Other',
}

export interface Hero {
  id: string;
  name: string;      // Nombre de la persona (Peter Parker)
  heroName: string;  // Nombre de superhéroe (Spider-Man)
  power: string;     // Por ahora lo dejo como string
  universe: Universe;
}
