import React from "react";
// react plugin that creates an input with badges
import TagsInput from "react-tagsinput";
import { Button, Checkbox } from "@chakra-ui/react";
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
            <div>
                {this.state.defaultEvents.map(de =>
                    <Checkbox mr={4} mb={2} fontSize={12} colorScheme='blue'
                    >
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
            </div>
        );
    }
}

export default TagsInput2;