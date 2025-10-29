import React, { useDebugValue, useState } from 'react'
import { Alert, StyleSheet, View, AppState , Switch, Text} from 'react-native'
import { supabase } from '../lib/supabase'
import { Button, Input } from '@rneui/themed'
import SignIn from './SignIn'

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

  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    is_organization: false,
    is_rescuer: false
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
        if (!session) Alert.alert('Please check your inbox for email verification!')
    }

    if(error) Alert.alert(error)

  }


  if(signin) return <SignIn />

  return (
    <View style={styles.container}>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
         /* @ts-ignore */
          onChangeText={(text:string) => setUserData({...userData, firstName: text})}
          value={userData.firstName}
          placeholder="First name"
        />
      </View>


      <View style={styles.verticallySpaced}>
        <Input
         /* @ts-ignore */
          onChangeText={(text:string) => setUserData({...userData, lastName: text})}
          value={userData.lastName}
          placeholder="Last name"
        />
      </View>

      <View style={styles.verticallySpaced}>
        <Input
         /* @ts-ignore */
          onChangeText={(text:string) => setUserData({...userData, email: text})}
          value={userData.email}
          placeholder="Email"
          autoCapitalize={'none'}
        />
      </View>

      <View style={styles.verticallySpaced}>
        <Input
         /* @ts-ignore */
          onChangeText={(text:string) => setUserData({...userData, password: text})}
          value={userData.password}
          placeholder="Password"
          secureTextEntry={true}
          autoCapitalize={'none'}
        />
      </View>

      <View style={[styles.verticallySpaced, styles.switchStyles]}>
        <Text>Are you a part of an organization?</Text>
        <Switch
            trackColor={{ false: '#767577', true: '#7ed189ff' }}
            thumbColor={userData.is_organization ? '#0c7a24ff' : '#f4f3f4'}
            onValueChange={() => setUserData({...userData, is_organization: !userData.is_organization})}
            value={userData.is_organization}
        />
      </View>

      <View style={[styles.verticallySpaced, styles.switchStyles]}>
        <Text>Are you an individual rescuer?</Text>
        <Switch
            trackColor={{ false: '#767577', true: '#7ed189ff' }}
            thumbColor={userData.is_rescuer ? '#0c7a24ff' : '#f4f3f4'}
            onValueChange={() => setUserData({...userData, is_rescuer: !userData.is_rescuer})}
            value={userData.is_rescuer}
        />
      </View>


      <View style={[styles.verticallySpaced, styles.mt20]}>
        
        <Button 
        /* @ts-ignore */
        title="Sign up" onPress={() => signUp()} />
      </View>
      <View style={styles.verticallySpaced}>
        <Button 
         /* @ts-ignore */
        title="Sign in" onPress={() => setSignin(true)} />
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
  mt20: {
    marginTop: 20,
  },
  switchStyles: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center'
  }
})