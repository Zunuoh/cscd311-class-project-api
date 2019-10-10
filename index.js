let express = require('express');
const path = require('path');
let app = express();
const bcrypt = require('bcrypt');


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

 let mongoose = require('mongoose');
 let bodyparser = require('body-parser');
 app.use(bodyparser.urlencoded({
     extended : true
 }));

// connecting to the db
let url = 'mongodb://localhost:27017/hallRegistration';
mongoose.connect(url, {useNewUrlParserc:true}, ( err)=>{
    if (err){
        console.log('Error connecting to db' +err)
    }
    else{
        console.log('Db connected successfully');
    }
})

// creating the schema
let newSchema = new mongoose.Schema({
   name: String,
   id: String,
   gender: String,
   pin: String,
   level: String,
   age: String,
});

let secSchema = new mongoose.Schema({
    hallName: String,
    room: String
});

// modelling the schema 
let Student = mongoose.model('hall', newSchema);
let Residence = mongoose.model('residence', secSchema);

app.get("/", (req,res) => {
    res.render('index', {
        viewTitle : "Welcome"
    });
});

app.get("/register", (req, res) => {
    res.render("reg")
});

app.get("/signin", (req, res) =>{
    res.render("signin")
})

app.get("/save", (req, res)=>{
    res.render("save")
})

app.post("/register", (req, res)=>{
    // console.log(req.body);
    let student = new Student();
    student.name = req.body.regName;
    student.id = req.body.regID;
    student.gender = req.body.regGender;
    student.pin = req.body.regPIN;
    student.level = req.body.regLevel;
    student.age = req.body.regAge;
    bcrypt.genSalt(10, function(err, salt){
        bcrypt.hash(student.pin, salt, function(err, hash){
            student.pin = hash;
            student.save((err, docs) =>{
                if(err)throw err;
                res.redirect("/save");
            })
        })
    });
    
    });
 


app.post("/save", (req,res) =>{
    console.log(req.body);
    let residence = new Residence();
    residence.hallName = req.body.hallSelc;
    residence.room = req.body.roomSel;
    residence.save((err, docs) =>{
        if(err)throw err;
        res.redirect("/display")
    });
    // res.send(req.body);
    
});

app.post("/signin", async(req,res)=>{
    try{
        const student = await Student.findOne({id:req.body.regID});
        bcrypt.compare(req.body.regPIN, student.pin, (err, isMatch)=>{
            if(isMatch){
                res.redirect("/display")
            }
            else{
                res.send("okay")
            }
        }); 
    } catch(err){
        console.log("lost");
    }
})

app.get("/display", (req,res)=>{
    res.render("display")
});







app.listen(4000, (err) => {
    if(err){
    console.log("server error");
    }else{
        console.log("server up");
    }
});