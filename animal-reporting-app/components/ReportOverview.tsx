import React, { useEffect, useState } from 'react'
import { Alert, StyleSheet, View, AppState , Text} from 'react-native'
import { supabase } from '../lib/supabase'
import { Button, Input } from '@rneui/themed'
import { Session } from '@supabase/supabase-js'
import { Report , ReportInformation} from '../types'
import ReportsTracker from './ReportsTracker'

export default function ReportOverview({ session , reportId, status}: { session: Session, reportId: number, status:string }) {

    const [exit, setExit] = useState(false)
    const [loading, setLoading] = useState(true)
    const [report, setReport] = useState({
        date: "",
        species: "",
        color: "",
        size: "",
        isInjured: false,
        condition: "",
        location: "",
        orgName: "",
        sharePOC: false,
        orgEmail: "",
        orgPhone: "",
        status: ""
    })

    useEffect(() => {
        if (session) {
            getReportInfo(reportId)
        }
    }, [session])

    const getReportInfo = async (reportId: number) => {
        try{
            if(!session?.user) throw new Error("No user on the session!")

            const {data, error, status} = await supabase.from("AnimalReports").select("*, ManageReports(*)").eq("id", reportId)

            if(error){
                console.log("ERROR: ", error)
                return
            }

            if(data){
                let orgId = data[0].ManageReports.org_id

                setReport((prev) => ({
                    ...prev,
                    species: data[0].species,
                    color: data[0].color,
                    size: data[0].size,
                    date: data[0].created_at,
                    condition: data[0].condition,
                    location: data[0].location,
                    status: data[0].ManageReports.status,
                }));
                
                console.log("REPORT 1: ", report)

                try{

                    const {data, error, status} = await supabase.from("Organizations").select("*").eq("id", orgId)

                    if(error){
                        console.log("ERROR: ", error)
                        return
                    }

                    if(data){
                        setReport((prev) => ({
                            ...prev,
                            orgName: data[0].name,
                            sharePOC: data[0].share_contact_info,
                            orgEmail: data[0].email,
                            orgPhone: data[0].phone_number
                        }))

                        setLoading(false)
                        console.log("REPORT 2: ", report)
                    }

                }catch(error){
                    console.log("ERROR: ", error)
                }
            }

        }catch(error){
            console.log("ERROR: ", error)
            return
        }
    }

    if(exit){
        return(
            <ReportsTracker session={session}/>
        )
    }

    return(
        <View style={styles.container}>
            <View>
                <Button title="x" onPress={() => setExit(true)}/>
            </View>
            {report && !loading ? (
                <View>
                    <Text>Report Information</Text>
                    <Text>Date: {report.date}</Text>
                    <Text>Animal: {report.species}</Text>
                    <Text>Color: {report.color}</Text>
                    <Text>Size: {report.size}</Text>
                    <Text>Injured: {report.isInjured ? "Yes": "No"}</Text>
                    <Text>Condition: {report.condition}</Text>
                    <Text>Last Seen: {report.location}</Text>
                    <Text>Organization handling the case: {report.orgName}</Text>
                    {report.sharePOC && (
                        <Text>Point of Contact from {report.orgName}: {report.orgEmail}, {report.orgPhone}</Text>
                    )}
                    <Text>Rescue Status: {report.status} (Last Updated: *time*)</Text>
                </View>
            ) : (
                <Text>Loading...</Text>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    padding: 12,
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
  }
})