import axios from "axios";
import {toast} from 'react-toastify';
import crypto from "crypto";
import {
    loadUnlabelledPost_accs_kws
    , loadUnlabelledPostByAccount
    , host, host_sa, host_ed, port_sa, port_ed, refillDb_acc_kws, refillDb_acc, refillDb_kw
} from "./db";
import Axios from "axios";
import {Tag} from "@chakra-ui/react";

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

export const getTagsInput = (eleId, isTwitterAcc=false, lowering = true) => {
    let tags = []
    let rootEle = document.getElementById(eleId)
    // if (rootEle.has)
    rootEle.querySelectorAll('.chakra-checkbox.css-khpbvo').forEach(de => {
        if (de.querySelector('.chakra-checkbox__control.css-xxkadm').hasChildNodes())
            tags.push(de.querySelector('.chakra-checkbox__label.css-1sgc0qu').innerHTML)
    })

    let reactTagInput = rootEle.querySelector('.react-tagsinput')
    if (reactTagInput) {
        rootEle.querySelector('.react-tagsinput').querySelectorAll('span .react-tagsinput-tag').forEach((element) => {
            let tmp = (isTwitterAcc ? '@' : '') + element.innerHTML.replace("<a></a>", "")
            if (lowering) tmp = tmp.toLowerCase()
            tags.push(tmp)
        })
        rootEle.querySelector('.react-tagsinput').querySelectorAll('span .react-tagsinput-input').forEach(element =>{
            // @ts-ignore
            let tmpInput = element.value
            if (tmpInput.trim() != '') {
                if (lowering) tmpInput = tmpInput.toLowerCase()
                tags.push((isTwitterAcc ? '@' : '') + tmpInput)
                toast.info(`Include unfinalised input ${tmpInput}. Please remember hitting Enter or Tab next time`)
            }
        })
    }
    console.log('detect tags: ' + tags)
    return tags
}

export const convertTimeToString = (time) => {
    let tmp = new Date(time['seconds'] * 1000)
    return tmp.toISOString()
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
    let result = true
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

    // let a = crypto.md5
    // let aa = CryptoJS.enc.Base64.parse(a)
    // console.log(a)
    // console.log(aa)

}
export const fetchData = async (accs: string[], kws:string[], limit) => {
    // setData(`loading post from ${accs} with keywords ${kws}`)
    let res = null

    if (kws.length == 0){
        res = await loadUnlabelledPostByAccount(accs, null, limit)
    }else res = await loadUnlabelledPost_accs_kws(accs, kws, limit)

    let isOldData = true
    let isReachLimit = false
    if (res.length > 0) {
        let latestDate = new Date(res[0].postAt['seconds'] * 1000)
        // @ts-ignore
        isOldData = ((new Date()) - latestDate) / (1000 * 3600 * 24) > 1
        isReachLimit = res.length >= limit
    }
    if (isOldData || !isReachLimit) {
        toast.info('Auto scrapping latest tweets')
        refillData(accs,kws)
    }


    return res;

}
export const refillData = async (accs:string[], kws:string[]) => {
    // setData("...preparing db...")
    //
    // let accs = getTagsInput('searchAcc',true)
    // let kws = getTagsInput('searchKey',false)

    // let isWaiting = true

    if (accs.length > 0 && kws.length > 0) {
        // refillDbWithAccount(accs.join(','))
        refillDb_acc_kws(accs, kws)
    } else {
        if (accs.length > 0) refillDb_acc(accs.join(','))
        else if (kws.length > 0) refillDb_kw(kws)
        else {
            toast.error('Please check your input')
            // isWaiting = false
        }
    }
}
export const getSAPrediction = async (tweetList: string[]) => {
    // let tmp = await Axios.post(`http://${host}:8001/trigger/account`, { list: acc })
    let tmp = await Axios.post(`http://${host_sa}:${port_sa}/predict`, { text: tweetList })
    return tmp
}

export const getEDPrediction = async (tweetList: string[]) => {
    // let tmp = await Axios.post(`http://${host}:8001/trigger/account`, { list: acc })
    let tmp = await Axios.post(`http://${host_ed}:${port_ed}/predict`, { text: tweetList })
    return tmp
}
export const displayTag = (list: string[], fullList:string[]=null, colorScheme='telegram') => {
    let result = []
    if (fullList == null) {
        for (const i in list) {
            result.push(<Tag m={1} colorScheme={colorScheme} variant="solid">{list[i]}</Tag>)
        }
    } else{
        for (const i in fullList) {
            if (list.includes(fullList[i]))
                result.push(<Tag m={1} colorScheme={colorScheme} variant="solid">{fullList[i]}</Tag>)
            else result.push(<Tag m={1} color={'gray.300'}>{fullList[i]}</Tag>)
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
export const displayTagToxic = (list: string[], fullList:string[]=null) => {
    let colorScheme = 'red'
    if (list[0] == 'friendly') colorScheme = 'green'
    return displayTag(list, fullList, colorScheme)
}