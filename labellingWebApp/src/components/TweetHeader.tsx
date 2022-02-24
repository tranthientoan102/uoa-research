import React from "react";
// react plugin that creates an input with badges
import TagsInput from "react-tagsinput";
import {Box, Button, Checkbox, Container, Flex, Grid, HStack, Tag, Text, VStack} from "@chakra-ui/react";
import {explainKws, isMasked} from "../utils/common";
import {random} from "nanoid";
import {getDefaultKws} from "../utils/db";
import {SocialIcon} from "react-social-icons";
import { MdOutlinePlace, MdOutlineTrendingUp, MdFavorite, MdChat, MdShare, MdRepeat, MdPriorityHigh } from "react-icons/md";


interface Props {
    isMasked: boolean,
    orig: string,
    acc: string,
    geo: string,
    like: number,
    retweet: number,
    comment: number,
    engage: number,
    postSec: number,
    hash: string,
    sortBy: string,
}

class TweetHeader extends React.Component<Props> {

    state = {
    };


    render() {
        // console.log(`${this.state.name}::render`)
        let geo = this.props.geo && this.props.geo != 'unknown location' ? this.props.geo : undefined

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
                            {geo ? <Text m={1} pt={1} mr={3}>{this.props.geo}</Text>
                                : <Box m={1} pt={1} mr={3} ml={-1}><MdPriorityHigh color="red" /></Box>
                            }

                            <MdFavorite size={18} color={this.props.sortBy == 'like' ? '#1DA1F2' : 'black'} />
                            {this.props.like ?
                                <Box m={1} pt={1} mr={3} color={this.props.sortBy == 'like' ? '#1DA1F2' : 'black'}> {this.props.like.toLocaleString()}</Box>
                                : <Box m={1} pt={1} mr={3} ml={-1}><MdPriorityHigh color="red" /></Box>}

                            <MdRepeat size={18} color={this.props.sortBy == 'retweet' ? '#1DA1F2' : 'black'} />
                            {this.props.retweet ?
                                <Box m={1} pt={1} mr={3} color={this.props.sortBy == 'retweet' ? '#1DA1F2' : 'black'}> {this.props.retweet.toLocaleString()}</Box>
                                : <Box m={1} pt={1} mr={3} ml={-1}><MdPriorityHigh color="red" /></Box>}


                            <MdChat size={18} color={this.props.sortBy == 'comment' ? '#1DA1F2' : 'black'} />
                            {this.props.comment
                                ? <Box m={1} pt={1} mr={3} color={this.props.sortBy == 'comment' ? '#1DA1F2' : 'black'}> {this.props.comment.toLocaleString()}</Box>
                                : <Box m={1} pt={1} mr={3} ml={-1}><MdPriorityHigh color="red" /></Box>}

                            <MdOutlineTrendingUp size={18} color={this.props.sortBy == 'combine' ? '#1DA1F2' : 'black'} />
                            {this.props.engage
                                ? <Box m={1} pt={1} mr={3} color={this.props.sortBy == 'combine' ? '#1DA1F2' : 'black'}> {this.props.engage.toLocaleString()}</Box>
                                : <Box m={1} pt={1} mr={3} ml={-1}><MdPriorityHigh color="red" /></Box>}


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