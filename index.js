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
let day = (("0"+(date.getDate())).slice(-2))
let month = (("0"+(1+date.getMonth())).slice(-2))
let year = date.getFullYear()
let reqTime = `${year}-${month}-${day}` 

app.use('/api', router.post("/create", /*cors(corsOptions),*/ async (req, res) => {
    const { name, phone, source, formid } = req.body;
    info_note = {
        name: name,
        phone: phone,
        host: source,
        blockId: formid
    };
    task_note = `Ім'я: ${info_note.name}\nТелефон: ${info_note.phone}\nHost: ${info_note.host}\nBlockID: ${info_note.blockId}`;
    createTask(info_note, task_note)
    res.status(200).json({msg: "OK"})
}));

app.use('/api', router.post("/create-calc", async (req, res) => {
    const { auto_made, auto_model, auto_year, engine, engine_size, kVt, auto_type, phone, source, formid } = req.body;
    info_note = {
        auto_made: auto_made,
        auto_model: auto_model,
        auto_year: auto_year,
        engine : engine,
        engine_size: engine_size,
        kVt: kVt,
        auto_type: auto_type,
        phone: phone,
        host: source,
        blockId: formid,
        taskCalc: "true",
    };
    task_note = 
    `Номер телефону: ${info_note.phone}
    Марка: ${info_note.auto_made}
    Модель: ${info_note.auto_model}
    Рік авто: ${info_note.auto_year}
    Тип палива: ${info_note.engine}
    Обєм Двигуна: ${info_note.engine_size}
    Кількість кіловат: ${info_note.kVt}
    Тип кузова: ${info_note.auto_type}
    Host: ${info_note.host}
    BlockID: ${info_note.blockId}`;
    createTask(info_note, task_note)
    res.status(200).json({msg: "OK"})
}))

function createTask(info_note, task_note){
    try{
        if(info_note.host == "eur1"){
            client.tasks.createTask({
                workspace: process.env.ASANA_WORKSPACE,
                projects: [config.asana.projects],
                assignee: config.asana.assignee,  
                assignee_section: config.asana.section,  
                name: `${config.asana.head} ${info_note.name}`, 
                due_on: reqTime,  
                notes: task_note})
                .catch(err => console.log("error on creating task in asana, err: ", err.value));
        }
        else if(info_note.host == "undercust"){
            client.tasks.createTask({
                workspace: process.env.ASANA_WORKSPACE,
                projects: [config.asanaCust.projects],
                assignee: config.asanaCust.assignee,  
                assignee_section: `${(info_note.taskCalc) ? config.asanaCust.sectionCalc : config.asanaCust.section}`,
                name: `${config.asanaCust.head} ${(info_note.taskCalc) ? info_note.auto_made : info_note.name}`, 
                due_on: reqTime,  
                notes: task_note})
                .catch(err => console.log("error on creating task in asana, err: ", err.value));
        }
        
    }
    catch (err) { 
        console.log(err.value);
    }
}


app.listen(port, () => {
    console.log(`App started Press Ctrl + C for stop server`);
})