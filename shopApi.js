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
var port = process.env.PORT || 2410;
app.listen(port, () => console.log(`Node app listen port ${port}!`))

const { Client } = require("pg")
const client = new Client({
   user: "postgres",
   password: "@shop_DB#7897",
   database: "postgres",
   port: "5432",
   host: "db.hrhgjuwnrcauhlxqcbmz.supabase.co",
   ssl: { rejectUnauthorized: false }
})
client.connect(function (res, err) {
   console.log('Connected!!!')
})


app.get("/shops", function (req, res) {
   let sql = "SELECT*FROM shops"
   client.query(sql, function (err, result) {
      if (err) res.status(404).send(err.message)
      else {
         res.send(result)
      }
   })
})


app.post("/shops", function (req, res) {
   let body = req.body
   let sql = `INSERT INTO shops("name","rent") VALUES ($1,$2)`
   let shop = [body.name, body.rent]
   client.query(sql, shop, function (err, result) {
      if (err) res.status(404).send(err)
      else res.send(`${result.rowCount} insertion Successfully`)
   })
})


app.get("/products", function (req, res) {
   let sql = "SELECT*FROM products"
   client.query(sql, function (err, result) {
      if (err) res.status(404).send(err.message)
      else {
         res.send(result)
      }
   })
})


app.get("/products/:id", function (req, res) {
   let id=req.params.id
   let sql = `select*from products where "productId"=$1`
   client.query(sql,[id], function (err, result) {
      if (err) res.status(404).send(err.message)
      else {
         res.send(result)
      }
   })
})



app.post("/products", function (req, res,next) {
   let product = Object.values(req.body)
   let sql = `INSERT INTO products("productName","category","description") VALUES ($1,$2,$3)`
   client.query(sql, product, function (err, result) {
      if (err) res.status(404).send(err)
      else res.send(`${result.rowCount} insertion Successfully`)
   })
})
 
app.put("/products/:id", function (req, res, next) {
   let id = req.params.id;
   let body = { ...req.body, }
   let value = Object.values(body)
   const query = 'UPDATE products SET "productName"=$2,"category"=$3,"description"=$4 WHERE "productId"=$1'
   client.query(query, value, function (err, result) {
      if (err) {
         res.status(400).send(err)
      }else res.send(`${result.rowCount} updation successful`)
   })
})


app.get("/purchases", function (req, res) {
   let shop = req.query.shop
   let product = req.query.product
   let sort = req.query.sort
   let s1 = sort ? sort.includes('Asc') ? 'asc' : 'desc' : ''
   let s2 = sort ? sort.includes('Qty') ? 'quantity' : 'quantity*price' : ''
   let s3 =  s2 + ' ' + s1
   let v1 =  sort?`order by ${s3}`:''
   let search = this.makeSearchStr(shop, product)
   let final=search?' Where '+`${search} `+` ${v1}`:`${v1}`
   let sql = `SELECT*FROM purchases ${final} `
   client.query(sql, function (err, result) {
      if (err) res.status(404).send(err.message)
      else {
         res.send(result)
      }
   })
})

   

makeSearchStr = (shop='', product='') => {          
            let search = ''
            search = addToQuery(search, shop, 'shopid')
            search = addToQuery(search, product, 'productid')
            return search
}

addToQuery = (search, value, name) =>
   value ?
      search ?
         `${search} AND ${name} IN (${value})`
         : `${name} IN (${value})`
      : search


app.post("/purchases", function (req, res) {
   let value = Object.values(req.body)
   let sql = `INSERT INTO purchases(shopid,productid,quantity,price) VALUES ($1,$2,$3,$4)`
   client.query(sql, value, function (err, result) {
      if (err) res.status(404).send(err)
      else res.send(result)
   })
})


app.get("/purchases/shops/:id", function (req, res) {
   let id = req.params.id
   let sql = "SELECT*FROM purchases WHERE shopId=$1"
   client.query(sql, [id], function (err, result) {
      if (err) res.status(404).send(err.message)
      else {
         res.send(result)
      }
   })
})

app.get("/purchases/products/:id", function (req, res) {
   let id = req.params.id
   let sql = "SELECT*FROM purchases WHERE productid=$1"
   client.query(sql, [id], function (err, result) {
      if (err) res.status(404).send(err.message)
      else {
         res.send(result)
      }
   })
})




app.get("/totalPurchases/shops/:id",function(req,res){
   let id=req.params.id;
   let sql=`SELECT productid, SUM(quantity) FROM purchases WHERE shopid=$1 GROUP BY productid`
   client.query(sql,[id],function(err,result){
      if(err) res.status(400).send(err.message)
      else res.send(result)
   })
})


app.get("/totalPurchases/product/:id",function(req,res){
   let id=req.params.id;
   let sql=`SELECT shopid, SUM(quantity) FROM purchases WHERE productid=$1 GROUP BY shopid`
   client.query(sql,[id],function(err,result){
      if(err) res.status(400).send(err.message)
      else res.send(result)
   })
})

