import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  ActivityIndicator,
  Alert
} from 'react-native';
// 修正 1：這裡不要用大括號，因為是 default export
import tmdbService from '../services/tmdbService'; 

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState('movie'); 

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResults([]); // 搜尋前先清空舊結果

    try {
      let data;
      // 修正 2：根據類型呼叫正確的函式名稱 (searchMovies 或 searchTVShows)
      if (searchType === 'movie') {
        data = await tmdbService.searchMovies(query);
      } else {
        data = await tmdbService.searchTVShows(query);
      }
      
      console.log('[SearchScreen] 搜尋結果數量:', data.results?.length);
      if (data.results && data.results.length > 0) {
        console.log('[SearchScreen] 第一部電影資料:', {
          title: data.results[0].title || data.results[0].name,
          release_date: data.results[0].release_date,
          releaseDate: data.results[0].releaseDate,
          year: data.results[0].year
        });
      }
      
      setResults(data.results || []);
    } catch (error) {
      console.error("搜尋出錯:", error);
      Alert.alert("搜尋失敗", "請檢查網路連線或 API Key");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('Detail', { movie: item })}
    >
      <Image 
        source={{ uri: item.posterUrl || 'https://via.placeholder.com/150' }} 
        style={styles.poster} 
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{item.title || item.name}</Text>
        <Text style={styles.date}>{item.year ? `${item.year} 年` : '未知年份'}</Text>
        <Text style={styles.rating}>⭐ {item.voteAverage?.toFixed(1) || 'N/A'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        <TextInput 
          style={styles.input}
          placeholder={searchType === 'movie' ? "搜尋電影名稱..." : "搜尋電視劇名稱..."}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.btnText}>搜尋</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.typeSelector}>
        <TouchableOpacity 
          style={[styles.typeBtn, searchType === 'movie' && styles.activeType]}
          onPress={() => setSearchType('movie')}
        >
          <Text style={searchType === 'movie' ? styles.activeText : styles.typeText}>電影</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.typeBtn, searchType === 'tv' && styles.activeType]}
          onPress={() => setSearchType('tv')}
        >
          <Text style={searchType === 'tv' ? styles.activeText : styles.typeText}>電視劇</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2872a7" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.emptyText}>輸入關鍵字開始搜尋吧！</Text>}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  searchSection: { flexDirection: 'row', padding: 15, backgroundColor: '#fff' },
  input: { flex: 1, height: 45, backgroundColor: '#f1f3f5', borderRadius: 8, paddingHorizontal: 15, fontSize: 16 },
  searchBtn: { backgroundColor: '#2872a7', marginLeft: 10, paddingHorizontal: 20, justifyContent: 'center', borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  typeSelector: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#fff' },
  typeBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  activeType: { borderBottomWidth: 3, borderBottomColor: '#2872a7' },
  typeText: { color: '#adb5bd', fontSize: 16 },
  activeText: { color: '#2872a7', fontWeight: 'bold', fontSize: 16 },
  card: { flexDirection: 'row', margin: 10, backgroundColor: '#fff', borderRadius: 12, elevation: 3, overflow: 'hidden' },
  poster: { width: 100, height: 150 },
  info: { flex: 1, padding: 15, justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#343a40', marginBottom: 5 },
  date: { color: '#868e96', marginBottom: 5 },
  rating: { color: '#fcc419', fontSize: 16, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 100, color: '#adb5bd', fontSize: 16 }
});