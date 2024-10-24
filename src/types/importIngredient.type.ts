import type { Importingredientitem } from "./importIngredientItem.type";

export interface Importingredient {
  importID?: number;
  date?: Date;
  store?: string;
  discount?: number;
  total?: number;
  user?: number;
  importStoreType?: string;
  importDescription?: string;
  importingredientitem: Importingredientitem[];
}


