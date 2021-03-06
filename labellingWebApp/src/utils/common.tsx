import axios from "axios";
import {toast} from 'react-toastify';
import {
    loadUnlabelledPost_accs_kws
    , loadUnlabelledPostByAccount
    , host_scrapper, host_sa, host_ed, port_sa, port_ed, refillDb_acc_kws, refillDb_acc, refillDb_kw, port_scrapper
} from "./db";
import Axios from "axios";
import {flexbox, Tag} from "@chakra-ui/react";
import dateformat from "dateformat";
import React from "react";
import { date } from "yup";
import { Form } from "formik";


export const eventList = ['cancer journey', 'qum', 'health inequity/disparity', 'patient centricity', 'phc',
                            'innovation/innovative therapies', 'affordability', 'initiatives/education', 'timely access',
                            'advocary/reform']
export const eventFullList = [eventList, 'no event detected'].flat()
export const sentimentFullList = ['negative', 'neutral', 'positive']

export const roles ={
    visitor:{
        "summary":true
    },
    user :{
        "summary":true,
        "predict":true,
        "download":true
    },
    annotator:{
        "annotation":true
    },
    reviewer:{
        "review": true
    },
    admin:{
        "admin":true
    }
}

export const findAccess = (auth,pages='annotation')=>{

    if(auth==null){
        return false;
    }
    else{
        for(let i =0 ;i<auth.roles.length;i++){
            if(roles[auth.roles[i]][pages]){
                return true;
            }
        }
        // return auth.roles.includes(targetRoles) && ( || roles["user"][pages]);
        return false;
    }
}


export const findByType = (children, component) => {
    const result = [];
    /* This is the array of result since Article can have multiple times the same sub-component */
    const type = [component.displayName] || [component.name];
    /* We can store the actual name of the component through the displayName or name property of our sub-component */
    React.Children.forEach(children, (child) => {
        const childType =
            child && child.type && (child.type.displayName || child.type.name);
        if (type.includes(childType)) {
            result.push(child);
        }
    });
    /* Then we go through each React children, if one of matches the name of the sub-component we???re looking for we put it in the result array */
    return result[0];
};




export const labelling = async (auth, values) => {
    try {
        const header = {
            'Content-Type': 'application/json',
            token: auth.token,
        };
        const res = await axios.post('/api/labelling', values, { headers: header });
        return res;
    } catch (error) {
        throw error;
    }
}

export const getTagsInput = (eleId, isTwitterAcc=false, lowering = true
                             , withWarning=true
                             , checkBoxCSS='.chakra-checkbox.css-khpbvo'

) => {
    let tags = []
    let rootEle = document.getElementById(eleId)
    if (rootEle == undefined) return []

    rootEle.querySelectorAll(checkBoxCSS).forEach(de => {
        if (de.querySelector('.chakra-checkbox__control.css-xxkadm').hasChildNodes())
            tags.push(de.querySelector('.chakra-checkbox__label.css-1sgc0qu').innerHTML)
    })

    let reactTagInput = rootEle.querySelector('.react-tagsinput')
    if (reactTagInput) {
        rootEle.querySelector('.react-tagsinput').querySelectorAll('span .react-tagsinput-tag').forEach((element) => {
            let tmp = (isTwitterAcc ? '@' : '') + element.innerHTML.replace("<a></a>", "").trim()
            if (lowering) tmp = tmp.toLowerCase()
            tags.push(tmp)
        })
        rootEle.querySelector('.react-tagsinput').querySelectorAll('span .react-tagsinput-input').forEach(element =>{
            // @ts-ignore
            let tmpInput = element.value
            if (tmpInput.trim() != '') {
                if (lowering) tmpInput = tmpInput.toLowerCase().trim()
                tags.push((isTwitterAcc ? '@' : '') + tmpInput)
                if (withWarning) toast.info(`Include unfinalised input ${tmpInput}. Please remember hitting Enter or Tab next time`)
            }
        })
    }
    console.log(`${eleId}'s tags: ${tags}`)
    return tags
}

export const getCheckedItemFromGrid =(eleId, isTwitterAcc=false, lowering = true
                             , withWarning=true
                             , gridCSS = '.css-1y0dfcn'
                             , checkBoxCSS='.chakra-checkbox.css-1uiwwan'
) => {
    let tags = []
    let rootEle = document.getElementById(eleId)

    if (rootEle == undefined) return []

    try{
        rootEle.querySelector(gridCSS).querySelectorAll(checkBoxCSS).forEach(de => {
            if (de.querySelector('.chakra-checkbox__control.css-xxkadm').hasChildNodes())
                tags.push(de.querySelector('.chakra-checkbox__label.css-1sgc0qu').innerHTML)
        })
    }catch (e){}

    console.log(`${eleId}'s tags: ${tags}`)
    return tags

}

export const getKwInput= (eleId, lowering = true, withWarning=true) => {

    let tmpTags = getTagsInput(eleId, false, lowering, withWarning)

    return tags_arrayOfArray(tmpTags)
}

export const getDate=(eleId,toOrfrom,exclusive)=>{
    var temp = new Date((document.getElementById(eleId) as HTMLInputElement).value)
    // True = fromDate false = toDate
    if(toOrfrom){
        console.log("from =" + temp)
        return (isNaN(temp.getMonth())) ? null : temp
    }
    else{
        temp =(isNaN(temp.getMonth())) ? new Date() : temp
        temp = isExclusive(temp,exclusive)
        console.log("after ="+ temp)
    }
    return temp
}
export const tags_arrayOfArray = (tagsArray) => {
    let tags = []
    for (let tmpTag of tagsArray) {
        let tmpSubTags = (tmpTag + " ").split(/\s+/)
        let subTags = []
        let insideQuoteMark = false
        let nonSepaKw = ''
        //  "christmas eve" "new year eve"
        for (let tmptmp of tmpSubTags) {
            if (tmptmp.startsWith('"')) {
                // tmptmp = tmptmp.split("\"")[1]
                insideQuoteMark = true
            }
            if (insideQuoteMark) {
                // console.log(tmptmp)
                if ((tmptmp.length > 1 || nonSepaKw.length > 1) && tmptmp.endsWith('"')) {
                    // tmptmp = tmptmp.split("\"")[0]
                    insideQuoteMark = false
                    nonSepaKw += ' ' + tmptmp
                    subTags.push(nonSepaKw)
                    nonSepaKw = ''
                } else nonSepaKw += ' ' + tmptmp
                // console.log(nonSepaKw)
            } else {
                // if (nonSepaKw.length != 0) {
                //     subTags.push(nonSepaKw)
                //     nonSepaKw = ''
                // }
                if (tmptmp.length > 0) subTags.push(tmptmp)
            }
        }
        tags.push(subTags)
    }
    return tags


}


export const explainKws = (eleId, lowering=true, outsideTagIsAND = true ) => {
    try {
        let kwTags = getKwInput(eleId, lowering, false)
        return explainKws_arrayOfArray(kwTags, outsideTagIsAND)
    } catch (error) {
        console.log(error)
        return `error ${eleId}`
    }
}
export const explainKws_arrayOfArray = (tags, outsideTagIsAND = true) => {
    let result = []
    if (outsideTagIsAND) {
        for (const tag of tags) {
            // console.log(tag)
            result.push(`(${tag.join(' OR ')})`)
        }
        return result.join(' AND ')
    } else {
        for (const tag of tags) {
            result.push(`(${tag.join(' AND ')})`)
        }
        return result.join(' OR ')
    }
}

// const dateformat = require('dateformat');
export const convertTimeToString = (time) => {
    if (time) {
        let tmp = new Date(time['seconds'] * 1000)
        // return tmp.toISOString()
        return dateformat(tmp, "yyyy-mm-dd'T'HH:MM:sso")
    }
    else return 'null'
    // return `${tmp.toLocaleString('%Y-%b-%d')} ${tmp.toLocaleTimeString()}`

}

export const isMasked = (auth) => {
    let result = isChecked('isMasked') || !isAdmin(auth)
    // console.log(`isMasked = ${result}`)
    return result
}

export const isAdmin = (auth) => {
    return auth.roles.includes('admin')
}

export const isChecked = (id) => {
    let result = false
    let ele = document.getElementById(id)
    if (ele != null) result= ele.querySelector('.chakra-checkbox__control.css-xxkadm').hasChildNodes()
    return result
}

const encryptKey = 'sH9NM6goFrv0o3W2y2YvCw=='

export const encrypting = (text) => {
    if (text == null) text='undefined'
    let crypto = require('crypto'),
    algorithm = 'aes-128-ecb'
    let cipher = crypto.createCipher(algorithm,encryptKey)
    let crypted = cipher.update(text,'utf8','hex')
    crypted += cipher.final('hex');
    return crypted
}

export const decrypting = (text) => {
    let decrypted = []
    // console.log(text)
    try{
        for (const item of text.trim().split('\n')){
            // console.log(item)
            let crypto = require('crypto'),
                algorithm = 'aes-128-ecb'
            let decipher = crypto.createDecipher(algorithm, encryptKey)
            let tmp = decipher.update(item, 'hex', 'utf8')
            tmp += decipher.final('utf8')
            decrypted.push(tmp)
        }
        // console.log(decrypted)

    } catch (err) {
        console.log('Error occurred: ' + err)
        decrypted = ['invalid input']
    }
    return decrypted
}

export const testEncrypt = () => {
    var crypto = require('crypto'),
        algorithm = 'aes-128-ecb'


    // var hash = crypto.createHash('md5')
    // var hashed = hash.update('sahealth').digest('hex')
    // console.log(hashed)

    var cipher = crypto.createCipher(algorithm,encryptKey)
    var crypted = cipher.update('sahealthsahealth','utf8','hex')
    crypted += cipher.final('hex');
    // crypted += cipher.final('hex');

    console.log(crypted)


    var decipher = crypto.createDecipher(algorithm,encryptKey)
    var decrypted = decipher.update(crypted,'hex','utf8')
    decrypted += decipher.final('utf8');
    console.log(decrypted)

}
export const maskPersonalDetails = (text:string, names:string[]) =>{
    return maskPersonalDetails_AtSign(maskPersonalDetails_names(text, names))
}

export const maskPersonalDetails_AtSign = (text:string) => {
    return text.replace(/(\w+)@/gi, "?????????@")
                .replace(/@(\w+)/gi, "@?????????")
}

// export const maskPersonalDetails_AtSign = (text:string) => {
//     let result = []
//     for (let i in text){
//         result.push(text[i].toString().replace(/(\w+)@/gi, "?????????@")
//                 .replace(/@(\w+)/gi, "@?????????"))
//     }
//     return result
//
//     // return text.replace(/(\w+)@/gi, "?????????@")
//     //             .replace(/@(\w+)/gi, "@?????????")
// }

export const maskPersonalDetails_names = (text:string, names:string[]) =>{
    if (names != null) {
        // console.log(`masking names: ${names.join(',')}`)
        names.forEach(name => {
            try{
                let pattern = name
                if (pattern.includes('+')) {
                    pattern = pattern.replaceAll('+', '\\+')
                    console.log(pattern)
                }
                if (pattern.includes('-')) pattern = pattern.replaceAll('-', '\\-')

                text = text.replace(new RegExp(pattern,'gi'), "?????????")
            } catch (e){
                toast.error(`masking fail: ${name}`, {autoClose:false})
            }

        })
    }
    return text
}

export const isExclusive = (date,exclusive)=>{
    if(exclusive){
        console.log("change ="+new Date(date.getFullYear(),date.getMonth(),date.getDate()-1,23,59,59))
        return new Date(date.getFullYear(),date.getMonth(),date.getDate()-1,23,59,59)
    }
    return new Date(date.getFullYear(),date.getMonth(),date.getDate(),23,59,59)
}

export const fetchData = async (accs: string[], kws:string[][], limit= 25
    ,fromDate=null, toDate = new Date(),exclusive =false ,refillCounter = 0
    , sortAtt = 'engage'
) => {
    // setData(`loading post from ${accs} with keywords ${kws}`)
    console.log(`fetchData >> accs:${accs}; kws:${kws}, ${fromDate?.toISOString()} -> ${toDate?.toISOString()}`)

    let res = null
    if (kws.length == 0){
        res = await loadUnlabelledPostByAccount(accs,fromDate,toDate,limit)
    }else res = await loadUnlabelledPost_accs_kws(accs, kws, limit,fromDate, toDate)
    

    let isOldData = true
    let isReachLimit = res.length >= limit
    if (fromDate == null){
        if (res.length > 0) {
            let latestDate = new Date(res[0].postAt['seconds'] * 1000)
            // @ts-ignore
            isOldData = ((new Date()) - latestDate) / (1000 * 3600 * 24) > .5
            // isReachLimit = res.length >= limit
        }
        if ((refillCounter == 0) && (isOldData || !isReachLimit)) {
            toast.info('Auto scrapping latest tweets', { autoClose: 20000 })
            refillData(accs,kws, isChecked('isPremium'), null, null)
        }
    } else {
        if (refillCounter==0 && !isReachLimit)
            refillData(accs,kws, isChecked('isPremium'), fromDate, toDate)
    }
    console.log(`fetched ${res.length} tweets`)

    // return res.sort((a, b) => { return (b[sortAtt] - a[sortAtt]) });
    return res;

}

export const refillData = async (accs:string[], kws:string[][], isPremium: boolean
                                 , fromDate: Date, toDate: Date
) => {
    // setData("...preparing db...")
    //
    // let accs = getTagsInput('searchAcc',true)
    // let kws = getTagsInput('searchKey',false)

    // let isWaiting = true

    let fromDate_string = null
    let toDate_string = null
    if (fromDate && toDate){
        fromDate_string = fromDate.toISOString().slice(0,-1)
        toDate_string = toDate.toISOString().slice(0,-1)
        console.log(`from ${fromDate_string} to ${toDate_string}`)
    }

    if (accs.length > 0 && kws.length > 0) {
        // refillDbWithAccount(accs.join(','))
        refillDb_acc_kws(accs, kws, isPremium, fromDate_string, toDate_string)
    } else {
        if (accs.length > 0) refillDb_acc(accs.join(','))
        // else if (kws.length > 0) refillDb_kw(kws, isPremium)
        else if (kws.length > 0)
            refillDb_acc_kws([], kws, isPremium,fromDate_string, toDate_string)
        else {
            toast.error('Please check your input')
            // isWaiting = false
        }
    }
}
export const getSAPrediction = async (tweetList: string[]) => {
    // let tmp = await Axios.post(`http://${host}:8001/trigger/account`, { list: acc })

    let port = host_sa.startsWith('https')?'':`:${port_sa}`
    console.log(`${host_sa}${port}/predict`)
    let tmp = await Axios.post(`${host_sa}${port}/predict`, { text: tweetList,headers: {
	  'Access-Control-Allow-Origin': '*',
	} })
    return tmp
}

export const getEDPrediction = async (tweetList: string[]) => {
    // let tmp = await Axios.post(`http://${host}:8001/trigger/account`, { list: acc })

    let port = host_ed.startsWith('https') ? '' : `:${port_ed}`
    console.log(`${host_sa}${port}/predict`)
    let tmp = await Axios.post(`${host_ed}${port}/predict`, { text: tweetList })
    return tmp
}

export const getCountRecent = async (kws: string[]) => {
    // let tmp = await Axios.post(`http://${host}:8001/trigger/account`, { list: acc })

    let port = host_scrapper.startsWith('https') ? '' : `:${port_scrapper}`
    console.log(`${host_scrapper}${port}/count/recent`)
    let data = {keyword: kws, outsideTagIsAND: true}
    let tmp = await Axios.post(`${host_scrapper}${port}/count/recent`,  {keyword: kws, outsideTagIsAND: true})
    return tmp
}

export const displayTag = (list: string[]
                           , fullList:string[]=null
                           , colorScheme='telegram'
                           , percentage:number[]=null
) => {
    let result = []
    if (fullList == null) {
        for (const i in list) {
            result.push(<Tag m={1} colorScheme={colorScheme} variant="solid" borderRadius={100}>{list[i]}</Tag>)
        }
    } else{
        for (const i in fullList) {
            let percent = ''
            if (percentage != null){
                percent = percent[i]
            }
            if (list.includes(fullList[i]))
                result.push(
                    <span>
                        <Tag m={1} colorScheme={colorScheme} variant="solid" align="center" justify="center" borderRadius={100}>{fullList[i]}
                        </Tag>
                        {percent}
                    </span>
                )
            else result.push(
                <span>
                    <Tag m={1} color={'gray.300'} align="center" justify="center" borderRadius={100}>{fullList[i]}
                    </Tag>
                    {percent}
                </span>

            )
        }

    }
    return result
}
export const displayTagSentiment = (list: string[], fullList:string[]=null) => {
    let colorScheme = 'green'
    if (list[0] == 'negative') colorScheme = 'red'
    else if (list[0] == 'neutral') colorScheme = 'yellow'
    return displayTag(list, fullList, colorScheme)
}
export const displayTagED = (list: string[], fullList:string[]=null) => {
    let colorScheme = 'orange'
    if (list[0] == 'no event detected') colorScheme = 'gray'
    return displayTag(list, fullList, colorScheme)
}

export const convertDate = (input) => {
    let result = null
    if (input){
        result = new Date(input['seconds'] * 1000)
    }
    return result
}

export const highlightKws = (text, kws) => {
    let result = []
    
    for (let i in kws){
        // let tag = <Tag m={0} p={0} borderRadius={0} bgColor={'telegram.400'} color={'white'}>${kws[i]}</Tag>
        //
        // // let newPart = `${tag}${kws[i]}${tagEnd}`
        // text = text.split(`/${kws[i]}/ig`).join(<Tag m={0} p={0} borderRadius={0} bgColor={'telegram.400'} color={'white'} key={'1'}>${kws[i]}</Tag>
        // )
        // console.log(text)
        // text= text.replace(`/${kws[i]}/ig`, `<Tag m={0} p={0} borderRadius={0} bgColor={'telegram.400'} color={'white'} key={'1'}>${kws[i]}</Tag>`)
        let textSep = text.split(kws[i])
        for (let i in textSep){
            result.push(textSep[i])
            // result.push(<Tag m={0} p={0} borderRadius={0} bgColor={'telegram.400'} color={'white'} key={'1'}>${kws[i]}</Tag>)
            result.push(<pre>${kws[i]}</pre>)
        }
        result.pop()
    }
    return result
}

export const calcAmountSummary = (input: [string], fullCate:string[], percentage:boolean) => {
    let total = input.length
    let result = {}


    fullCate.forEach(c => {
        if (percentage)
            result[c] = (input.filter(i => i == c).length / total).toFixed(4)
        else result[c] = input.filter(i => i == c).length

    })
    console.log(result)
    return result
}

export const calcStackedSummaryED = (inputED:[][], inputSA:[], fullCat:string[], percentage:boolean)=>{
    let result = []
    let tmpRes = {}
    fullCat.forEach(c=> tmpRes[c]={'name':c, 'negative':0,'neutral':0,'positive':0})
    for (let es in inputED){
        let sa= inputSA[es]
        for (let e in inputED[es]){
            // @ts-ignore
            tmpRes[inputED[es][e]][sa]+=1
        }
    }
    for (let i in tmpRes){
        result.push(tmpRes[i])
    }
    return result
}

export const checkExpect = (prop: string[], expected: string[], mode='in') => {


    let result = false
    prop = [prop].flat()
    if (expected.length == 0) result=true
    else if (mode=='in'){
        for (const p of prop){
            console.log(`${p}`)
            if (expected.includes(p)){
                result = true
                break
            }
        }
    }

    console.log(`${prop} is included in ${expected}: ${result}`)
    return result

}

export const processPredict = async (accInputId, kwsInputId, numberPredict, sortBy) => {

    let tweets = []
    let pred_sa
    let pred_ed

    await fetchData(
        getTagsInput(accInputId, true)
        , getKwInput(kwsInputId, false)
        , numberPredict
    ).then((res) => {
        res.forEach(a => {
            // console.log(`converting ${a.id}`)
            // a.postAt = convertTimeToString(a.postAt)
            // a.insertDbAt = convertTimeToString(a.insertDbAt)

            // tweetList.push(a.text)
            tweets.push(a)

        })
        return res
    })
    // toast.info('Predicting...')


    // let pred_sa = await getSAPrediction(tweetList)
    // let pred_ed = await getEDPrediction(tweetList)


    let promise1 = getSAPrediction(tweets)
    let promise2 = getEDPrediction(tweets)
    await Promise.all([promise1, promise2]).then(promises => {
        pred_sa = promises[0].data
        pred_ed = promises[1].data

        // setText(tweets)
        // setPred_sa(promises[0].data)
        // setPred_ed(promises[1].data)
    })



    console.log(tweets)
    console.log(pred_sa)
    console.log(pred_ed)

    return [tweets, pred_sa, pred_ed]
}


export const processPredict_fromTotalFetch = async (accInputId, kwsInputId, numberPredict, totalFetch, sortBy) => {

    let tweets = []
    let pred_sa
    let pred_ed

    console.log(`numberPredict=${numberPredict} ; totalFetch=${totalFetch}`)

    await fetchData(
        getTagsInput(accInputId, true)
        , getKwInput(kwsInputId, false)
        , totalFetch
    ).then((res) => {
        res.forEach(a => {
            // console.log(`converting ${a.id}`)
            // a.postAt = convertTimeToString(a.postAt)
            // a.insertDbAt = convertTimeToString(a.insertDbAt)

            // tweetList.push(a.text)
            tweets.push(a)

        })
        return res

    })
    // toast.info('Predicting...')


    // let pred_sa = await getSAPrediction(tweetList)
    // let pred_ed = await getEDPrediction(tweetList)

    tweets = tweets.sort((a, b) => b[sortBy] - a[sortBy]).slice(0, numberPredict)
    let promise1 = getSAPrediction(tweets)
    let promise2 = getEDPrediction(tweets)
    await Promise.all([promise1, promise2]).then(promises => {
        pred_sa = promises[0].data
        pred_ed = promises[1].data

        // setText(tweets)
        // setPred_sa(promises[0].data)
        // setPred_ed(promises[1].data)
    })



    console.log(tweets)
    console.log(pred_sa)
    console.log(pred_ed)

    return [tweets, pred_sa, pred_ed]
}

export const parseTagFromFile = (e, callback) => {
    let result = {}
    const files = e.target.files;

    for (let f of files) {
        let fileReader = new FileReader();
        let tmp
        fileReader.readAsText(f, "UTF-8");
        // fileReader.onload = e => {
        //     tmp = parseTag(e.target.result)
        //     console.log(tmp)
        //     result = Object.assign({}, result, tmp)
        // };
        fileReader.onload = e => {
            tmp = parseTag(e.target.result)
            // console.log(tmp)
            result = Object.assign({}, result, tmp)
            callback(result)
        };
    }
    return result

}

export const parseTag = (content) => {
    let result = {}
    for (let row of content.split(/\r?\n/)) {
        let [cat, kw, rel] = row.split(',')
        if (!cat) break

        if (!result[cat]) {
            result[cat] = ['',]
        }
        if (rel.toLowerCase() == 'and') {
            result[cat].push(kw)
        } else result[cat][0] += ` "${kw}"`
    }

    return result

}






