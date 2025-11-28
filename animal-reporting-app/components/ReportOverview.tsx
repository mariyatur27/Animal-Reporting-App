import React, { useEffect, useState } from 'react'
import { Alert, StyleSheet, View, AppState } from 'react-native'
import { supabase } from '../lib/supabase'
import { Session } from '@supabase/supabase-js'
import { Report , ReportInformation} from '../types'
import ReportsTracker from './ReportsTracker'
import ManageReports from './ManageReports'
import {Modal, Portal} from 'react-native-paper'
import {Image} from 'react-native'
import { Appbar, Text, Button, SegmentedButtons, DataTable, Chip } from 'react-native-paper';

export default function ReportOverview({ session , reportData, org}: { session: Session, reportData: any[] | undefined, org: boolean }) {

    const [exit, setExit] = useState(false)
    const report = reportData?.[0]

    // const [report, setReport] = useState({
    //     date: "",
    //     species: "",
    //     color: "",
    //     size: "",
    //     isInjured: false,
    //     condition: "",
    //     location: "",
    //     orgName: "",
    //     sharePOC: false,
    //     orgEmail: "",
    //     orgPhone: "",
    //     status: "",
    //     photoLink: "",
    // })

    // useEffect(() => {
    //     if (session) {
    //         getReportInfo(reportId)
    //     }
    // }, [session])

    // const getReportInfo = async (reportId: number) => {
    //     try{
    //         if(!session?.user) throw new Error("No user on the session!")

    //         const {data, error, status} = await supabase.from("AnimalReports").select("*, ManageReports(*)").eq("id", reportId)

    //         if(error){
    //             console.log("ERROR: ", error)
    //             return
    //         }

    //         if(data){
    //             let orgId = data[0].ManageReports.org_id

    //             setReport((prev) => ({
    //                 ...prev,
    //                 species: data[0].species,
    //                 color: data[0].color,
    //                 size: data[0].size,
    //                 date: data[0].created_at,
    //                 condition: data[0].condition,
    //                 location: data[0].location,
    //                 status: data[0].ManageReports.status,
    //                 photoLink: data[0].photo_link,
    //             }));
                
    //             console.log("REPORT 1: ", report)

    //             try{

    //                 const {data, error, status} = await supabase.from("Organizations").select("*").eq("id", orgId)

    //                 if(error){
    //                     console.log("ERROR: ", error)
    //                     return
    //                 }

    //                 if(data){
    //                     setReport((prev) => ({
    //                         ...prev,
    //                         orgName: data[0].name,
    //                         sharePOC: data[0].share_contact_info,
    //                         orgEmail: data[0].email,
    //                         orgPhone: data[0].phone_number
    //                     }))

    //                     setLoading(false)
    //                     console.log("REPORT 2: ", report)
    //                 }

    //             }catch(error){
    //                 console.log("ERROR: ", error)
    //             }
    //         }

    //     }catch(error){
    //         console.log("ERROR: ", error)
    //         return
    //     }
    // }

    if(exit){
        return org ? <ManageReports session={session} /> : <ReportsTracker session={session}/>
    }

    console.log(reportData)

    return(
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => setExit(true)} />
                <Appbar.Content title="Report Details"/>
            </Appbar.Header>

            <View style={styles.mainPage}>
                <DataTable style={styles.table}>
                    <DataTable.Row>
                        <DataTable.Cell style={styles.namesColumn}>
                            <Text style={styles.namesStyles}>Created:</Text>
                        </DataTable.Cell>
                        <DataTable.Cell style={styles.valuesColumn}>
                            <Text>{report.created_at.split("T")[0]}</Text>
                        </DataTable.Cell>
                    </DataTable.Row>

                    <DataTable.Row>
                        <DataTable.Cell style={styles.namesColumn}>
                            <Text style={styles.namesStyles}>Animal:</Text>
                        </DataTable.Cell>
                        <DataTable.Cell style={styles.valuesColumn}>
                            <Text>{report.species.toLowerCase()}</Text>
                        </DataTable.Cell>
                    </DataTable.Row>

                    <DataTable.Row>
                        <DataTable.Cell style={styles.namesColumn}>
                            <Text style={styles.namesStyles}>Color:</Text>
                        </DataTable.Cell>
                        <DataTable.Cell style={styles.valuesColumn}>
                            <Text>{report.color.toLowerCase()}</Text>
                        </DataTable.Cell>
                    </DataTable.Row>

                    <DataTable.Row>
                        <DataTable.Cell style={styles.namesColumn}>
                            <Text style={styles.namesStyles}>Size:</Text>
                        </DataTable.Cell>
                        <DataTable.Cell style={styles.valuesColumn}>
                            <Text>{report.size.toLowerCase()}</Text>
                        </DataTable.Cell>
                    </DataTable.Row>

                    <DataTable.Row>
                        <DataTable.Cell style={styles.namesColumn}>
                            <Text style={styles.namesStyles}>Injured:</Text>
                        </DataTable.Cell>
                        <DataTable.Cell style={styles.valuesColumn}>
                            <Text>{report.is_injured ? "yes": "no"}</Text>
                        </DataTable.Cell>
                    </DataTable.Row>

                    <DataTable.Row>
                        <DataTable.Cell style={styles.namesColumn}>
                            <Text style={styles.namesStyles}>Condition:</Text>
                        </DataTable.Cell>
                        <DataTable.Cell style={styles.valuesColumn}>
                            <Text>{report.condition.toLowerCase()}</Text>
                        </DataTable.Cell>
                    </DataTable.Row>

                    <DataTable.Row>
                        <DataTable.Cell style={styles.namesColumn}>
                            <Text style={styles.namesStyles}>Last Seen:</Text>
                        </DataTable.Cell>
                        <DataTable.Cell style={styles.valuesColumn}>
                            <Text>{report.location}</Text>
                        </DataTable.Cell>
                    </DataTable.Row>

                    <DataTable.Row>
                        <DataTable.Cell style={styles.namesColumn}>
                            <Text style={styles.namesStyles}>Status:</Text>
                        </DataTable.Cell>
                        <DataTable.Cell style={styles.valuesColumn}>
                            <Chip>{report.ManageReports.status.toLowerCase()}</Chip>
                        </DataTable.Cell>
                    </DataTable.Row>
                </DataTable>
            </View>

            <View style={styles.mainPage}>
                <Text variant="headlineSmall">Updates</Text>
            </View>
            <View style={styles.mainPage}>
                <DataTable style={styles.table}>
                    <DataTable.Header>
                        <DataTable.Title style={{flex: 1}}>Date</DataTable.Title>
                        <DataTable.Title style={{flex: 3}}>Update</DataTable.Title>
                    </DataTable.Header>
                </DataTable>
                <View style={styles.leftAlign}>
                    <Button mode="contained">+ Update</Button>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%'
  },
  leftAlign: {
    width: '90%',
    alignItems: 'flex-start',
    marginTop: 7
  },
  namesColumn: {
    flex: 1,
  },
  namesStyles: {
    fontWeight: 700
  },
  valuesColumn: {
    flex: 3,
  },
  mainPage: {
    display: 'flex',
    marginTop: 20,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  table: {
    backgroundColor: '#f8f4fa',
    width: '90%',
    borderRadius: 15, 
    overflow: 'hidden', 
    padding: 5,
    boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
  }
})