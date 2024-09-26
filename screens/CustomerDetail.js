import { useEffect, useState } from "react";
import { Alert, Image, StyleSheet, TouchableOpacity, View } from "react-native"
import { Button, Text, TextInput } from "react-native-paper"
import { Dropdown } from "react-native-paper-dropdown";
import firestore from '@react-native-firebase/firestore';

const BLUE_COLOR = '#0000CD';

const CustomerDetail = ({navigation, route}) =>{
    const {fullname, email, phone, address, avatar, department} = route.params;
    const [newfullname, setFullname] = useState(fullname);
    const [newphone, setPhone] = useState(phone);
    const [newaddress, setAddress] = useState(address);
    const [newdepartment, setDepartment] = useState(department);
    const [departments, setDepartments] = useState([]);

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
      fetchDepartments();
    }, []);

    const handleUpdate = async () => {
      try {  
        await firestore().collection("USERS").doc(email).update({
          fullname: newfullname,
          department: newdepartment,
          phone: newphone,
          address: newaddress,
        });
  
        Alert.alert("Cập nhật thành công!");
        navigation.navigate("Customers");
      } catch (error) {
        console.error("Error updating profile: ", error);
        Alert.alert("Có lỗi xảy ra khi cập nhật!");
      }
    };

    return (
      <View style={styles.container}> 
          <View style={styles.formContainer}>
              <View style={styles.imageContainer}>
                  <Image
                  source={avatar ? { uri: avatar } : require("../assets/user.png")}
                  style={styles.icon}
                  />
              </View>
              <TextInput
                  label={"Họ và tên"}
                  style={styles.input}
                  value={newfullname}
                  onChangeText={setFullname}
                  theme={{ colors: { primary: BLUE_COLOR, text: 'black' } }}
                  outlineColor={BLUE_COLOR}
                  activeOutlineColor={BLUE_COLOR}
                  mode="outlined"
                  textColor="black"
              />
              <TextInput
                  label={"Email"}
                  style={[styles.input, styles.disabledInput]}
                  value={email}
                  editable={false}
                  theme={{ colors: { primary: BLUE_COLOR, text: 'black' } }}
                  outlineColor={BLUE_COLOR}
                  activeOutlineColor={BLUE_COLOR}
                  mode="outlined"
                  textColor="black"
              />
              <TextInput
                  label={"Số điện thoại"}
                  style={styles.input}
                  value={newphone}
                  onChangeText={setPhone}
                  theme={{ colors: { primary: BLUE_COLOR, text: 'black' } }}
                  outlineColor={BLUE_COLOR}
                  activeOutlineColor={BLUE_COLOR}
                  mode="outlined"
                  textColor="black"
              />
              <TextInput
                  label={"Địa chỉ"}
                  style={styles.input}
                  value={newaddress}
                  onChangeText={setAddress}
                  theme={{ colors: { primary: BLUE_COLOR, text: 'black' } }}
                  outlineColor={BLUE_COLOR}
                  activeOutlineColor={BLUE_COLOR}
                  mode="outlined"
                  textColor="black"
              />
          </View>
          <View style={styles.dropdownContainer}>
              <Dropdown
                  label="Chọn phòng"
                  options={departments}
                  value={newdepartment}
                  onSelect={setDepartment}
                  mode="outlined"
                  theme={{ colors: { primary: BLUE_COLOR, text: 'black' } }}
                  outlineColor={BLUE_COLOR}
                  activeOutlineColor={BLUE_COLOR}
              />
          </View>
          <View style={styles.buttonContainer}>
              <Button mode="contained" style={styles.button} labelStyle={styles.buttonLabel} onPress={handleUpdate}>
                  Cập nhật
              </Button>
              <Button mode="contained" style={styles.button} labelStyle={styles.buttonLabel} onPress={()=> navigation.navigate("Customers")}>
                  Quay lại
              </Button>
          </View>
      </View>
    );
  };
    
export default CustomerDetail;
    
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  formContainer: {
    alignItems: "center",
  },
  imageContainer: {
    position: "relative",
    width: 150,
    height: 150,
    margin: 10,
  },
  icon: {
    width: 150,
    height: 150,
    borderWidth: 2,
    borderColor: BLUE_COLOR,
    borderRadius: 75,
  },
  input: {
    width: "90%",
    margin: 5,
    backgroundColor: "white",
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
  },
  dropdownContainer: {
    marginHorizontal: 20,
    marginVertical: 10,
    
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: BLUE_COLOR,
    width: '100%',
    marginVertical: 5,
  },
  buttonLabel: {
    color: 'white',
    fontWeight: 'bold',
  },
});
