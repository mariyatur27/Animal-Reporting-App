import React, { useEffect, useState } from 'react'
import { Alert, StyleSheet, View, AppState } from 'react-native'
import { supabase } from '../lib/supabase'
import { Session } from '@supabase/supabase-js'
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import {Image} from 'react-native'
import { TextInput , Button, SegmentedButtons , Portal, Dialog, Text} from 'react-native-paper'
import { useNavigation } from '@react-navigation/native';
import ReportsTracker from './ReportsTracker';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackParams } from '../types';

export default function CreateReport({ session }: { session: Session }) {
    const [reportData, setReportData] = useState({
        uid: session.user.id,
        location: "",
        species: "",
        color: "",
        size: "",
        is_injured: false,
        condition: "",
        photo_link: "",
    })
    const [mimetype, setMimetype] = useState("")
    const [cancel, setCancel] = useState(false)
    const [closeReport, setCloseReport] = useState(false)
    // type NavigationProps = StackNavigationProp<StackParams, 'ReportsTracker'>;
    // const navigation = useNavigation<NavigationProps>();


    useEffect(() => {
         getCurrentLocation();
    }, [])

    const getCurrentLocation = async() => {
        try{
            const {status} = await Location.requestForegroundPermissionsAsync();

            if(status !== "granted") return

            const location = await Location.getCurrentPositionAsync({});
            const {latitude, longitude} = location.coords;
            const address = await Location.reverseGeocodeAsync({latitude, longitude});

            if(address.length > 0){
                if(address[0].name != "" && address[0].city != "" && address[0].postalCode != ""){
                    console.log(`${address[0].name}, ${address[0].city}, ${address[0].postalCode}`)
                    setReportData(prev => ({...prev, location: `${address[0].name}, ${address[0].city}, ${address[0].postalCode}`}))
                    return
                }
            }

            setReportData(prev => ({...prev, location: `${address[0].name}, ${address[0].city}, ${address[0].postalCode}`}))

        }catch(error){
            console.log("ERROR: ", error)
        }
    }

    const SubmitReport = async() => {
        try {
            const {data, error} = await supabase.from('AnimalReports').insert([
                reportData
            ]).select('*')

            if(error){
                console.log("ERROR: ", error);
                return
            }

            try {

                const reportId = data?.[0]?.id;
                const {error} = await supabase.from('UserReports').insert([
                    {uid: session.user.id, report_id: reportId, status: "processing"}
                ])

                if(!error){
                    setCloseReport(true)
                }else{
                    console.log("ERROR: ", error)
                }

            }catch(error){
                console.log("ERROR: ", error)
            }

        }catch(error){
            console.log("ERROR", error)
        }
    }

    const uploadPhoto = async () => {
        try{
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: false,
                allowsEditing: true,
                quality: 1,
                exif: false
            })

            console.log("IMAGE RESULTS 1: ", result)

            if(result.canceled || !result.assets || result.assets.length == 0){
                return
            }

            const image = result.assets[0].uri
            const mimeType = result.assets[0].mimeType

            if(mimeType){
                setMimetype(mimeType)
            }

            // Update the reportData state with the signed URL
            setReportData((prev) => ({
                ...prev,
                photo_link: image, // Use the signed URL for the photo
            }));

            console.log(reportData.photo_link)
        }catch(error){
            console.log(error)
        }

    }

    const takePhoto = async () => {
        try{
            const {status} = await ImagePicker.requestCameraPermissionsAsync();
            if(status !== "granted") return

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                quality: 1
            })

            console.log("IMAGE RESULTS 2: ", result)

            if(result.canceled || !result.assets || result.assets.length == 0){
                return
            }

            const image = result.assets[0].uri
            const mimeType = result.assets[0].mimeType
            
            if(mimeType){
                setMimetype(mimeType)
            }

            // Update the reportData state with the signed URL
            setReportData((prev) => ({
                ...prev,
                photo_link: image, // Use the signed URL for the photo
            }));
        }catch(error){
            console.log(error)
        }
    }

    const storeImageInSupabase = async (uri: string, mimeType: string) => {
        try{
            const arraybuffer = await fetch(uri).then((res) => res.arrayBuffer())
            const fileExt = uri?.split('.').pop()?.toLowerCase() ?? 'jpeg'
            const path = `${Date.now()}.${fileExt}`
            const { data, error: uploadError } = await supabase.storage
                .from('report_pictures')
                .upload(path, arraybuffer, {
                contentType: mimeType ?? 'image/jpeg',
            })

            if (uploadError) {
                throw uploadError
            }

            // Generate a signed URL for the uploaded file
            const { data: signedUrlData, error: signedUrlError } = await supabase.storage
                .from('report_pictures')
                .createSignedUrl(path, 60 * 60); // URL valid for 1 hour

            if (signedUrlError) {
                throw signedUrlError;
            }

            // Update the reportData state with the signed URL
            // setReportData((prev) => ({
            //     ...prev,
            //     photo: signedUrlData.signedUrl, // Use the signed URL for the photo
            // }));

        }catch(error){
            console.log(error)
        }
    }

    if(closeReport){
        return(
            <ReportsTracker session={session} />
        )
    }

    return(
        <View style={styles.container}>

            {cancel && (
                <Portal>
                    <Dialog visible={cancel} onDismiss={() => setCloseReport(true)}>
                        <Dialog.Title>You're about to cancel your report!</Dialog.Title>
                        <Dialog.Content>
                            <Text>Once you cancel your report, the form will not save.</Text>
                        </Dialog.Content>
                    </Dialog>
                </Portal>
            )}

            {reportData.photo_link && (
                <Image source={{uri: reportData.photo_link}} style={styles.image}/>
            )}

            <View style={styles.row}>
                <Button onPress={() => uploadPhoto()} mode='contained-tonal'>Upload Photo</Button>
                <Button onPress={() => takePhoto()} mode='contained-tonal' icon="camera">Take Photo</Button>
            </View>

            <View style={styles.form}>
                <TextInput 
                    label="Species"
                    onChangeText={(text:string) => setReportData({...reportData, species: text})}
                    value={reportData.species}
                    style={styles.textField}
                    mode='outlined'
                />

                <TextInput 
                    label="Color"
                    onChangeText={(text:string) => setReportData({...reportData, color: text})}
                    value={reportData.color}
                    style={styles.textField}
                    mode='outlined'
                />


                <SegmentedButtons 
                    value={reportData.size}
                    density='regular'
                    onValueChange={(text:string) => setReportData({...reportData, size: text})}
                    buttons={[
                        {
                            value: 'small',
                            label: 'Small'
                        },
                        {
                            value: 'medium',
                            label: 'Medium'
                        },
                        {
                            value: 'large',
                            label: 'Large'
                        }
                    ]}
                />

                <TextInput 
                    label="Condition"
                    onChangeText={(text:string) => setReportData({...reportData, condition: text})}
                    value={reportData.condition}
                    style={styles.textField}
                    mode='outlined'
                />

                <TextInput 
                    label="Location"
                    onChangeText={(text:string) => setReportData({...reportData, location: text})}
                    value={reportData.location}
                    style={styles.textField}
                    mode='outlined'
                />
            </View>

            <View style={styles.row}>
                <Button onPress={async () => await SubmitReport()} mode='contained'>Report</Button>
                <Button onPress={() => setCancel(true)} mode='contained-tonal' >Cancel</Button>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '10%'
  },
  image: {
    width: '100%', // Set the width of the image
    height: 250, // Set the height of the image
    marginVertical: 20, // Add spacing around the image
    borderRadius: '30px', // Optional: Add rounded corners
  },
  textField: {
    width: '100%',
    height: 50,
  },
  form:{
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  row: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row',
    marginVertical: 20,
    gap: 10
  }
});