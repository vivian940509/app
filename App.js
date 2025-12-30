import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Text, View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import Context
import { MoviesProvider } from './context/MoviesContext';

// Import screens
import LoginScreen from './screens/LoginScreen';
import ToWatchScreen from './screens/ToWatchScreen';
import WatchedScreen from './screens/WatchedScreen';
import SearchScreen from './screens/SearchScreen';
import DetailScreen from './screens/DetailScreen';
import ProfileScreen from './screens/ProfileScreen';
import RecommendationScreen from './screens/RecommendationScreen';
import ExportScreen from './screens/ExportScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 底部導航欄
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#e50914',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: { backgroundColor: '#1a1a1a', borderTopColor: '#333' },
        headerStyle: { backgroundColor: '#1a1a1a' },
        headerTintColor: '#fff',
      }}
    >
      <Tab.Screen 
        name="ToWatch" 
        component={ToWatchScreen} 
        options={{ title: '待追清單', tabBarIcon: ({ color }) => <Text style={{color, fontSize: 20}}>📋</Text> }}
      />
      <Tab.Screen 
        name="Watched" 
        component={WatchedScreen} 
        options={{ title: '已完成', tabBarIcon: ({ color }) => <Text style={{color, fontSize: 20}}>✅</Text> }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen} 
        options={{ title: '找電影', tabBarIcon: ({ color }) => <Text style={{color, fontSize: 20}}>🔍</Text> }}
      />
      <Tab.Screen 
        name="Recommendation" 
        component={RecommendationScreen} 
        options={{ title: '推薦', tabBarIcon: ({ color }) => <Text style={{color, fontSize: 20}}>🔥</Text> }}
      />
      <Tab.Screen 
        name="Export" 
        component={ExportScreen} 
        options={{ title: '導出', tabBarIcon: ({ color }) => <Text style={{color, fontSize: 20}}>📥</Text> }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: '我的', tabBarIcon: ({ color }) => <Text style={{color, fontSize: 20}}>👤</Text> }}
      />
    </Tab.Navigator>
  );
}

// 主程式
export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkLogin = async () => {
      // ★★★ 測試用：強制清除登入紀錄，讓你看到登入頁 ★★★
      // 測試成功後，請把下面這一行註解掉或刪掉！
      // await AsyncStorage.removeItem('userName'); 

      const userName = await AsyncStorage.getItem('userName');
      setInitialRoute(userName ? 'MainTabs' : 'Login');
    };
    checkLogin();
  }, []);

  if (initialRoute === null) {
    return (
      <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#1a1a1a'}}>
        <ActivityIndicator size="large" color="#e50914"/>
      </View>
    );
  }

  return (
    <MoviesProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Screen 
            name="Detail" 
            component={DetailScreen} 
            options={{ 
              headerShown: true, 
              title: '電影詳情',
              headerStyle: { backgroundColor: '#1a1a1a' },
              headerTintColor: '#fff'
            }} 
          />
        </Stack.Navigator>
        <StatusBar style="light" />
      </NavigationContainer>
    </MoviesProvider>
  );
}