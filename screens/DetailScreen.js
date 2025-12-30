import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Alert
} from 'react-native';
import { useMovies } from '../context/MoviesContext';
import StarRating from '../components/StarRating';
import { shareMovie } from '../utils/shareUtils';

export default function DetailScreen({ route, navigation }) {
  const { movie: paramMovie } = route.params;
  const movieId = paramMovie.id.toString();

  const { 
    getMovieById, 
    addMovie, 
    markAsWatched, 
    updateMovieReview, 
    removeMovie
  } = useMovies();

  const contextMovie = getMovieById(movieId);
  const displayMovie = contextMovie || paramMovie;
  const isSaved = !!contextMovie;

  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [hasLoadedReview, setHasLoadedReview] = useState(false);

  useEffect(() => {
    if (contextMovie && !hasLoadedReview) {
      setRating(contextMovie.userRating || 0);
      setReview(contextMovie.userReview || '');
      setHasLoadedReview(true);
    }
  }, [contextMovie, hasLoadedReview]);

  // ★ 動作 1：加入待追蹤清單
  const handleSave = async () => {
    console.log(`[Log] 動作：使用者點擊加入清單 | 電影：${displayMovie.title || displayMovie.name}`);
    
    const success = await addMovie(displayMovie);
    if (success) {
      console.log(`[Log] 結果：成功加入清單`);
      Alert.alert('成功', '已加入待追清單！');
    } else {
      console.log(`[Log] 結果：加入失敗 (已存在)`);
      Alert.alert('提示', '這部電影已經在清單中了');
    }
  };

  // ★ 動作 2：儲存評分與心得
  const handleUpdateReview = async () => {
    if (!isSaved) return;
    
    console.log('========== [Log] 使用者提交心得 ==========');
    console.log(`電影名稱：${displayMovie.title || displayMovie.name}`);
    console.log(`給予評分：${rating} 分`);
    console.log(`撰寫心得：${review}`);
    console.log('========================================');

    await updateMovieReview(movieId, rating, review);
    Alert.alert('成功', '心得與評分已儲存！');
  };

  // ★ 動作 3：標記觀看狀態
  const handleToggleWatched = async () => {
    if (!isSaved) return;
    console.log(`[Log] 動作：使用者標記為已看 | 電影：${displayMovie.title || displayMovie.name}`);
    await markAsWatched(movieId);
  };

  // ★ 動作 4：刪除電影
  const handleDelete = () => {
    Alert.alert(
      '確認刪除',
      '確定要從清單中移除這部電影嗎？',
      [
        { text: '取消', style: 'cancel', onPress: () => console.log('[Log] 動作：使用者取消刪除') },
        { 
          text: '刪除', 
          style: 'destructive', 
          onPress: () => {
            console.log(`[Log] 動作：使用者確認刪除電影 | ID: ${movieId}`);
            removeMovie(movieId);
            navigation.goBack();
          }
        }
      ]
    );
  };

  // ★ 動作 5：分享電影
  const handleShareMovie = async () => {
    await shareMovie(displayMovie);
  };

  return (
    <ScrollView style={styles.container}>
      <Image 
        source={{ uri: displayMovie.posterUrl || 'https://via.placeholder.com/300x450' }} 
        style={styles.poster} 
      />
      
      <View style={styles.content}>
        <Text style={styles.title}>{displayMovie.title || displayMovie.name}</Text>
        <Text style={styles.info}>
          {displayMovie.release_date || displayMovie.first_air_date || '未知日期'} | 
          TMDB ⭐ {
            (displayMovie.vote_average && displayMovie.vote_average > 0) 
              ? displayMovie.vote_average.toFixed(1)
              : (displayMovie.voteAverage && displayMovie.voteAverage > 0)
                ? displayMovie.voteAverage.toFixed(1)
                : '暫無評分'
          }
        </Text>
        
        <Text style={styles.sectionTitle}>劇情簡介</Text>
        <Text style={styles.overview}>{displayMovie.overview || '暫無簡介'}</Text>

        <View style={styles.actionArea}>
          {!isSaved ? (
            <TouchableOpacity style={styles.addBtn} onPress={handleSave}>
              <Text style={styles.btnText}>➕ 加入待追蹤清單</Text>
            </TouchableOpacity>
          ) : (
            <View>
              <View style={styles.statusRow}>
                <Text style={styles.statusText}>
                  狀態：{displayMovie.isWatched ? '✅ 已看完' : '📋 待追中'}
                </Text>
                {!displayMovie.isWatched && (
                  <TouchableOpacity style={styles.watchBtn} onPress={handleToggleWatched}>
                    <Text style={styles.btnText}>標記為已看</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.reviewBox}>
                <Text style={styles.sectionTitle}>我的影評</Text>
                
                <View style={styles.ratingSection}>
                  <Text style={styles.label}>給個評分：</Text>
                  <StarRating 
                    rating={rating} 
                    onRatingChange={(r) => {
                      setRating(r);
                      // 這裡也可以加 Log 追蹤每一次點擊星星
                      console.log(`[Log] 動作：使用者點擊星星評分 -> ${r} 分`);
                    }} 
                    size={32} 
                  />
                  <Text style={styles.ratingValue}>
                    {rating > 0 ? `${rating} 分` : '點擊星星評分'}
                  </Text>
                </View>

                <TextInput 
                  style={styles.reviewInput}
                  placeholder="寫下你的觀後感..."
                  multiline
                  value={review}
                  onChangeText={setReview}
                  // 如果想連打字都追蹤，可以加這裡，但 Log 會太多，通常不建議
                />
                <TouchableOpacity style={styles.saveReviewBtn} onPress={handleUpdateReview}>
                  <Text style={styles.btnText}>💾 儲存心得</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                <Text style={styles.deleteText}>🗑️ 從清單移除</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareBtn} onPress={handleShareMovie}>
                <Text style={styles.shareText}>📤 分享電影</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  poster: { width: '100%', height: 450, resizeMode: 'cover' },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  info: { color: '#666', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10, color: '#333' },
  overview: { lineHeight: 24, color: '#444' },
  actionArea: { marginTop: 30 },
  addBtn: { backgroundColor: '#e50914', padding: 15, borderRadius: 10, alignItems: 'center' },
  watchBtn: { backgroundColor: '#2872a7', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8, marginLeft: 10 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, padding: 10, backgroundColor: '#f8f9fa', borderRadius: 8 },
  statusText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  reviewBox: { marginTop: 10, padding: 15, backgroundColor: '#f0f0f0', borderRadius: 10 },
  ratingSection: { alignItems: 'center', marginBottom: 15 },
  label: { marginBottom: 5, color: '#666' },
  ratingValue: { marginTop: 5, color: '#e50914', fontWeight: 'bold', fontSize: 16 },
  reviewInput: { backgroundColor: '#fff', height: 100, borderRadius: 5, padding: 10, textAlignVertical: 'top', marginBottom: 10, borderWidth: 1, borderColor: '#ddd' },
  saveReviewBtn: { backgroundColor: '#28a745', padding: 12, borderRadius: 8, alignItems: 'center' },
  deleteBtn: { marginTop: 20, alignItems: 'center', padding: 10 },
  deleteText: { color: '#999', textDecorationLine: 'underline' },
  shareBtn: { marginTop: 15, alignItems: 'center', padding: 10, paddingVertical: 12, backgroundColor: '#f0f0f0', borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  shareText: { color: '#2872a7', fontWeight: '600', fontSize: 14 }
});