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

];

interface Props {
    text: string[],
    sa: string[],
    ed: string[],
    isMasked: boolean
}

class PredictionDownload extends Component<Props> {
    // private csvLinkEl: React.RefObject<HTMLDivElement>;

    // constructor(props) {
    //     super(props);
    // }
    state = {
        data: [],
        text: this.props.text,
        ed: this.props.ed,
        sa: this.props.sa,
        isMasked: this.props.isMasked
    }
    csvLinkEl = React.createRef();

    download = async () => {
        // const data = await this.getData();
        let data =  []
        for (let i = 0; i < this.state.text.length; i++){
            let text= this.state.text[i]
            text = text.replaceAll("\"","[doubleQuote]")
                    .replaceAll("\n", "[newLine]")
            if (this.state.isMasked){
                text = maskPersonalDetails_AtSign(text)
            }

            data.push({
                text: text,
                sa: this.state.sa[i],
                ed: this.state.ed[i]
            })

        }
        console.log(this.props.text)
        this.setState({data: data}, () => {
            setTimeout(() => {

                // @ts-ignore
                this.csvLinkEl.current.link.click();
            });
        });
    }

    render() {
        return (
            <SimpleGrid>
                <Button my={2} colorScheme={"green"} onClick={this.download}>
                    Export to CSV
                </Button>
                <CSVLink
                        headers={headers}
                        filename={`prediction_${(new Date()).toDateString()}_${(new Date()).toLocaleTimeString()}.csv`}
                        data={this.state.data}
                        ref={this.csvLinkEl}
                    />
            </SimpleGrid>

        );
    }
}

export default PredictionDownload;