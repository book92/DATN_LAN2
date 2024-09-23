import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { IconButton, Searchbar } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const Device = ({ name, state, dayfix, onPress }) => (
  <View style={styles.deviceContainer}>
    <TouchableOpacity onPress={onPress} style={styles.deviceInfo}>
      <Text style={styles.deviceName}>{name}</Text>
      <Text style={styles.deviceStatus}>
        {state === "Fixed" ? `Đã sửa: ${dayfix}` : "Chưa sửa"}
      </Text>
    </TouchableOpacity>
    <IconButton
      icon={state === "Fixed" ? "check-circle" : "close-circle"}
      color={state === "Fixed" ? "green" : "red"}
      size={24}
    />
  </View>
);

const ErrorDevices = () => {
  const [errordevices, setErrordevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();
  const ERROR = firestore().collection('ERROR');

  useEffect(() => {
    const unsubscribe = ERROR.onSnapshot((querySnapshot) => {
      const errorDevicelist = [];
      querySnapshot.forEach((doc) => {
        const { deviceName, description, fixday, reportday, state, userreport } = doc.data();
        errorDevicelist.push({
          id: doc.id,
          deviceName,
          description,
          fixday,
          reportday,
          state,
          userreport,
        });
      });
      setErrordevices(errorDevicelist);
      setFilteredDevices(errorDevicelist);
    });
    return () => unsubscribe();
  }, []);

  const handleSelectErrorDevice = (item) => {
    navigation.navigate('ErrorDeviceDetail', { item });
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = errordevices.filter(item => 
      item.deviceName.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredDevices(filtered);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh sách thiết bị lỗi</Text>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Tìm kiếm..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>
      <FlatList
        data={filteredDevices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Device
            name={item.deviceName}
            state={item.state}
            dayfix={item.fixday}
            onPress={() => handleSelectErrorDevice(item)}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchBar: {
    flex: 1,
  },
  deviceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  deviceStatus: {
    fontSize: 14,
    color: 'gray',
    marginTop: 5,
  },
});

export default ErrorDevices;
