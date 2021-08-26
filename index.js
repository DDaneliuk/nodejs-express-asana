const express = require("express");
const config = require("./config.json")
const asana = require("asana")
const bodyParser = require("body-parser")
const cors = require("cors");

const app = express();
const router = express.Router();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
// set up cors policy
app.use(cors())
let whitelist = [
    'https://tilda.cc',
    'https://forms.tildacdn.com',
    'https://stat.tildacdn.com',
    'https://tilda.cc',
    'https://tilda.cc',
    'https://eur1.com.ua/', 
    'https://undercust.com/'
] 
let corsOptions = {
    origin: function (origin, callback){
        console.log("CALLBACK ORIGIN: ", origin)
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}

const client = asana.Client.create().useAccessToken(config.asana.token)

let task_note;
let date = new Date();
let day = date.getDate()
let month = (("0"+(1+date.getMonth())).slice(-2))
let year = date.getFullYear()
let reqTime = `${year}-${month}-${day}` 

app.use('/api', router.post("/create", cors(corsOptions), async (req, res) => {
    const { name, phone, host, formid } = req.body;
    task_note = {
        name: name,
        phone: phone,
        host: host,
        blockId: formid
    };
    createTask(task_note)
    res.status(200).json({msg: "OK"})
}));

function createTask(task_note){
    try{
        client.tasks.createTask({
            workspace: process.env.ASANA_WORKSPACE,
            projects: [config.asana.projects],
            assignee: config.asana.assignee,  
            section: config.asana.section,  
            name: `${config.asana.head} ${task_note.name}`, 
            due_on: reqTime,  
            notes: `Ім'я: ${task_note.name}\nТелефон: ${task_note.phone}\nHost: ${task_note.host}\nBlockID: ${task_note.blockId}`})
            .catch(err => console.log("error on creating task in asana, err: ", err));
    }
    catch (err) { 
        console.log(err);
    }
}


app.listen(port, () => {
    console.log(`App started Press Ctrl + C for stop server`);
})