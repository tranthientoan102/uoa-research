import React, {useEffect} from 'react';
import {createDefaultEvent, getDefaultEventList,getDefaultKws} from "../utils/db";
import {Box, Button, Flex, Grid, SimpleGrid, Spinner} from "@chakra-ui/react";
import {DeleteIcon, DownloadIcon} from "@chakra-ui/icons";
import {getTagsInput,tags_arrayOfArray} from "../utils/common";
import TagsInput2 from "./TagsInput2";
import {toast} from "react-toastify";
import {CSVLink} from "react-csv";

import firebase from "../lib/firebase";
import ItemCrd from './ItemCrd';

const headers = [
    {label: "list", key: "list"},
    {label: "keyword", key: "keyword"},
    { label: "logic", key: "logic" },
    
   
];



class KwdCrd extends ItemCrd{
    csvLinkEl = React.createRef();
data=[]    
    
// extend itemcard 
// use stringReplace function to replace any punctuation in the keyword
    stringReplace(array){
        let new_array = []
        for(let i =0;i<array.length;i++){
            console.log(array[i] + " before" );
            while(array[i][0]==' '){
                array[i]=array[i].replace(array[i][0],'');
            }
            console.log(array[i]+" after");
            const regex = /["]/g;
//use str.replace function
            let a = array[i].replace(regex,'')
            new_array.push(a)

        }
        return new_array

    }

    //get the data(value)from for download according to the id of the keyword
    getvalue = async(id)=>{  
        //get all the keyword, and return objects of each keyword

       
        // let defKws = await this.props.getFnc()

        // use the itemlist to get data/ get data from itemlist
        let defKws = this.itemList        
        
        
        for(let key in defKws) {
            var value = defKws[key];

                
            let arr = []
            let logic = []
            let temparray =[]
            //find the keyword by id
            if(value['id'] == id){
                // use tags_arrayofArray function to return 'val' attribute for the keyword
                temparray = tags_arrayOfArray(value['val'])
               // get each keyword from the arrary
                for(let i =0;i<temparray.length;i++){
                    if(temparray[i].length==1){
                        logic.push('and')
                        arr.push(temparray[i][0])
                    }
                    else{
                        for(let j = 0;j<temparray[i].length;j++){
                            arr.push(temparray[i][j])
                            logic.push('or')
                        }
                    }
                } 
              
            let obj = {}
            let result = []
            
            // remove any punctuation
            arr = this.stringReplace(arr)

                // produce obj 
            for (let i=0; i<=logic.length-1; i++) {
                obj[i] = { "list": value['name'], "keyword": arr[i], "logic": logic[i] }
                result.push(obj[i])
              }
            console.log(result)

            return result 
                
               
            }
        }

    }

    downloadReport = async (z) => {

        //get the data 
        this.data =  await this.getvalue(z);
        
        
        this.setState({data: this.data}, () => {
            setTimeout(() => {

                // @ts-ignore
                this.csvLinkEl.current.link.click();
            });
        });
    }




    render() {

        if (this.state.isLoading)
            return (<Flex pt={6} px={4} flexDirection="row" flexWrap="wrap" justify="center" align="center"><Spinner size="xl" m={5} thickness="6px"
                            speed="0.65s"
                            emptyColor="gray.200"
                            color="blue.500"/>
            </Flex>)
        else {
            return (
                <SimpleGrid m={0} p={0}>
                    <Button onClick={() => this.getFnc()} >
                        {this.compTittle}
                    </Button>
                    <Grid>
                        {this.itemList.map(i=>(
                                <Box key={i.id}>
                                    <Flex align="center" justify="center" m={2} px={2}>
                                        {i.name}
                                        <Box pl={1}>
                                            <DeleteIcon w={4} h={4} color={'Tomato'} onClick={() => {
                                                this.deleteFnc(i.id)
                                                this.getFnc(200)


                                            }}/>
                                        </Box>
                                        <Box pl= {1}>
                                            <DownloadIcon w={4} h={4} color={'Tomato'} onClick={() => {
                                                //set a download icon in order to download each keyword infromation.
                                                //find the keyword by id

                                                //produce the data we have
                                                 this.downloadReport(i.id)
                                                
                                                                                            
                                            }}/>
                                        </Box>
                                        <CSVLink
                                        //download the data in a sv filw
                                        headers ={headers}
                                        
                                        // filename="Clue_Mediator_Report_Async.csv"
                                        filename = 'keyword.csv'
                                        data={this.data}
                                        ref={this.csvLinkEl}
                    />
                                    </Flex>
                                </Box>

                        ))}
                    </Grid>
                    <TagsInput2 id={this.inputId} tags={[]} defaultEvents={[]} />
                    {this.props.enableImport ? <input type="file" onChange={e => {
                        this.itemDict = this.props.importFnc(e, this.importCallback)
                    }
                    } multiple={true} /> : ''}
                    <Button my={2} colorScheme='twitter' onClick={() => {
                            console.log(this.inputId)
                        this.createFnc(getTagsInput(this.inputId), this.state.auth)
                        this.createFnc(this.itemDict, this.state.auth)
                            this.getFnc()
                    }}>
                        +
                    </Button>
                </SimpleGrid>
            )


        }
    }




}
export default KwdCrd