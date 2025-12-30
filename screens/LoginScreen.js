import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useMovies } from '../context/MoviesContext'; 

export default function LoginScreen({ navigation }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState(''); 
  const { login } = useMovies(); 

  const handleLogin = async () => {
    if (name.trim().length === 0) {
      Alert.alert('提示', '請輸入帳號 (暱稱)');
      return;
    }
    // 這裡是模擬登入，所以密碼不強制檢查，但如果有輸入會比較像真的
    if (password.length === 0) {
       // 也可以選擇不強制擋密碼
       // Alert.alert('提示', '請輸入密碼');
       // return;
    }

    try {
      // ★★★ Log 紀錄區域 ★★★
      console.log(`========== [Log] 使用者嘗試登入 ==========`);
      console.log(`帳號名稱：${name}`);
      console.log(`========================================`);

      await login(name);
      
      // 登入成功後跳轉
      navigation.replace('MainTabs'); 
    } catch (e) {
      console.error(e);
      Alert.alert('錯誤', '登入失敗，請稍後再試');
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.card}>
        <Text style={styles.title}>🎬 影迷記事本</Text>
        <Text style={styles.subtitle}>登入你的專屬片單</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>帳號 / 暱稱</Text>
          <TextInput
            style={styles.input}
            placeholder="例如：莫莫"
            placeholderTextColor="#666"
            value={name}
            onChangeText={setName}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>密碼</Text>
          <TextInput
            style={styles.input}
            placeholder="請輸入密碼"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry 
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>登入 / 註冊</Text>
        </TouchableOpacity>
        
        <Text style={styles.hint}>* 這是專題模擬，輸入任意密碼即可登入</Text>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  card: {
    width: '85%',
    backgroundColor: '#2a2a2a',
    padding: 30,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#e50914',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#333',
    borderRadius: 10,
    paddingHorizontal: 15,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#444',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#e50914',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  hint: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
  }
});