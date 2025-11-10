import {useState, useEffect} from 'react'
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import ReportsTracker from './components/ReportsTracker';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase'
import ReportOverview from './components/ReportOverview';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StackParams } from './types';


export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const Stack = createStackNavigator<StackParams>();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  if(session){
    console.log("SESSION is ON")
  }else{
    console.log("NO SESSION STARTED")
  }

  return (
      // <NavigationContainer>
      //   <Stack.Navigator initialRouteName='SignUp'>
      //       {/* <Stack.Screen name="ReportsTracker" component={ReportsTracker} initialParams={session ? {session: session}}/> */}
      //       <Stack.Screen name="SignUp" component={SignUp} />
      //   </Stack.Navigator>
      //   {/* <Stack.Navigator initialRouteName='ReportsTracker'>
      //     {session && session.user ? (
      //       <Stack.Screen name="ReportsTracker" component={ReportsTracker} initialParams={{session: session}}/>
      //     ) : ( 
      //       <Stack.Screen name="SignUp" component={SignUp} />
      //     )}
      //   </Stack.Navigator> */}
      // </NavigationContainer>

    <PaperProvider>
      <View style={styles.container}>

        {/* {session && session.user ? (
          <ReportsTracker key={session.user.id} session={session} />
        ) : (
          <View>
            <Text>Welcome to Animal Report</Text>
            <SignUp />
          </View>
        )} */}

        <SignUp />
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
