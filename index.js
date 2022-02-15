// create a rest api for stitch
const lib = require('./lib');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.set('port', (process.env.PORT || 3333));
app.use(function (req, res, next) { //allow cross origin requests
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
	res.header("Access-Control-Max-Age", "3600");
	res.header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
	next();
});
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.get('/', (req, res) => {
    res.send('<h1> Hello World! </h1>');
})
app.get('/getPatternData', async (req, res) => {
    let data = await lib.getPatternData();
    res.send(JSON.stringify({'data':{'databasesListNames':data[0], 'collectionListNames':data[1]}}))
})
app.get('/getDataByQuery', async (req, res) => {
    let data = await lib.getDataByQuery(req.query.databaseName, req.query.collectionName, req.query.query);
    res.send(JSON.stringify({'data':data}))
})
app.get('/getAllData', async (req, res) => {
    let data = await lib.getAllData(req.query.databaseName, req.query.collectionName);
    res.send(JSON.stringify({'data':data}))
})
app.get('/convert2CSV', async (req, res) => {
    let data = await lib.convert2CSV(req.query.data);
    res.send(JSON.stringify({'data':data}))
})
app.get('/addData', async (req, res) => {
    let data = await lib.addData(req.query.databaseName, req.query.collectionName, req.query.data);
    res.send(JSON.stringify({'data':data}))
})
app.listen(app.get('port'), function () {
    console.log("running: port", app.get('port'))
})
