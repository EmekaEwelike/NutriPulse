import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { COLORS } from '../theme';
import { PRESET_FOODS } from '../foodDatabase';

export default function FoodLogger({ onLogFood, initialCategory = 'all' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [foodDatabase, setFoodDatabase] = useState(PRESET_FOODS);
  
  // Custom Food Modal State
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState('snack');
  const [customCals, setCustomCals] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');

  // Barcode Scanner Modal State
  const [isBarcodeOpen, setIsBarcodeOpen] = useState(false);

  // Selected Food Logging Quantity State
  const [activeFoodItem, setActiveFoodItem] = useState(null);
  const [servingQty, setServingQty] = useState(1);

  // Filter foods based on category & search term
  const filteredFoods = foodDatabase.filter(food => {
    const matchesCat = selectedCategory === 'all' || food.category === selectedCategory;
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCreateCustomFood = () => {
    if (!customName || !customCals) return;

    const newFood = {
      id: 'custom-' + Date.now(),
      name: customName,
      category: customCategory,
      calories: parseInt(customCals, 10) || 0,
      protein: parseInt(customProtein, 10) || 0,
      carbs: parseInt(customCarbs, 10) || 0,
      fat: parseInt(customFat, 10) || 0,
      fiber: 2,
      serving: '1 serving',
      icon: '✨'
    };

    setFoodDatabase([newFood, ...foodDatabase]);
    setIsCustomModalOpen(false);

    // Reset fields
    setCustomName('');
    setCustomCals('');
    setCustomProtein('');
    setCustomCarbs('');
    setCustomFat('');
  };

  const handleScanBarcodeDemo = () => {
    // Pick a mock scanned item
    const scanned = {
      id: 'barcode-' + Date.now(),
      name: 'Organic Almond Milk & Chia (Scanned)',
      category: 'snack',
      calories: 120,
      protein: 4,
      carbs: 8,
      fat: 9,
      fiber: 4,
      serving: '1 cup (240ml)',
      icon: '🔍'
    };

    setActiveFoodItem(scanned);
    setIsBarcodeOpen(false);
  };

  const handleConfirmLog = () => {
    if (!activeFoodItem) return;
    onLogFood({
      ...activeFoodItem,
      quantity: servingQty,
      loggedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    setActiveFoodItem(null);
    setServingQty(1);
  };

  return (
    <View style={styles.container}>
      {/* Search Header & Barcode Trigger */}
      <View style={styles.headerBox}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search foods, meals, snacks..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearSearch}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.barcodeBtn} onPress={() => setIsBarcodeOpen(true)}>
          <Text style={styles.barcodeBtnText}>📷 Scan</Text>
        </TouchableOpacity>
      </View>

      {/* Category Pills */}
      <View style={styles.categoryPills}>
        {['all', 'breakfast', 'lunch', 'dinner', 'snack'].map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.pill, selectedCategory === cat && styles.pillActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.pillText, selectedCategory === cat && styles.pillTextActive]}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <Text style={styles.resultsCount}>{filteredFoods.length} items found</Text>
        <TouchableOpacity style={styles.customFoodBtn} onPress={() => setIsCustomModalOpen(true)}>
          <Text style={styles.customFoodBtnText}>+ Custom Food</Text>
        </TouchableOpacity>
      </View>

      {/* Food Items List */}
      <ScrollView style={styles.foodList} showsVerticalScrollIndicator={false}>
        {filteredFoods.map(food => (
          <TouchableOpacity
            key={food.id}
            style={styles.foodCard}
            onPress={() => {
              setActiveFoodItem(food);
              setServingQty(1);
            }}
          >
            <View style={styles.foodInfo}>
              <Text style={styles.foodIcon}>{food.icon || '🥑'}</Text>
              <View>
                <Text style={styles.foodTitle}>{food.name}</Text>
                <Text style={styles.foodServing}>{food.serving} • Category: {food.category}</Text>
                <View style={styles.macroPillRow}>
                  <Text style={[styles.macroMiniPill, { color: COLORS.protein }]}>P: {food.protein}g</Text>
                  <Text style={[styles.macroMiniPill, { color: COLORS.carbs }]}>C: {food.carbs}g</Text>
                  <Text style={[styles.macroMiniPill, { color: COLORS.fat }]}>F: {food.fat}g</Text>
                </View>
              </View>
            </View>

            <View style={styles.addCol}>
              <Text style={styles.foodCalText}>{food.calories} kcal</Text>
              <View style={styles.logPlusBtn}>
                <Text style={styles.logPlusText}>+ Add</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Serving Quantity Modal */}
      {activeFoodItem && (
        <Modal transparent animationType="slide" visible={!!activeFoodItem}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{activeFoodItem.icon} Log {activeFoodItem.name}</Text>
                <TouchableOpacity onPress={() => setActiveFoodItem(null)}>
                  <Text style={styles.closeModal}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSub}>{activeFoodItem.serving}</Text>

              <View style={styles.qtyContainer}>
                <Text style={styles.qtyLabel}>Servings:</Text>
                <View style={styles.qtyStepper}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setServingQty(Math.max(1, servingQty - 1))}
                  >
                    <Text style={styles.stepperText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyVal}>{servingQty}</Text>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setServingQty(servingQty + 1)}
                  >
                    <Text style={styles.stepperText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.totalCalcBox}>
                <Text style={styles.calcLabel}>Total Calories:</Text>
                <Text style={styles.calcVal}>{activeFoodItem.calories * servingQty} kcal</Text>
              </View>

              <TouchableOpacity style={styles.confirmLogBtn} onPress={handleConfirmLog}>
                <Text style={styles.confirmLogText}>Add to Daily Log</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Custom Food Creation Modal */}
      <Modal transparent animationType="fade" visible={isCustomModalOpen}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>✨ Create Custom Food</Text>
              <TouchableOpacity onPress={() => setIsCustomModalOpen(false)}>
                <Text style={styles.closeModal}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.inputField}
              placeholder="Food Name (e.g. Homemade Smoothie)"
              placeholderTextColor={COLORS.textMuted}
              value={customName}
              onChangeText={setCustomName}
            />

            <View style={styles.inputRow}>
              <TextInput
                style={[styles.inputField, styles.halfInput]}
                placeholder="Calories (kcal)"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
                value={customCals}
                onChangeText={setCustomCals}
              />
              <TextInput
                style={[styles.inputField, styles.halfInput]}
                placeholder="Protein (g)"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
                value={customProtein}
                onChangeText={setCustomProtein}
              />
            </View>

            <View style={styles.inputRow}>
              <TextInput
                style={[styles.inputField, styles.halfInput]}
                placeholder="Carbs (g)"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
                value={customCarbs}
                onChangeText={setCustomCarbs}
              />
              <TextInput
                style={[styles.inputField, styles.halfInput]}
                placeholder="Fat (g)"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
                value={customFat}
                onChangeText={setCustomFat}
              />
            </View>

            <TouchableOpacity style={styles.confirmLogBtn} onPress={handleCreateCustomFood}>
              <Text style={styles.confirmLogText}>Save Food Item</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Barcode Scanner Modal Demo */}
      <Modal transparent animationType="fade" visible={isBarcodeOpen}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { alignItems: 'center' }]}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📷</Text>
            <Text style={styles.modalTitle}>Barcode Scanner Demo</Text>
            <Text style={[styles.modalSub, { textAlign: 'center', marginBottom: 20 }]}>
              Position camera over product barcode to automatically scan nutrition info.
            </Text>

            <TouchableOpacity style={styles.confirmLogBtn} onPress={handleScanBarcodeDemo}>
              <Text style={styles.confirmLogText}>⚡ Simulate Barcode Scan</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={{ marginTop: 12 }} onPress={() => setIsBarcodeOpen(false)}>
              <Text style={{ color: COLORS.textMuted }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingTop: 16
  },
  headerBox: {
    flexDirection: 'row',
    marginBottom: 12
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginRight: 8
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: COLORS.textPrimary,
    fontSize: 14
  },
  clearSearch: {
    color: COLORS.textMuted,
    fontSize: 16,
    paddingHorizontal: 4
  },
  barcodeBtn: {
    backgroundColor: COLORS.secondaryGlow,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    borderRadius: 14,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  barcodeBtnText: {
    color: COLORS.secondary,
    fontWeight: '700',
    fontSize: 13
  },
  categoryPills: {
    flexDirection: 'row',
    marginBottom: 12
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.cardBg,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  pillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  pillText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600'
  },
  pillTextActive: {
    color: '#000',
    fontWeight: '700'
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  resultsCount: {
    color: COLORS.textMuted,
    fontSize: 12
  },
  customFoodBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  customFoodBtnText: {
    color: COLORS.primaryLight,
    fontSize: 12,
    fontWeight: '700'
  },
  foodList: {
    flex: 1
  },
  foodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  foodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  foodIcon: {
    fontSize: 28,
    marginRight: 12
  },
  foodTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700'
  },
  foodServing: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2
  },
  macroPillRow: {
    flexDirection: 'row',
    marginTop: 4
  },
  macroMiniPill: {
    fontSize: 11,
    fontWeight: '600',
    marginRight: 8
  },
  addCol: {
    alignItems: 'flex-end'
  },
  foodCalText: {
    color: COLORS.primaryLight,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6
  },
  logPlusBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10
  },
  logPlusText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 12
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  modalTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700'
  },
  closeModal: {
    color: COLORS.textMuted,
    fontSize: 20,
    fontWeight: 'bold'
  },
  modalSub: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 16
  },
  qtyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 12
  },
  qtyLabel: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600'
  },
  qtyStepper: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.cardBorder,
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepperText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold'
  },
  qtyVal: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 16
  },
  totalCalcBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  calcLabel: {
    color: COLORS.textSecondary,
    fontSize: 14
  },
  calcVal: {
    color: COLORS.primaryLight,
    fontSize: 20,
    fontWeight: '800'
  },
  confirmLogBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    width: '100%'
  },
  confirmLogText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 15
  },
  inputField: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.textPrimary,
    fontSize: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  halfInput: {
    width: '48%'
  }
});
