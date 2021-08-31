import { IdProvider } from "@chakra-ui/react";
import firebase from "../lib/firebase";
import Axios from "axios";

const postLimit = 20

export const addUser = async (authUser: any) => {
    console.log('lookup user from db: ' + authUser.uid)
    var isExisted = docExisted(firebase.firestore().collection('users').doc(authUser.uid as string))

    if (!isExisted) {
        console.log('insert user to db ' + authUser.uid)
        const resp = await firebase.firestore().collection('users')
            .doc(authUser.uid as string)
            .set({ ...authUser });
        console.log('done inserting user to db')
    }
    // return resp;
}

export const docExisted = async (docRef: any) => {
    return docRef.onSnapshot((snapshot) => {
        if (snapshot.exists) return true;
        else return false;
    })
}

export const refillDbWithAccount = async (acc: string) => {

    // let tmp = await Axios.post('http://localhost:8000/trigger/account', { list: acc })
    let tmp = await Axios.post('http://20.37.47.186:8000/trigger/account', { list: acc })

    // let tmp = await Axios.post('http://ec2-3-135-207-27.us-east-2.compute.amazonaws.com:8000/trigger/account', { list: acc })

    return tmp
}


export const loadUnlabelledPost = async () => {
    // var dataRef = null
    let loadUnlabelled = null

    try {
        let dataRef = await firebase.firestore().collection("tweets_health")
            .where("rating", "<", -2).orderBy("rating", "desc")
            .limit(postLimit)
            .get()
        loadUnlabelled = dataRef.docs.map((doc) => (
            { id: doc.id, ...doc.data() })
        )

        return loadUnlabelled

        // if (docExisted(dataRef))
        //     data = (await dataRef.get()).docs.map((doc) => ({ ...doc.data }));
    } catch (err) {
        console.log('Error occurred: ' + err)
    }


    // return (await dataRef.get()).docs.map((doc) => ({ ...doc.data }));
}


export const loadUnlabelledPostByAccount = async (account: string = 'SAHealth') => {
    let result = []
    if (!account.startsWith('@'))
        account = '@' + account
    // console.log(`load UnlabelledPost By ${account}`)

    try {
        let dataRef = await firebase.firestore().collection("tweets_health")
            .where("account", "==", account)
            .where("rating", '==', -10)
            .orderBy("postAt", 'desc')
            .limit(postLimit)
            .get()
        result = dataRef.docs.map((doc) => (
            { id: doc.id, ...doc.data() })
        )
        console.log(`finish load ${result.length} unlabelled post By ${account} `)

        return result
    } catch (err) {
        console.log('Error occurred: ' + err)
    }
}

export const updateLabel = async (auth, hash, rating, event) => {
    let dataRef = await firebase.firestore().collection("tweets_health").doc(hash)

    try {
        const res = await firebase.firestore().runTransaction(async t => {
            const doc = await t.get(dataRef)
            await t.update(dataRef, { rating: rating, event: event })
        })
        console.log('Transaction success', res);
    } catch (e) {
        console.log('Transaction failure:', e);
    }

}

export const getDefaultEventList = async () => {
    console.log('getDefaultEventList')
    let dataRef = await firebase.firestore().collection("default_events").get()

    // dataRef.docs.forEach((doc) => defEve.push(doc.data))
    // let defEve = dataRef.docs.map((doc) => (
    //     { id: doc.id, ...doc.data() })
    // )
    let defEve = dataRef.docs.map(doc => (
        { id: doc.id, ...doc.data() })
    )
    console.log(defEve)

    return defEve

}

export const downloadData = async (auth, accounts: string[], limit:number) => {
    let result= []
    // if (!account.startsWith('@'))
    //     account = '@' + account
    // console.log(`load UnlabelledPost By ${account}`)

    try {
        // let dataRef = await firebase.firestore().collection("tweets_health")
        //     .where("account", "==", account)
        //     .where("rating", '!=', -10)
        //     .orderBy("postAt", 'desc')
        //     .get()

        let dataRef = await buildGETQuery(accounts, limit).get().then((all)=>{
            result = all.docs.map((doc) => (
                { id: doc.id, ...doc.data() })
            )

        })

        console.log(`downloaded ${result.length} records By ${accounts} `)
        return result
    } catch (err) {
        console.log('Error occurred: ' + err)
    }
}

function buildGETQuery (accounts: string[], limit) {
    let query = firebase.firestore().collection("tweets_health")
                        .where("rating", '!=', -10)
    if (accounts.length > 0){
        query = query.where("account", 'in', accounts)
    }
    if (limit != null){
        query = query.limit(limit)
    }
    return query
}