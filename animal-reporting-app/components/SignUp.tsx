import React, { useDebugValue, useState } from 'react'
import { Alert, StyleSheet, View, AppState} from 'react-native'
import { supabase } from '../lib/supabase'
import SignIn from './SignIn'
import { SegmentedButtons , TextInput, Switch, Text, Button} from 'react-native-paper';

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

export default function SignUp() {
  const [signin, setSignin] = useState(false)
  const [error, setError] = useState("")
  const [isOrganization, setIsOrganization] = useState("")
  const [shareInfo, setShareInfo] = useState("")

  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    is_organization: isOrganization === "organization" ? true : false,
    is_rescuer: isOrganization === "individual" ? true : false
  })

  const [orgData, setOrgData] = useState({
    orgName: "",
    orgEmail: "",
    location: "",
    phoneNumber: "",
    password: "",
    canShareInfo: shareInfo === "Share contact info." ? true : false
  })

  async function signUp() {

    if( userData.email == "" || userData.firstName == "" || userData.lastName == "" || userData.password == "") {
        setError("One or more of the required input fields is empty!")
    }else{
        const { data: { session }, error } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
              data: {
                  firstName: userData.firstName,
                  lastName: userData.lastName,
                  isOrganization: userData.is_organization,
                  isRescuer: userData.is_rescuer
              }
          }
        })

        if (error) Alert.alert(error.message)

        try{

          const {error} = await supabase.from('Users').insert([
            {first_name: userData.firstName, last_name: userData.lastName, email: userData.email, is_organization: false, is_rescuer: true}
          ])

          if(error){
            Alert.alert(error.message)
            return;
          }

        }catch(error){
          console.log("ERROR: ", error)
        }
    }

    if(error) Alert.alert(error)

  }

  async function SignUpOrganization(){
    if( orgData.orgName == "" || orgData.orgEmail == "" || orgData.phoneNumber == "" || orgData.phoneNumber == "" || orgData.password == "") {
        setError("One or more of the required input fields is empty!")
    }else{
        try{

          const { data: { session }, error } = await supabase.auth.signUp({
            email: orgData.orgEmail,
            password: orgData.password,
            })

          try{

            const {error} = await supabase.from('Organizations').insert([
              {name: orgData.orgEmail, email: orgData.orgEmail, location: orgData.location, phone_number: orgData.phoneNumber, share_contact_info: orgData.canShareInfo}
            ])

            if(error){
              Alert.alert(error.message)
              return;
            }

          }catch(error){
            console.log("ERROR: ", error)
          }
          
          if(error){
            Alert.alert(error.message)
            return;
          }

        }catch(e){
          console.log("ERROR: ", e)
        }
        
    }

    if(error) Alert.alert(error)
  }


  if(signin) return <SignIn />

  return (
    <View style={styles.container}>

        <SegmentedButtons
          value={isOrganization}
          onValueChange={setIsOrganization}
          buttons={[
            {
              value: 'organization',
              label: 'Organization',
            },
            {
              value: 'individual',
              label: 'Individual',
            },
          ]}
        />

        {isOrganization == "organization" ? (
          <View style={styles.form}>
            <TextInput 
              label="Organization name"
              onChangeText={(text:string) => setOrgData({...orgData, orgName: text})}
              value={orgData.orgName}
              style={styles.textField}
              mode='outlined'
            />

            <TextInput 
              label="Organization email"
              onChangeText={(text:string) => setOrgData({...orgData, orgEmail: text})}
              value={orgData.orgEmail}
              style={styles.textField}
              mode='outlined'
            />

            <TextInput 
              label="Phone number"
              onChangeText={(text:string) => setOrgData({...orgData, phoneNumber: text})}
              value={orgData.phoneNumber}
              style={styles.textField}
              mode='outlined'
            />

            <TextInput 
              label="Password"
              onChangeText={(text:string) => setOrgData({...orgData, password: text})}
              value={orgData.password}
              style={styles.textField}
              secureTextEntry={true}
              mode='outlined'
            />

            <TextInput 
              label="Address"
              onChangeText={(text:string) => setOrgData({...orgData, location: text})}
              value={orgData.location}
              style={styles.textField}
              mode='outlined'
            />

            <View style={styles.dividedForm}>
              <Text variant="bodyMedium" style={{width: '70%'}}>Can we share your contact information with rescuers?</Text>
              <Switch value={orgData.canShareInfo} onValueChange={() => setOrgData({...orgData, canShareInfo: !orgData.canShareInfo})} />
            </View>

          </View>
        ) : (

        <View style={styles.form}>
          <TextInput 
              label="First name"
              onChangeText={(text:string) => setUserData({...userData, firstName: text})}
              value={userData.firstName}
              style={styles.textField}
              mode='outlined'
          />

          <TextInput 
              label="Last name"
              onChangeText={(text:string) => setUserData({...userData, lastName: text})}
              value={userData.lastName}
              style={styles.textField}
              mode='outlined'
          />

          <TextInput 
              label="Email"
              onChangeText={(text:string) => setUserData({...userData, email: text})}
              value={userData.email}
              style={styles.textField}
              mode='outlined'
          />

          <TextInput 
              label="Password"
              onChangeText={(text:string) => setUserData({...userData, password: text})}
              value={userData.password}
              style={styles.textField}
              secureTextEntry={true}
              mode='outlined'
          />

        </View>
      )}

      <View>
        <Button onPress={() => {
          if(isOrganization === "organization"){
            SignUpOrganization()
          }else{
            signUp()
          }
        }}  mode='contained'>Sign Up</Button>
      </View>
      <View style={styles.verticallySpaced}>
        <Button onPress={() => setSignin(true)}  mode='contained-tonal'>Sign In</Button>
      </View>
        
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
    width: '80%'
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  switchStyles: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center'
  },
  textField: {
    width: '100%',
    height: 50,
  },
  form: {
    marginTop: 20,
    marginBottom: 20,
  },
  dividedForm: {
    display: 'flex',
    flexDirection: 'row',
    gap: 2,
    marginTop: 20,
    justifyContent: 'space-between',
    alignItems: 'center'
  }
})