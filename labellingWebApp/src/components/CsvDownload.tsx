import React, {Component} from 'react';
import {CSVLink} from "react-csv";
import {convertTimeToString, encrypting, getTagsInput, isAdmin, isMasked, maskPersonalDetails} from "../utils/common";
import {downloadData} from "../utils/db";
import {Button, SimpleGrid} from "@chakra-ui/react";

const headers = [
    {label: "id", key: "id"},
    {label: "account", key: "account"},
    // { label: "hash", key: "hash" },
    {label: "postAt", key: "postAt"},
    {label: "insertDbAt", key: "insertDbAt"},
    {label: "text", key: "text"},
    {label: "event", key: "event"},
    {label: "rating", key: "rating"},
    { label: "labelledBy", key: "labelledBy" }
];

interface Props {
    auth: any,
    id: string
}

class CsvDownload extends Component<Props> {
    // private csvLinkEl: React.RefObject<HTMLDivElement>;

    // constructor(props) {
    //     super(props);
    // }
    state = {
            data: []
    }
    csvLinkEl = React.createRef();

    getData = () => {
        // @ts-ignore
        let accs = getTagsInput(this.props.id, true, false)
        let labelledBy = isAdmin(this.props.auth)?null:this.props.auth.email
        console.log(`download data labelled by ${labelledBy}`)
        // @ts-ignore
        let result = downloadData(this.props.auth, accs, null, labelledBy).then((res) => {
            res.forEach(a => {
                // console.log(`converting ${a.id}`)
                console.log(a.masking)
                a.postAt = convertTimeToString(a.postAt)
                a.insertDbAt = convertTimeToString(a.insertDbAt)
                a.text = a.text.replaceAll("\"","[doubleQuote]")
                    .replaceAll("\n", "[newLine]")
                if (isMasked(this.props.auth)){
                    a.account = encrypting(a.account[0])
                    a.labelledBy =  encrypting(a.labelledBy)
                    a.text = maskPersonalDetails(a.text, a.masking)
                }
            })
            return res
        })
        // setData(result)
        console.log(`done download data`)

        return result


    }

    downloadReport = async () => {
        const data = await this.getData();
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
                <Button my={2} colorScheme={"green"} onClick={this.downloadReport}>
                    Export to CSV
                </Button>
                <CSVLink
                        headers={headers}
                        // filename="Clue_Mediator_Report_Async.csv"
                        data={this.state.data}
                        ref={this.csvLinkEl}
                    />
            </SimpleGrid>

        );
    }
}

export default CsvDownload;