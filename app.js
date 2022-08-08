const { ObjectId}=require('mongodb')
const { connectToDb,getDb}=require('./db')
const express = require('express')
require("dotenv").config()
const axios = require('axios')
const cheerio = require('cheerio')
const hostname='192.168.137.1'
const port=process.env.PORT 
//init app & middleware
const app=express()
app.use(express.json())
//db connection
let db
connectToDb((err)=>{
if(!err){

    app.listen(port , ()=>{
        console.log('app listening on port 3000')
    })
db=getDb()    
}
})

//web scraping

const url = "https://weather.com/en-IN/weather/today/l/14.68,77.59?par=google"
const attributes = []
axios(url)
    .then(res => {
        const html = res.data
        // console.log(html)
        const $ = cheerio.load(html)
        $("h3[class='Column--label--3QyFS Column--small--3yLq9']", html).each(function () {
            const time=$(this).text()
            // const temp = $(this).find('a').attr('href')
            attributes.push({
                time,
                // temp:temp
            })
        })
        console.log(attributes)
        app.post('/books/post',(req,res)=>{
            db.collection("books").insertMany(attributes, function(err, res) {
                if (err) console.log("error is appeared"+err);
                console.log("Number of documents inserted: " + res.insertedCount);
                // db.close();
              });//    res.send( collection('books').insertMany(attributes))
        })
        
    }).catch(err => console.log(err))


//routes

app.get('/books',(req,res)=>{
    let books=[]
    db.collection('books')
    .find() //cursor toArray forEach
    .sort({ya:1})
    .forEach(book=>books.push(book))
    .then(()=>{
        res.status(200).json(books)
    })    
    .catch(()=>{
        res.status(500).json({error: 'coud not fetch error'})
    })
})


app.get('/books/:id',(req,res)=>{
    if(ObjectId.isValid(req.params.id)){
    db.collection('books')
    .findOne({_id: ObjectId(req.params.id)})
    .then(doc=>{
        res.status(200).json(doc)
    })
    .catch(err=>{
        res.status(500).json({error: 'error'})
    })
}else{
    res.status(500).json({error:'erroes'})
}
})


app.post('/books',(req,res)=>{
const book=req.body

db.collection('books')
.insertOne(book)
.then(result=>{
    res.status(201).json(result)
})
.catch(err=>{
res.status(500).json({err:'could not create new doc'})
})


})


app.delete('/books/:id',(req,res)=>{
    if(ObjectId.isValid(req.params.id)){
        db.collection('books')
        .deleteOne({_id: ObjectId(req.params.id)})
        .then(doc=>{
            res.status(200).json(doc)
        })
        .catch(err=>{
            res.status(500).json({error: 'could not delete '})
        })
    }else{
        res.status(500).json({error:'not a valid id'})
    }
    
})
app.patch('/books/:id',(req,res)=>{
    const update=req.body

    if(ObjectId.isValid(req.params.id)){
        db.collection('books')
        .updateOne({_id: ObjectId(req.params.id)},{$set: update})
        .then(doc=>{
            res.status(200).json(doc)
        })
        .catch(err=>{
            res.status(500).json({error: 'could not update '})
        })
    }else{
        res.status(500).json({error:'not a valid id'})
    }
    
})