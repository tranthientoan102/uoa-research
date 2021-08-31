import axios from "axios";

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
    rootEle.querySelector('.react-tagsinput').querySelectorAll('span .react-tagsinput-tag').forEach((element) => {
        tags.push((isTwitterAcc?'@':'') + element.innerHTML.replace("<a></a>", ""))
    })
    console.log('detect tags: ' + tags)
    return tags
}

export const convertTimeToString = (time) => {
    let tmp = new Date(time['seconds'] * 1000)
    return tmp.toISOString()
    // return `${tmp.toLocaleString('%Y-%b-%d')} ${tmp.toLocaleTimeString()}`

}