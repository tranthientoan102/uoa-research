import React, { Component } from "react";
import * as d3 from "d3";
import { positionTranslate } from "../utils/svgCommon";

interface Props {
    data,
    innerRadius,
    outerRadius,
    width,
    height,
}

const Arc = ({ data, index, createArc, colors, format }) => (
    <g key={index} className="arc">
        <path className="arc" d={createArc(data)}
            // fill={colors(index / 2 + 0.2)}
            fill={colors[index * 2]}
            strokeWidth="3" strokeLinejoin="round" stroke="#000000"
        />
        {/* <text
            transform={`translate(${createArc
                .centroid(data)
                .map((c) => (c * 5) / 3)})`}
            textAnchor="middle"
            dominantBaseline="after-edge"
            fill="black"
            fontSize="15"
        >
            {data.toString()}-{format(data.value)}
        </text> */}
    </g>
);
const ArcText = ({ data, index, createArc, colors, format }) => (
    <g key={index} className="arc">
        <text
            transform={`translate(${createArc
                .centroid(data)
                .map((c) => (c * 4.5) / 3)
                })`}
            textAnchor="middle"
            dominantBaseline="after-edge"
            fill={colors[index * 2 + 1]}
            fontSize="15"
        >
            {data.value > 0 ? `${data.data.name}` : ''}
        </text>
        <text
            transform={`translate(
                ${positionTranslate(createArc
                .centroid(data)
                .map((c) => (c * 4.5) / 3)
                , [0, -17])
                // .map((c) => ${c.x} ${c.y - 10} `)
                })`}
            textAnchor="middle"
            dominantBaseline="after-edge"
            fill={colors[index * 2 + 1]}
            fontSize="15"
        >
            {data.value > 0 ? `${format(data.value * 100)}%` : ''}
        </text>
    </g>
);

class Pie2 extends Component<Props> {
    createPie = d3
        .pie()
        .value((d) => d.value)
        .sort(null);

    createArc = d3
        .arc()
        .innerRadius(this.props.innerRadius)
        .outerRadius(this.props.outerRadius);
    // const colors = d3.scaleOrdinal(d3.schemeCategory10);
    // colors = d3.scaleOrdinal(d3.interpolateRdYlGn);
    // colors = d3.interpolateRdYlGn
    colors = [
        // d3.schemeTableau10[2], d3.schemePastel1[0]
        // , d3.schemeDark2[5], d3.schemePastel1[4]
        // , d3.schemeTableau10[4], d3.schemePastel1[2]
        d3.schemeTableau10[2], '#fff'
        , d3.schemeDark2[5], '#fff'
        , d3.schemeTableau10[4], '#fff'
    ]

    format = d3.format(".2f");
    data = this.createPie(this.props.data);


    render() {
        console.log(`Pie2::render`)

        console.log(this.colors)
        this.data.map((d, i) => { console.log(`d=${JSON.stringify(d)}, i=${i}`) })


        return (
            <svg
                width={this.props.width * 1.1}
                height={this.props.height * 1.1}
                style={{ margin: "10px", alignContent: "center" }}
            >
                <g
                    transform={`translate(${this.props.outerRadius * 1.1} ${this.props.outerRadius + 10})`}
                    style={{ padding: "10px", alignContent: "center" }}
                >
                    {this.data.map((d, i) => (
                        <Arc
                            key={i}
                            data={d}
                            index={i}
                            createArc={this.createArc}
                            colors={this.colors}
                            format={this.format}
                        />
                    ))}
                    {this.data.map((d, i) => (
                        <ArcText
                            key={i}
                            data={d}
                            index={i}
                            createArc={this.createArc}
                            colors={this.colors}
                            format={this.format}
                        />
                    ))}
                </g>
            </svg>
        );
    }
}

export default Pie2;
