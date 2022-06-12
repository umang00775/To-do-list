const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;
const _ = require('lodash');

app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));

mongoose.connect("mongodb+srv://admin-umang:umang319@cluster0.6firork.mongodb.net/todolistDB", {useNewUrlParser :true});

const itemSchema = new mongoose.Schema({
    name : String
});

const Item = mongoose.model("Item",itemSchema);
const item1 = new Item({
    name : "Welcome to your todo list"
});
const item2 = new Item({
    name : "click + to add an item"
});

const item3 = new Item({
    name : "<-- to delete an item"
});

const defaultItems = [item1, item2, item3];

app.get('/',(req,res)=>{

    Item.find({}, (err, foundItems)=>{

        if(foundItems.length === 0){
            Item.insertMany(defaultItems,(err)=>{
                if(err){
                    console.log("Something Went Wrong");
                }
                else{
                    console.log("Success");
                }
            });
            res.redirect('/');
        }
        else{
            res.render('list',{listTitle:"Today",newListItems: foundItems});
        }
    })

});

app.post('/',(req,res)=>{
    const itemName = String(req.body.item);
    const listName = String(req.body.list);
    const item = new Item({
        name : itemName
    });

    if(listName === "Today"){
        item.save();
        res.redirect('/');
    }
    else{
        List.findOne({name : listName},(err,foundList)=>{
            if(!err){
                foundList.items.push(item);
                foundList.save();
            }
            res.redirect("/" + listName);
        })
    }
});

app.listen(port,()=>{
    console.log(`Listening to port ${port}`);
});


app.post('/delete',(req,res)=>{
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    
    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId,(err)=>{
            if(!err){
                console.log("Deleted Successfully");
                res.redirect('/');
            }
        });
    }
    else{
        List.findOneAndUpdate({name : listName}, {$pull : {items : {_id : checkedItemId}}},(err, foundList)=>{
            if(!err){
                res.redirect("/" + listName);
            }
        })
    }
    
});

const listSchema = new mongoose.Schema({
    name : String,
    items : [itemSchema]
});

const List = mongoose.model("List", listSchema);

app.get('/:customListName',(req,res)=>{
    const customListName = _.capitalize(String(req.params.customListName));
    List.findOne({name:customListName},(err,foundList)=>{
        if(!err){
            if(!foundList){
                const list = new List({
                    name : customListName,
                    items : defaultItems
                });
                list.save();
                res.redirect('/' + customListName);
            }
            else{
                res.render('list',{listTitle:foundList.name ,newListItems:foundList.items});
            }
        }
    });
});

