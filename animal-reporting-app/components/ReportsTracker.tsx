import React, { useEffect, useState } from 'react'
import { Alert, StyleSheet, View, AppState} from 'react-native'
import { supabase } from '../lib/supabase'
import { Session } from '@supabase/supabase-js'
import { Report } from '../types'
import ReportOverview from './ReportOverview'
import CreateReport from './CreateReport'
import { Text, Appbar, DataTable , Chip, FAB, BottomNavigation} from 'react-native-paper'
import { ReportStatus } from '../constants'
import SignIn from './SignIn'


export default function ReportsTracker({ session }: { session: Session }) {

    const [reports, setReports] = useState<Report[]>([])
    const [username, setUsername] = useState("")
    const [openOverview, setOpenOverview] = useState(false)
    const [targetId, setTargetId] = useState(-1)
    const [targetStatus, setTargetStatus] = useState("")
    const [createReport, setCreateReport] = useState(false)
    const [page, setPage] = useState(0)
    const [logout, setLogout] = useState(false)

    useEffect(() => {
        if (session) {
            setPage(0)
            getUserReports()
            console.log(session)
            setUsername(session.user?.user_metadata["firstName"])
        }
    }, [session])

    const getUserReports = async () => {
        try{
            if(!session?.user) throw new Error("No user on the session!")
                        
            const {data, error, status} = await supabase
            .from("UserReports").select("*, AnimalReports(*)").eq("uid", session.user.id)

            if(error){
                console.log("ERROR: ", error)
                return
            }

            if(data){
                console.log("RESULTS: ", data)
                const sortedData = data.sort((a, b) => {
                const dateA = new Date(a.AnimalReports.created_at).getTime();
                const dateB = new Date(b.AnimalReports.created_at).getTime();
                return dateB - dateA; // newest first
            });
            setReports(sortedData);

            }

        }catch(error){
            console.log("ERROR: ", error)
            return
        }
    }

    if (openOverview){
        return (
        <ReportOverview session={session} reportId={targetId} status={targetStatus}/>
        )
    }

    if (createReport){
        return(
            <CreateReport session={session} />
        )
    }

    const itemsPerPage = 10;
    const from = page * itemsPerPage;
    const to = Math.min((page + 1) * itemsPerPage, reports.length);
    
    const LogOut = () => {
        setLogout(true)
        return null
    }

    const [index, setIndex] = React.useState(0);
    const [routes] = React.useState([
        { key: 'logout', title: 'Log Out', focusedIcon: 'logout'},
    ]);

    const renderScene = BottomNavigation.SceneMap({
        logout: LogOut,
    });

    if(logout){
        return <SignIn />
    }

    return(
        <View style={styles.container}>
            {username && (
                <Appbar.Header>
                    <Appbar.Content title="Reports Tracker"/>
                </Appbar.Header>
            )}
            <View style={styles.mainPage}>
                {reports.length > 0 ? (
                    <DataTable style={styles.table}>
                        <DataTable.Header>
                            <DataTable.Title style={{flex: 1}}>ID</DataTable.Title>
                            <DataTable.Title style={{flex: 2}}>Date</DataTable.Title>
                            <DataTable.Title style={{flex: 3}}>Status</DataTable.Title>
                        </DataTable.Header>

                        {reports.slice(from, to).map((item, index, arr) => (
                            <DataTable.Row key={item.report_id} style={index === arr.length - 1 && {borderBottomWidth: 0}} onPress={() => {
                                setTargetId(item.report_id);
                                setTargetStatus(item.status);
                                setOpenOverview(true)
                            }}>
                                <DataTable.Cell style={{flex: 1}}>{item.report_id}</DataTable.Cell>
                                <DataTable.Cell style={{flex: 2}}>{item.AnimalReports.created_at.split("T")[0]}</DataTable.Cell>
                                <DataTable.Cell style={{flex: 3}}>
                                    <Chip style={{backgroundColor: ReportStatus[item.status] || '#BCE0BE'}}>{item.status}</Chip>
                                </DataTable.Cell>
                            </DataTable.Row>
                        ))}

                        {reports.length > itemsPerPage && (
                            <DataTable.Pagination
                                page={page}
                                numberOfPages={Math.ceil(reports.length / itemsPerPage)}
                                onPageChange={(page) => setPage(page)}
                                label={`${from + 1}-${to} of ${reports.length}`}
                                numberOfItemsPerPage={itemsPerPage}
                                showFastPaginationControls
                                selectPageDropdownLabel={'Rows per page'}
                            />
                        )}

                    </DataTable>
                ): (
                    <Text>You haven't made any reports yet!</Text>
                )}
            </View>

            <View style={styles.lowerSection}>
                <FAB label="Report" style={styles.fab} onPress={() => setCreateReport(true)} />
            </View>
            
            {/* 
            <BottomNavigation
                navigationState={{ index, routes }}
                onIndexChange={setIndex}
                onPress={renderScene}
            /> */}
        </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%'
  },
  mainPage: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  lowerSection: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
    width: '100%'
  },
  fab: {
    width: '50%'
  },
  table: {
    backgroundColor: '#f8f4fa',
    width: '90%',
    borderRadius: 15, 
    overflow: 'hidden', 
    padding: 5,
    boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
    marginTop: 30
  }
})
