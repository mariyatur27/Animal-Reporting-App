import React, { useEffect, useState } from 'react'
import { Alert, StyleSheet, View, AppState , Text} from 'react-native'
import { supabase } from '../lib/supabase'
import { Button, Input } from '@rneui/themed'
import { Session } from '@supabase/supabase-js'
import { Report , ReportInformation} from '../types'
// import Geolocation from 'react-native-geolocation-service';
import { loadBindings } from 'next/dist/build/swc'

export default function CreateReport({ session }: { session: Session }) {
    const [reportData, setReportData] = useState({
        location: "",
        species: "",
        color: "",
        size: "",
        is_injured: false,
        condition: "",
    })

    useEffect(() => {
        //get current location
        // Geolocation.getCurrentPosition(
        //     (position) => {
        //         const {latitude, longitude} = position.coords;
        //         console.log("POSITION: ", latitude, longitude)
        //     },
        //     (error) => {
        //         console.log(error)
        //     },
        //     { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        // )
    }, [])

    return(
        <View style={styles.container}>
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
        </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});