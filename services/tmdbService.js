// TMDB API 配置
const TMDB_API_KEY = '9cfc2140294f2324fd8cd7b92648396c'; // 您的 TMDB API Key
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// API 路徑
const API_ENDPOINTS = {
  SEARCH_MOVIE: '/search/movie',
  MOVIE_DETAILS: '/movie',
  SEARCH_TV: '/search/tv',
  TV_DETAILS: '/tv',
  TRENDING: '/trending/movie/day',
  POPULAR: '/movie/popular',
  TOP_RATED: '/movie/top_rated',
};

// 圖片尺寸選項
export const IMAGE_SIZES = {
  POSTER_SMALL: 'w185',
  POSTER_MEDIUM: 'w342',
  POSTER_LARGE: 'w500',
  BACKDROP_SMALL: 'w300',
  BACKDROP_MEDIUM: 'w780',
  BACKDROP_LARGE: 'w1280',
  ORIGINAL: 'original',
};

class TMDBService {
  constructor() {
    this.apiKey = TMDB_API_KEY;
    this.baseUrl = TMDB_BASE_URL;
    
    // 調試信息
    console.log('TMDB Service 初始化');
    console.log('API Key 長度:', this.apiKey ? this.apiKey.length : 'undefined');
    console.log('Base URL:', this.baseUrl);
  }

  // 構建完整的 API URL
  buildUrl(endpoint, params = {}) {
    // 確保 endpoint 以 / 開頭
    if (!endpoint.startsWith('/')) {
      endpoint = '/' + endpoint;
    }
    
    const baseUrl = this.baseUrl + endpoint;
    const url = new URL(baseUrl);
    
    // 添加 API key
    url.searchParams.append('api_key', this.apiKey);
    url.searchParams.append('language', 'zh-TW');
    
    // 添加其他參數
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.append(key, value.toString());
      }
    });
    
    return url.toString();
  }

  // 構建圖片 URL
  buildImageUrl(path, size = IMAGE_SIZES.POSTER_MEDIUM) {
    if (!path) return null;
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
  }

  // 通用 API 請求方法
  async makeRequest(endpoint, params = {}) {
    try {
      const url = this.buildUrl(endpoint, params);
      console.log('TMDB API URL:', url); // 調試用
      
      const response = await fetch(url);
      
      console.log('TMDB API Response Status:', response.status); // 調試用
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('TMDB API Error Response:', errorText); // 調試用
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('TMDB API Success:', data.results?.length || 0, 'results'); // 調試用
      return data;
    } catch (error) {
      console.error('TMDB API Error:', error);
      throw error;
    }
  }

  // 搜尋電影
  async searchMovies(query, page = 1) {
    if (!query || query.trim() === '') {
      throw new Error('搜尋關鍵字不能為空');
    }

    const params = {
      query: query.trim(),
      page,
      include_adult: false,
    };

    const data = await this.makeRequest(API_ENDPOINTS.SEARCH_MOVIE, params);
    
    // 格式化結果
    const results = data.results.map(movie => this.formatMovieData(movie));
    
    return {
      results,
      page: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results,
    };
  }

  // 搜尋電視劇
  async searchTVShows(query, page = 1) {
    if (!query || query.trim() === '') {
      throw new Error('搜尋關鍵字不能為空');
    }

    const params = {
      query: query.trim(),
      page,
      include_adult: false,
    };

    const data = await this.makeRequest(API_ENDPOINTS.SEARCH_TV, params);
    
    // 格式化結果
    const results = data.results.map(tv => this.formatTVData(tv));
    
    return {
      results,
      page: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results,
    };
  }

  // 取得電影詳情
  async getMovieDetails(movieId) {
    const data = await this.makeRequest(`${API_ENDPOINTS.MOVIE_DETAILS}/${movieId}`);
    return this.formatMovieData(data);
  }

  // 取得電視劇詳情
  async getTVDetails(tvId) {
    const data = await this.makeRequest(`${API_ENDPOINTS.TV_DETAILS}/${tvId}`);
    return this.formatTVData(data);
  }

  // 取得熱門電影
  async getPopularMovies(page = 1) {
    const data = await this.makeRequest(API_ENDPOINTS.POPULAR, { page });
    return {
      results: data.results.map(movie => this.formatMovieData(movie)),
      page: data.page,
      totalPages: data.total_pages,
    };
  }

  // 取得最高評分電影
  async getTopRatedMovies(page = 1) {
    const data = await this.makeRequest(API_ENDPOINTS.TOP_RATED, { page });
    return {
      results: data.results.map(movie => this.formatMovieData(movie)),
      page: data.page,
      totalPages: data.total_pages,
    };
  }

  // 取得趨勢電影
  async getTrendingMovies(page = 1) {
    const data = await this.makeRequest(API_ENDPOINTS.TRENDING, { page });
    return {
      results: data.results.map(movie => this.formatMovieData(movie)),
      page: data.page,
      totalPages: data.total_pages,
    };
  }

  // 格式化電影資料
  formatMovieData(movie) {
    return {
      id: movie.id,
      title: movie.title,
      originalTitle: movie.original_title,
      overview: movie.overview,
      releaseDate: movie.release_date, // 駝峰式
      release_date: movie.release_date, // 底線式（保留相容性）
      posterPath: movie.poster_path,
      backdropPath: movie.backdrop_path,
      voteAverage: movie.vote_average,
      voteCount: movie.vote_count,
      popularity: movie.popularity,
      genreIds: movie.genre_ids,
      adult: movie.adult,
      originalLanguage: movie.original_language,
      video: movie.video,
      // 格式化的欄位
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      posterUrl: this.buildImageUrl(movie.poster_path, IMAGE_SIZES.POSTER_MEDIUM),
      backdropUrl: this.buildImageUrl(movie.backdrop_path, IMAGE_SIZES.BACKDROP_MEDIUM),
      type: 'movie',
    };
  }

  // 格式化電視劇資料
  formatTVData(tv) {
    return {
      id: tv.id,
      name: tv.name,
      title: tv.name, // 為了相容性
      originalName: tv.original_name,
      overview: tv.overview,
      firstAirDate: tv.first_air_date, // 駝峰式
      first_air_date: tv.first_air_date, // 底線式（保留相容性）
      posterPath: tv.poster_path,
      backdropPath: tv.backdrop_path,
      voteAverage: tv.vote_average,
      voteCount: tv.vote_count,
      popularity: tv.popularity,
      genreIds: tv.genre_ids,
      originCountry: tv.origin_country,
      originalLanguage: tv.original_language,
      // 格式化的欄位
      year: tv.first_air_date ? new Date(tv.first_air_date).getFullYear() : null,
      posterUrl: this.buildImageUrl(tv.poster_path, IMAGE_SIZES.POSTER_MEDIUM),
      backdropUrl: this.buildImageUrl(tv.backdrop_path, IMAGE_SIZES.BACKDROP_MEDIUM),
      type: 'tv',
    };
  }

  // 檢查 API Key 是否有效
  async validateApiKey() {
    try {
      await this.makeRequest('/configuration');
      return true;
    } catch (error) {
      return false;
    }
  }
}

// 建立實例
const tmdbService = new TMDBService();

export default tmdbService;

// 便利方法導出
export const {
  searchMovies,
  searchTVShows,
  getMovieDetails,
  getTVDetails,
  getPopularMovies,
  getTopRatedMovies,
  getTrendingMovies,
  buildImageUrl,
  validateApiKey,
} = tmdbService;