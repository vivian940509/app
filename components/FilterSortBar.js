import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';

export default function FilterSortBar({ onFilterChange, onSortChange, showRatingFilter = true }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState('dateAdded'); // dateAdded, rating, title, year
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const [startYear, setStartYear] = useState(''); // 起始年份
  const [endYear, setEndYear] = useState(''); // 結束年份
  const [minRating, setMinRating] = useState('');
  const [maxRating, setMaxRating] = useState('');

  const handleApplyFilters = () => {
    // 建構篩選條件
    const filters = {
      startYear: startYear && startYear.trim() !== '' ? parseInt(startYear) : null,
      endYear: endYear && endYear.trim() !== '' ? parseInt(endYear) : null,
      minRating: minRating && minRating.trim() !== '' ? parseFloat(minRating) : null,
      maxRating: maxRating && maxRating.trim() !== '' ? parseFloat(maxRating) : null,
    };

    // 建構排序條件
    const sorting = {
      by: sortBy,
      order: sortOrder,
    };

    console.log('[FilterSortBar] 套用篩選:', filters);
    console.log('[FilterSortBar] 套用排序:', sorting);

    onFilterChange && onFilterChange(filters);
    onSortChange && onSortChange(sorting);
    setModalVisible(false);
  };

  const handleReset = () => {
    setSortBy('dateAdded');
    setSortOrder('desc');
    setStartYear('');
    setEndYear('');
    setMinRating('');
    setMaxRating('');
    onFilterChange && onFilterChange({ startYear: null, endYear: null, minRating: null, maxRating: null });
    onSortChange && onSortChange({ by: 'dateAdded', order: 'desc' });
    setModalVisible(false);
  };

  const getSortLabel = () => {
    const sortLabels = {
      dateAdded: '加入日期',
      rating: '評分',
      title: '標題',
      year: '年份',
      watchedDate: '觀看日期',
    };
    const orderLabel = sortOrder === 'desc' ? '↓' : '↑';
    return `${sortLabels[sortBy]} ${orderLabel}`;
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (startYear && startYear.trim() !== '') count++;
    if (endYear && endYear.trim() !== '') count++;
    if (minRating && minRating.trim() !== '') count++;
    if (maxRating && maxRating.trim() !== '') count++;
    return count;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>🔍 篩選排序</Text>
        {getActiveFiltersCount() > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{getActiveFiltersCount()}</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.currentSort}>
        <Text style={styles.sortLabel}>{getSortLabel()}</Text>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>篩選與排序</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* 排序選項 */}
              <Text style={styles.sectionTitle}>📊 排序方式</Text>
              <View style={styles.sortOptions}>
                <TouchableOpacity
                  style={[styles.sortOption, sortBy === 'dateAdded' && styles.sortOptionActive]}
                  onPress={() => setSortBy('dateAdded')}
                >
                  <Text style={[styles.sortOptionText, sortBy === 'dateAdded' && styles.sortOptionTextActive]}>
                    加入日期
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.sortOption, sortBy === 'watchedDate' && styles.sortOptionActive]}
                  onPress={() => setSortBy('watchedDate')}
                >
                  <Text style={[styles.sortOptionText, sortBy === 'watchedDate' && styles.sortOptionTextActive]}>
                    觀看日期
                  </Text>
                </TouchableOpacity>

                {showRatingFilter && (
                  <TouchableOpacity
                    style={[styles.sortOption, sortBy === 'rating' && styles.sortOptionActive]}
                    onPress={() => setSortBy('rating')}
                  >
                    <Text style={[styles.sortOptionText, sortBy === 'rating' && styles.sortOptionTextActive]}>
                      我的評分
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.sortOption, sortBy === 'title' && styles.sortOptionActive]}
                  onPress={() => setSortBy('title')}
                >
                  <Text style={[styles.sortOptionText, sortBy === 'title' && styles.sortOptionTextActive]}>
                    標題
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.sortOption, sortBy === 'year' && styles.sortOptionActive]}
                  onPress={() => setSortBy('year')}
                >
                  <Text style={[styles.sortOptionText, sortBy === 'year' && styles.sortOptionTextActive]}>
                    年份
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 排序順序 */}
              <Text style={styles.sectionTitle}>🔄 排序順序</Text>
              <View style={styles.orderOptions}>
                <TouchableOpacity
                  style={[styles.orderOption, sortOrder === 'desc' && styles.orderOptionActive]}
                  onPress={() => setSortOrder('desc')}
                >
                  <Text style={[styles.orderOptionText, sortOrder === 'desc' && styles.orderOptionTextActive]}>
                    ↓ 降序（大到小）
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.orderOption, sortOrder === 'asc' && styles.orderOptionActive]}
                  onPress={() => setSortOrder('asc')}
                >
                  <Text style={[styles.orderOptionText, sortOrder === 'asc' && styles.orderOptionTextActive]}>
                    ↑ 升序（小到大）
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 上映年份篩選 */}
              <Text style={styles.sectionTitle}>📅 電影上映年份篩選</Text>
              <View style={styles.ratingRange}>
                <View style={styles.ratingInput}>
                  <Text style={styles.ratingLabel}>起始年份</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="例如：2020"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={startYear}
                    onChangeText={setStartYear}
                    maxLength={4}
                  />
                </View>
                <Text style={styles.rangeSeparator}>至</Text>
                <View style={styles.ratingInput}>
                  <Text style={styles.ratingLabel}>結束年份</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="例如：2024"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={endYear}
                    onChangeText={setEndYear}
                    maxLength={4}
                  />
                </View>
              </View>
              <Text style={styles.hint}>💡 提示：留空表示不限制該範圍端點</Text>

              {/* 評分範圍篩選 */}
              {showRatingFilter && (
                <>
                  <Text style={styles.sectionTitle}>⭐ 評分範圍篩選</Text>
                  <View style={styles.ratingRange}>
                    <View style={styles.ratingInput}>
                      <Text style={styles.ratingLabel}>最低評分</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="0"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        value={minRating}
                        onChangeText={setMinRating}
                        maxLength={1}
                      />
                    </View>
                    <Text style={styles.rangeSeparator}>至</Text>
                    <View style={styles.ratingInput}>
                      <Text style={styles.ratingLabel}>最高評分</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="5"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        value={maxRating}
                        onChangeText={setMaxRating}
                        maxLength={1}
                      />
                    </View>
                  </View>
                  <Text style={styles.hint}>💡 提示：評分範圍 0-5 星</Text>
                </>
              )}
            </ScrollView>

            {/* 底部按鈕 */}
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                <Text style={styles.resetButtonText}>重置</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilters}>
                <Text style={styles.applyButtonText}>套用</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2872a7',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    position: 'relative',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#e50914',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  currentSort: {
    marginLeft: 10,
    flex: 1,
  },
  sortLabel: {
    color: '#666',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 28,
    color: '#666',
    fontWeight: '300',
  },
  modalBody: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  sortOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  sortOption: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  sortOptionActive: {
    backgroundColor: '#2872a7',
  },
  sortOptionText: {
    color: '#666',
    fontSize: 14,
  },
  sortOptionTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  orderOptions: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  orderOption: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  orderOptionActive: {
    backgroundColor: '#28a745',
  },
  orderOptionText: {
    color: '#666',
    fontSize: 14,
  },
  orderOptionTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#333',
  },
  ratingRange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingInput: {
    flex: 1,
  },
  ratingLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  rangeSeparator: {
    marginHorizontal: 10,
    color: '#666',
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 5,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 15,
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#2872a7',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
