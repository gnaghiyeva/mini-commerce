const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const uuid = require('uuid')
const fs = require('fs')
const multer = require('multer')
const cors = require('cors')
const mongoose = require('mongoose')
const dotenv = require('dotenv')


app.use(bodyParser.json())



const DIR = './uploads/';
app.use('/uploads', express.static('uploads'))
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        const fileName = file.originalname.toLowerCase().split(' ').join('-');
        cb(null, uuid.v4() + '-' + fileName)
    }
});

var upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
});
dotenv.config()
app.use(cors())

const CommerceSchema = new mongoose.Schema({
    imageURL:String,
    name:String,
    
})
const CommerceModel = mongoose.model('CommerceModel', CommerceSchema)

//post
app.post('/api/commerces', upload.single('image'), async (req,res)=>{
    const url = req.protocol + '://' + req.get('host');
    const newModel = new CommerceModel({
      imageURL: url + '/uploads/' + req.file.filename,
      name:req.body.name,
    })
    await newModel.save()
    res.status(201).send("model created succesfully")
  })


  app.get("/api/commerces", async(req,res)=>{
    const {name}=req.query
    const allModels = await CommerceModel.find();
    if(name===undefined){
      res.status(200).send({
        data:allModels,
        message:"data get success!"
      })
    }
    else{
      res.status(200).send({
        data: allModels.filter((x)=>x.name.toLowerCase().trim().includes(name.toLowerCase().trim())),
        message:"data get success!"
      })
    }
  })

  app.get('/api/commerces/:id',(req,res)=>{
    const id = req.params.id
     
    CommerceModel.findById(id).then((model)=>{
      res.status(200).send({
        data:model,
        message:'data get  success'
      })
  
    }).catch((err)=>{
      res.send('data not found')
    })
   
  
  })

  app.delete("/api/commerces/:id", async(req,res)=>{
    const id = req.params.id;
  
    const deletedModel = await CommerceModel.findByIdAndDelete(id)
    const idx = deletedModel.image.indexOf("uploads/")
    const imageName = deletedModel.image.substr(idx)
    fs.unlinkSync('./'+imageName)
    if(deletedModel==undefined){
      res.status(204).send("data not found")
    }
    else{
      res.status(200).send({
        data:deletedModel,
        message:'data deleted succesfully'
      })
    }
  })
  
  app.put("/api/commerces/:id", async(req,res)=>{
    const id = req.params.id;
    const {imageURL,name} = req.body
    const existedModel = await CommerceModel.findByIdAndUpdate(id,{imageURL:imageURL, name:name})
    
    const idx = existedModel.image.indexOf("uploads/")
    const imageName = existedModel.image.substr(idx)
    fs.unlinkSync('./'+imageName)
    if(existedModel==undefined){
      res.status(204).send('data not found')
    }
    else{
      res.status(200).send('data edited succesfuly')
    }
  })
  
DB_CONNECTION = process.env.DB_CONNECTION
DB_PASSWORD = process.env.DB_PASSWORD
mongoose.connect(DB_CONNECTION.replace("<password>", DB_PASSWORD)).then(()=>{
    console.log('MongoDB Connected!')
})


PORT = process.env.PORT
app.get('/api', (req, res) => {
  res.send('Hello E-commerse!')
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})