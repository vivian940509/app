import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MoviesContext = createContext();

export const useMovies = () => useContext(MoviesContext);

export const MoviesProvider = ({ children }) => {
  const [movies, setMovies] = useState([]);
  const [currentUser, setCurrentUser] = useState(null); // 紀錄現在是誰
  const [loading, setLoading] = useState(true);

  // 1. App 啟動時：檢查有沒有人已經登入
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const savedName = await AsyncStorage.getItem('userName');
        if (savedName) {
          setCurrentUser(savedName);
          await loadUserData(savedName); // 載入該使用者的專屬資料
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    checkLogin();
  }, []);

  // 核心功能：根據使用者名稱載入資料
  const loadUserData = async (username) => {
    try {
      // ★ 關鍵：Key 加上使用者名稱，實現資料隔離！
      const userKey = `@movie_data_${username}`; 
      const jsonValue = await AsyncStorage.getItem(userKey);
      if (jsonValue != null) {
        setMovies(JSON.parse(jsonValue));
      } else {
        setMovies([]); // 如果是新使用者，清空清單
      }
    } catch (e) {
      console.error('讀取失敗:', e);
    }
  };

  // 2. 當 movies 改變時，存回「該使用者」的專屬空間
  useEffect(() => {
    if (currentUser && !loading) {
      const saveData = async () => {
        try {
          const userKey = `@movie_data_${currentUser}`;
          await AsyncStorage.setItem(userKey, JSON.stringify(movies));
        } catch (e) {
          console.error('儲存失敗:', e);
        }
      };
      saveData();
    }
  }, [movies, currentUser, loading]);

  // --- 提供給外部呼叫的登入/登出功能 ---

  const login = async (username) => {
    await AsyncStorage.setItem('userName', username); // 記住是誰登入
    setCurrentUser(username);
    await loadUserData(username); // 切換資料庫
  };

  const logout = async () => {
    await AsyncStorage.removeItem('userName'); // 清除登入紀錄
    setCurrentUser(null);
    setMovies([]); // 清空記憶體中的清單
  };

  // --- 原有的電影操作功能 (邏輯不變) ---

  const addMovie = async (movie) => {
    if (movies.some(m => m.id.toString() === movie.id.toString())) return false;
    
    // 確保日期欄位正確保存
    const releaseDate = movie.release_date || movie.releaseDate || movie.first_air_date || movie.firstAirDate || null;
    
    const newMovie = {
      ...movie,
      id: movie.id.toString(),
      title: movie.title || movie.name, // 確保有標題
      release_date: releaseDate, // 標準化欄位名稱
      releaseDate: releaseDate, // 保留兩種格式以相容
      isWatched: false,
      userRating: 0,
      userReview: '',
      dateAdded: new Date().toISOString(),
      posterUrl: movie.posterUrl || (movie.poster_path ? `https://image.tmdb.org/t/p/w342${movie.poster_path}` : null)
    };
    
    console.log(`[MoviesContext] 加入電影: "${newMovie.title}", 上映日期: ${releaseDate}`);
    setMovies(prev => [newMovie, ...prev]);
    return true;
  };

  const markAsWatched = async (id) => {
    setMovies(prev => prev.map(m => 
      m.id.toString() === id.toString() ? { ...m, isWatched: true, watchedDate: new Date().toISOString() } : m
    ));
    return true;
  };

  const updateMovieReview = async (id, rating, review) => {
    setMovies(prev => prev.map(m => 
      m.id.toString() === id.toString() ? { ...m, userRating: rating, userReview: review } : m
    ));
    return true;
  };

  const removeMovie = (id) => {
    setMovies(prev => prev.filter(m => m.id.toString() !== id.toString()));
  };

  const getMovieById = (id) => {
    return movies.find(m => m.id.toString() === id.toString());
  };

  return (
    <MoviesContext.Provider value={{ 
      movies, 
      currentUser,
      login, 
      logout,
      addMovie, 
      markAsWatched, 
      updateMovieReview, 
      removeMovie,
      getMovieById,
      loading 
    }}>
      {children}
    </MoviesContext.Provider>
  );
};