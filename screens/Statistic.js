import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import { ScrollView } from 'react-native-gesture-handler';
import { Divider, Searchbar } from 'react-native-paper';

const firebaseConfig = {
  apiKey: 'AIzaSyApBWUABXIusWxrlvdBt9ttvTd0uSISTQY',
  projectId: 'device-management-43211',
  storageBucket: 'device-management-43211.appspot.com',
  appId: 'com.device_management',
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

const BLUE_COLOR = '#0000CD'; // Định nghĩa màu xanh dương

const Statistic = () => {
  const [roomCountsUser, setRoomCountsUser] = useState({});
  const [roomCountsDevice, setRoomCountsDevice] = useState({});
  const [userCount, setUserCount] = useState({});
  const [errorCount, setErrorCount] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState({
    roomCountsUser: {},
    roomCountsDevice: {},
    userCount: {},
    errorCount: {},
  });

  const screenWidth = Dimensions.get('screen').width;
  const chartWidth = screenWidth * 0.92;
  const chartHeight = 300;

  useEffect(() => {
    const unsubscribeUserRoom = onSnapshot(collection(firestore, 'USERS'), (snapshot) => {
      const users = snapshot.docs.map((doc) => doc.data());

      const roomCountTempUser = {};

      users.forEach((user) => {
        roomCountTempUser[user.department] = (roomCountTempUser[user.department] || 0) + 1;
      });

      setRoomCountsUser(roomCountTempUser);
    });

    const unsubscribeDeviceRoom = onSnapshot(collection(firestore, 'DEVICES'), (snapshot) => {
      const devices = snapshot.docs.map((doc) => doc.data());

      const roomCountTempDevice = {};

      devices.forEach((device) => {
        roomCountTempDevice[device.departmentName] = (roomCountTempDevice[device.departmentName] || 0) + 1;
      });

      setRoomCountsDevice(roomCountTempDevice);
    });

    const unsubscribeDeviceUser = onSnapshot(collection(firestore, 'DEVICES'), (snapshot) => {
      const devices = snapshot.docs.map((doc) => doc.data());

      const UserCountTempDevice = {};

      devices.forEach((device) => {
        UserCountTempDevice[device.user] = (UserCountTempDevice[device.user] || 0) + 1;
      });

      setUserCount(UserCountTempDevice);
    });

    const unsubscribeErrors = onSnapshot(collection(firestore, 'ERROR'), (snapshot) => {
      const errors = snapshot.docs.map((doc) => doc.data());
      const errorCountTemp = {};

      errors.forEach((error) => {
        errorCountTemp[error.deviceName] = (errorCountTemp[error.deviceName] || 0) + 1;
      });

      setErrorCount(errorCountTemp);
    });

    return () => {
      unsubscribeUserRoom();
      unsubscribeDeviceRoom();
      unsubscribeDeviceUser();
      unsubscribeErrors();
    };
  }, []);

  useEffect(() => {
    const filterAndSortData = (data) => {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filteredData = Object.entries(data).filter(([key]) =>
        key.toLowerCase().includes(lowercaseQuery)
      );
      return Object.fromEntries(
        filteredData.sort(([, a], [, b]) => b - a)
      );
    };

    setFilteredData({
      roomCountsUser: filterAndSortData(roomCountsUser),
      roomCountsDevice: filterAndSortData(roomCountsDevice),
      userCount: filterAndSortData(userCount),
      errorCount: filterAndSortData(errorCount),
    });
  }, [searchQuery, roomCountsUser, roomCountsDevice, userCount, errorCount]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filterAndSortData = (data) => {
      const lowercaseQuery = query.toLowerCase();
      const filteredData = Object.entries(data).filter(([key]) =>
        key.toLowerCase().includes(lowercaseQuery)
      );
      return Object.fromEntries(
        filteredData.sort(([, a], [, b]) => b - a)
      );
    };

    setFilteredData({
      roomCountsUser: filterAndSortData(roomCountsUser),
      roomCountsDevice: filterAndSortData(roomCountsDevice),
      userCount: filterAndSortData(userCount),
      errorCount: filterAndSortData(errorCount),
    });
  };

  const wrapLabel = (label, maxWidth) => {
    const words = label.split(' ');
    let lines = [];
    let currentLine = '';

    words.forEach(word => {
      if (currentLine.length + word.length <= maxWidth) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    });
    lines.push(currentLine);

    return lines.join('\n');
  };

  const createChartData = (data, isUserChart = false) => {
    const labels = Object.keys(data);
    const maxLabelWidth = isUserChart ? 20 : 10; // Tăng độ dài tối đa cho nhãn người dùng
    const wrappedLabels = labels.map(label => wrapLabel(label, maxLabelWidth));
    return {
      labels: wrappedLabels,
      datasets: [
        {
          data: Object.values(data),
          color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
        },
      ],
    };
  };

  const dataErrorDevice = createChartData(filteredData.errorCount);
  const dataRoomCountsUser = createChartData(filteredData.roomCountsUser);
  const dataDeviceRoom = createChartData(filteredData.roomCountsDevice);
  const dataDeviceUser = createChartData(filteredData.userCount, true);

  const renderChart = (data, title, isUserChart = false) => (
    <>
      <View style={styles.legendContainer}>
        <Text style={styles.titleText}>{title}</Text>
      </View>
      <ScrollView horizontal>
        <BarChart
          data={data}
          width={Math.max(chartWidth, data.labels.length * (isUserChart ? 120 : 60))}
          height={chartHeight}
          chartConfig={{
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            color: (opacity = 1) => `rgba(0, 0, 205, ${opacity})`,
            labelColor: (opacity = 1) => BLUE_COLOR,
            style: { borderRadius: 16 },
            barPercentage: 0.7,
            propsForLabels: {
              fontSize: isUserChart ? 8 : 10,
              width: isUserChart ? 120 : 60,
              alignmentBaseline: 'middle',
              fill: BLUE_COLOR,
            },
          }}
          verticalLabelRotation={0}
          horizontalLabelRotation={isUserChart ? -45 : 0}
          yAxisLabel=""
          yAxisSuffix=""
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
          fromZero={true}
          showValuesOnTopOfBars={true}
        />
      </ScrollView>
      <Divider bold />
    </>
  );

  return (
    <ScrollView style={styles.container}>
      <Searchbar
        placeholder="Tìm kiếm"
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
        inputStyle={styles.searchBarInput}
        iconColor={BLUE_COLOR}
        placeholderTextColor={BLUE_COLOR}
        theme={{ colors: { primary: BLUE_COLOR } }}
      />
      {renderChart(dataErrorDevice, "Thống kê lỗi theo thiết bị")}
      {renderChart(dataRoomCountsUser, "Thống kê người dùng theo phòng")}
      {renderChart(dataDeviceRoom, "Thống kê thiết bị theo phòng")}
      {renderChart(dataDeviceUser, "Thống kê thiết bị theo người dùng", true)}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  colorBox: {
    width: 20,
    height: 20,
    marginHorizontal: 5,
  },
  legendText: {
    fontSize: 16,
    color: BLUE_COLOR,
  },
  searchBar: {
    marginBottom: 10,
    marginHorizontal: 10,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: BLUE_COLOR,
  },
  searchBarInput: {
    color: BLUE_COLOR,
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BLUE_COLOR,
  },
});

export default Statistic;
