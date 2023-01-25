const express = require("express")
const app = express()

const delay = process.env.DELAY || '1000'
const limit = process.env.LIMIT || '30'



let connections = []

app.get("/date", (req, res, next) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8")
    res.setHeader("Transfer-Encoding", "chunked")
    connections.push(res)
})

let tick = 0

setTimeout(function run() {
    const utcStr = new Date().toUTCString();
    console.log(utcStr, tick)
    if (++tick > limit) {
        connections.map((res) => {
            res.write(`Completion time ${utcStr}`)
            res.end()
        })
        // connections = []
        // tick = 0
    } else {
        // connections.map(res => {
        //     res.write(`Current time ${utcStr}`)
        // })
        setTimeout(run, delay)
    }
}, delay);

module.exports = app