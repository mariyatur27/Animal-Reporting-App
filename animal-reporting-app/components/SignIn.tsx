import React, { useState } from 'react'
import { Alert, StyleSheet, View, AppState } from 'react-native'
import { supabase } from '../lib/supabase'
import { Button, Input } from '@rneui/themed'
import SignUp from './SignUp'

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

  const resetPassword = async() => {
    const { error } = await supabase.auth.signInWithOtp({email: userData.email});

    if(error){
      console.log("ERROR: ", error)
      return
    }
  }

  if (signup) return (<SignUp />)

  return (
    <View style={styles.container}>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
         /* @ts-ignore */
          onChangeText={(text:string) => setUserData({...userData, email: text})}
          value={userData.email}
          placeholder="Email address"
          autoCapitalize={'none'}
        />
      </View>

      <View style={styles.verticallySpaced}>
        <Input
         /* @ts-ignore */
          onChangeText={(text:string) => setUserData({...userData, password: text})}
          value={userData.password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={'none'}
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        
        <Button 
        /* @ts-ignore */
        title="Sign in"  onPress={() => signInWithEmail()} />
      </View>
      <View style={styles.verticallySpaced}>
        <Button 
         /* @ts-ignore */
        title="Sign up"  onPress={() => setSignup(true)} />
      </View>
      <View style={styles.verticallySpaced}>
        <Button 
         /* @ts-ignore */
        title="Forgot My Password :("  onPress={() => resetPassword(true)} />
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
})