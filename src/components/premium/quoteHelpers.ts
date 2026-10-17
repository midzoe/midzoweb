/**
 * Helpers PURS du sélecteur de packages (story 3.7) — aucune logique de PRIX ici :
 * le calcul est 100% backend (POST /api/packages/quote). On ne fait que préparer
 * la sélection et formater des montants déjà calculés.
 */

export interface Subcategory {
  id: number;
  name: string;
  isOther?: boolean;
}

export interface CategoryNode {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  subcategories: Subcategory[];
}

export interface Selection {
  categories: string[];
  subcategoryIds: number[];
}

/**
 * Décocher une catégorie doit retirer ses sous-catégories : une sous-catégorie orpheline
 * ferait renvoyer 400 au backend (elle n'appartiendrait à aucune catégorie sélectionnée).
 */
export function pruneSelection(selection: Selection, categories: CategoryNode[]): Selection {
  const activeCategories = new Set(selection.categories);
  const allowedSubIds = new Set(
    categories
      .filter((c) => activeCategories.has(c.id))
      .flatMap((c) => c.subcategories.map((s) => s.id))
  );
  return {
    categories: [...activeCategories],
    subcategoryIds: selection.subcategoryIds.filter((id) => allowedSubIds.has(id)),
  };
}

export function toggleCategory(selection: Selection, categoryId: string, categories: CategoryNode[]): Selection {
  const has = selection.categories.includes(categoryId);
  const next: Selection = {
    categories: has
      ? selection.categories.filter((id) => id !== categoryId)
      : [...selection.categories, categoryId],
    subcategoryIds: selection.subcategoryIds,
  };
  return pruneSelection(next, categories);
}

export function toggleSubcategory(selection: Selection, subId: number): Selection {
  const has = selection.subcategoryIds.includes(subId);
  return {
    categories: selection.categories,
    subcategoryIds: has
      ? selection.subcategoryIds.filter((id) => id !== subId)
      : [...selection.subcategoryIds, subId],
  };
}

/** Centimes entiers → montant lisible. Le backend garantit des entiers ; on ne calcule pas de prix. */
export function formatAmount(cents: number, currency: string): string {
  const value = (cents / 100).toFixed(2);
  return `${value} ${currency}`;
}
