import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Statistic from './src/screens/Statistic'; 
import DeviceList from './src/screens/DeviceList';

// Tạo stack navigator
const Stack = createStackNavigator();

const RouterStatic = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Statistic" component={Statistic} options={{ title: 'Thống kê' }} />
        <Stack.Screen name="DeviceList" component={DeviceList} options={{ title: 'Danh sách thiết bị' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RouterStatic;
