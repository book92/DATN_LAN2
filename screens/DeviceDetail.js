import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { Button } from 'react-native-paper';
import { Dropdown } from 'react-native-paper-dropdown';

const DeviceDetail = ({ route, navigation }) => {
  const { deviceId } = route.params;
  const [device, setDevice] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [departments, setDepartments] = useState([]);
  const [user, setUser] = useState('');  
  const [users, setUsers] = useState('');  
  const [specifications, setSpecifications] = useState({});
  const [note, setNote] = useState('');
  const [QR, setQR] = useState('');
  useEffect(() => {
    const fetchDepartments = async () => {
        try {
          const snapshot = await firestore().collection("DEPARTMENTS").get();
          const deptList = snapshot.docs.map(doc => ({
            label: doc.data().name,
            value: doc.data().name,
          }));
          setDepartments(deptList);
        } catch (error) {
          console.log("Error fetching departments: ", error);
        }
    };
    const fetchUsers = async () => {
        try {
          const snapshot = await firestore().collection("USERS").get();
          const userList = snapshot.docs.map(doc => ({
            label: doc.data().fullname,
            value: doc.data().fullname,
          }));
          setUsers(userList);
        } catch (error) {
          console.log("Error fetching users: ", error);
        }
      };
    fetchDepartments();
    fetchUsers();
    fetchDevice();
  }, [deviceId]);
  const handleSave = async () => {
    try {
      await firestore().collection('DEVICES').doc(deviceId).update({
        name,
        type,
        departmentName,
        user,
        specifications,
        note
      });
      Alert.alert('Thông báo', 'Cập nhật thành công');
      fetchDevice();
      setIsEditing(false);
    } catch (error) {
      console.error('Lỗi cập nhật: ', error);
      Alert.alert('Thông báo', 'Cập nhật thất bại');
    }
  };
  const fetchDevice = async () => {
    try {
      const doc = await firestore().collection('DEVICES').doc(deviceId).get();
      if (doc.exists) {
        const deviceData = doc.data();
        setDevice(deviceData);
        setName(deviceData.name);
        setType(deviceData.type);
        setDepartmentName(deviceData.departmentName);
        setUser(deviceData.user || '');
        setSpecifications(deviceData.specifications || {});
        setNote(deviceData.note || '');
        setQR(deviceData.image || '');
      } else {
        console.log('Không có dữ liệu!');
      }
    } catch (error) {
      console.error('Error fetching device: ', error);
    }
  };
  const handleCancel = () => {
    Alert.alert(
      'Thông báo',
      'Bạn có muốn hủy các thay đổi?',
      [
        {
          text: 'Hủy',
          onPress: () => console.log('Hủy pressed'),
          style: 'cancel',
        },
        {
          text: 'Xác nhận',
          onPress: () => {
            setIsEditing(false);
            fetchDevice();
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleSpecificationChange = (key, value) => {
    setSpecifications(prevSpecs => ({
      ...prevSpecs,
      [key]: value
    }));
  };

  if (!device) {
    return <Text>Đang tải...</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{isEditing ? 'Cập nhật thiết bị' : 'Chi tiết thiết bị'}</Text>
      <Text style={styles.label}>Tên thiết bị:</Text>
      {isEditing ? (
        <TextInput
          style={[styles.input, { color: '#0000FF' }]}
          value={name}
          onChangeText={setName}
        />
      ) : (
        <Text style={[styles.value, { color: '#0000FF' }]}>{device.name}</Text>
      )}
      <Text style={styles.label}>Loại thiết bị:</Text>
      {isEditing ? (
        <TextInput
          style={[styles.input, { color: '#0000FF' }]}
          value={type}
          onChangeText={setType}
          editable={false}
        />
      ) : (
        <Text style={[styles.value, { color: '#0000FF' }]}>{device.type}</Text>
      )}
      <Text style={styles.label}>Phòng:</Text>
      {isEditing ? (
        <Dropdown
          options={departments}
          value={departmentName}
          onSelect={setDepartmentName}
          mode="outlined"
          style={{ color: '#0000FF' }}
        />
      ) : (
        <Text style={[styles.value, { color: '#0000FF' }]}>{departmentName || 'No department assigned'}</Text>
      )}
      <Text style={styles.label}>Người dùng:</Text>
      {isEditing ? (
        <Dropdown
          options={users}
          value={user}
          onSelect={setUser}
          mode="outlined"
          style={{ color: '#0000FF' }}
        />
      ) : (
        <Text style={[styles.value, { color: '#0000FF' }]}>{device.user}</Text>
      )}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Thông số kỹ thuật:</Text>
        {isEditing ? (
          Object.keys(specifications).map((key) => (
            <View key={key} style={styles.specificationContainer}>
              <Text style={[styles.specificationLabel, { color: '#0000FF' }]}>{key}:</Text>
              <TextInput
                style={[styles.input, { color: '#0000FF' }]}
                value={specifications[key]}
                onChangeText={(value) => handleSpecificationChange(key, value)}
              />
            </View>
          ))
        ) : (
          <View style={styles.specificationsContainer}>
            {Object.entries(device.specifications || {}).length > 0 ? (
              Object.entries(device.specifications).map(([key, value]) => (
                <View key={key} style={styles.specificationItem}>
                  <Text style={[styles.specificationKey, { color: '#0000FF' }]}>{key}:</Text>
                  <Text style={[styles.specificationValue, { color: '#0000FF' }]}>{value}</Text>
                </View>
              ))
            ) : (
              <Text style={{ color: '#0000FF' }}>Không có thông số kỹ thuật</Text>
            )}
          </View>
        )}
      </View>
      <Text style={styles.label}>Ghi chú:</Text>
      {isEditing ? (
        <TextInput
          style={[styles.input, styles.multilineInput, { color: '#0000FF' }]}
          value={note}
          onChangeText={setNote}
          multiline
        />
      ) : (
        <Text style={[styles.value, { color: '#0000FF' }]}>{device.note}</Text>
      )}
      <Text style={styles.label}>QR:</Text>
      <Image
        source={{uri: QR}}
        style={{height:200, width:200, alignSelf:'center'}}
      />
      <View style={styles.buttonContainer}>
        {isEditing ? (
          <>
            <Button mode='contained' onPress={handleSave} style={styles.button} labelStyle={{ color: '#FFFFFF' }}>
                Lưu
            </Button>
            <Button mode='contained' onPress={handleCancel} style={styles.button} labelStyle={{ color: '#FFFFFF' }}>
                Hủy
            </Button>
          </>
        ) : (
        <>
            <Button mode='contained' onPress={() => setIsEditing(true)} style={styles.button} labelStyle={{ color: '#FFFFFF' }}>
                Cập nhật
            </Button>
            <Button mode='contained' style={styles.button} onPress={()=> navigation.navigate("Devices", {departmentName})} labelStyle={{ color: '#FFFFFF' }}>
                Trở về
            </Button>
        </>  
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign:'center',
    color:"#0000CD"
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#0000FF',
  },
  value: {
    fontSize: 16,
    marginVertical: 5,
    color: '#0000FF',
  },
  input: {
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    color: '#0000FF',
  },
  multilineInput: {
    height: 100,
  },
  specificationsContainer: {
    marginVertical: 10,
  },
  specificationContainer: {
    marginBottom: 5,
    marginTop: 5,
    marginStart:10
  },
  specificationLabel: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#0000FF',
  },
  specificationItem: {
    flexDirection: 'row',
    marginBottom: 5,
    marginStart:10
  },
  specificationKey: {
    fontWeight: 'bold',
    marginRight: 10,
    color: '#0000FF',
  },
  specificationValue: {
    flex: 1,
    color: '#0000FF',
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 50,
  },
  button:{
    backgroundColor:'#0000CD',
    margin:5
}
});

export default DeviceDetail;