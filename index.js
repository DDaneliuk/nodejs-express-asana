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
let whitelist = []
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
let day = (("0"+(date.getDate())).slice(-2))
let month = (("0"+(1+date.getMonth())).slice(-2))
let year = date.getFullYear()
let reqTime = `${year}-${month}-${day}`

app.use('/api', router.post("/create", async (req, res) => {
    const { name, email, zip, referral } = req.body;
    console.log('req.body', req.body);

    task_note = `Name: ${name}\nEmail: ${email}\nZIP Code: ${zip}\nReferral code: ${referral}`;
    createTask(email, task_note)
    res.status(200).json({msg: "OK"})
}));

function createTask(email, task_note){
    try{
        client.tasks.createTask({
            workspace: process.env.ASANA_WORKSPACE,
            projects: [config.asana.projects],
            assignee: config.asana.assignee,
            assignee_section: config.asana.section,
            name: `${config.asana.head} ${email}`,
            notes: task_note})
          .catch(err => console.log("error on creating task in asana, err: ", err.value));
    } catch (err) {
        console.log(err.value);
    }
}


app.listen(port, () => {
    console.log(`${port} App started Press Ctrl + C for stop server`);
})
