//jshint esversion:6
// to comment all (1st select all and 2nd ctrl+/)
// require  npm modules 
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _ =require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set('strictQuery', true);
//mongoose connection to mongodb
const uri=process.env.MONGO_KEY;
mongoose.connect(uri,{useNewUrlParser:true});

const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
});
//mongoose.connect(process.env.MONGO_URL);
//schema for model/collection/table created
const itemsSchema={
   name:String
};
//creating the model
const Item=mongoose.model("Item",itemsSchema);
//creating the documents or objects that stored in model
const item1=new Item({
  name:"welcome to do list"
});
const item2=new Item({
  name:"type in todolist"
});
const item3=new Item({
  name:"add in todolist"
});
//putting all docs in an array
const defaultItem=[item1,item2,item3];

//customlist schema
const customlistSchema={
  name:String,
  items:[itemsSchema]
}
const List=mongoose.model("List",customlistSchema);



// using get method find the port 3000 and render the ejs file.

app.get("/", function(req, res) {
  // using model.find() to find all
 Item.find({},function(err,foundeditems){
  if (foundeditems.length===0){
    Item.insertMany(defaultItem,function(err){
      if (err){
        console.log("err")
      }
      else{
        console.log("success saved in mongodb");
      }
    }); 
    res.redirect("/");
  }
  else{
    res.render("list", {listTitle:"Today", newListItems:foundeditems});
  }
 });
});




app.get("/:customList", function(req, res) {
  const customListName=_.capitalize(req.params.customList);
  List.findOne({name:customListName},function(err,foundedlist){
    if(!err){
      if(!foundedlist){
      const list=new List({
        name:customListName,
        items:defaultItem
      });
      list.save();
      res.redirect("/"+ customListName);
    }
    else{
      res.render("list", {listTitle:customListName, newListItems:foundedlist.items});
    }
  }
  });

 
  

});


// post request from home route
app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName=req.body.list;
  //creating new item for itemmodel and save it in db
   const item=new Item({
    name:itemName
  });
  if(listName==="Today"){
    item.save();
    res.redirect("/");}
    else{
      List.findOne({name:listName},function(err,foundedlistitems){
        foundedlistitems.items.push(item);
        foundedlistitems.save();
       res.redirect("/"+listName);
      });
    }

});

//delete items in Item model or collection
app.post("/delete", function(req, res){
  const idOfCheckbox = req.body.checkbox;
  const listname=req.body.listname;
  //delete  item 
 // console.log(idOfCheckbox);
 if(listname==="Today"){
  Item.findByIdAndRemove(idOfCheckbox,function(err){
    if(!err){
      console.log("successfully removed");
      res.redirect("/");
            }
  }); 
}
else{
  List.findOneAndUpdate({name:listname},{$pull:{items:{_id:idOfCheckbox}}},function(err,foundedlistitems){
    if(!err){
      console.log("success delete of custom list item");
      res.redirect("/"+listname);
    }

  });
}
 
});



app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

let port=process.env.PORT;
if (port==null || port ==""){
  port=3000;
}
app.listen(port, function() {
  console.log("Server started on port 3000");
});
