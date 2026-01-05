import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useMovies } from '../context/MoviesContext';
import FilterSortBar from '../components/FilterSortBar';

export default function ToWatchScreen({ navigation }) {
  const { movies } = useMovies(); 
  const [filters, setFilters] = useState({ startYear: null, endYear: null, minRating: null, maxRating: null });
  const [sorting, setSorting] = useState({ by: 'dateAdded', order: 'desc' });
  
  // 篩選與排序邏輯
  const toWatchMovies = useMemo(() => {
    console.log('[ToWatch] 開始篩選，filters:', filters, 'sorting:', sorting);
    let filtered = movies.filter(movie => !movie.isWatched);
    console.log('[ToWatch] 初始電影數量:', filtered.length);

    // 電影上映年份範圍篩選
    if (filters.startYear || filters.endYear) {
      const beforeCount = filtered.length;
      filtered = filtered.filter(movie => {
        const dateStr = movie.release_date || movie.first_air_date;
        
        // 沒有日期資料的電影，在有設定年份篩選時排除
        if (!dateStr) {
          console.log(`[ToWatch] 電影 "${movie.title || movie.name}" 沒有日期資料，已排除`);
          return false;
        }
        
        const year = new Date(dateStr).getFullYear();
        console.log(`[ToWatch] 檢查電影 "${movie.title || movie.name}" (${year})`);
        
        // 檢查起始年份
        if (filters.startYear && year < filters.startYear) {
          console.log(`  -> 年份 ${year} < 起始年份 ${filters.startYear}，已排除`);
          return false;
        }
        // 檢查結束年份
        if (filters.endYear && year > filters.endYear) {
          console.log(`  -> 年份 ${year} > 結束年份 ${filters.endYear}，已排除`);
          return false;
        }
        
        console.log(`  -> 通過篩選`);
        return true;
      });
      console.log(`[ToWatch] 年份範圍篩選 ${filters.startYear || '不限'}-${filters.endYear || '不限'}: ${beforeCount} -> ${filtered.length}`);
    } else {
      console.log('[ToWatch] 未設定年份篩選，顯示所有電影');
    }

    // 排序
    console.log(`[ToWatch] 排序依據: ${sorting.by}, 順序: ${sorting.order}`);
    filtered.sort((a, b) => {
      let compareA, compareB;

      switch (sorting.by) {
        case 'dateAdded':
          compareA = new Date(a.dateAdded || 0).getTime();
          compareB = new Date(b.dateAdded || 0).getTime();
          break;
        case 'title':
          compareA = (a.title || a.name || '').toLowerCase();
          compareB = (b.title || b.name || '').toLowerCase();
          break;
        case 'year':
          compareA = a.release_date ? new Date(a.release_date).getFullYear() : 0;
          compareB = b.release_date ? new Date(b.release_date).getFullYear() : 0;
          break;
        default:
          return 0;
      }

      if (sorting.order === 'asc') {
        return compareA > compareB ? 1 : compareA < compareB ? -1 : 0;
      } else {
        return compareA < compareB ? 1 : compareA > compareB ? -1 : 0;
      }
    });

    console.log('[ToWatch] 最終電影數量:', filtered.length);
    return filtered;
  }, [movies, filters, sorting]);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('Detail', { movie: item })}
    >
      <Image 
        source={{ uri: item.posterUrl || 'https://via.placeholder.com/100x150' }} 
        style={styles.poster} 
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{item.title || item.name}</Text>
        <Text style={styles.date}>加入日期：{new Date(item.dateAdded).toLocaleDateString()}</Text>
        <Text style={styles.status}>📋 待追蹤</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FilterSortBar 
        onFilterChange={setFilters}
        onSortChange={setSorting}
        showRatingFilter={false}
      />
      <FlatList
        data={toWatchMovies}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>
              {(filters.startYear || filters.endYear || filters.minRating || filters.maxRating)
                ? '篩選條件沒有符合的電影'
                : '還沒有待追清單'}
            </Text>
            <Text style={styles.emptySub}>
              {(filters.startYear || filters.endYear || filters.minRating || filters.maxRating)
                ? '請調整篩選條件或重置篩選'
                : '快去搜尋頁加幾部電影吧！'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  card: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 15, marginTop: 15, borderRadius: 10, padding: 10, elevation: 2 },
  poster: { width: 70, height: 105, borderRadius: 5, backgroundColor: '#eee' },
  info: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  date: { fontSize: 12, color: '#888', marginBottom: 5 },
  status: { fontSize: 14, color: '#2872a7', fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyEmoji: { fontSize: 60, marginBottom: 10 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#555' },
  emptySub: { fontSize: 14, color: '#888', marginTop: 5 },
});