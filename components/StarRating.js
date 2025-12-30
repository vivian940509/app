import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const StarRating = ({ rating = 0, onRatingChange, size = 30, color = '#FFD700' }) => {
  const handleStarPress = (starIndex) => {
    if (onRatingChange) {
      onRatingChange(starIndex + 1);
    }
  };

  return (
    <View style={styles.container}>
      {[0, 1, 2, 3, 4].map((index) => (
        <TouchableOpacity
          key={index}
          onPress={() => handleStarPress(index)}
          disabled={!onRatingChange}
        >
          <Text
            style={[
              styles.star,
              {
                fontSize: size,
                color: index < rating ? color : '#ccc',
              },
            ]}
          >
            ★
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginHorizontal: 2,
  },
});

export default StarRating;