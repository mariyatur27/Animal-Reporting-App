import React, { useState } from 'react'
import { Alert, StyleSheet, View, AppState } from 'react-native'
import { supabase } from '../lib/supabase'
import SignUp from './SignUp'
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

export default function SignIn() {
  const [signup, setSignup] = useState(false)
  const [error, setError] = useState("")
  const [userData, setUserData] = useState({
    email: "",
    password: ""
  })

  async function signInWithEmail() {
    if(userData.email == "" || userData.password == ""){
      setError("One or more required fields is empty")
    }else{
      const { error } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: userData.password,
      })

      if (error) Alert.alert(error.message)
    }

    if (error) Alert.alert(error)
  }


  if (signup) return (<SignUp />)

  return (
    <View style={styles.container}>
      <Text variant='headlineSmall'>Welcome back!</Text>
      <View style={styles.form}>
        <TextInput 
          label="Email address"
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
          mode='outlined'
          secureTextEntry={true}
        />
      </View>

      <View>
        <Button onPress={() => signInWithEmail()}  mode='contained'>Sign in</Button>
      </View>
      <View style={styles.verticallySpaced}>
        <Button onPress={() => setSignup(true)}  mode='contained-tonal'>Sign up</Button>
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
  textField: {
    width: '100%',
    height: 50,
  },
  form: {
    marginTop: 20,
    marginBottom: 20,
  },
})