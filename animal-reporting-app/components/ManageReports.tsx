import { useState, useEffect } from "react";
import { Appbar, Text, Button, SegmentedButtons, DataTable, Chip } from 'react-native-paper';
import { Alert, StyleSheet, View, AppState} from 'react-native'
import { Session } from '@supabase/supabase-js'
import { supabase } from "../lib/supabase";
import ReportOverview from "./ReportOverview";

export default function ManageReports({ session }: { session: Session }){
    const [filter, setFilter] = useState("new")
    const [allReports, setAllReports] = useState<any[] | null>([])
    const [targetReport, setTargetReport] = useState(-1)
    const [openOverview, setOpenOverview] = useState(false)

    const getAllReports = async() => {
        try{
            if(!session?.user) throw new Error("No user on the session!")
            
            const {data: orgId} = await supabase.from("Organizations").select("id").eq("user_id", session.user.id);

            if(orgId){
                const {data: orgReports} = await supabase.from("ManageReports").select("*").eq("org_id", orgId[0].id)

                if(orgReports){
                    const idArr =  orgReports.map(obj => obj.report_id)
                    const {data: reportDetails} = await supabase.from("AnimalReports").select("*, ManageReports(*)").in("id", idArr)
                    console.log(reportDetails?.length)
                    setAllReports(reportDetails)
                }
            }
        }catch(error){
            console.log("Error: ", error)
        }
    }

    useEffect(() => {
        getAllReports();
    }, [])

    if (openOverview){
        const targetReportDetails = allReports?.filter(obj => obj.ManageReports.report_id == targetReport)
        return (
            <ReportOverview session={session} reportData={targetReportDetails} org={true}/>
        )
    }

    return (
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.Content title="Reports Manager"/>
            </Appbar.Header>

            <View style={styles.mainPage}>
                <SegmentedButtons
                    value={filter}
                    onValueChange={setFilter}
                    style={{width: '80%'}}
                    buttons={[
                    {
                        value: 'new',
                        label: 'New',
                    },
                    {
                        value: 'processing',
                        label: 'Processing',
                    },
                    {
                        value: 'resolved',
                        label: 'Resolved',
                    },
                ]}/>
            </View>

            <View style={styles.mainPage}>
                {allReports && allReports.filter(report => report.ManageReports.status === filter).length > 0 ? (
                    <DataTable style={styles.table}>
                        <DataTable.Header>
                            <DataTable.Title style={{flex: 1}}>ID</DataTable.Title>
                            <DataTable.Title style={{flex: 2}}>Date</DataTable.Title>
                            <DataTable.Title style={{flex: 3}}>Condition</DataTable.Title>
                        </DataTable.Header>

                        {allReports.filter(report => report.ManageReports.status === filter).map((ele) => (
                            <DataTable.Row key={ele.ManageReports.report_id} onPress={() => {
                                setTargetReport(ele.ManageReports.report_id)
                                setOpenOverview(true)
                            }}>
                                <DataTable.Cell style={{flex: 1}}>{ele.ManageReports.report_id}</DataTable.Cell>
                                <DataTable.Cell style={{flex: 2}}>{ele.created_at.split("T")[0]}</DataTable.Cell>
                                <DataTable.Cell style={{flex: 3}}>
                                    <Chip>{ele.condition.charAt(0).toUpperCase() + ele.condition.slice(1)}</Chip>
                                </DataTable.Cell>
                            </DataTable.Row>
                        ))}

                    </DataTable>
                ) : (
                    <Text>There are no {filter.toLowerCase()} yet!</Text>
                )}
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
  table: {
    backgroundColor: '#f8f4fa',
    width: '90%',
    borderRadius: 15, 
    overflow: 'hidden', 
    padding: 5,
    boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
  }
});
