import React, {useEffect} from 'react';
import {createDefaultEvent, getDefaultEventList} from "../utils/db";
import {Box, Button, Flex, Grid, SimpleGrid, Spinner} from "@chakra-ui/react";
import {DeleteIcon} from "@chakra-ui/icons";
import {getTagsInput} from "../utils/common";
import TagsInput2 from "./TagsInput2";
import {toast} from "react-toastify";


interface Props {
    auth,
    compTittle,
    inputId,
    createFnc,
    getFnc,
    deleteFnc,

}

class ItemCrd extends React.Component<Props> {

    
    
    state = {
        auth: this.props.auth,
        isLoading: false,
        // itemList: [],
        //
        // compTittle: this.props.compTittle,

    }

    compTittle = this.props.compTittle
    itemList= []
    inputId = this.props.inputId

    createFnc = this.props.createFnc
    // getFnc = this.props.getFnc
    deleteFnc = this.props.deleteFnc



    create=(auth, items: string[]) => {

    }



    getFnc= async (sleep?) => {
        this.setState({
            'isLoading': true,
        })
        if (sleep) setTimeout(()=>{this.getFnc()}, sleep)
        else {
            let result = []
            this.itemList = []
            await this.props.getFnc().then(data => {
                data.forEach(d => {
                    // console.log(d)
                    this.itemList.push(d)
                })
            }).finally(() => {
                this.setState({
                    'isLoading': false,


                })
            })

        }

    }

    componentDidMount(){
        this.getFnc();
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
                <SimpleGrid flexDirection="column" flexWrap="wrap" align="center" m={0} p={0}>
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
                                    </Flex>
                                </Box>

                        ))}
                    </Grid>
                    <TagsInput2 id={this.inputId} tags={[]} defaultEvents={[]}/>
                    <Button my={2} colorScheme='telegram' onClick={() => {
                            console.log(this.inputId)
                            this.createFnc(getTagsInput(this.inputId), this.state.auth)
                            this.getFnc()
                    }}>
                        +
                    </Button>
                </SimpleGrid>
            )


        }
    }
}
export default ItemCrd;