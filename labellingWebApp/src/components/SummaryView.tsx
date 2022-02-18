import { Box, Button, Checkbox, Container, Divider, Flex, Grid, SimpleGrid, Spinner, Tag, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import {
    getDefaultEventList,
    loadUnlabelledPostByAccount,
    refillDb_acc,
    updateLabel,
    loadUnlabelledPost_accs_kws,
    refillDb_kw,
    refillDb_acc_kws, loadLabelledPostByLabelledBy, getDefaultKws
} from '../utils/db';
import { useAuth } from "../lib/auth";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import TagInput2 from './TagsInput2';
import {
    fetchData,
    getKwInput,
    getTagsInput,
    isAdmin,
    isMasked,
    explainKws,
    // maskPersonalDetails,
    maskPersonalDetails_AtSign,
    getCountRecent,
    getSAPrediction,
    getEDPrediction,
    isChecked,
    calcAmountSummary,
    checkExpect, displayTagSentiment, displayTagED, sentimentFullList, eventFullList, eventList
} from "../utils/common";
import Pie2 from './Pie2';


interface Props {

    tweets,
    pred_sa,
    pred_ed,

}

class SummaryView extends React.Component<Props> {

    state = {
        id: 'SummaryView',

        refreshing: false,
        tweets: this.props.tweets,
        pred_sa: this.props.pred_sa,
        pred_ed: this.props.pred_ed,
        width: 300,
        height: 300,


    }



    render() {
        console.log(`${this.state.id}::render`)
        let summary = calcAmountSummary(this.props.pred_sa, sentimentFullList, true)
        let sumList = []
        for (const i in summary) {
            sumList.push({ name: i, value: summary[i] })
        }

        console.log(sumList)
        // this.displayResult = this.displayPredicts()
        return (
            <div>

                <Container id='pie' align="center" justify="top" maxW={'8xl'}>
                    <Pie2 data={sumList} innerRadius={0} outerRadius={Math.min(this.state.height, this.state.width) / 2}
                        width={this.state.width} height={this.state.height} />

                </Container >


            </div >

        );
    }
}


export default SummaryView;