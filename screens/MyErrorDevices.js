import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore'; 
import { useMyContextController } from '../store';
import { IconButton, Searchbar, Menu } from 'react-native-paper';

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

const MyErrorDevices = () => {
  const [errors, setErrors] = useState([]);
  const [filteredErrors, setFilteredErrors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('deviceName');
  const [menuVisible, setMenuVisible] = useState(false);
  const [controller] = useMyContextController();
  const { userLogin } = controller;
  const navigation = useNavigation();

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const errorRef = firestore().collection('ERROR');
        const snapshot = await errorRef.where('userreport', '==', userLogin.fullname).get();
        const errorList = snapshot.docs.map(doc => ({
          id: doc.id,
          deviceName: doc.data().deviceName,
          description: doc.data().description,
          fixday: doc.data().fixday,
          reportday: doc.data().reportday,
          state: doc.data().state,
          userreport: doc.data().userreport
        }));
        
        setErrors(errorList);
        setFilteredErrors(errorList);
      } catch (error) {
        console.error("Error fetching devices: ", error);
      }
    };

    if (userLogin.fullname) {
      fetchDevices();
    }
  }, [userLogin.fullname]);

  const handleSelectErrorDevice = (item) => {
    navigation.navigate('MyErrorDeviceDetail', { item });
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = errors.filter(item => 
      item[searchType].toLowerCase().includes(query.toLowerCase())
    );
    setFilteredErrors(filtered);
  };

  const handleSearchTypeChange = (type) => {
    setSearchType(type);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thiết bị đã báo lỗi</Text>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Tìm kiếm..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>
      <FlatList
        data={filteredErrors}
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

export default MyErrorDevices;