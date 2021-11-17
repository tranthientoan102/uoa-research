import React from "react";
// react plugin that creates an input with badges
import TagsInput from "react-tagsinput";
import {Button, Checkbox, Container} from "@chakra-ui/react";
import {explainKws} from "../utils/common";
// import 'react-tagsinput/react-tagsinput.css'


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
    outsideIsAND: boolean
}

class TagsInputKws extends React.Component<Props> {
    // constructor(init: Props) {
    //     super(init)
    //     console.log(init.defaultEvents)
    // }
    state = {
        tags: this.props.tags,
        outsideIsAND: this.props.outsideIsAND
    };

    handleTagsinput = tags => {
        this.setState({ tags });
    }

    // clickDefaultEvent = de => {
    //     document.getElementById(hash).
    // }

    render() {
        return (
            <Container id={this.props.id} m={0} p={0}>
                <TagsInput
                    className="react-tagsinput"
                    onChange={this.handleTagsinput}
                    tagProps={tagProps}
                    value={this.state.tags}
                    inputProps={inputProps}
                >
                </TagsInput>
                {/*<Checkbox mr={4} mb={2} fontSize={12} colorScheme='blue'*/}
                {/*          value ={(this.state.outsideIsAND)?'checked':'unchecked'}*/}
                {/*          onChange={()=> {*/}
                {/*              this.state.outsideIsAND = !this.state.outsideIsAND*/}
                {/*          }}*/}
                {/*>*/}
                {/*        /!*{this.props.outsideIsAND}*!/ tag {this.state.outsideIsAND?'AND':'OR'} tag*/}
                {/*</Checkbox>*/}
                <p>{explainKws(this.props.id)}</p>
            </Container>
        );
    }
}

export default TagsInputKws;