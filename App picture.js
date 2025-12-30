import React from 'react';
import { StyleSheet, Text, View, Image, ScrollView } from 'react-native';

export default function App() {
  // 這裡定義一個小元件：AnimalCard
  const AnimalCard = ({ name, description, image }) => (
    <View style={styles.card}>
      <Image source={image} style={styles.image} resizeMode="cover" />
      <View style={styles.textBox}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.desc}>{description}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Welcome to the Animal World!</Text>
      <Text style={styles.subtitle}>
        在這裡你可以認識各種可愛又神奇的動物朋友。
      </Text>

      {/* 動物卡片 1 */}
      <AnimalCard
        name="老虎"
        description="森林中的王者，速度快、力量強，喜歡獨自行動。"
        image={require('./assets/tiger.png')}
      />

      {/* 動物卡片 2 */}
      <AnimalCard
        name="海豚"
        description="聰明的海洋生物，喜歡群體活動並善於與人互動。"
        image={require('./assets/dolphin.png')}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f5e9',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1b5e20',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#2e7d32',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 180,
  },
  textBox: {
    padding: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1b5e20',
    marginBottom: 5,
  },
  desc: {
    fontSize: 15,
    color: '#33691e',
  },
});
