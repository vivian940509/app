import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import StarRating from './StarRating';
import LocalMoviePoster from './LocalMoviePoster';

const MovieListItem = ({ movie, onPress, showRating = false, isInWatchlist = false }) => {
  const title = movie.title || movie.name;
  const year = movie.release_date 
    ? new Date(movie.release_date).getFullYear() 
    : movie.first_air_date 
    ? new Date(movie.first_air_date).getFullYear() 
    : movie.year || '未知年份';

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => {
        console.log('Movie clicked:', movie.title || movie.name);
        onPress && onPress(movie);
      }}
      activeOpacity={0.7}
      accessible={true}
      accessibilityRole="button"
    >
      <View style={styles.posterContainer}>
        <LocalMoviePoster
          title={title}
          type={movie.type}
          posterUrl={movie.posterUrl}
          style={{ width: 80, height: 120 }}
        />
      </View>
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.yearBadge}>({year})</Text>
          {isInWatchlist && (
            <View style={styles.inWatchlistBadge}>
              <Text style={styles.inWatchlistText}>✓</Text>
            </View>
          )}
        </View>
        
        {movie.type === 'tv' && (
          <Text style={styles.typeIndicator}>📺 電視劇</Text>
        )}
        
        {showRating && movie.userRating && (
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingLabel}>我的評分：</Text>
            <StarRating rating={movie.userRating} size={16} />
          </View>
        )}
        
        {!showRating && movie.vote_average && (
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingLabel}>TMDB：</Text>
            <Text style={styles.avgRating}>{movie.vote_average.toFixed(1)} ⭐</Text>
          </View>
        )}
        
        {movie.watchedDate && (
          <Text style={styles.watchedDate}>
            觀看日期：{new Date(movie.watchedDate).toLocaleDateString()}
          </Text>
        )}

        {movie.overview && !showRating && (
          <Text style={styles.overview} numberOfLines={2}>
            {movie.overview}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  posterContainer: {
    width: 80,
    height: 120,
  },
  poster: {
    width: 80,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  info: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'flex-start',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  inWatchlistBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inWatchlistText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  yearBadge: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
    marginLeft: 5,
  },
  year: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  typeIndicator: {
    fontSize: 12,
    color: '#2872a7',
    marginBottom: 5,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  ratingLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 5,
  },
  avgRating: {
    fontSize: 12,
    color: '#666',
  },
  watchedDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  overview: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginTop: 8,
  },
});

export default MovieListItem;