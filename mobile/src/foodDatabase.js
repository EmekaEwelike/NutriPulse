export const PRESET_FOODS = [
  // Breakfast
  { id: 'b1', name: 'Oatmeal with Berries & Honey', category: 'breakfast', calories: 320, protein: 12, carbs: 58, fat: 5, fiber: 8, serving: '1 bowl (250g)', icon: '🥣' },
  { id: 'b2', name: 'Scrambled Eggs with Avocado', category: 'breakfast', calories: 380, protein: 18, carbs: 6, fat: 31, fiber: 5, serving: '2 eggs + 1/2 avocado', icon: '🍳' },
  { id: 'b3', name: 'Greek Yogurt & Granola', category: 'breakfast', calories: 290, protein: 20, carbs: 34, fat: 8, fiber: 3, serving: '200g yogurt', icon: '🥛' },
  { id: 'b4', name: 'Whole Wheat Toast with Peanut Butter', category: 'breakfast', calories: 280, protein: 10, carbs: 30, fat: 14, fiber: 4, serving: '2 slices', icon: '🍞' },
  { id: 'b5', name: 'Protein Berry Smoothie', category: 'breakfast', calories: 250, protein: 24, carbs: 32, fat: 3, fiber: 6, serving: '400ml', icon: '🥤' },

  // Lunch
  { id: 'l1', name: 'Grilled Chicken Caesar Salad', category: 'lunch', calories: 450, protein: 42, carbs: 12, fat: 26, fiber: 4, serving: '1 large bowl', icon: '🥗' },
  { id: 'l2', name: 'Salmon Quinoa Power Bowl', category: 'lunch', calories: 540, protein: 38, carbs: 48, fat: 22, fiber: 7, serving: '1 bowl', icon: '🍲' },
  { id: 'l3', name: 'Turkey & Swiss Avocado Wrap', category: 'lunch', calories: 420, protein: 32, carbs: 38, fat: 16, fiber: 5, serving: '1 wrap', icon: '🌯' },
  { id: 'l4', name: 'Brown Rice & Black Bean Bowl', category: 'lunch', calories: 410, protein: 16, carbs: 72, fat: 6, fiber: 14, serving: '350g', icon: '🍚' },
  { id: 'l5', name: 'Tuna Salad Sandwich', category: 'lunch', calories: 390, protein: 29, carbs: 34, fat: 15, fiber: 4, serving: '1 sandwich', icon: '🥪' },

  // Dinner
  { id: 'd1', name: 'Ribeye Steak with Asparagus', category: 'dinner', calories: 650, protein: 52, carbs: 8, fat: 46, fiber: 3, serving: '250g steak', icon: '🥩' },
  { id: 'd2', name: 'Baked Salmon with Sweet Potato', category: 'dinner', calories: 510, protein: 36, carbs: 42, fat: 20, fiber: 6, serving: '1 fillet + 1 potato', icon: '🐟' },
  { id: 'd3', name: 'Chicken Breast & Roasted Vegetables', category: 'dinner', calories: 430, protein: 45, carbs: 24, fat: 14, fiber: 6, serving: '350g plate', icon: '🍗' },
  { id: 'd4', name: 'Tofu Stir-fry with Brown Rice', category: 'dinner', calories: 440, protein: 22, carbs: 56, fat: 15, fiber: 8, serving: '1 plate', icon: '🥘' },
  { id: 'd5', name: 'Lean Beef Pasta Bolognese', category: 'dinner', calories: 580, protein: 38, carbs: 64, fat: 18, fiber: 5, serving: '1 plate (300g)', icon: '🍝' },

  // Snacks
  { id: 's1', name: 'Handful of Almonds & Walnuts', category: 'snack', calories: 170, protein: 6, carbs: 6, fat: 15, fiber: 3, serving: '30g', icon: '🥜' },
  { id: 's2', name: 'Whey Protein Shake', category: 'snack', calories: 140, protein: 26, carbs: 3, fat: 2, fiber: 1, serving: '1 scoop with water', icon: '🥛' },
  { id: 's3', name: 'Apple with Peanut Butter', category: 'snack', calories: 210, protein: 5, carbs: 28, fat: 10, fiber: 5, serving: '1 medium apple + 1 tbsp PB', icon: '🍎' },
  { id: 's4', name: 'Dark Chocolate (85%)', category: 'snack', calories: 160, protein: 2, carbs: 12, fat: 12, fiber: 3, serving: '30g', icon: '🍫' },
  { id: 's5', name: 'Cottage Cheese with Honey', category: 'snack', calories: 180, protein: 18, carbs: 16, fat: 4, fiber: 0, serving: '150g', icon: '🍨' }
];

export const calculateMacrosSummary = (loggedItems) => {
  return loggedItems.reduce(
    (acc, item) => {
      const qty = item.quantity || 1;
      acc.calories += (item.calories || 0) * qty;
      acc.protein += (item.protein || 0) * qty;
      acc.carbs += (item.carbs || 0) * qty;
      acc.fat += (item.fat || 0) * qty;
      acc.fiber += (item.fiber || 0) * qty;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );
};
