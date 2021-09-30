import axios from "axios";
import {toast} from 'react-toastify';
import crypto from "crypto";
import {loadUnlabelledPost_accs_kws, loadUnlabelledPostByAccount, host} from "./db";
import Axios from "axios";

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

export const getTagsInput = (eleId, isTwitterAcc=false) => {
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
            tags.push((isTwitterAcc ? '@' : '') + element.innerHTML.replace("<a></a>", ""))
        })
        rootEle.querySelector('.react-tagsinput').querySelectorAll('span .react-tagsinput-input').forEach(element =>{
            // @ts-ignore
            let tmpInput = element.value
            if (tmpInput != '') {
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
        decrypted = ['invalie input']
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

    return res;

}
export const getPrediction = async (tweetList: string[]) => {
    // let tmp = await Axios.post(`http://${host}:8001/trigger/account`, { list: acc })
    let tmp = await Axios.post(`http://${host}:8001/predict`, { text: tweetList })
    return tmp
}
