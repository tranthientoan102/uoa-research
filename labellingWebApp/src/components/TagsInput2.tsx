import React from "react";
// react plugin that creates an input with badges
import TagsInput from "react-tagsinput";
import {Button, Checkbox, Container} from "@chakra-ui/react";
import {explainKws} from "../utils/common";
import {random} from "nanoid";
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
    defaultEvents: DE[]
}

class TagsInput2 extends React.Component<Props> {
    // constructor(init: Props) {
    //     super(init)
    //     console.log(init.defaultEvents)
    // }
    state = {
        tags: this.props.tags,
        defaultEvents: this.props.defaultEvents
    };

    handleTagsinput = tags => {
        this.setState({ tags });
    }

    // clickDefaultEvent = de => {
    //     document.getElementById(hash).
    // }

    render() {
        return (
            <Container id={this.props.id} m={0} p={0} mb={1}>
                {this.state.defaultEvents.map(de =>
                    <Checkbox mr={4} mb={2} fontSize={12} colorScheme='blue' key={''+random(1)}>
                        {de.name}
                    </Checkbox>)
                }
                <TagsInput
                    className="react-tagsinput"
                    onChange={this.handleTagsinput}
                    tagProps={tagProps}
                    value={this.state.tags}
                    inputProps={inputProps}
                >
                </TagsInput>
            </Container>
        );
    }
}

export default TagsInput2;