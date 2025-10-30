import React, { useEffect, useState } from 'react'
import { Alert, StyleSheet, View, AppState , Text} from 'react-native'
import { supabase } from '../lib/supabase'
import { Button, Input } from '@rneui/themed'
import { Session } from '@supabase/supabase-js'
import { Report } from '../types'
import ReportOverview from './ReportOverview'
import { TouchableOpacity } from 'react-native';
import CreateReport from './CreateReport'


export default function ReportsTracker({ session }: { session: Session }) {

    const [reports, setReports] = useState<Report[]>([])
    const [username, setUsername] = useState("")
    const [openOverview, setOpenOverview] = useState(false)
    const [targetId, setTargetId] = useState(-1)
    const [targetStatus, setTargetStatus] = useState("")
    const [createReport, setCreateReport] = useState(false)

    useEffect(() => {
        if (session) {
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
                setReports(data)
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

    return(
        <View style={styles.container}>
            {username && (
                <Text>Hey {username}!</Text>
            )}
            {reports.length > 0 ? (
                <View style={styles.reportsContainer}>
                    <Text style={{marginBottom: 20}}>Active Reports </Text>
                    <View style={[styles.reportRow, {marginBottom: 10}]}>
                        <Text>Report Id</Text>
                        <Text>Status</Text>
                    </View>
                    {reports.map((report) => (
                        <TouchableOpacity style={styles.reportRow} key={report.report_id} onPress={() =>{
                            setTargetId(report.report_id);
                            setTargetStatus(report.status);
                            setOpenOverview(true);
                        }}>
                            <Text>{report.report_id}</Text>
                            <Text>{report.status}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            ): (
                <Text>You haven't made any reports yet!</Text>
            )}
            <View style={styles.reportButton}>
                <Button title={"Report Animal"} onPress={() => setCreateReport(true)}/>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    padding: 12,
    height: '100%',
    width: '80%'
  },
  reportsContainer:{
    marginTop: 50
  },
  reportRow:{
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    textAlign: 'left'
  },
  reportButton:{
    position: 'absolute',
    bottom: 200,
    width: '100%'
  }
})