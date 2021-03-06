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
    header = header.splice(1, header.length - 1);
    let array = [header];
    for(let i = 0; i < data.length; i++){
        let row = [];
        for(let j = 0; j < header.length; j++){
            if(typeof data[i][header[j]] == 'object' || typeof data[i][header[j]] == 'array'){
                let string = '';
                for(let key2 in data[i][header[j]]){
                    string += data[i][header[j]][key2]
                    if(key2 != Object.keys(data[i][header[j]]).length - 1){
                        string += ';'
                    }
                }
                row.push(string)
            }else{
                row.push(data[i][header[j]])
            }
        }
        array.push(row)
    }
    return array
}
function convert2CSV(data){
    let csv = '';
    for(let i = 0; i < data.length; i++){
        let line = ''
        for(let key in data[i]){
            // if data[i][key] is object then convert to string multi-line
            if(typeof data[i][key] == 'object' || typeof data[i][key] == 'array'){
                let string = '';
                for(let key2 in data[i][key]){
                    string += data[i][key][key2]
                    if(key2 != Object.keys(data[i][key]).length - 1){
                        string += ' \r\n'
                    }
                }
                line += string
                if (key != Object.keys(data[i]).length - 1){
                    line += '\n'
                }
            }else{
                line += data[i][key]
                if (key != Object.keys(data[i]).length - 1){
                    line += ','
                }
            }
        }
        csv += line
        if (i != data.length - 1){
            csv += '\n'
        }
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