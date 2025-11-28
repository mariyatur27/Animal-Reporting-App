import {useState, useEffect} from 'react'
import { StyleSheet, View } from 'react-native';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import ReportsTracker from './components/ReportsTracker';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase'
import { PaperProvider } from 'react-native-paper';
import ManageReports from './components/ManageReports';
import { BottomNavigation, Text, Dialog, Portal, Button , Icon} from 'react-native-paper';

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [index, setIndex] = useState(0);
  const [logout, setLogout] = useState(true)

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

  const LogUserOut = async() => {
    const {error} = await supabase.auth.signOut()

    if(error){
      console.log("ERROR: ", error)
    }else {
      setIndex(0)
      setLogout(false)
    }
  }

  function LogoutAlert() {
    return (
      <Portal>
        <Dialog visible={logout} onDismiss={LogUserOut}>
          <Dialog.Content>
            <Text variant="bodyMedium">Are you sure you want to log out?</Text>
            <View style={styles.rowContainer}>
              <Button mode='contained-tonal' onPress={() => LogUserOut()}>Log Out</Button>
              <Button mode='contained' onPress={Home}>Cancel</Button>
            </View>
          </Dialog.Content>
        </Dialog>
      </Portal>
    )
  }

  const routes = [
    { key: 'home', title: 'Home', icon: 'home' },
    { key: 'logout', title: 'Logout', icon: 'logout' },
  ];

  interface routeProps {
    route: {
      key: string,
      title: string,
      icon: string
    }
  }


  function Home(){
    if(session && session.user){
      console.log("ORG STATUS: ", session.user.user_metadata.isOrganization)
      if(session.user.user_metadata.isOrganization){
        return <ManageReports session={session} />
      }else{
        return <ReportsTracker key={session.user.id} session={session} />
      }
    }
  }

  const renderScene = ({ route }: routeProps) => {
    switch (route.key) {
      case 'home':
        return <Home />
      case 'logout':
        return <LogoutAlert />;
      default:
        return null;
    }
  };

  return (
    <PaperProvider>
        {session && session.user ? (
          <View style={styles.container}>
            <View style={styles.bottomNavContainer}>
                {renderScene({ route: routes[index] })}
                <BottomNavigation.Bar
                  navigationState={{ index, routes }}
                  onTabPress={({ route }) => {
                    const newIndex = routes.findIndex((r) => r.key === route.key);
                    if (newIndex !== -1) {
                      setIndex(newIndex);
                    }
                  }}
                  renderIcon={({ route, color }) => (
                    <Icon source={route.icon} size={24} color={color} />
                  )}
                  getLabelText={({ route }) => route.title}
                  style={styles.bottomNav}
                />
            </View>
          </View>
        ) : logout ? (
          <View style={styles.container}>
            <SignUp />
          </View>
        ) : (
          <View style={styles.container}>
            <SignIn />
          </View>
        )}

    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center'
  },
   bottomNavContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
  },
  bottomNav: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0
  },
  rowContainer: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 15,
    gap: 5
  }
});
