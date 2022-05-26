import React, {Component, PureComponent} from 'react';
import * as d3 from "d3";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {calcStackedSummaryED, eventList} from "../utils/common";



interface Props{
    pred_sa,
    pred_ed,
}
const CustomizedXAxisTick = ({ x, y, payload }) => (

     // const {x, y, payload} = this.props;

         <g transform={`translate(${x},${y})`}>
         {/*<g>*/}
             <text
                 textAnchor="middle"

                 // fill="#666"
             >{payload.value.split(/\W+/ig).map(aa=>aa[0]).join('').toUpperCase()}</text>
         </g>

)

class BarChartWrapper extends  Component<Props> {

    render() {
        let data2 = calcStackedSummaryED(this.props.pred_ed,this.props.pred_sa,eventList, false )
        console.log(data2)
        return (

            <BarChart syncId="anyId"
                width={800}
                height={400}
                data={data2}
                margin={{
                    top: 20,
                    right: 20,
                    left: 0,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="5 5" />
                {/*<XAxis dataKey="name" angle={-45} tickMargin={75} height={200} padding='gap' />*/}
                {/*/!*<XAxis dataKey="name" />*!/*/}
                {/*<YAxis />*/}

                {/*<XAxis dataKey="name" allowDataOverflow={true} angle={-60} interval={0} tickMargin={25} height={100} padding='gap' />*/}
                <XAxis dataKey="name" tickMargin={25} height={100} width={2}  interval={0} tick={CustomizedXAxisTick} />
                {/*<XAxis dataKey="name" tickMargin={25} height={100} interval={0} />*/}

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