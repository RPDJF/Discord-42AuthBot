// A wrapper around MongoDB to read and write data to the database
// The befenits of using wrapper is that it allows us to easily switch to another database in the future as we only need to change the implementation of the wrapper

const { MongoClient } = require('mongodb');

const username = process.env.MONGO_USERNAME;
const password = process.env.MONGO_PASSWORD;
const dbName = process.env.MONGO_DB;
const uri = process.env.MONGO_URI;

if (!username || !password || !dbName || !uri) {
    console.error('MongoDB environment variables not set');
    console.error('Please set MONGO_USERNAME, MONGO_PASSWORD, MONGO_DB, and MONGO_URI');
    process.exit(1);
}

const client = new MongoClient(uri, {
    auth: {
        username: username,
        password: password,
    }
});

let db;

async function connect() {
    if (!db) {
        try {
            await client.connect();
            db = client.db(dbName);
            console.info('Connected to MongoDB');
        } catch (err) {
            console.error('Error connecting to MongoDB');
            console.error(err);
            process.exit(err.code || 1)
        }
    }
    return db;
}

/**
 * 
 * @param {String} collectionName 
 * @param {Number} documentId 
 * @returns {Promise<Object>}
 */
async function getData(collectionName, documentId) {
    try {
        const database = await connect();
        const collection = database.collection(collectionName);
        const document = await collection.findOne({ id: documentId });
        if (!document) {
            return ({
                id: documentId,
            });
        }
        return document;
    } catch (err) {
        console.error('Error reading data');
        console.error(err);
        throw err;
    }
}

/**
 * 
 * @param {String} collectionName 
 * @param {Number} documentId 
 * @param {Object} newData 
 * @param {Boolean} merge 
 * @returns {Promise<Object>}
 */
async function writeData(collectionName, documentId, newData, merge = true) {
    try {
        const database = await connect();
        const collection = database.collection(collectionName);

        if (merge) {
            const updateResult = await collection.updateOne(
                { id: documentId },
                { $set: newData },
                { upsert: true }
            );
            return updateResult;
        } else {
            const replaceResult = await collection.replaceOne(
                { id: documentId },
                newData,
                { upsert: true }
            );
            return replaceResult;
        }
    } catch (err) {
        console.error('Error writing data');
        console.error(err);
        throw err;
    }
}

/**
 * 
 * @param {String} collectionName 
 * @param {Number} documentId 
 * @returns 
 */
async function deleteData(collectionName, documentId) {
	try {
		const database = await connect();
		const collection = database.collection(collectionName);
		const deleteResult = await collection.deleteOne({ id: documentId });
		return deleteResult;
	} catch (err) {
		console.error('Error deleting data');
		console.error(err);
		throw err;
	}
}

module.exports = {
    getData,
    writeData,
	deleteData,
};