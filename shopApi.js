var express = require("express");
var app = express();
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
    res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD"
  );
  next();
});
const port = 2410;
app.listen(port,()=>console.log(`Node app listen port ${port}!`))

const {Client}=require ("pg")
const client=new Client({
   user:"postgres",
   password:"@shop_DB#7897",
   database:"postgres",
   port:"5432",
   host:"db.hrhgjuwnrcauhlxqcbmz.supabase.co",
   ssl:{rejectUnauthorized:false}
})
client.connect(function (res,err){
   console.log('Connected!!!')
})


app.get("/shops",function(req,res){
   let sql="SELECT*FROM shops"
   client.query(sql,function(err,result){
      if(err) res.status(404).send(err.message)
      else {
      res.send(result)
   }
   })
})


app.post("/shops",function(req,res){
   let body=req.body
   let sql=`INSERT INTO shops(name,rent) VALUES ($1,$2)`
   let shop=[body.name,body.rent]
   client.query(sql,shop,function(err,result){
      if(err) res.status(404).send(err)
      else res.send(`${result.rowCount} insertion Successfully`)
   })
})


app.get("/products",function(req,res){
   let sql="SELECT*FROM products"
   client.query(sql,function(err,result){
      if(err) res.status(404).send(err.message)
      else {
      res.send(result)
   }
   })
})


app.post("/products",function(req,res){
   let body=req.body
   let sql=`INSERT INTO products(productName,category,description) VALUES ($1,$2,$3)`
   let product=[body.productName,body.category,body.description]

   client.query(sql,product,function(err,result){
      // console.log(sql)
      if(err) res.status(404).send(err)
      else res.send(`${result.rowCount} insertion Successfully`)
   })
})

app.put("/products/:id",function(req,res,next){
   let id=req.params.id;
   let body={...req.body,id:id}
   let value=Object.values(body)
   const query='UPDATE products SET productName=$1,category=$2,description=$3 WHERE productId=$4'
   client.query(query,value,function(err,result){
      if(err) res.status(400).send(err)
      else res.send(`${result.rowCount} updation successful`)
   })

})


app.get("/purchases",function(req,res){
   let shop=req.query.shop
   let product=req.query.product
   let sort=req.query.sort
   let search=this.makeSearchStr(shop,product,sort)
   let sql=`SELECT*FROM purchases WHERE $1`
   client.query(sql,[search],function(err,result){
      if(err) res.status(404).send(err.message)
      else {
         res.send(`${result.rowCount} insertion Successfully`)
      }
   })
})

makeSearchStr=(shop,product,sort)=>{
   let search=''
search=addToQuery(search,shop,'shopId')
search=addToQuery(search,product,'productid')
search=addToQuerySort(search,sort)
return search
}

addToQuery=(search,value,name)=>
   value?
   search?
        `${search} AND ${name}=${value}`
        :`${name}=${value}`
      :search

      addToQuerySort=(search,value)=>{
         let s1=value?value.includes('ASC')?'ASC':'DESC':''
         let s2=value?value.includes('QTY')?'Quantity':'Value':''
         let s3=s2+' '+s1
         let v1=value? search? `${search} AND ORDER BY ${s3}`:`ORDER BY ${s3}`:search
    return (v1)
      }

app.post("/purchases",function(req,res){
   let value=Object.values(req.body)
   let sql=`INSERT INTO purchases(shopId,productid,quantity,price) VALUES ($1,$2,$3,$4)`
   client.query(sql,value,function(err,result){
      if(err) res.status(404).send(err)
      else res.send(result)
   })
})


app.get("/purchases/shops/:id",function(req,res){
   let id=req.params.id
   let sql="SELECT*FROM purchases WHERE shopId=$1"
   client.query(sql,[id],function(err,result){
      if(err) res.status(404).send(err.message)
      else {
      res.send(result)
   }
   })
})

app.get("/purchases/products/:id",function(req,res){
   let id=req.params.id
   let sql="SELECT*FROM purchases WHERE productid=$1"
   client.query(sql,[id],function(err,result){
      if(err) res.status(404).send(err.message)
      else {
      res.send(result)
   }
   })
})

