import React, {Component, PureComponent} from 'react';
import * as d3 from "d3";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {calcStackedSummaryED, eventFullList, eventList} from "../utils/common";


const data = [
    {
        name: 'Page A',
        uv: 4000,
        pv: 2400,
        amt: 2400,
    },
    {
        name: 'Page B',
        uv: 3000,
        pv: 1398,
        amt: 2210,
    },
    {
        name: 'Page C',
        uv: 2000,
        pv: 9800,
        amt: 2290,
    },
    {
        name: 'Page D',
        uv: 2780,
        pv: 3908,
        amt: 2000,
    },
    {
        name: 'Page E',
        uv: 1890,
        pv: 4800,
        amt: 2181,
    },
    {
        name: 'Page F',
        uv: 2390,
        pv: 3800,
        amt: 2500,
    },
    {
        name: 'Page G',
        uv: 3490,
        pv: 4300,
        amt: 2100,
    },
];
interface Props{
    pred_sa,
    pred_ed,
}

class BarChartWrapper extends  Component<Props> {

    render() {
        let data2 = calcStackedSummaryED(this.props.pred_ed,this.props.pred_sa,eventList, false )
        console.log(data2)
        return (

            <BarChart syncId="anyId"
                width={1000}
                height={500}
                data={data2}
                margin={{
                    top: 20,
                    right: 0,
                    left: 0,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                {/*<XAxis dataKey="name" angle={-45} tickMargin={75} height={200} padding='gap' />*/}
                {/*/!*<XAxis dataKey="name" />*!/*/}
                {/*<YAxis />*/}

                <XAxis dataKey="name" angle={-90} tickMargin={75} height={200} padding='gap' />
                {/*<XAxis dataKey="name" />*/}
                <YAxis />

                <Tooltip isAnimationActive={false}/>
                <Legend verticalAlign={'top'}/>
                <Bar dataKey="negative" stackId="a"  fill={d3.schemeTableau10[2]} />
                <Bar dataKey="neutral" stackId="a"   fill={d3.schemeDark2[5]} />
                <Bar dataKey="positive" stackId="a"  fill={d3.schemeTableau10[4]} />
            </BarChart>
        );
    }
}
export default BarChartWrapper;