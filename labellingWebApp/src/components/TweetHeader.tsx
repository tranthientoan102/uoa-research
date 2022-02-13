import React from "react";
// react plugin that creates an input with badges
import TagsInput from "react-tagsinput";
import {Box, Button, Checkbox, Container, Flex, Grid, HStack, Tag, Text, VStack} from "@chakra-ui/react";
import {explainKws, isMasked} from "../utils/common";
import {random} from "nanoid";
import {getDefaultKws} from "../utils/db";
import {SocialIcon} from "react-social-icons";
import {MdOutlinePlace, MdOutlineTrendingUp} from "react-icons/md";


interface Props {
    isMasked: boolean,
    orig: string,
    acc: string,
    geo: string,
    engage: number,
    postSec: number,
    hash: string,
}

class TweetHeader extends React.Component<Props> {

    state = {
    };


    render() {
        // console.log(`${this.state.name}::render`)

        return (
            // eslint-disable-next-line react/jsx-no-undef
            <Box align={'left'} p={0} m={0}>
                {this.props.isMasked ? '' :
                                            <Text color="blue.300">
                                                <a href={this.props.orig}>{this.props.orig} </a>
                                            </Text>}
                <HStack p={0} m={0} align={'center'}>
                    <Tag colorScheme={"twitter"} m={0} p={0}
                        borderRadius={100}
                    >
                        <SocialIcon network="twitter" style={{ height: 32, width: 32 }} />
                        <Text justify="center"
                              pl={this.props.isMasked ?0: 1}
                              pr={this.props.isMasked ?0: 5}
                        >
                            <b>{this.props.isMasked ? '': this.props.acc}</b>
                        </Text>
                    </Tag>
                    <Tag m={2} pr={3}
                        borderRadius={100}
                    >
                        <Flex align={'center'}>
                            <MdOutlinePlace size={18}/>
                            <Text m={1} pt={1} mr={3}>{this.props.geo}</Text>
                            <MdOutlineTrendingUp size={18}/>
                            <Text m={1} pt={1}><b>{this.props.engage?this.props.engage.toLocaleString():''}</b></Text>


                        </Flex>
                    </Tag>
                </HStack>
                <Text colorScheme="teal">
                    {(new Date(this.props.postSec * 1000).toString())}

                </Text>
                <Text color="teal">
                    {this.props.hash}
                </Text>
            </Box>
        );
    }
}

export default TweetHeader;