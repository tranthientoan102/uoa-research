// const {host_scrapper, port_scrapper} = require("./src/utils/db");
module.exports = {
    reactStrictMode: false,
    serverRuntimeConfig: {
        // Will only be available on the server side
        mySecret: 'secret',
        secondSecret: process.env.SECOND_SECRET, // Pass through env variables
    },
    publicRuntimeConfig: {

    }
}
