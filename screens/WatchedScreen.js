import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useMovies } from '../context/MoviesContext';

export default function WatchedScreen({ navigation }) {
  const { movies } = useMovies();
  
  // 自動過濾出「已看完」的電影
  const watchedMovies = movies.filter(movie => movie.isWatched);

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
      <FlatList
        data={watchedMovies}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>✅</Text>
            <Text style={styles.emptyText}>還沒有看完的電影</Text>
            <Text style={styles.emptySub}>看完電影記得標記喔！</Text>
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