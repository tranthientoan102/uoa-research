import React, {Component} from 'react';
import {CSVLink} from "react-csv";
import {
    convertDate,
    convertTimeToString,
    encrypting,
    getTagsInput,
    isAdmin,
    isMasked,
    maskPersonalDetails, maskPersonalDetails_AtSign
} from "../utils/common";
import {downloadData} from "../utils/db";
import {Button, SimpleGrid} from "@chakra-ui/react";

const headers = [
    { label: "text", key: "text" },
    { label: "sa", key: "sa" },
    { label: "ed", key: "ed" },
    { label: "location", key: "location" },
    { label: "#LRC", key: "#LRC" },

];

interface Props {
    tweets: any[],
    sa: string[],
    ed: string[],
    isMasked: boolean,
    disabled: boolean
}

class PredictionDownload extends Component<Props> {
    // private csvLinkEl: React.RefObject<HTMLDivElement>;


    state = {
        data: [],
        // text: this.props.text,
        // ed: this.props.ed,
        // sa: this.props.sa,
        // isMasked: this.props.isMasked,
        // disabled: this.props.disabled,
    }
    csvLinkEl = React.createRef();

    download = async () => {

        console.log(this.props.tweets)
        // const data = await this.getData();
        let data =  []
        // for (let i = 0; i < this.state.text.length; i++){
        //     let text= this.state.text[i]
        for (let i = 0; i < this.props.tweets.length; i++){
            let text= this.props.tweets[i].text
            text = text.replaceAll("\"","[doubleQuote]")
                    .replaceAll("\n", "[newLine]")
                    .replaceAll("&amp;","&")
            // if (this.state.isMasked){
            if (this.props.isMasked){
                text = maskPersonalDetails_AtSign(text)
            }

            data.push({
                text: text,
                sa: this.props.sa[i],
                ed: this.props.ed[i],
                location: this.props.tweets[i].geo,
                '#LRC': this.props.tweets[i].engage,
            })

        }
        console.log(this.props.tweets)
        // console.log(this.state.text)
        this.setState({data: data}, () => {
            setTimeout(() => {

                // @ts-ignore
                this.csvLinkEl.current.link.click();
            });
        });
    }

    render() {
        return (
            <div>
                <Button my={2} colorScheme={"green"} onClick={this.download} disabled={this.props.disabled}>
                    Export to CSV
                </Button>
                <CSVLink
                        headers={headers}
                        filename={`prediction_${(new Date()).toDateString()}_${(new Date()).toLocaleTimeString()}.csv`}
                        data={this.state.data}
                        ref={this.csvLinkEl}
                    />
            </div>

        );
    }
}

export default PredictionDownload;