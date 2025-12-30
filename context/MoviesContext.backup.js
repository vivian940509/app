import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { getMoviesData, saveMoviesData } from '../utils/storage';

// 初始狀態
const initialState = {
  movies: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

// Action Types
export const MOVIES_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_MOVIES: 'SET_MOVIES',
  ADD_MOVIE: 'ADD_MOVIE',
  UPDATE_MOVIE: 'UPDATE_MOVIE',
  REMOVE_MOVIE: 'REMOVE_MOVIE',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const moviesReducer = (state, action) => {
  switch (action.type) {
    case MOVIES_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case MOVIES_ACTIONS.SET_MOVIES:
      return {
        ...state,
        movies: action.payload,
        loading: false,
        lastUpdated: new Date().toISOString(),
        error: null,
      };

    case MOVIES_ACTIONS.ADD_MOVIE:
      const newMovie = {
        ...action.payload,
        id: action.payload.id || Date.now().toString(),
        dateAdded: new Date().toISOString(),
        isWatched: false,
        userRating: null,
        userReview: '',
        watchedDate: null,
      };
      return {
        ...state,
        movies: [...state.movies, newMovie],
        lastUpdated: new Date().toISOString(),
      };

    case MOVIES_ACTIONS.UPDATE_MOVIE:
      return {
        ...state,
        movies: state.movies.map(movie =>
          movie.id === action.payload.id
            ? { ...movie, ...action.payload.updates }
            : movie
        ),
        lastUpdated: new Date().toISOString(),
      };

    case MOVIES_ACTIONS.REMOVE_MOVIE:
      return {
        ...state,
        movies: state.movies.filter(movie => movie.id !== action.payload),
        lastUpdated: new Date().toISOString(),
      };

    case MOVIES_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case MOVIES_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Context
const MoviesContext = createContext();

// Provider Component
export const MoviesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(moviesReducer, initialState);

  // 載入電影資料
  const loadMovies = async () => {
    dispatch({ type: MOVIES_ACTIONS.SET_LOADING, payload: true });
    try {
      const movies = await getMoviesData();
      dispatch({ type: MOVIES_ACTIONS.SET_MOVIES, payload: movies });
    } catch (error) {
      dispatch({ type: MOVIES_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  // 新增電影
  const addMovie = async (movieData) => {
    try {
      const existingMovies = await getMoviesData();
      const newMovie = {
        ...movieData,
        id: movieData.id || Date.now().toString(),
        dateAdded: new Date().toISOString(),
        isWatched: false,
        userRating: null,
        userReview: '',
        watchedDate: null,
      };
      
      const updatedMovies = [...existingMovies, newMovie];
      await saveMoviesData(updatedMovies);
      
      dispatch({ type: MOVIES_ACTIONS.SET_MOVIES, payload: updatedMovies });
      return true;
    } catch (error) {
      dispatch({ type: MOVIES_ACTIONS.SET_ERROR, payload: error.message });
      return false;
    }
  };

  // 更新電影
  const updateMovie = async (movieId, updates) => {
    try {
      const existingMovies = await getMoviesData();
      const movieIndex = existingMovies.findIndex(movie => movie.id === movieId.toString());
      
      if (movieIndex === -1) {
        throw new Error('Movie not found');
      }
      
      existingMovies[movieIndex] = {
        ...existingMovies[movieIndex],
        ...updates,
        lastModified: new Date().toISOString(),
      };
      
      await saveMoviesData(existingMovies);
      dispatch({ type: MOVIES_ACTIONS.SET_MOVIES, payload: existingMovies });
      return true;
    } catch (error) {
      dispatch({ type: MOVIES_ACTIONS.SET_ERROR, payload: error.message });
      return false;
    }
  };

  // 刪除電影
  const removeMovie = async (movieId) => {
    try {
      const existingMovies = await getMoviesData();
      const filteredMovies = existingMovies.filter(movie => movie.id !== movieId.toString());
      
      await saveMoviesData(filteredMovies);
      dispatch({ type: MOVIES_ACTIONS.SET_MOVIES, payload: filteredMovies });
      return true;
    } catch (error) {
      dispatch({ type: MOVIES_ACTIONS.SET_ERROR, payload: error.message });
      return false;
    }
  };

  // 標記為已觀看
  const markAsWatched = async (movieId, watchedDate = null) => {
    const updates = {
      isWatched: true,
      watchedDate: watchedDate || new Date().toISOString(),
    };
    return await updateMovie(movieId, updates);
  };

  // 更新評分和心得
  const updateMovieReview = async (movieId, rating, review) => {
    const updates = {
      userRating: rating,
      userReview: review,
    };
    return await updateMovie(movieId, updates);
  };

  // 取得篩選後的電影
  const getMoviesByStatus = (isWatched) => {
    return state.movies.filter(movie => movie.isWatched === isWatched);
  };

  // 取得單一電影
  const getMovieById = (movieId) => {
    return state.movies.find(movie => movie.id === movieId);
  };

  // 清除錯誤
  const clearError = () => {
    dispatch({ type: MOVIES_ACTIONS.CLEAR_ERROR });
  };

  // 初始化載入資料
  useEffect(() => {
    loadMovies();
  }, []);

  const value = {
    // State
    movies: state.movies,
    loading: state.loading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    
    // Actions
    loadMovies,
    addMovie,
    updateMovie,
    removeMovie,
    markAsWatched,
    updateMovieReview,
    
    // Getters
    getMoviesByStatus,
    getMovieById,
    
    // Utils
    clearError,
  };

  return (
    <MoviesContext.Provider value={value}>
      {children}
    </MoviesContext.Provider>
  );
};

// Custom Hook
export const useMovies = () => {
  const context = useContext(MoviesContext);
  if (context === undefined) {
    throw new Error('useMovies must be used within a MoviesProvider');
  }
  return context;
};

export default MoviesContext;