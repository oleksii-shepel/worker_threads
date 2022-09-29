const express = require('express');
const bodyParser = require('body-parser');
const util = require("util");
const dotenv = require("dotenv");

dotenv.config({ path: './config.env' });


const {Worker} = require("worker_threads");

const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let ticket = 0;
let tasks = [];

const runService = (workerData) => {
    return new Promise((resolve, reject) => {
        const worker = new Worker('./worker.js', workerData);
        
        worker.once("message", (workerData) => {
            console.log(`Fibonacci Number: ${workerData.result}`);
            let index = tasks.findIndex(w => w.workerData.ticket == workerData.ticket);
            if(index < 0) {
                reject(new Error("Task not found."));   
            }
            tasks[index].workerData = workerData;
            resolve(workerData);
        });
          
        worker.on("error", error => {
            console.log(error);
            reject(error);
        });
    
        worker.on('exit', (code) => {
        if (code !== 0)
            reject(new Error(`stopped with  ${code} exit code`));
        })
    })
}

app.post('/input', async (req, res) => {
    const { number } = req.body;
    
    ticket++;
    let workerData = {ticket, num: +number, result: 0n};
    
    tasks.push({workerData, promise: runService({workerData})});
    res.status(200).json({ ticket: ticket.toString() })
});

app.get('/output', async (req, res) => {
    const { ticket } = req.query;
    let task = tasks.find(a => a.workerData.ticket == ticket);
    if(!task || util.inspect(task.promise).includes("pending")){
        res.status(404).json({ error: "not found" })
    }
    else {
        res.status(200).json({ Fibonacci: task.workerData.result.toString() });
    }
});

let port = +(process.env.PORT);

app.listen(port, () => {
    console.log("Server is running on port", port)
})