import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useMovies } from '../context/MoviesContext';

export default function ToWatchScreen({ navigation }) {
  const { movies } = useMovies(); 
  
  // 自動過濾出「還沒看」的電影
  const toWatchMovies = movies.filter(movie => !movie.isWatched);

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
      <FlatList
        data={toWatchMovies}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🎬</Text>
            <Text style={styles.emptyText}>還沒有待追清單</Text>
            <Text style={styles.emptySub}>快去搜尋頁加幾部電影吧！</Text>
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