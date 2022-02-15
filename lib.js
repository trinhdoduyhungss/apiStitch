const {MongoClient} = require('mongodb');
const uri = 'mongodb+srv://dev_phongnt:dataversion123@fdvc.tlxdu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
const client = new MongoClient(uri);
async function listDatabases(client){
    let databasesList = await client.db().admin().listDatabases();
    let databasesListNames = databasesList.databases.map(db => db.name);
    return databasesListNames;
};
async function getPatternData() {
    try {
        await client.connect();
        let databasesListNames = await listDatabases(client);
        let collectionListNames = await Promise.all(databasesListNames.map(async (nameDatabase) =>  await client.db(nameDatabase).listCollections().toArray().then(collections => {
                if(nameDatabase != 'admin' && nameDatabase != 'local'){
                    let listName = collections.map(collection => collection.name);
                    return listName
                }else{
                    return []
                }
            })

        ))
        return [databasesListNames, collectionListNames]
    } catch (e) {
        console.error(e);
    }
    finally {
        console.log('closing connection');
        await client.close();
    }
}
async function getDataByQuery(databaseName, collectionName, query){
    try {
        await client.connect();
        let data = await client.db(databaseName).collection(collectionName).find(query).toArray();
        return data
    } catch (e) {
        console.error(e);
    }
    finally {
        console.log('closing connection');
        await client.close();
    }
}
function convertJson2Array(data){
    let header = Object.keys(data[0]);
    let array = [header];
    for(let i = 0; i < data.length; i++){
        let row = [];
        for(let j = 0; j < header.length; j++){
            row.push(data[i][header[j]])
        }
        array.push(row)
    }
    return array
}
function convert2CSV(data){
    let csv = '';
    for(let i = 1; i < data.length; i++){
        for(let key in data[i]){
            // if data[i][key] is object then convert to string multi-line
            if(typeof data[i][key] == 'object' || typeof data[i][key] == 'array'){
                let string = '';
                for(let key2 in data[i][key]){
                    string += data[i][key][key2] + '\n'
                }
                csv += string + ','
            }else{
                csv += data[i][key] + ','
            }
        }
        csv += '\n'
    }
    return csv
}
async function getAllData(databaseName,collectionName){
    try {
        await client.connect();
        // limit 200 documents
        let data = await client.db(databaseName).collection(collectionName).find().limit(200).toArray();
        return data
    } catch (e) {
        console.error(e);
    }
    finally {
        console.log('closing connection');
        await client.close();
    }
}
async function addData(databaseName, collectionName, data){
    try {
        await client.connect();
        await client.db(databaseName).collection(collectionName).insertOne(data);
        return 'success'
    } catch (e) {
        console.error(e);
    }
    finally {
        console.log('closing connection');
        await client.close();
    }
}
module.exports = {
    getPatternData,
    convert2CSV,
    getDataByQuery,
    getAllData,
    addData,
    convertJson2Array
}