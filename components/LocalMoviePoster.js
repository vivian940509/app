import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

// TMDB 海報組件，直接使用 TMDB 圖片
const LocalMoviePoster = ({ title, style, posterUrl }) => {
  const [imageError, setImageError] = useState(false);

  // 如果有 TMDB 圖片且載入成功，直接顯示
  if (posterUrl && !imageError) {
    return (
      <Image
        source={{ uri: posterUrl }}
        style={[styles.posterImage, style]}
        resizeMode="cover"
        onError={() => {
          console.log(`圖片載入失敗: ${title}`);
          setImageError(true);
        }}
      />
    );
  }

  // 如果沒有圖片或載入失敗，返回空
  return null;
};

const styles = StyleSheet.create({
  posterImage: {
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default LocalMoviePoster;