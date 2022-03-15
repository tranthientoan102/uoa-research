import React from "react";
// react plugin that creates an input with badges
import TagsInput from "react-tagsinput";
import { Box, Button, Checkbox, Container, Flex, Grid, Link, Tag } from "@chakra-ui/react";
import { explainKws, explainKws_arrayOfArray, tags_arrayOfArray } from "../utils/common";
import {random} from "nanoid";
import {getDefaultKws} from "../utils/db";
import { toast } from "react-toastify";

const tagProps = { className: "react-tagsinput-tag" };

const inputProps = {
    className: "react-tagsinput-input",
    placeholder: ""
};
interface DE{
    name: string
}
interface Props {
    id: string,
    tags: string[],
    outsideIsAND: boolean,
}

class TagsInputKws extends React.Component<Props> {

    state = {
        name:'TagsInputKws',
        id: this.props.id,
        isLoading: false,
        tags: this.props.tags,
        outsideIsAND: this.props.outsideIsAND,
        exp: ''
        // items : []
    };
    items = []
    itemExplain = ''

    handleTagsinput = tags => {
        this.setState({ tags, exp: explainKws_arrayOfArray(tags_arrayOfArray(tags)) });

    }

    // clickDefaultEvent = de => {
    //     document.getElementById(hash).
    // }

    collectItem = async() => {
        this.setState({
            'isLoading': true,
        })
        this.items = []
        await getDefaultKws().then(data => {
            data.forEach((i) =>  this.items.push(i))
        })
        this.setState({
            'isLoading': false,
        })
    }

    componentDidMount() {

        console.log(`${this.state.name}::componentDidMount`)
        this.collectItem()


    }

    render() {
        // console.log(`${this.state.name}::render`)
        this.itemExplain = explainKws(this.props.id)

        return (
            <Box id={this.props.id} m={0} p={0} justify="center" align="start">

                <TagsInput
                    className="react-tagsinput"
                    onChange={this.handleTagsinput}
                    tagProps={tagProps}
                    value={this.state.tags}
                    inputProps={inputProps}
                >
                </TagsInput>

                <Box p={1}></Box>

                {this.items.map(i =>
                    <Link pt={2} fontSize={13} colorScheme='blue' key={i.id}
                        onClick={() => {
                            let a = this.state.tags

                            if (i.val) {
                                for (let c of i.val) {
                                    if (a.includes(c)) {
                                        a = a.filter(x => x != c)
                                    } else a = [a, c].flat()

                                }
                            } else {
                                if (a.includes(i.name)) {
                                    a = a.filter(x => x != i.name)
                                } else a = [a, i.name].flat()
                            }
                            console.log(a)
                            this.handleTagsinput(a)

                            // this.setState({ isLoading: true, exp: explainKws(this.props.id) })
                            // this.itemExplain = explainKws(this.props.id)
                            // this.setState({ isLoading: false })
                            // console.log(`${i.name} is clicked\nthis.itemExplain=${this.itemExplain}\nthis.state.exp=${this.state.exp}`)
                            // this.setState({ isLoading: false })

                        }}
                    >
                        <Tag mr={3} mb={2} px={3} py={1} borderRadius={100}>{i.name}</Tag>
                    </Link>)
                }
                {/*<Checkbox mr={4} mb={2} fontSize={12} colorScheme='blue'*/}
                {/*          value ={(this.state.outsideIsAND)?'checked':'unchecked'}*/}
                {/*          onChange={()=> {*/}
                {/*              this.state.outsideIsAND = !this.state.outsideIsAND*/}
                {/*          }}*/}
                {/*>*/}
                {/*        /!*{this.props.outsideIsAND}*!/ tag {this.state.outsideIsAND?'AND':'OR'} tag*/}
                {/*</Checkbox>*/}
                <Box mt={2}>{this.state.exp.length == 0 ? 'no tag selected' : this.state.exp}</Box>
            </Box>
        );
    }
}

export default TagsInputKws;