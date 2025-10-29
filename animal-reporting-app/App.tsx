import {useState, useEffect} from 'react'
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import ReportsTracker from './components/ReportsTracker';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase'
import ReportOverview from './components/ReportOverview';


export default function App() {
  const [session, setSession] = useState<Session | null>(null)

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
    <View style={styles.container}>

      {session && session.user ? (
        // <ReportOverview session={session} reportId={1} status={"Geting help"}/>
        <ReportsTracker key={session.user.id} session={session} />
      ) : (
        <View>
          <Text>Welcome to Animal Report</Text>
          <SignUp />
        </View>
      )}
    </View>
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
