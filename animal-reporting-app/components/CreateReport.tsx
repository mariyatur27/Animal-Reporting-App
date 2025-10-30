import React, { useEffect, useState } from 'react'
import { Alert, StyleSheet, View, AppState , Text} from 'react-native'
import { supabase } from '../lib/supabase'
import { Button, Input } from '@rneui/themed'
import { Session } from '@supabase/supabase-js'
import { Report , ReportInformation} from '../types'
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';

export default function CreateReport({ session }: { session: Session }) {
    const [reportData, setReportData] = useState({
        location: "",
        species: "",
        color: "",
        size: "",
        is_injured: false,
        condition: "",
    })
    const [currentLocation, setCurrentLoaction] = useState("")


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
                    setCurrentLoaction( `${address[0].name}, ${address[0].city}, ${address[0].postalCode}`)
                    return
                }
            }

            setCurrentLoaction(`${latitude}, ${longitude}`)
        }catch(error){
            console.log("ERROR: ", error)
        }
    }

    const SubmitReport = async() => {

    }

    const uploadPhoto = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: false,
            allowsEditing: true,
            quality: 1,
            exif: false
        })

        console.log("IMAGE RESULTS 1: ", result)
    }

    const takePhoto = async () => {
        const {status} = await ImagePicker.requestCameraPermissionsAsync();
        if(status !== "granted") return

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 1
        })

        console.log("IMAGE RESULTS 2: ", result)
    }

    return(
        <View style={styles.container}>

            <Button title="Upload Photo" onPress={() => uploadPhoto()}/>
            <Button title="Take Photo" onPress={() => takePhoto()} />

            <Input
                /* @ts-ignore */
                onChangeText={(text:string) => setReportData({...reportData, species: text})}
                value={reportData.species}
                placeholder="Species"
                autoCapitalize={'none'}
            />

            <Input
                /* @ts-ignore */
                onChangeText={(text:string) => setReportData({...reportData, color: text})}
                value={reportData.color}
                placeholder="Color"
                autoCapitalize={'none'}
            />

            <Input
                /* @ts-ignore */
                onChangeText={(text:string) => setReportData({...reportData, size: text})}
                value={reportData.size}
                placeholder="Size"
                autoCapitalize={'none'}
            />

            <Input
                /* @ts-ignore */
                onChangeText={(text:string) => setReportData({...reportData, condition: text})}
                value={reportData.condition}
                placeholder="Condition"
                autoCapitalize={'none'}
            />

            {currentLocation && (
                <Input
                    /* @ts-ignore */
                    onChangeText={(text:string) => setReportData({...reportData, location: text})}
                    value={reportData.location}
                    placeholder={currentLocation}
                    autoCapitalize={'none'}
                />
            )}

            <Button title="Report" onPress={async () => await SubmitReport()}/>
        </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%'
  },
});