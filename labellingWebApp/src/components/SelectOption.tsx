import React, { Component } from "react";
// react plugin that creates an input with badges
import TagsInput from "react-tagsinput";
import { Box, Button, Checkbox, Container, Flex, Grid, HStack, Link, Tag, Text, VStack } from "@chakra-ui/react";
import { explainKws, isMasked } from "../utils/common";
import { random } from "nanoid";
import { getDefaultKws } from "../utils/db";
import { SocialIcon } from "react-social-icons";
import { MdOutlinePlace, MdOutlineTrendingUp } from "react-icons/md";

// export class SelectOption {
//     name: string
//     selected: boolean

// }

export enum SelectionMode {
    'ONE',
    'MULTI'
}

export interface SelectOptionProps {
    title: string,
    id,
    data: string[]
    init: string[],
    mode: SelectionMode,
    colorScheme: string,
    parentCallback

}

class SelectOption extends Component<SelectOptionProps> {

    state = {
        selected: this.props.init
    };




    onSelecting = (item) => {
        if (this.props.mode == SelectionMode.ONE) this.setState({ selected: [item] })
        else {
            if (this.state.selected.includes(item))
                this.setState({
                    selected: this.state.selected.filter((a) => a != item)
                })
            else this.setState({ selected: [this.state.selected, item].flat() })
        }
    }

    // getSelecting = this.state.selected.join(',')


    render() {
        this.props.parentCallback(this.state.selected.join(','))
        // console.log(`${this.state.name}::render`)
        let data = this.props.data
        let selecting = this.state.selected
        // console.log(selecting)
        let display = data.map((d) =>
            <Tag m={1} align="center" justify="center" borderRadius={100} colorScheme={this.props.colorScheme}
                onClick={() => this.onSelecting(d)}
                variant={selecting.includes(d) ? 'solid' : 'outline'}
                key={`${this.props.id}_${d}`}
            ><Link>{d}</Link>
            </Tag>
        )
        return (
            // eslint-disable-next-line react/jsx-no-undef
            <div id={this.props.id}>

                <Flex flexDirection="row" flexWrap="wrap"
                    // templateColumns={'repeat(5,auto)'}
                    align="center" justify="center" mx={1} >
                    {this.props.title}{display}
                </Flex>
            </div>

        );
    }
}

export default SelectOption;