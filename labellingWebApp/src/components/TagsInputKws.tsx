import React from "react";
// react plugin that creates an input with badges
import TagsInput from "react-tagsinput";
import {Button, Checkbox, Container, Grid} from "@chakra-ui/react";
import {explainKws} from "../utils/common";
import {random} from "nanoid";
import {getDefaultKws} from "../utils/db";

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
        // items : []
    };
    items = []
    itemExplain = ''

    handleTagsinput = tags => {
        this.setState({ tags });
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

        return (
            <Grid id={this.props.id} m={0} p={0} justify="center" align="start">

                <TagsInput
                    className="react-tagsinput"
                    onChange={this.handleTagsinput}
                    tagProps={tagProps}
                    value={this.state.tags}
                    inputProps={inputProps}
                >
                </TagsInput>

                {this.items.map(i =>
                    <Checkbox mr={4} mb={2} fontSize={12} colorScheme='blue' key={i.id}
                    >
                        {i.name}
                    </Checkbox>)
                }
                {/*<Checkbox mr={4} mb={2} fontSize={12} colorScheme='blue'*/}
                {/*          value ={(this.state.outsideIsAND)?'checked':'unchecked'}*/}
                {/*          onChange={()=> {*/}
                {/*              this.state.outsideIsAND = !this.state.outsideIsAND*/}
                {/*          }}*/}
                {/*>*/}
                {/*        /!*{this.props.outsideIsAND}*!/ tag {this.state.outsideIsAND?'AND':'OR'} tag*/}
                {/*</Checkbox>*/}
                <p>{explainKws(this.props.id)}</p>
            </Grid>
        );
    }
}

export default TagsInputKws;