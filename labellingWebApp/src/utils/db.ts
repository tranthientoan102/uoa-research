import { IdProvider } from "@chakra-ui/react";
import firebase from "../lib/firebase";
import Axios from "axios";
import {database} from "firebase-admin/lib/database";
import {toast} from 'react-toastify';



toast.configure()

const expectingPost = 500
const dbLookupLimit = 1000

export const host = 'localhost'
// export const host = '20.37.47.186'


export const updateAuthUser = async (authUser: any) => {
    console.log('lookup user from db: ' + authUser.uid)
    var userInfo = await firebase.firestore().collection('users').doc(authUser.uid as string).get()

    if (!userInfo.exists) {
        console.log('insert user to db ' + authUser.uid)
        const resp = await firebase.firestore().collection('users')
            .doc(authUser.uid as string)
            .set({ ...authUser });
        console.log('done inserting user to db')
    }else{
        authUser.roles = userInfo.data()['roles']
    }
    return authUser
}

// export const docExisted = async (docRef: any) => {
//     return docRef.onSnapshot((snapshot) => {
//         if (snapshot.exists) return true;
//         else return false;
//     })
// }

export const refillDb_acc = async (acc: string) => {
    let tmp = await Axios.post(`http://${host}:8000/trigger/account`, { list: acc })
    return tmp
}
export const refillDb_kw = async (kws:string[]) => {

    // let data = JSON.stringify({"account": acc, "keyword": kw})
    let tmp = await Axios.post(`http://${host}:8000/trigger/keyword`, {list: kws})
    return tmp
}

export const refillDb_acc_kws = async (acc: string[], kws:string[]) => {

    // let data = JSON.stringify({"account": acc, "keyword": kw})
    let tmp = await Axios.post(`http://${host}:8000/trigger/combine`, {account: acc, keyword: kws})
    return tmp
}
// export const searchDb_kw = async(kws: string[])=> {
//     console.log(`searchDb_kw with ${kws.length} word(s) ${kws}`)
//     let accs = []
//
//     let result =[]
//     let data = await loadUnlabelledPostByAccount(accs, null)
//     data.forEach(p =>{
//         if (checkDocIncludesKws(p.text, kws))
//                 result.push(p)
//     })
//     console.log(`finish load ${result.length} unlabelled post with keywords [ ${kws} ]`)
//     return result
// }


// export const refillDb_acc_kw = async (acc: string[], kw:string[]) => {
//
//     let data = JSON.stringify({"account": acc, "keyword": kw})
//     let tmp = await Axios.post(`http://${host}:8000/trigger/combine`
//                         , data)
//                 .then(res => res.data)
//     return tmp
// }

export const searchCache_acc_kw = async (acc: string[], kw:string[]) => {
    let data = JSON.stringify({"account": acc, "keyword": kw})
    console.log(data)
    let tmp = await Axios.get(`http://${host}:8000/search/combine`
                        , {params: {initConfig: data}})
                .then(res => res.data)
    return tmp

}

export const loadUnlabelledPost = async () => {
    // var dataRef = null
    let loadUnlabelled = null

    try {
        let dataRef = await buildGETQuery_unlabelled([], null, expectingPost)
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


export const loadUnlabelledPostByAccount = async (accs: string[], postAfter=new Date() , limit = expectingPost) => {
    let result = []

    try {
        let dataRef = await buildGETQuery_unlabelled(accs, postAfter, limit).get()
        result = dataRef.docs.map((doc) => (
            { id: doc.id, ...doc.data() })
        )
        console.log(`finish load ${result.length} unlabelled post By ${accs} `)
        // console.log(result)
        return result
    } catch (err) {
        console.log('Error occurred: ' + err)
    }
}
export const loadUnlabelledPost_accs_kws = async (accs: string[], kws: string[], limit= expectingPost) => {
    let result = []
    let queryDateTime = new Date()

    while (result.length < limit) {
        console.log('query by date: ' + queryDateTime)
        let data = await loadUnlabelledPostByAccount(accs, queryDateTime, dbLookupLimit)
        if (data.length == 0) break
        for (const doc of data){
            if (checkDocIncludesKws(doc.text, kws)) {
                result.push(doc)
            }
            if (result.length == limit) break
        }
        // console.log(data[data.length - 1].postAt['seconds'])
        queryDateTime = new Date(data[data.length - 1].postAt['seconds'] * 1000)

        // data.forEach((doc) => {
        //     if (checkDocIncludesKws(doc.text, kws))
        //         console.log(doc)
        //     result.push(doc)
        //     if (result.length == expectingPost) break
        //
        // })
    }


    console.log(`finish load ${result.length} unlabelled post By ${accs} with keywords ${kws}`)
    return result
}
const checkDocIncludesKws = (doc:string, kws:string[]) =>{
    let result = false
    for (const kw of kws){
        if (doc.toLowerCase().includes(kw.toLowerCase())) {
            result = true
            break
        }
    }
    return result

}

// export const loadUnlabelledPost_accs_kws = async (accs: string[], kws: string[]) => {
//     let result = []
//
//     const hash = await searchCache_acc_kw(accs, kws)
//
//     try {
//         while (hash.length > 0) {
//             let tmpHash = getAtMost10FromList(hash)
//             let dataRef = await buildGETQuery_hash_unlabelled(tmpHash, postLimit).get()
//             let tmpResult = dataRef.docs.map((doc) => (
//                 {id: doc.id, ...doc.data()})
//             )
//             tmpResult.forEach((x) => result.push(x))
//         }
//         // toast.info(`load ${result.length} unlabelled tweets`,{ autoClose: 5000 })
//         console.log(`finish load ${result.length} unlabelled post By ${accs} `)
//
//         result.sort(function(a,b){
//             return b.postAt['seconds'] - a.postAt['seconds']
//         })
//
//     } catch (err) {
//         toast.error('Error occurred: ' + err, { autoClose: 10000 })
//         console.log('Error occurred: ' + err)
//     }
//     return result
// }

function getAtMost10FromList(fullList:string[]){
    let result = []
    while (result.length <10 && fullList.length > 0){
        result.push(fullList.pop())
    }
    return result
}


export const updateLabel = async (auth, hash, rating, event) => {
    let dataRef = await firebase.firestore().collection("tweets_health").doc(hash)

    try {
        const res = await firebase.firestore().runTransaction(async t => {
            const doc = await t.get(dataRef)
            await t.update(dataRef, { rating: rating, event: event, labelledBy: auth.email})
        })
        console.log('Transaction success', res);
    } catch (e) {
        console.log('Transaction failure:', e);
    }

}

export const getDefaultEventList = async () => {
    let dataRef = await firebase.firestore().collection("default_events").get()

    // dataRef.docs.forEach((doc) => defEve.push(doc.data))
    // let defEve = dataRef.docs.map((doc) => (
    //     { id: doc.id, ...doc.data() })
    // )
    let defEve = dataRef.docs.map(doc => (
        { id: doc.id, ...doc.data() })
    )

    return defEve

}
export const createDefaultEvent = async (eventList:string[], auth) =>{
    let dataRef = await firebase.firestore().collection("default_events")
    var crypto = require('crypto');
    for (const e of eventList){
        let doc = {
            id: crypto.createHash('md5').update(e).digest('hex'),
            name: e,
            createdBy: auth.email
        }
        console.log(doc)
        dataRef.doc(doc.id.toString()).set(doc)
    }

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

        let dataRef = await buildGETQuery_labelled(accounts, limit).get().then((all)=>{
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
function buildGETQuery_unlabelled (accounts: string[], postAfter, limit) {

    let dataRef = firebase.firestore().collection("tweets_health")
    let query = dataRef.where("rating", '==', -10)

    if (accounts.length > 0){
        query = query.where("account", 'array-contains-any', accounts)
    }
    if (postAfter!= null){
        query = query.where("postAt", "<", postAfter)
    }
    if (limit != null){
        query = query.limit(limit)
    }
    return query.orderBy("postAt",'desc')
    // return query
}


function buildGETQuery_hash_unlabelled (hashList: string[], limit) {

    let dataRef = firebase.firestore().collection("tweets_health")
    let query = dataRef.where("rating", '==', -10)
    query = query.where("hash", "in", hashList)

    if (limit != null){
        query = query.limit(limit)
    }
    return query.orderBy("postAt",'desc')
    // return query
}


function buildGETQuery_labelled (accounts: string[], limit) {

    let dataRef = firebase.firestore().collection("tweets_health")
    let query = dataRef.where("rating", '!=', -10)
    // else query = dataRef.where("rating", '==', -10)

    if (accounts.length > 0){
        query = query.where("account", 'array-contains-any', accounts)
    }
    if (limit != null){
        query = query.limit(limit)
    }
    return query.orderBy("rating").orderBy("postAt",'desc')
    // return query
}

