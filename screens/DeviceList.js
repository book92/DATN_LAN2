import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore'; // Import Firestore

const DeviceList = () => {
  const route = useRoute();
  const { label } = route.params; // Get the label from params
  const [devices, setDevices] = useState([]); // State to hold devices
  const [loading, setLoading] = useState(true); // State to manage loading

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const devicesCollection = await firestore()
          .collection('devices')
          .where('department', '==', label)
          .get();

        const devicesData = devicesCollection.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setDevices(devicesData);
      } catch (error) {
        console.error("Error fetching devices: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, [label]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Devices in {label}</Text>
      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default DeviceList;
