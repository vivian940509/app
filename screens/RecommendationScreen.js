import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { useMovies } from '../context/MoviesContext';
import tmdbService from '../services/tmdbService';

export default function RecommendationScreen({ navigation }) {
  const { movies } = useMovies();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendationType, setRecommendationType] = useState('trending'); // 'trending' or 'similar'

  // 生成推薦電影函數定義
  const generateRecommendations = React.useCallback(async () => {
    setLoading(true);
    
    if (recommendationType === 'trending') {
      // 🔥 熱門推薦：從 TMDB API 抓取最近的熱門電影
      try {
        console.log('開始獲取熱門電影...');
        const trendingData = await tmdbService.getTrendingMovies(1);
        console.log('熱門電影數據:', trendingData);
        console.log('第一部電影詳細:', trendingData.results[0]);
        
        if (!trendingData || !trendingData.results) {
          console.warn('沒有熱門電影數據');
          setRecommendations([]);
          setLoading(false);
          return;
        }

        // 獲取用戶已有的電影 ID（包括已看完和待追清單，避免重複推薦）
        const userMovieIds = new Set(movies.map(m => m.id));

        // 轉換 API 數據格式，添加海報 URL
        const trendingMovies = trendingData.results
          .filter(movie => !userMovieIds.has(movie.id)) // 排除所有已有的電影（已看完+待追）
          .map(movie => {
            console.log('處理電影:', movie.title, {
              releaseDate: movie.releaseDate,
              release_date: movie.release_date,
              voteAverage: movie.voteAverage,
              vote_average: movie.vote_average
            });
            // 計算熱門推薦指數：評分 × 10 + 人氣度權重（最高150分）
            const voteAvg = movie.voteAverage || movie.vote_average || 0;
            const voteCount = movie.voteCount || movie.vote_count || 0;
            const popularityScore = voteAvg * 10 + Math.log(voteCount + 1) * 5;
            const recommendScore = Math.min(150, Math.round(popularityScore)); // 限制最高150分
            
            return {
              id: movie.id,
              title: movie.title,
              release_date: movie.releaseDate || movie.release_date || '2024-01-01',
              year: movie.year, // 保留格式化的年份
              overview: movie.overview,
              poster_path: movie.posterPath || movie.poster_path,
              posterUrl: movie.posterUrl,
              vote_average: voteAvg,
              voteAverage: movie.voteAverage, // 保留原始欄位
              vote_count: voteCount,
              recommendScore: recommendScore, // 熱門推薦指數（最高150分）
              type: 'movie',
              isWatched: false,
              userRating: 0,
              userReview: '',
              dateAdded: new Date().toISOString(),
            };
          })
          .slice(0, 20);

        console.log('推薦電影數量:', trendingMovies.length);
        setRecommendations(trendingMovies);
      } catch (error) {
        console.error('獲取熱門電影失敗:', error);
        Alert.alert('提示', '無法獲取熱門電影，請檢查網絡連接');
        setRecommendations([]);
      }
    } else {
      // 🎯 相似推薦：從已看完的高分電影中推薦相似的
      const watched = movies.filter(m => m.isWatched && m.userRating >= 3); // 至少 3 分才納入推薦
      
      if (watched.length === 0) {
        console.log('沒有 3 分以上的電影，無法進行相似推薦');
        setRecommendations([]);
        setLoading(false);
        return;
      }

      // 從已看完的電影中推薦（按評分排序）
      const allWatched = movies.filter(m => m.isWatched);
      
      if (allWatched.length === 0) {
        setRecommendations([]);
        setLoading(false);
        return;
      }
      
      // 根據用戶評分排序推薦（5星=100分，4星=80分，以此類推）
      const recommended = allWatched
        .map(movie => {
          // 推薦指數 = 用戶評分 × 20（最高100分）
          const recommendScore = (movie.userRating || 0) * 20;
          return { ...movie, recommendScore };
        })
        .filter(m => m.recommendScore > 0)
        .sort((a, b) => b.recommendScore - a.recommendScore)
        .slice(0, 20);

      setRecommendations(recommended);
    }

    setLoading(false);
  }, [movies, recommendationType]);

  // 當類型改變時重新生成推薦
  useEffect(() => {
    generateRecommendations();
  }, [generateRecommendations]);

  const handleSelectMovie = (movie) => {
    navigation.push('Detail', { movie });
  };

  const renderRecommendationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.movieCard}
      onPress={() => handleSelectMovie(item)}
      activeOpacity={0.7}
    >
      {item.posterUrl ? (
        <Image
          source={{ uri: item.posterUrl }}
          style={styles.poster}
        />
      ) : (
        <View style={[styles.poster, styles.noPoster]}>
          <Text style={styles.noImageText}>📽️</Text>
        </View>
      )}
      <View style={styles.movieInfo}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.year}>
          {item.release_date && item.release_date !== '2024-01-01' && item.release_date !== '未知'
            ? new Date(item.release_date).getFullYear()
            : item.year || '未知年份'}
        </Text>
        <View style={styles.ratingRow}>
          <Text style={styles.tmdbRating}>
            ⭐ {item.vote_average && item.vote_average > 0 
              ? item.vote_average.toFixed(1) 
              : item.voteAverage && item.voteAverage > 0
                ? item.voteAverage.toFixed(1)
                : '暫無評分'}
          </Text>
          {item.recommendScore && item.recommendScore > 0 && (
            <Text style={styles.recommendScore}>推薦指數: {Math.round(item.recommendScore)}</Text>
          )}
        </View>
        <Text style={styles.overview} numberOfLines={3}>
          {item.overview}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#e50914" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 推薦類型切換 */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            recommendationType === 'trending' && styles.activeFilter,
          ]}
          onPress={() => setRecommendationType('trending')}
        >
          <Text
            style={[
              styles.filterText,
              recommendationType === 'trending' && styles.activeFilterText,
            ]}
          >
            🔥 熱門推薦
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            recommendationType === 'similar' && styles.activeFilter,
          ]}
          onPress={() => setRecommendationType('similar')}
        >
          <Text
            style={[
              styles.filterText,
              recommendationType === 'similar' && styles.activeFilterText,
            ]}
          >
            🎯 相似推薦
          </Text>
        </TouchableOpacity>
      </View>

      {recommendations.length > 0 ? (
        <FlatList
          data={recommendations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRecommendationItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>😔 暫無推薦</Text>
          <Text style={styles.emptySubText}>
            {recommendationType === 'similar'
              ? '需要先看完一些高分電影哦~'
              : '沒有符合條件的推薦'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#1a1a1a',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
    marginHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  activeFilter: {
    backgroundColor: '#e50914',
    borderColor: '#e50914',
  },
  filterText: {
    color: '#888',
    fontWeight: '600',
    fontSize: 13,
  },
  activeFilterText: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  movieCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
    marginHorizontal: 5,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#333',
  },
  poster: {
    width: 120,
    height: 180,
    backgroundColor: '#2a2a2a',
  },
  noPoster: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    fontSize: 40,
  },
  movieInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  year: {
    color: '#888',
    fontSize: 12,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tmdbRating: {
    color: '#FFB800',
    fontWeight: '600',
    marginRight: 10,
  },
  recommendScore: {
    color: '#e50914',
    fontSize: 11,
    fontWeight: '600',
  },
  overview: {
    color: '#aaa',
    fontSize: 11,
    lineHeight: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  emptySubText: {
    color: '#888',
    fontSize: 14,
  },
});
