import React, { useEffect, useState } from 'react'
import { StyleSheet, View, ScrollView } from 'react-native'
import { supabase } from '../lib/supabase'
import { Session } from '@supabase/supabase-js'
import ReportsTracker from './ReportsTracker'
import ManageReports from './ManageReports'
import {Image} from 'react-native'
import { Appbar, Text, Button, Modal, DataTable, Chip, TextInput, Portal } from 'react-native-paper';
import * as Location from 'expo-location';

export default function ReportOverview({ session , reportData, org}: { session: Session, reportData: any[] | undefined, org: boolean }) {

    const [exit, setExit] = useState(false)
    const [openModal, setOpenModal] = useState(false)
    const [refreshUpdates, setRefreshUpdates] = useState(false)
    const [updateContent, setUpdateContent] = useState("")
    const [updatePhotoUrl, setUpdatePhotoUrl] = useState("")
    const [allUpdates, setAllUpdates] = useState<any[]>([])
    const [location, setLocation] = useState("")
    const [contactInfo, setContactInfo] = useState({
        email: null,
        phone: null,
        name: null
    })
    const report = reportData?.[0]
    const [status, setStatus] = useState<string | undefined>(report.ManageReports.status)
    const statusOptions = [
        {label: 'new', value: 'new'},
        {label: 'processing', value: 'processing'},
        {label: 'resolved', value: 'resolved'}
    ]

    useEffect(() => {
        fetchAllUpdates()
        setRefreshUpdates(false)
        fetchContacts()
    }, [refreshUpdates])

    const fetchContacts = async() => {
        try{
            let contactInfo;

            if(org){
                //To Do: Start adding new users to the dedicated users table and sak if they want to share their contact info
            }else{
                const {data} = await supabase.from("Organizations").select("name, email, phone_number, share_contact_info").eq("id", report.ManageReports.org_id)
                contactInfo = data;
            }

            if(contactInfo && contactInfo[0].share_contact_info){
                setContactInfo({
                    email: contactInfo[0].email,
                    phone: contactInfo[0].phone_number,
                    name: contactInfo[0].name
                })
            }
        }catch(error){
            console.log("ERROR: ", error)
        }
    }

    const updateStatus = async() => {
        try{
            const {error} = await supabase.from('ManageReports').update({status: status}).eq('report_id', report.ManageReports.report_id)
            console.log("HERE....")
            if(!error){
                return
            }else{
                throw new Error(`${error}`)
            }
        }catch(error){
            console.log("ERROR: ", error)
        }
    }

    const fetchAllUpdates = async() => {
        try{
            const {data: updates} = await supabase.from("ReportUpdates").select("*").eq("report_id", report.ManageReports.report_id)

            if(updates){
                console.log(updates)
                setAllUpdates(updates)
            }

        }catch(error){
            console.log("ERROR: ", error)
        }
    }

    const getLocation = async() => {
        try{
            const {status} = await Location.requestForegroundPermissionsAsync();

            if(status !== "granted") return

            const location = await Location.getCurrentPositionAsync({});
            const {latitude, longitude} = location.coords;
            const address = await Location.reverseGeocodeAsync({latitude, longitude});

            if(address.length > 0){
                if(address[0].name != "" && address[0].city != "" && address[0].postalCode != ""){
                    console.log(`In here: ${address[0].name}, ${address[0].city}, ${address[0].postalCode}`)
                    setLocation( `${address[0].name}, ${address[0].city}, ${address[0].postalCode}`)
                    return
                }
            }

            setLocation(`${address[0].name}, ${address[0].city}, ${address[0].postalCode}`)

        }catch(error){
            console.log("ERROR: ", error)
        }
    }

    const postUpdate = async () => {
        try{
            const {error} = await supabase.from("ReportUpdates").insert([
                {report_id: report.ManageReports.report_id, image_url: updatePhotoUrl, report_update: updateContent.trim(), location: location}
            ])

            if(!error){
                setUpdateContent("")
                setUpdatePhotoUrl("")
                setLocation("")
                setOpenModal(false)
                setRefreshUpdates(true)
            }
        }catch(error){
            console.log("ERROR: ", error)
        }
    }

    if(exit){
        return org ? <ManageReports session={session} /> : <ReportsTracker session={session}/>
    }

    return(
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => setExit(true)} />
                <Appbar.Content title="Report Details"/>
            </Appbar.Header>

            <Portal>
                <Modal visible={openModal} dismissable={false} dismissableBackButton={false} style={styles.modalContainer}>
                    <View style={styles.modalContents}>
                        {location.trim() !== "" && (
                            <Chip mode="flat" icon="pin" style={styles.locationChip}>
                                {location}
                            </Chip>
                        )}
                        <TextInput
                            value={updateContent}
                            onChangeText={text => setUpdateContent(text)}
                            mode="flat"
                            label="Leave your comments..."
                            multiline
                            style={{height: 150}}
                        />
                        <View style={styles.buttonRow}>
                            <Button mode="contained">Upload photo</Button>
                            <Button mode="contained-tonal" onPress={() => getLocation()} disabled={location ? true:false}>Share location</Button>
                        </View>
                        <Button mode="elevated" onPress={() => postUpdate()}>Post update</Button>
                        <Button mode="elevated" onPress={() => {
                            setUpdateContent("")
                            setUpdatePhotoUrl("")
                            setLocation("")
                            setOpenModal(false)
                        }}>Cancel</Button>
                    </View>
                </Modal>
            </Portal>   

            <ScrollView>
                <View style={styles.inner}>
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
                                    <View style={styles.statusColumn}>
                                        {statusOptions.map((option, key) => (
                                            <Chip style={styles.statusChip} key={key} onPress={() => {
                                                updateStatus()
                                                setStatus(option.value)
                                            }} selected={option.value === status}>{option.label.toLowerCase()}</Chip>
                                        ))}
                                    </View>
                                </DataTable.Cell>
                            </DataTable.Row>
                            
                            {contactInfo.email && contactInfo.name && (
                                <DataTable.Row>
                                    <DataTable.Cell style={styles.namesColumn}>
                                        <Text style={styles.namesStyles}>Contact:</Text>
                                    </DataTable.Cell>
                                    <DataTable.Cell style={styles.valuesColumn}>
                                        <View style={styles.statusColumn}>
                                            <Chip style={styles.statusChip}>
                                                Name: {contactInfo.name}
                                            </Chip>
                                            <Chip style={styles.statusChip}>
                                                Email: {contactInfo.email}
                                            </Chip>
                                            {contactInfo.phone && (
                                                <Chip style={styles.statusChip}>
                                                    Phone: {contactInfo.phone}
                                                </Chip>
                                            )}
                                        </View>
                                    </DataTable.Cell>
                                </DataTable.Row>
                            )}
                        </DataTable>
                    </View>

                    <View style={styles.mainPage}>
                        <Text variant="headlineSmall">Updates</Text>
                    </View>
                    <View style={styles.mainPage}>
                        {allUpdates.length > 0 ? (
                            <DataTable style={styles.table}>
                                <DataTable.Header>
                                    <DataTable.Title style={{flex: 1}}>Date</DataTable.Title>
                                    <DataTable.Title style={{flex: 5}}>Update</DataTable.Title>
                                </DataTable.Header>

                                {allUpdates.map((update, key) => (
                                    <DataTable.Row style={{padding: 5, height: 'auto'}} key={key}>
                                        <DataTable.Cell style={{flex: 1}}>{update.created_at.split("T")[0].substring(5)}</DataTable.Cell>
                                        <DataTable.Cell style={{flex: 5}}>
                                            <View>
                                                <Text style={{ flexWrap: 'wrap'}}>{update.report_update}</Text>
                                                <Text style={{ flexWrap: 'wrap'}}>{`Location: ${update.location || "not provided"}`}</Text>
                                            </View>
                                        </DataTable.Cell>
                                    </DataTable.Row>
                                ))}
                            </DataTable>
                        ) : (
                            <Text>No updates were posted yet...</Text>
                        )}
                        
                        {org && (
                            <View style={styles.leftAlign}>
                                <Button mode="contained" onPress={() => {setOpenModal(true)}}>+ Update</Button>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
  inner: {
    paddingTop: 20,
    paddingBottom: 150
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
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
  statusColumn: {
    flexWrap: 'wrap',
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    padding: 10
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
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    width: "100%",         
  },
  modalContents: {
    display: 'flex',
    flexDirection: 'column',
    gap: 15,
    width: '80%',
    alignSelf: 'center'
  },
  locationChip: {
    padding: 5,
    maxWidth: '100%',
    alignSelf: 'flex-start'
  },
  buttonRow: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
  }
})