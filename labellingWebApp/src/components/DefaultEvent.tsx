import React from "react";
// react plugin that creates an input with badges
import TagsInput from "react-tagsinput";
import { Button, Checkbox } from "@chakra-ui/react";
import {random} from "nanoid";
// import 'react-tagsinput/react-tagsinput.css'


const tagProps = { className: "react-tagsinput-tag" };

const inputProps = {
    className: "react-tagsinput-input",
    placeholder: ""
};
export class DE{
    name: string
    constructor (initName){
        this.name = initName;
    }
}
interface Props {
    id: string,

    defaultEvents: DE[]
}

class DefaultEvent extends React.Component<Props> {
    // constructor(init: Props) {
    //     super(init)
    //     console.log(init.defaultEvents)
    // }
    state = {

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
            <div id={this.props.id}>
                {this.state.defaultEvents.map(de =>(
                    <Checkbox mr={4} mb={2} fontSize={12} colorScheme='blue'
                              key={'_events' + random(1)}
                    >
                        {de.name}
                    </Checkbox>))
                }
            </div>
        );
    }
}

export default DefaultEvent;