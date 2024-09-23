import React, { useEffect, useState } from 'react';
import { FlatList, View, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { IconButton, Text, Searchbar } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';

const CustomerItem = ({ avatar, fullname, phone, onPress }) => (
  <View style={styles.customerContainer}>
    <TouchableOpacity onPress={onPress} style={styles.customerInfo}>
      <Image
        source={avatar ? {uri: avatar} : require('../assets/user.png')}
        style={styles.avatar}
      />
      <View style={styles.textContainer}>
        <Text style={styles.customerName}>{fullname}</Text>
        <Text style={styles.customerPhone}>{phone}</Text>
      </View>
    </TouchableOpacity>
    <IconButton
      icon="chevron-right"
      size={24}
      onPress={onPress}
    />
  </View>
);

const Customers = ({ navigation }) => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const USERS = firestore().collection('USERS');

  useEffect(() => {
    const unsubscribe = USERS.where('role', '==', 'user').onSnapshot((querySnapshot) => {
      const customerList = [];
      querySnapshot.forEach((doc) => {
        const { fullname, email, phone, role, address, avatar, department } = doc.data();
        if (role === 'user') {
          customerList.push({
            id: doc.id,
            fullname,
            email,
            phone,
            address,
            avatar, 
            department
          });
        }
      });
      setCustomers(customerList);
      setFilteredCustomers(customerList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = customers.filter(item => 
      item.fullname.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCustomers(filtered);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh sách khách hàng</Text>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Tìm kiếm..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>
      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CustomerItem 
            avatar={item.avatar} 
            fullname={item.fullname} 
            phone={item.phone} 
            onPress={() => navigation.navigate("CustomerDetail", item)}
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
  customerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  customerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    height: 50,
    width: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  customerPhone: {
    fontSize: 14,
    color: 'gray',
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Customers;
