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

    const [reports, setReports] = useState<any[] | null>([])
    const [username, setUsername] = useState("")
    const [openOverview, setOpenOverview] = useState(false)
    const [targetId, setTargetId] = useState(-1)
    const [createReport, setCreateReport] = useState(false)
    const [page, setPage] = useState(0)
    const itemsPerPage = 10;
    const [to, setTo] = useState<number>(-1)
    const [from, setFrom] = useState<number>(-1)

    useEffect(() => {
        if (session) {
            setPage(0)
            getUserReports()
            console.log(session)
            setUsername(session.user?.user_metadata["firstName"])
        }
    }, [session])

    useEffect(() => {
        if(reports){
            setTo(Math.min((page + 1) * itemsPerPage, reports.length));
            setFrom(page * itemsPerPage);
        }

    }, [reports])

    const getUserReports = async () => {
        try{
            if(!session?.user) throw new Error("No user on the session!")

            const{data: userReports} = await supabase.from("UserReports").select("report_id").eq("uid", session.user.id)

            if(userReports){
                const idArr = userReports.map(obj => obj.report_id)
                const {data} = await supabase.from("AnimalReports").select("*, ManageReports(*)").in("id", idArr)

                if(data){
                    console.log("RESULTS: ", data)
                    const sortedData = data.sort((a, b) => {
                        const dateA = new Date(a.created_at).getTime();
                        const dateB = new Date(b.created_at).getTime();
                        return dateB - dateA
                    });
                    console.log("SORTED: ", sortedData)
                    setReports(sortedData);
                }
            }

        }catch(error){
            console.log("ERROR: ", error)
            return
        }
    }

    if (openOverview){
        const targetReportDetails = reports?.filter(obj => obj.ManageReports.report_id == targetId)
        console.log(targetReportDetails)
        return (
            <ReportOverview session={session} reportData={targetReportDetails} org={false}/>
        )
    }

    if (createReport){
        return(
            <CreateReport session={session} />
        )
    }

    return(
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.Content title="Reports Tracker"/>
            </Appbar.Header>
            <View style={styles.mainPage}>
                {reports && to > -1 && from > -1 && reports.length > 0 ? (
                    <DataTable style={styles.table}>
                        <DataTable.Header>
                            <DataTable.Title style={{flex: 1}}>ID</DataTable.Title>
                            <DataTable.Title style={{flex: 2}}>Date</DataTable.Title>
                            <DataTable.Title style={{flex: 3}}>Status</DataTable.Title>
                        </DataTable.Header>

                        {reports.slice(from, to).map((item, index, arr) => (
                            <DataTable.Row key={item.ManageReports.report_id} style={index === arr.length - 1 && {borderBottomWidth: 0}} onPress={() => {
                                setTargetId(item.ManageReports.report_id);
                                setOpenOverview(true)
                            }}>
                                <DataTable.Cell style={{flex: 1}}>{item.ManageReports.report_id}</DataTable.Cell>
                                <DataTable.Cell style={{flex: 2}}>{item.created_at.split("T")[0]}</DataTable.Cell>
                                <DataTable.Cell style={{flex: 3}}>
                                    <Chip style={{backgroundColor: '#BCE0BE'}}>{item.ManageReports.status}</Chip>
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
    marginTop: 20,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  lowerSection: {
    position: 'absolute',
    bottom: 150,
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
