import {Box, Button, Checkbox, Container, Divider, Flex, Grid, SimpleGrid, Spinner, Tag, Text} from '@chakra-ui/react';
import React, {useState} from 'react';
import {
    getDefaultEventList,
} from '../utils/db';
import 'react-toastify/dist/ReactToastify.css';

import {
    maskPersonalDetails, maskPersonalDetails_AtSign
} from "../utils/common";

interface Props {
    text,
    hash,
    kws,
}

class PostView2Decoration extends React.Component<Props> {
// const PostView2 = (props) => {

    // const formData = JSON.parse(props.formData);
    // console.log(formData)
    // toast.configure()
    // const { auth, signinWithGoogle } = useAuth();
    // const [data, setData] = useState("init data");

    // const [items, setItems] = useState([]);

    // let items = []
    // let de = []

    // const getEvents = (hash) => {
    //     let tags = []
    //     document.getElementById(hash).querySelectorAll('.chakra-checkbox.css-khpbvo').forEach(de => {
    //         if (de.querySelector('.chakra-checkbox__control.css-xxkadm').hasChildNodes())
    //             tags.push(de.querySelector('.chakra-checkbox__label.css-1sgc0qu').innerHTML)
    //     })
    //     document.getElementById(hash).querySelector('.react-tagsinput').querySelectorAll('span .react-tagsinput-tag').forEach((element) => {
    //         tags.push(element.innerHTML.replace("<a></a>", ""))
    //     })
    //     return tags.join(',')
    // }


    // const getDE = () => {
    getDE = () => {
        let result = []
        getDefaultEventList().then(data => {
            data.forEach(d => result.push(d))
        })

        return result
    }

    counter = 0;
    postAfter= new Date();
    state = {
        name: 'PostView2Decoration',
        hash: this.props.hash,
        // text: this.props.text,
        // text: 'santa claus claus claus claus is coming to town',
        kws:this.props.kws,
        result:[],
        tagBgColor:'LightSkyBlue',
        tagColor:'white',
    }

    kwsRefine = () => {
        let result = []
        let wholeWordPattern = new RegExp(/"[^"]*"/,'ig')
        this.state.kws.forEach(dd => {

            dd.forEach(d => {
                console.log(d)
                let wholeWords = d.matchAll(wholeWordPattern)
                while (true){
                    let tmp = wholeWords.next()
                    if (tmp.value){
                        result.push(tmp.value)
                    }else break;
                }
                d.split(/"[^"]*"/ig).map(e=> {return e.split(' ')}).flat().forEach(f=>{
                    f = f.trim();
                    if (f.length>0) result.push(f)
                })
            })
            // let wholeWords = d.matchAll(wholeWordPattern)
            // while (true){
            //     let tmp = wholeWords.next()
            //     if (tmp.value){
            //         result.push(tmp.value)
            //     }else break;
            // }
            // d.split(/"[^"]*"/ig).map(e=> {return e.split(' ')}).flat().forEach(f=>{
            //     f = f.trim();
            //     if (f.length>0) result.push(f)
            // })

        })
        return result.flat()
    }

    // const update = (auth, hash, rating, events, names) => {


    render() {

        // for (let i in this.state.kws){
        //     let textSep = this.state.text.split(`/${this.state.kws[i]}/ig`)
        //
        // }
        let refinedKws = this.kwsRefine()
        let displayingText = maskPersonalDetails_AtSign(this.props.text.replaceAll("&amp;","&"))

        let result = refinedKws.length>0?[]:[Object(displayingText)]
        for (let i in refinedKws){
            // let kw = this.state.kws[i][0].replaceAll('"', '').trim().toUpperCase()
            let kw = refinedKws[i].replaceAll('"', '').trim().toUpperCase()
            let pattern = new RegExp(kw,'ig')
            console.log(pattern)
            if (result.length == 0){

                let tmpResult = maskPersonalDetails_AtSign(this.props.text).split(pattern)
                for (let i in tmpResult){
                    result.push(tmpResult[i])
                    result.push(<Tag fontSize="2xl" m={0} p={0} pt={1} borderRadius={0}
                                     bgColor={this.state.tagBgColor} color={this.state.tagColor}>{kw}</Tag>)
                }
                result.pop()

            } else {
                result = result.flat()
                for (let i in result){
                    try{
                        // console.log(result[i])
                        // console.log(pattern)
                        let tmpResult = result[i].split(pattern).map(i => {
                            let a = []
                            a.push(i)
                            a.push(<Tag fontSize="2xl" m={0} p={0} pt={1} borderRadius={0}
                                        bgColor={this.state.tagBgColor} color={this.state.tagColor}>{kw}</Tag>)
                            return a
                        }).flat()
                        tmpResult.pop()
                        result[i] = tmpResult
                    }catch(e){

                    }

                }
            }

        }
        result = result.flat()

        return (
            <Text color="gray.500" fontSize="2xl" maxW="6xl">
                {result}
            </Text>

        );
    }
}


export default PostView2Decoration;