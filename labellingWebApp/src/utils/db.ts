
import firebase from "../lib/firebase";
import Axios from "axios";
import {toast} from 'react-toastify';



toast.configure()
// dotenv.config()
// require('dotenv').config({path: './config/.e2222nv.development.dev'})

const expectingPost = 30
const dbLookupLimit = 500

// export const host = 'localhost'
// export const host = '20.37.47.186'
// export const host_sa = '20.37.47.186'
// export const port_sa = 8001
// export const host_ed = '20.37.47.186'
// export const port_ed = 8002

export const host_scrapper = process.env.NEXT_PUBLIC_HOST_SCRAPPER
export const port_scrapper = process.env.NEXT_PUBLIC_PORT_SCRAPPER
export const host_sa = process.env.NEXT_PUBLIC_HOST_SA
export const port_sa = process.env.NEXT_PUBLIC_PORT_SA
export const host_ed = process.env.NEXT_PUBLIC_HOST_ED
export const port_ed = process.env.NEXT_PUBLIC_PORT_ED



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

export const getAllLabeller = async (authUser: any) => {
    console.log('lookup user from db')
    var users = await firebase.firestore().collection('users').get()
    var result = []
    users.docs.map(doc=> {
        result.push(doc.data().email)
    })
    // console.log(result.join(' ; '))
    return result
}

// export const docExisted = async (docRef: any) => {
//     return docRef.onSnapshot((snapshot) => {
//         if (snapshot.exists) return true;
//         else return false;
//     })
// }

export const refillDb_acc = async (acc: string) => {
    // console.log(process.env.NEXT_PUBLIC_HOST_SCRAPPER)
    // console.log(process.env.NEXT_PUBLIC_PORT_SCRAPPER)

    let port = host_scrapper.startsWith('https')?'':`:${port_scrapper}`
    let tmp = await Axios.post(`${host_scrapper}${port}/trigger/account`, { list: acc })
    return tmp
}
export const refillDb_kw = async (kws:string[][], isPremium: boolean, outsideTagIsAND= true) => {

    // let data = JSON.stringify({"account": acc, "keyword": kw})

    // console.log(process.env.NEXT_PUBLIC_HOST_SCRAPPER)
    // console.log(process.env.NEXT_PUBLIC_PORT_SCRAPPER)

    console.log(`isPremium = ${isPremium}`)
    let port = host_scrapper.startsWith('https')?'':`:${port_scrapper}`

    // let api = isPremium?'/trigger/full':'/trigger/keyword'
    let api = '/trigger/keyword'
    let data
    if (isPremium){
        api = '/trigger/full'
        data = {account: [], keyword: kws, outsideTagIsAND: outsideTagIsAND}
    } else{
        data= {list: kws, outsideTagIsAND: outsideTagIsAND}
    }



    let tmp = await Axios.post(`${host_scrapper}${port}${api}`
                                , data)
    return tmp
}

export const refillDb_acc_kws = async (acc: string[], kws:string[][], isPremium: boolean
                                       , fromDate_string:string=null, toDate_string:string=null, outsideTagIsAND= true) => {

    // let data = JSON.stringify({"account": acc, "keyword": kw})

    let port = host_scrapper.startsWith('https')?'':`:${port_scrapper}`
    let api = isPremium?'/trigger/full':'/trigger/combine'
    // let tmp = await Axios.post(`${host_scrapper}${port}/trigger/combine`
    //                             , {account: acc, keyword: kws, outsideTagIsAND: outsideTagIsAND})

    let data = {
                account: acc, keyword: kws
                , fromDate: fromDate_string, toDate: toDate_string
                , outsideTagIsAND: outsideTagIsAND
            }
    console.log(data)

    // console.log(`isPremium = ${isPremium}`)
    // let tmp = await Axios(
    //     {
    //         method: 'post',
    //         headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    //         url: `${host_scrapper}${port}${api}`,
    //         data: {
    //             account: acc, keyword: kws
    //             , from: fromDate_string, to: toDate_string
    //             , outsideTagIsAND: outsideTagIsAND
    //         }
    //
    // })
    let tmp = await Axios.post(`${host_scrapper}${port}${api}`, data)

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

// export const searchCache_acc_kw = async (acc: string[], kw:string[]) => {
//     let data = JSON.stringify({"account": acc, "keyword": kw})
//     console.log(data)
//     let tmp = await Axios.get(`http://${host}:8000/search/combine`
//                         , {params: {initConfig: data}})
//                 .then(res => res.data)
//     return tmp
//
// }

export const loadUnlabelledPost = async () => {
    // var dataRef = null
    let loadUnlabelled = null

    try {
        let dataRef = await buildGETQuery_unlabelled([], null,null, expectingPost)
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


export const loadUnlabelledPostByAccount = async (accs: string[],fromDate =null, toDate=new Date() , limit = expectingPost) => {
    let result = []

    try {
        let dataRef = await buildGETQuery_unlabelled(accs,fromDate,toDate, limit).get()
        result = dataRef.docs.map((doc) => (
            { id: doc.id, ...doc.data() })
        )
        // console.log(`finish load ${result.length} unlabelled post By ${accs} `)
        // console.log(result)
        return result
    } catch (err) {
        console.log('Error occurred: ' + err)
    }
}


export const loadUnlabelledPost_accs_kws = async (accs: string[], kws: string[][]
                                                  , limit= expectingPost
                                                  ,fromDate, toDate = new Date()) => {
    console.log(`load unlabelled post By ${accs} with keywords ${kws}`)

    let result = []
    // if (postAfter == None) {
    //     postAfter = new Date()
    // }

    while (result.length < limit) {
        // console.log('query by date: ' + postAfter)
        let data = await loadUnlabelledPostByAccount(accs, fromDate,toDate, dbLookupLimit)
        if (data.length == 0) break
        for (const doc of data){
            if (checkDocIncludesKws(doc.text, kws)) {
                result.push(doc)
            }
            if (result.length == limit) break
        }
        toDate = new Date(data[data.length - 1].postAt['seconds'] * 1000)

    }


    // console.log(`finish load ${result.length} unlabelled post By ${accs} with keywords ${kws}`)
    return result
}
export const loadLabelledPostByLabelledBy = async ( reviewer: string
                                                    , labelledBy: string[]
                                                    , limit= expectingPost
                                                    , postAfter = new Date()) => {
    let result = []
    try {
        while (result.length < limit) {

            let dataRef = await buildGETQuery_review(labelledBy, limit, postAfter).get()
            // result = dataRef.docs.map((doc) => (
            //     { id: doc.id, ...doc.data() })
            // )

            dataRef.docs.forEach(doc => {
                // console.log(doc.data().reviewedBy.includes(reviewer))
                if ((doc.data().reviewedBy == undefined) || (!doc.data().reviewedBy.includes(reviewer))) {
                    result.push({...doc.data()})
                }
                // console.log(doc.data().postAt['seconds'])
                // // console.log(doc.data())
                // postAfter = new Date(doc.data().postAt['seconds'] * 1000)
            })
            postAfter = new Date(dataRef.docs[dataRef.docs.length-1].data().postAt['seconds'] * 1000)
            console.log(postAfter)
        }

        // console.log(`finish load ${result.length} posts labelled by ${labelledBy} `)
        // console.log(result)
        return result
    } catch (err) {
        console.log('Error occurred: ' + err)
    }

}


const checkDocIncludesKws = (doc:string, kws:string[][], outsideTagIsAND = true) =>{
    let result = outsideTagIsAND
    if (outsideTagIsAND){
        // outside tag is AND
        // inside tag is OR
        result = true
        for (const tag of kws) {
            result = result && checkDocIncludesKws_insideTag_OR(doc,tag)
        }
    } else {
        // outside tag is OR
        // inside tag is AND
        result = false
        for (const tag of kws){
            result = result || checkDocIncludesKws_insideTag_AND(doc,tag)
        }

    }
    return result

}

const checkDocIncludesKws_insideTag_OR = (inputdoc: string, kwTag: string[]) => {
    let result = false;
    if (inputdoc != null){
        let doc = inputdoc.toLowerCase();
        for (const kw of kwTag) {
            if (doc.includes(kw.replaceAll("\"", "").toLowerCase())) {
                result = true
                break
            }
        }
    }
    return result

}
const checkDocIncludesKws_insideTag_AND = (inputdoc: string, kwTag: string[]) => {
    let result = true;
    let doc = inputdoc.toLowerCase();
    for (const kw of kwTag){
        if (!doc.includes(kw.replaceAll("\"","").toLowerCase())){
            result = false
            break;
        }
    }
    return result;
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


export const updateLabel = async (auth, hash, rating, event, maskingNames) => {
    let dataRef = await firebase.firestore().collection("tweets_health").doc(hash)

    try {
        const res = await firebase.firestore().runTransaction(async t => {
            const doc = await t.get(dataRef)
            await t.update(dataRef, { rating: rating, event: event, labelledBy: auth.email, masking: maskingNames})
        })
        console.log('Transaction success', res);
    } catch (e) {
        console.log('Transaction failure:', e);
    }

}

export const updateReview = async (auth, hash, rating, events, email) =>{
    try{
        let dataRef = await firebase.firestore().collection("tweets_health").doc(hash)

        let data = (await dataRef.get()).data()


        if (data.reviewCount > 0) {

            if (data.reviewedAt == undefined){
                data.reviewedAt=[]
                for (let i =0; i < data.reviewCount; i++){
                    data.reviewedAt.push(null)
                }
            }

            let oldIndex = data.reviewedBy.findIndex((x)=> x==email)
            if (oldIndex>=0){
                data.reviewedRating[oldIndex] = rating
                data.reviewedEvent[oldIndex] = events.join(',')
                data.reviewedAt[oldIndex] = new Date()

                // await dataRef.update({
                //     reviewedRating: data.reviewedRating,
                //     reviewedEvent: data.reviewedEvent,
                //     reviewedAt: data.reviewedAt
                // })
                await dataRef.update({...data})
                console.log(`update existing review ${oldIndex}: ${rating}, ${events}`)
            }else {
                await dataRef.update({
                    reviewCount: data.reviewCount + 1
                    , reviewedRating: data.reviewedRating.concat(rating)
                    , reviewedEvent: data.reviewedEvent.concat(events.join(','))
                    , reviewedBy: data.reviewedBy.concat(email)
                    , reviewedAt: data.reviewedAt.concat((new Date()))
                })
            }
        }else{
            await dataRef.update({
                reviewCount: 1
                , reviewedRating: [rating]
                , reviewedEvent: [events.join(',')]
                , reviewedBy: [email]
                , reviewedAt: [new Date()]
            })

        }

        // const res =await firebase.firestore().runTransaction(async t => {
        //     // const doc = await t.get(dataRef)
        //     await t.set(dataRef, reviewData)
        // })
        // await dataRef.update({...reviewData})
        console.log('Transaction success');

    }catch (e){
        toast.error(`Transaction failed:  ${e}`)
        console.log(`Transaction failed: ${e}`);
    }
}

export const getDefaultEventList = async () => {
    let dataRef = await firebase.firestore().collection("default_events").get()

    // dataRef.docs.forEach((doc) => defEve.push(doc.data))
    // let defEve = dataRef.docs.map((doc) => (
    //     { id: doc.id, ...doc.data() })
    // )
    let defEve = dataRef.docs.map(doc => (
        { id: doc.id, name:doc.data().name,...doc.data() })
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

export const deleteDefaultEvent = async (hash: string) => {

    try{
        await firebase.firestore().collection("default_events").doc(hash).delete()
    }catch (e) {
        console.log(`Delete failure: ${hash}`, e);
    }

}
export const createDefaultKws = async (input, auth?) => {
    if (input.constructor == Object) {
        createDefaultKws_dic(input, auth)
    } else createDefaultKws_list(input, auth)
}
export const createDefaultKws_list = async (kwsList: string[], auth?) => {
    var collectionPath = '/default_kws'
    var fire = await firebase.firestore()
    var crypto = require('crypto')
    for (const e of kwsList){
        let doc = {
            id: crypto.createHash('md5').update(e).digest('hex'),
            name: e,
            createdBy: auth?auth.email:'testAcc'
        }
        fire.doc(`${collectionPath}/${doc.id}`).set(doc)
    }

}
export const createDefaultKws_dic = async (kwsDict: {}, auth?) => {
    var collectionPath = '/default_kws'
    var fire = await firebase.firestore()
    var crypto = require('crypto')
    for (const cat in kwsDict) {
        let doc = {
            id: crypto.createHash('md5').update(cat).digest('hex'),
            name: cat,
            val: kwsDict[cat].filter(x => x.length > 0),
            createdBy: auth ? auth.email : 'testAcc'
        }
        fire.doc(`${collectionPath}/${doc.id}`).set(doc)
    }

}
export const getDefaultKws = async () => {
    let dataRef = await firebase.firestore().collection("default_kws").get()
    let defKws = dataRef.docs.map(doc => (
        { id: doc.id, name:doc.data().name,...doc.data() })
    )

    return defKws
}
export const deleteDefaultKws = async (hash: string) => {

    try{
        await firebase.firestore().collection("default_kws").doc(hash).delete()
    }catch (e) {
        console.log(`Delete failure: ${hash}`, e);
    }

}

export const downloadData = async (auth, accounts: string[], limit:number, labelledBy) => {
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

        let dataRef = await buildGETQuery_labelled(accounts, limit, labelledBy).get().then((all)=>{
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
function buildGETQuery_unlabelled (accounts: string[],fromDate,toDate, limit) {

    let dataRef = firebase.firestore().collection("tweets_health")
    let query = dataRef.where("rating", '==', -10)

    if (accounts.length > 0){
        query = query.where("account", 'array-contains-any', accounts)
    }

    if(fromDate==null){
        query = query.where("postAt", "<",toDate)
    }
    else{
        query = query.where("postAt",">",fromDate)
        query = query.where("postAt","<",toDate)
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


function buildGETQuery_labelled (accounts: string[], limit, labelledBy= null, postAfter = new Date()) {

    let dataRef = firebase.firestore().collection("tweets_health")
    let query = dataRef.where("rating", '!=', -10)
    // else query = dataRef.where("rating", '==', -10)

    if (accounts.length > 0){
        query = query.where("account", 'array-contains-any', accounts)
    }
    if (labelledBy != null){
        query = query.where('labelledBy', '==', labelledBy)
    }
    if (limit != null){
        query = query.limit(limit)
    }
    return query.orderBy("rating").orderBy("postAt",'desc')
    // return query
}

function buildGETQuery_review (labelledBy, limit,  postAfter = new Date()) {

    let dataRef = firebase.firestore().collection("tweets_health")
    let query = dataRef.where('labelledBy', 'in', labelledBy)
    // else query = dataRef.where("rating", '==', -10)


    if (postAfter!= null){
        query = query.where("postAt", "<", postAfter)
    }
    if (limit != null){
        query = query.limit(limit)
    }
    return query
        // .orderBy("rating")
        .orderBy("postAt",'desc')
    // return query
}
