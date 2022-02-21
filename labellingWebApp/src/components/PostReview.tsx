import { Box, Button, Checkbox, Container, Divider, Flex, Grid, SimpleGrid, Spinner, Tag, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import {
    getDefaultEventList,
    loadUnlabelledPostByAccount,
    refillDb_acc,
    updateLabel,
    loadUnlabelledPost_accs_kws,
    refillDb_kw,
    refillDb_acc_kws, loadLabelledPostByLabelledBy
} from '../utils/db';
import { useAuth } from "../lib/auth";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



import InfiniteScroll from "react-infinite-scroll-component";
import PostReviewEle from "./PostReviewEle";
import {random} from "nanoid";
import {isChecked} from "../utils/common";

interface Props {
    auth,
    labelledBy: string[],

}

class PostReview extends React.Component<Props> {

    getDE = () => {
        let result = []
        getDefaultEventList().then(data => {
            data.forEach(d => result.push(d.name))
        })
        console.log(result.join(','))
        return result
    }

    counter = 0;
    postAfter = new Date();
    state = {
        name: 'PostReview',
        auth: this.props.auth,

        labelledBy: this.props.labelledBy,

        items: [],
        loadEachTime: 10,
        de: this.getDE(),
        hasMore: true,
        loading: true,
    }

    constructor(props) {
        super(props)
        this.fetchMoreData()
    }






    // const update = (auth, hash, rating, events, names) => {
    update = (auth, hash, rating, events, names) => {
        if (auth != null) {
            updateLabel(auth, hash, rating, events, names)
            document.getElementById(hash).style.backgroundColor = "LightYellow";
        } else {
            toast.error('Please login to start labelling')
        }
    }


    fetchMoreData = async () => {
        if (this.counter == 0) {
            // toast.info('resetting configs...',{autoClose: 2000})
            let cur = new Date()
            this.setState({
                items: []
                , loading: true
            })
            this.postAfter = cur
            // console.log(cur.getTime())
            // console.log(this.postAfter)
        }
        console.log(`check postAfter: ${this.postAfter}`)

        let res = await loadLabelledPostByLabelledBy(
            this.state.auth.email
            , this.state.labelledBy
            , 3
            , this.postAfter
        )
        this.setState({
                loading: true
            })

        this.counter++;
        // this.setState({
        //         loading: true
        //     })
        // .then(data => result.push)
        // .finally(() => {
        //     console.log(`displaying ${result.length} items`)
        //     this.setState({items: result})
        //     // setTimeout(() => this.forceUpdate(),2000)
        // })
        // // .finally(() => this.forceUpdate)

        if ((res != null) && (res.length > 0)) {
            this.setState({
                items: this.state.items.concat(res)
            })
            this.postAfter = new Date(res[res.length - 1].postAt['seconds'] * 1000)

            // if (res.length < this.state.loadEachTime) this.fetchMoreData()
        } else {
            this.setState({
                loading: false
            })
        }

        // this.state.items.forEach(d => {
        //     console.log(d)
        //     // this.forceUpdate()
        // })
        console.log(`${this.state.name}-fetchMoreData: done`)

    }

    render() {
        console.log(`render ${this.state.name}`)
        console.log(`${this.state.items.length}`)
        return (
            <div>
                <Container maxW="8xl">
                    <SimpleGrid my={2} >
                        <InfiniteScroll
                            dataLength={this.state.items.length}
                            next={this.fetchMoreData}
                            hasMore={this.state.hasMore}
                            loader={''}
                        >
                            {this.state.items.map(data => (
                                <PostReviewEle auth={this.state.auth}
                                    key={data.hash}
                                    hash={data.hash}
                                    isMasked={isChecked('isMasked')}
                                    events={data.event}
                                    orig={data.orig}
                                    de={this.state.de}
                                    postAt={data.postAt['seconds']}
                                    text={data.text}
                                    labelledBy={data.labelledBy}
                                    rating={data.rating}
                                    account={data.account}
                                    like={data.fav}
                                    comment={data.comment}
                                    retweet={data.retweet}
                                    engage={data.engage}
                                    geo={data.geo} />
                            )
                            )}

                        </InfiniteScroll>
                        <Flex my={2} align="center" justify="center">
                            {this.state.loading ? <Spinner size="xl" m={1} thickness="10px"
                                    speed="0.65s"
                                    emptyColor="gray.200"
                                    color="blue.500"
                                /> : (
                                        <Grid position="relative" maxW="8xl" align="center" justify="center">
                                            <Text fontWeight={600} fontSize='2xl' m={10}>End of annotations</Text>
                                        </Grid>
                            )}
                        </Flex>

                    </SimpleGrid>
                </Container>
            </div>
        );
    }
}


export default PostReview;