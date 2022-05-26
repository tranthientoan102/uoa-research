import React, {Component} from 'react';
import {CSVLink} from "react-csv";
import {
    convertDate,
    convertTimeToString,
    encrypting,
    getTagsInput,
    isAdmin,
    isMasked,
    maskPersonalDetails
} from "../utils/common";
import {downloadData} from "../utils/db";
import {Button, SimpleGrid} from "@chakra-ui/react";

const headers = [
    {label: "id", key: "id"},
    {label: "account", key: "account"},
    // { label: "hash", key: "hash" },
    {label: "postAt", key: "postAt"},
    {label: "insertDbAt", key: "insertDbAt"},
    { label: "text", key: "text" },
    { label: "query", key: "query" },
    { label: "location", key: "geo" },
    { label: "like", key: "fav" },
    { label: "retweet", key: "retweet" },
    { label: "comment", key: "comment" },
    { label: "#LRC", key: "engage" },

    {label: "event", key: "event"},
    {label: "rating", key: "rating"},
    { label: "labelledBy", key: "labelledBy" },

    { label: "review1rating", key: "review1rating" },
    { label: "review1event", key: "review1event" },
    { label: "review1by", key: "review1by" },
    { label: 'review1At', key:'review1At'},

    { label: "review2rating", key: "review2rating" },
    { label: "review2event", key: "review2event" },
    { label: "review2by", key: "review2by" },
    { label: 'review2At', key:'review2At'},

    { label: "review3rating", key: "review3rating" },
    { label: "review3event", key: "review3event" },
    { label: "review3by", key: "review3by" },
    { label: 'review3At', key:'review3At'},

    { label: "review4rating", key: "review4rating" },
    { label: "review4event", key: "review4event" },
    { label: "review4by", key: "review4by" },
    { label: 'review4At', key:'review4At'},

    { label: "review5rating", key: "review5rating" },
    { label: "review5event", key: "review5event" },
    { label: "review5by", key: "review5by" },
    { label: 'review5At', key:'review5At'},

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
                // console.log(a.masking)

                a.postAt = convertTimeToString(a.postAt)
                a.insertDbAt = convertTimeToString(a.insertDbAt)
                a.text = a.text.replaceAll("\"","[doubleQuote]")
                    .replaceAll("\n", "[newLine]")
                    .replaceAll("&amp;","&")
                if (isMasked(this.props.auth)){
                    a.account = encrypting(a.account[0])
                    a.labelledBy =  encrypting(a.labelledBy)
                    a.text = maskPersonalDetails(a.text, a.masking)
                }

                if (a.reviewedAt == undefined){
                    a.reviewedAt=[]
                    for (let i =0; i < a.reviewCount; i++){
                        a.reviewedAt.push(null)
                    }
                }

                if ( a.reviewedBy && a.reviewedBy.length > 5) {
                    a.reviewedBy = a.reviewedBy.slice(-5)
                    a.reviewedRating = a.reviewedRating.slice(-5)
                    a.reviewedEvent = a.reviewedEvent.slice(-5)
                    a.reviewedAt = a.reviewedAt.slice(-5)
                }else if ( a.reviewedBy && a.reviewedBy.length < 5){
                    let missing = 5-a.reviewedBy.length
                    for (let i = 0; i < missing; i++){
                        a.reviewedBy.push(null)
                        a.reviewedRating.push(null)
                        a.reviewedEvent.push(null)
                        a.reviewedAt.push(null)
                    }
                }else {
                    a.reviewedBy = [null,null,null,null,null]
                    a.reviewedRating = [null,null,null,null,null]
                    a.reviewedEvent = [null,null,null,null,null]
                    a.reviewedAt = [null,null,null,null,null]
                }

                a.review1rating = a.reviewedRating[0]
                a.review2rating = a.reviewedRating[1]
                a.review3rating = a.reviewedRating[2]
                a.review4rating = a.reviewedRating[3]
                a.review5rating = a.reviewedRating[4]

                a.review1event = a.reviewedEvent[0]
                a.review2event = a.reviewedEvent[1]
                a.review3event = a.reviewedEvent[2]
                a.review4event = a.reviewedEvent[3]
                a.review4event = a.reviewedEvent[4]

                a.review1by = a.reviewedBy[0]
                a.review2by = a.reviewedBy[1]
                a.review3by = a.reviewedBy[2]
                a.review4by = a.reviewedBy[3]
                a.review5by = a.reviewedBy[4]

                // console.log(a.reviewedAt)
                a.review1At = convertTimeToString(a.reviewedAt[0])
                a.review2At = convertTimeToString(a.reviewedAt[1])
                a.review3At = convertTimeToString(a.reviewedAt[2])
                a.review4At = convertTimeToString(a.reviewedAt[3])
                a.review5At = convertTimeToString(a.reviewedAt[4])


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