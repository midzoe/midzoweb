export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  services: string[];
}

export interface Region {
  name: string;
  countries: string[];
}

export interface Service {
  id: string;
  name: string;
  description: string;
  categories: string[];
}