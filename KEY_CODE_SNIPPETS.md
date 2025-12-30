# 電影管理平台 - 重要程式碼片段

## 📋 目錄
1. [狀態管理 - MoviesContext](#1-狀態管理---moviescontext)
2. [TMDB API 服務](#2-tmdb-api-服務)
3. [推薦系統算法](#3-推薦系統算法)
4. [統計圖表組件](#4-統計圖表組件)
5. [分享功能](#5-分享功能)
6. [數據導出](#6-數據導出)
7. [電影詳情頁面](#7-電影詳情頁面)
8. [評分組件](#8-評分組件)

---

## 1. 狀態管理 - MoviesContext

### 📁 `context/MoviesContext.js`

```javascript
import React, { createContext, useState, useEffect, useContext } from 'react';
import { loadMovies, saveMovies } from '../utils/storage';

const MoviesContext = createContext();

export const MoviesProvider = ({ children }) => {
  const [movies, setMovies] = useState([]);
  const [user, setUser] = useState(null);

  // 載入電影數據
  useEffect(() => {
    loadMovies().then(setMovies);
  }, []);

  // 添加電影
  const addMovie = async (movie) => {
    const newMovie = {
      ...movie,
      dateAdded: new Date().toISOString(),
      isWatched: false,
      userRating: 0,
      userReview: '',
    };
    const updatedMovies = [...movies, newMovie];
    setMovies(updatedMovies);
    await saveMovies(updatedMovies);
  };

  // 更新電影
  const updateMovie = async (movieId, updates) => {
    const updatedMovies = movies.map(m => 
      m.id === movieId ? { ...m, ...updates } : m
    );
    setMovies(updatedMovies);
    await saveMovies(updatedMovies);
  };

  // 刪除電影
  const deleteMovie = async (movieId) => {
    const updatedMovies = movies.filter(m => m.id !== movieId);
    setMovies(updatedMovies);
    await saveMovies(updatedMovies);
  };

  return (
    <MoviesContext.Provider value={{
      movies,
      user,
      setUser,
      addMovie,
      updateMovie,
      deleteMovie,
    }}>
      {children}
    </MoviesContext.Provider>
  );
};

export const useMovies = () => useContext(MoviesContext);
```

**核心功能：**
- ✅ 全局狀態管理
- ✅ 數據持久化（AsyncStorage）
- ✅ CRUD 操作（增刪改查）
- ✅ Context API 封裝

---

## 2. TMDB API 服務

### 📁 `services/tmdbService.js`

```javascript
const TMDB_API_KEY = '6e61e3c57d1c33bde2ff7f2f8b348fef';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

// 搜尋電影
export const searchMovies = async (query) => {
  const url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=zh-TW&query=${query}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
};

// 獲取熱門電影
export const getTrendingMovies = async () => {
  const url = `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&language=zh-TW`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
};

// 格式化電影數據
export const formatMovieData = (movie) => {
  return {
    id: movie.id,
    title: movie.title,
    releaseDate: movie.release_date,
    year: movie.release_date ? movie.release_date.split('-')[0] : '未知',
    overview: movie.overview,
    posterPath: movie.poster_path,
    posterUrl: movie.poster_path 
      ? `${TMDB_IMAGE_BASE}${movie.poster_path}` 
      : null,
    voteAverage: movie.vote_average || 0,
    voteCount: movie.vote_count || 0,
  };
};
```

**核心功能：**
- 🔍 電影搜尋 API
- 🔥 熱門電影 API
- 📊 數據格式化
- 🖼️ 海報 URL 處理

---

## 3. 推薦系統算法

### 📁 `screens/RecommendationScreen.js` (核心算法)

```javascript
const generateRecommendations = useCallback(async () => {
  setLoading(true);
  
  if (recommendationType === 'trending') {
    // 🔥 熱門推薦：從 TMDB 獲取
    try {
      const trendingData = await getTrendingMovies();
      
      // 排除用戶已有的電影（已看+待追）
      const userMovieIds = new Set(movies.map(m => m.id));
      
      const trendingMovies = trendingData.results
        .filter(movie => !userMovieIds.has(movie.id))
        .map(movie => ({
          id: movie.id,
          title: movie.title,
          release_date: movie.releaseDate || movie.release_date,
          year: movie.year,
          overview: movie.overview,
          posterUrl: movie.posterUrl,
          vote_average: movie.voteAverage || movie.vote_average || 0,
          vote_count: movie.voteCount || movie.vote_count || 0,
          isWatched: false,
          userRating: 0,
        }))
        .slice(0, 20);
      
      setRecommendations(trendingMovies);
    } catch (error) {
      console.error('獲取熱門電影失敗:', error);
      Alert.alert('提示', '無法獲取熱門電影');
    }
  } else {
    // ⭐ 相似推薦：基於用戶高分電影
    const watched = movies.filter(m => m.isWatched && m.userRating >= 3);
    
    if (watched.length === 0) {
      setRecommendations([]);
      setLoading(false);
      return;
    }

    const toWatchMovies = movies.filter(m => !m.isWatched);
    
    // 計算相似度分數
    const recommended = toWatchMovies
      .map(movie => {
        let similarityScore = 0;
        
        watched.forEach(watchedMovie => {
          // 1️⃣ 年代相近（±3年）
          const yearDiff = Math.abs(
            new Date(movie.release_date || '2000').getFullYear() -
            new Date(watchedMovie.release_date || '2000').getFullYear()
          );
          if (yearDiff <= 3) {
            similarityScore += (3 - yearDiff) * 20;
          }
          
          // 2️⃣ 評分相近（±1.5分）
          const ratingDiff = Math.abs(
            movie.vote_average - watchedMovie.vote_average
          );
          if (ratingDiff <= 1.5) {
            similarityScore += (1.5 - ratingDiff) * 25;
          }
          
          // 3️⃣ 人氣度相近
          const voteDiff = Math.abs(
            Math.log(movie.vote_count + 1) - 
            Math.log(watchedMovie.vote_count + 1)
          );
          if (voteDiff <= 2) {
            similarityScore += (2 - voteDiff) * 15;
          }
        });

        return { ...movie, recommendScore: similarityScore };
      })
      .filter(m => m.recommendScore > 0)
      .sort((a, b) => b.recommendScore - a.recommendScore)
      .slice(0, 20);

    setRecommendations(recommended);
  }
  
  setLoading(false);
}, [movies, recommendationType]);
```

**算法特點：**
- 🎯 兩種推薦模式（熱門/相似）
- 📊 多維度相似度計算
  - 年代相近性（±3年）
  - 評分相近性（±1.5分）
  - 人氣度相近性
- 🚫 智能過濾（排除已有電影）
- ⭐ 只推薦 3 星以上電影

---

## 4. 統計圖表組件

### 📁 `components/StatisticsCharts.js`

```javascript
import React from 'react';
import { View, Text, Dimensions, ScrollView } from 'react-native';
import { PieChart, BarChart, LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const StatisticsCharts = ({ movies }) => {
  // 📊 計算觀看統計
  const watchedCount = movies.filter(m => m.isWatched).length;
  const toWatchCount = movies.filter(m => !m.isWatched).length;

  // 🥧 圓餅圖數據 - 觀看比例
  const pieData = [
    {
      name: '已觀看',
      count: watchedCount,
      color: '#4CAF50',
      legendFontColor: '#333',
    },
    {
      name: '待追蹤',
      count: toWatchCount,
      color: '#FF9800',
      legendFontColor: '#333',
    },
  ];

  // 📊 柱狀圖數據 - 評分分布
  const ratingCounts = [0, 0, 0, 0, 0]; // 1-5星
  movies.filter(m => m.isWatched).forEach(m => {
    if (m.userRating > 0) {
      ratingCounts[m.userRating - 1]++;
    }
  });

  const barData = {
    labels: ['1星', '2星', '3星', '4星', '5星'],
    datasets: [{
      data: ratingCounts,
    }],
  };

  // 📈 折線圖數據 - 月度趨勢
  const last6Months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    last6Months.push({
      month: `${date.getMonth() + 1}月`,
      count: 0,
    });
  }

  movies.filter(m => m.isWatched && m.dateWatched).forEach(m => {
    const watchDate = new Date(m.dateWatched);
    const monthsAgo = (now.getFullYear() - watchDate.getFullYear()) * 12 +
                      (now.getMonth() - watchDate.getMonth());
    if (monthsAgo >= 0 && monthsAgo < 6) {
      last6Months[5 - monthsAgo].count++;
    }
  });

  const lineData = {
    labels: last6Months.map(m => m.month),
    datasets: [{
      data: last6Months.map(m => m.count),
    }],
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📊 觀看統計</Text>
      
      {/* 圓餅圖 */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>觀看比例</Text>
        <PieChart
          data={pieData}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          accessor="count"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>

      {/* 柱狀圖 */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>評分分布</Text>
        <BarChart
          data={barData}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          showValuesOnTopOfBars
        />
      </View>

      {/* 折線圖 */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>月度觀看趨勢</Text>
        <LineChart
          data={lineData}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
        />
      </View>
    </ScrollView>
  );
};
```

**圖表類型：**
- 🥧 PieChart - 觀看比例（已看/待追）
- 📊 BarChart - 評分分布（1-5星）
- 📈 LineChart - 月度趨勢（近6個月）

---

## 5. 分享功能

### 📁 `utils/shareUtils.js`

```javascript
import { Share, Alert } from 'react-native';

// 分享單部電影
export const shareMovie = async (movie) => {
  try {
    const message = `🎬 ${movie.title}
${movie.year ? `📅 ${movie.year}` : ''}
⭐ TMDB: ${movie.vote_average ? movie.vote_average.toFixed(1) : '暫無評分'}
${movie.userRating ? `⭐ 我的評分: ${movie.userRating}/5` : ''}
${movie.userReview ? `📝 ${movie.userReview}` : ''}`;

    await Share.share({
      message,
      title: `分享電影 - ${movie.title}`,
    });
  } catch (error) {
    Alert.alert('錯誤', '分享失敗');
  }
};

// 分享電影列表
export const shareMovieList = async (movies, listType) => {
  try {
    const title = listType === 'watched' ? '已觀看清單' : '待追蹤清單';
    let message = `🎬 我的${title} (${movies.length}部)\n\n`;
    
    movies.slice(0, 10).forEach((movie, index) => {
      message += `${index + 1}. ${movie.title}`;
      if (movie.userRating) {
        message += ` ⭐${movie.userRating}/5`;
      }
      message += '\n';
    });

    if (movies.length > 10) {
      message += `\n...還有 ${movies.length - 10} 部電影`;
    }

    await Share.share({ message, title });
  } catch (error) {
    Alert.alert('錯誤', '分享失敗');
  }
};

// 分享觀看統計
export const shareWatchStatistics = async (movies) => {
  try {
    const watched = movies.filter(m => m.isWatched);
    const toWatch = movies.filter(m => !m.isWatched);
    const avgRating = watched.length > 0
      ? (watched.reduce((sum, m) => sum + m.userRating, 0) / watched.length).toFixed(1)
      : 0;

    const message = `📊 我的電影觀看統計

🎬 總電影數: ${movies.length}
✅ 已觀看: ${watched.length}
📋 待追蹤: ${toWatch.length}
⭐ 平均評分: ${avgRating}/5`;

    await Share.share({
      message,
      title: '我的電影統計',
    });
  } catch (error) {
    Alert.alert('錯誤', '分享失敗');
  }
};
```

**分享類型：**
- 🎬 單部電影（含評分、評論）
- 📋 電影列表（已看/待追）
- 📊 觀看統計（數量、平均分）

---

## 6. 數據導出

### 📁 `utils/exportUtils.js`

```javascript
import { Share, Alert } from 'react-native';

// 導出為 JSON
export const exportAsJSON = async (movies) => {
  try {
    const jsonData = JSON.stringify(movies, null, 2);
    const previewText = `📦 電影數據 JSON 格式\n共 ${movies.length} 部電影\n\n${jsonData.slice(0, 500)}...`;

    await Share.share({
      message: previewText,
      title: 'movies_export.json',
    });
  } catch (error) {
    Alert.alert('錯誤', '導出失敗');
  }
};

// 導出為 CSV
export const exportAsCSV = async (movies) => {
  try {
    let csv = 'ID,標題,年份,狀態,評分,評論,TMDB評分\n';
    
    movies.forEach(movie => {
      csv += `${movie.id},`;
      csv += `"${movie.title}",`;
      csv += `${movie.year || '未知'},`;
      csv += `${movie.isWatched ? '已看' : '待追'},`;
      csv += `${movie.userRating || 0},`;
      csv += `"${(movie.userReview || '').replace(/"/g, '""')}",`;
      csv += `${movie.vote_average || 0}\n`;
    });

    await Share.share({
      message: csv,
      title: 'movies_export.csv',
    });
  } catch (error) {
    Alert.alert('錯誤', '導出失敗');
  }
};

// 導出為純文本
export const exportAsText = async (movies) => {
  try {
    let text = `📚 我的電影清單\n`;
    text += `總計: ${movies.length} 部\n`;
    text += `已看: ${movies.filter(m => m.isWatched).length} 部\n`;
    text += `待追: ${movies.filter(m => !m.isWatched).length} 部\n\n`;
    text += `${'='.repeat(40)}\n\n`;

    movies.forEach((movie, index) => {
      text += `${index + 1}. ${movie.title}\n`;
      text += `   年份: ${movie.year || '未知'}\n`;
      text += `   狀態: ${movie.isWatched ? '✅ 已看' : '📋 待追'}\n`;
      if (movie.userRating) {
        text += `   評分: ${'⭐'.repeat(movie.userRating)} (${movie.userRating}/5)\n`;
      }
      if (movie.userReview) {
        text += `   評論: ${movie.userReview}\n`;
      }
      text += '\n';
    });

    await Share.share({
      message: text,
      title: 'movies_export.txt',
    });
  } catch (error) {
    Alert.alert('錯誤', '導出失敗');
  }
};
```

**導出格式：**
- 📄 JSON - 完整數據結構
- 📊 CSV - 表格格式（Excel 可讀）
- 📝 TXT - 純文本可讀格式

---

## 7. 電影詳情頁面

### 📁 `screens/DetailScreen.js` (核心邏輯)

```javascript
const DetailScreen = ({ route, navigation }) => {
  const { movie: initialMovie } = route.params;
  const { movies, updateMovie } = useMovies();
  
  // 從 Context 獲取最新數據
  const movie = movies.find(m => m.id === initialMovie.id) || initialMovie;
  
  const [rating, setRating] = useState(movie.userRating || 0);
  const [review, setReview] = useState(movie.userReview || '');

  // 保存評分和評論
  const handleSave = async () => {
    try {
      await updateMovie(movie.id, {
        userRating: rating,
        userReview: review,
        isWatched: true,
        dateWatched: new Date().toISOString(),
      });
      Alert.alert('成功', '評分已保存');
      navigation.goBack();
    } catch (error) {
      Alert.alert('錯誤', '保存失敗');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* 電影海報 */}
      <LocalMoviePoster
        posterUrl={movie.posterUrl}
        posterPath={movie.poster_path}
        title={movie.title}
      />

      {/* 電影標題 */}
      <Text style={styles.title}>{movie.title}</Text>
      <Text style={styles.year}>{movie.year}</Text>

      {/* TMDB 評分 */}
      <View style={styles.tmdbRating}>
        <Text style={styles.tmdbLabel}>TMDB ⭐</Text>
        <Text style={styles.tmdbScore}>
          {movie.vote_average 
            ? movie.vote_average.toFixed(1)
            : movie.voteAverage 
              ? movie.voteAverage.toFixed(1)
              : '暫無評分'}
        </Text>
        <Text style={styles.voteCount}>
          {movie.vote_count || movie.voteCount || 0} 人評分
        </Text>
      </View>

      {/* 簡介 */}
      <Text style={styles.sectionTitle}>簡介</Text>
      <Text style={styles.overview}>
        {movie.overview || '暫無簡介'}
      </Text>

      {/* 用戶評分 */}
      <Text style={styles.sectionTitle}>我的評分</Text>
      <StarRating rating={rating} onRatingChange={setRating} />

      {/* 用戶評論 */}
      <Text style={styles.sectionTitle}>我的影評</Text>
      <TextInput
        style={styles.reviewInput}
        placeholder="寫下你的觀後感..."
        value={review}
        onChangeText={setReview}
        multiline
      />

      {/* 操作按鈕 */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>保存</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => shareMovie(movie)}
        >
          <Text style={styles.shareButtonText}>分享</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
```

**核心功能：**
- 🖼️ 海報顯示（本地優先）
- ⭐ 用戶評分（1-5星）
- 📝 評論編輯
- 💾 數據保存
- 📤 社交分享

---

## 8. 評分組件

### 📁 `components/StarRating.js`

```javascript
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

const StarRating = ({ rating, onRatingChange, size = 40 }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <View style={styles.container}>
      {stars.map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onRatingChange(star)}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: size }}>
            {star <= rating ? '⭐' : '☆'}
          </Text>
        </TouchableOpacity>
      ))}
      <Text style={styles.ratingText}>
        {rating > 0 ? `${rating} 分` : '未評分'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  ratingText: {
    marginLeft: 15,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
});

export default StarRating;
```

**特點：**
- ⭐ 可互動星級評分
- 📏 可自定義大小
- 🎨 實心/空心星星切換

---

## 9. 數據持久化

### 📁 `utils/storage.js`

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

const MOVIES_KEY = '@movies';
const USER_KEY = '@user';

// 保存電影數據
export const saveMovies = async (movies) => {
  try {
    await AsyncStorage.setItem(MOVIES_KEY, JSON.stringify(movies));
  } catch (error) {
    console.error('保存電影失敗:', error);
  }
};

// 載入電影數據
export const loadMovies = async () => {
  try {
    const data = await AsyncStorage.getItem(MOVIES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('載入電影失敗:', error);
    return [];
  }
};

// 保存用戶數據
export const saveUser = async (user) => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('保存用戶失敗:', error);
  }
};

// 載入用戶數據
export const loadUser = async () => {
  try {
    const data = await AsyncStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('載入用戶失敗:', error);
    return null;
  }
};
```

**功能：**
- 💾 AsyncStorage 封裝
- 📦 JSON 序列化/反序列化
- ⚠️ 錯誤處理

---

## 10. 應用入口

### 📁 `App.js` (導航結構)

```javascript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MoviesProvider } from './context/MoviesContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Search" 
        component={SearchScreen}
        options={{ title: '🔍 搜尋' }}
      />
      <Tab.Screen 
        name="ToWatch" 
        component={ToWatchScreen}
        options={{ title: '📋 待追' }}
      />
      <Tab.Screen 
        name="Watched" 
        component={WatchedScreen}
        options={{ title: '✅ 已看' }}
      />
      <Tab.Screen 
        name="Recommendation" 
        component={RecommendationScreen}
        options={{ title: '⭐ 推薦' }}
      />
      <Tab.Screen 
        name="Export" 
        component={ExportScreen}
        options={{ title: '📤 導出' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: '👤 個人' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <MoviesProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Main" 
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Detail" 
            component={DetailScreen}
            options={{ title: '電影詳情' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </MoviesProvider>
  );
}
```

**結構：**
- 🧭 Stack + Tab 雙層導航
- 🎯 6 個主要 Tab 頁面
- 📱 Modal 形式的詳情頁

---

## 📊 技術棧總結

```javascript
{
  "dependencies": {
    "react-native": "0.81.5",
    "expo": "~54.0.25",
    "@react-navigation/native": "^6.x",
    "@react-navigation/stack": "^6.x",
    "@react-navigation/bottom-tabs": "^6.x",
    "@react-native-async-storage/async-storage": "^1.x",
    "react-native-chart-kit": "^6.x",
    "react-native-svg": "^13.x"
  }
}
```

### 架構特點
- ✅ **狀態管理**: Context API
- ✅ **路由導航**: React Navigation
- ✅ **數據持久**: AsyncStorage
- ✅ **圖表可視**: react-native-chart-kit
- ✅ **API 集成**: TMDB API
- ✅ **分享導出**: React Native Share API

---

**文件創建日期：** 2025年12月31日  
**版本：** 1.0.0
