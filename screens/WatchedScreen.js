import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useMovies } from '../context/MoviesContext';
import FilterSortBar from '../components/FilterSortBar';

export default function WatchedScreen({ navigation }) {
  const { movies } = useMovies();
  const [filters, setFilters] = useState({ startYear: null, endYear: null, minRating: null, maxRating: null });
  const [sorting, setSorting] = useState({ by: 'watchedDate', order: 'desc' });
  
  // 篩選與排序邏輯
  const watchedMovies = useMemo(() => {
    console.log('[Watched] 開始篩選，filters:', filters, 'sorting:', sorting);
    let filtered = movies.filter(movie => movie.isWatched);
    console.log('[Watched] 初始電影數量:', filtered.length);
    
    // 顯示每部電影的日期資料
    if (filtered.length > 0) {
      console.log('[Watched] 電影日期資料檢查:');
      filtered.forEach(movie => {
        console.log(`  - "${movie.title || movie.name}":`);
        console.log(`    release_date: ${movie.release_date}`);
        console.log(`    releaseDate: ${movie.releaseDate}`);
        console.log(`    first_air_date: ${movie.first_air_date}`);
      });
    }

    // 電影上映年份範圍篩選
    if (filters.startYear || filters.endYear) {
      const beforeCount = filtered.length;
      filtered = filtered.filter(movie => {
        const dateStr = movie.release_date || movie.first_air_date;
        
        // 沒有日期資料的電影，在有設定年份篩選時排除
        if (!dateStr) {
          console.log(`[Watched] 電影 "${movie.title || movie.name}" 沒有日期資料，已排除`);
          return false;
        }
        
        const year = new Date(dateStr).getFullYear();
        console.log(`[Watched] 檢查電影 "${movie.title || movie.name}" (${year})`);
        
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
      console.log(`[Watched] 年份範圍篩選 ${filters.startYear || '不限'}-${filters.endYear || '不限'}: ${beforeCount} -> ${filtered.length}`);
    } else {
      console.log('[Watched] 未設定年份篩選，顯示所有電影');
    }

    // 評分範圍篩選
    if (filters.minRating !== null && filters.minRating !== '') {
      const minRating = parseFloat(filters.minRating);
      const beforeCount = filtered.length;
      filtered = filtered.filter(movie => (movie.userRating || 0) >= minRating);
      console.log(`[Watched] 最低評分篩選 ${minRating}: ${beforeCount} -> ${filtered.length}`);
    }
    if (filters.maxRating !== null && filters.maxRating !== '') {
      const maxRating = parseFloat(filters.maxRating);
      const beforeCount = filtered.length;
      filtered = filtered.filter(movie => (movie.userRating || 0) <= maxRating);
      console.log(`[Watched] 最高評分篩選 ${maxRating}: ${beforeCount} -> ${filtered.length}`);
    }

    // 排序
    console.log(`[Watched] 排序依據: ${sorting.by}, 順序: ${sorting.order}`);
    filtered.sort((a, b) => {
      let compareA, compareB;

      switch (sorting.by) {
        case 'watchedDate':
          compareA = new Date(a.watchedDate || 0).getTime();
          compareB = new Date(b.watchedDate || 0).getTime();
          break;
        case 'dateAdded':
          compareA = new Date(a.dateAdded || 0).getTime();
          compareB = new Date(b.dateAdded || 0).getTime();
          break;
        case 'rating':
          compareA = a.userRating || 0;
          compareB = b.userRating || 0;
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

    console.log('[Watched] 最終電影數量:', filtered.length);
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
        <Text style={styles.date}>觀看日期：{new Date(item.watchedDate).toLocaleDateString()}</Text>
        <Text style={styles.rating}>我的評分：{item.userRating > 0 ? `${item.userRating} ⭐` : '尚未評分'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FilterSortBar 
        onFilterChange={setFilters}
        onSortChange={setSorting}
        showRatingFilter={true}
      />
      <FlatList
        data={watchedMovies}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>
              {(filters.startYear || filters.endYear || filters.minRating || filters.maxRating)
                ? '篩選條件沒有符合的電影'
                : '還沒有看完的電影'}
            </Text>
            <Text style={styles.emptySub}>
              {(filters.startYear || filters.endYear || filters.minRating || filters.maxRating)
                ? '請調整篩選條件或重置篩選'
                : '看完電影記得標記喔！'}
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
  rating: { fontSize: 14, color: '#f1c40f', fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyEmoji: { fontSize: 60, marginBottom: 10 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#555' },
  emptySub: { fontSize: 14, color: '#888', marginTop: 5 },
});