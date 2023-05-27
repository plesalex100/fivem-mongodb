const { MongoClient } = require("mongodb");
const utils = require("./utils");

const url = GetConvar("mongodb_url", "changeme");
const dbName = GetConvar("mongodb_database", "changeme");

let db;

if (url != "changeme" && dbName != "changeme") {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
        if (err) return print("Error: " + err.message);
        db = client.db(dbName);

        console.log(`^2[MongoDB] Connected to database "${dbName}".^0`);
        emit("onDatabaseConnect", dbName);
    });
} else {
    if (url == "changeme") console.log(`^1[MongoDB][ERROR] Convar "mongodb_url" not set^0`);
    if (dbName == "changeme") console.log(`^1[MongoDB][ERROR] Convar "mongodb_database" not set^0`);
}

function checkDatabaseReady() {
    if (!db) {
        console.log(`[MongoDB][ERROR] Database is not connected.`);
        return false;
    }
    return true;
}

function checkParams(params) {
    return params !== null && typeof params === 'object';
}

function getParamsCollection(params) {
    if (!params.collection) return;
    return db.collection(params.collection)
}

/* MongoDB methods wrappers */

/**
 * MongoDB insert method
 * @param {Object} params - Params object
 * @param {Array}  params.documents - An array of documents to insert.
 * @param {Object} params.options - Options passed to insert.
 */
function dbInsert(params, callback) {
    if (!checkDatabaseReady()) return;
    if (!checkParams(params)) return console.log(`^1[MongoDB][ERROR] (exports.insert) Invalid params object.^0`);

    let collection = getParamsCollection(params);
    if (!collection) return console.log(`^1[MongoDB][ERROR] (exports.insert) Invalid collection "${params.collection}"^0`);

    let documents = params.documents;
    if (!documents || !Array.isArray(documents))
        return console.log(`^1[MongoDB][ERROR] (exports.insert) Invalid 'params.documents' value. Expected object or array of objects.^0`);

    const options = utils.safeObjectArgument(params.options);

    collection.insertMany(documents, options, (err, result) => {
        if (err) {
            console.log(`^1[MongoDB][ERROR] (exports.insert) Error "${err.message}".^0`);
            //utils.safeCallback(callback, false, err.message);
            return;
        }
        let arrayOfIds = [];
        // Convert object to an array
        for (let key in result.insertedIds) {
            if (result.insertedIds.hasOwnProperty(key)) {
                arrayOfIds[parseInt(key)] = result.insertedIds[key].toString();
            }
        }
        utils.safeCallback(callback, true, result.insertedCount, arrayOfIds);
    });
    process._tickCallback();
}

/**
 * MongoDB insertOne method
 * @param {Object} params - Params object
 * @param {Object} params.document - The object to insert.
 * @param {Object} params.options - Options passed to insert.
 */
async function dbInsertOne(params, callback) {
    if (!checkDatabaseReady()) return;
    if (!checkParams(params)) return console.log(`^1[MongoDB][ERROR] (exports.insertOne) Invalid params object.^0`);

    const collection = getParamsCollection(params);
    if (!collection) return console.log(`^1[MongoDB][ERROR] (exports.insertOne) Invalid collection "${params.collection}"^0`);

    const doc = utils.safeObjectArgument(params.document);
    const options = utils.safeObjectArgument(params.options);

    try {
        const result = await collection.insertOne(doc, options);
        if(callback) utils.safeCallback(callback, true, result.insertedId);
        return result.insertedId;
    } catch(err) {
        console.log(`^1[MongoDB][ERROR] (exports.insertOne) ${err}^0`);
        return false;
    }    
}

/**
 * MongoDB find method
 * @param {Object} params - Params object
 * @param {Object} params.query - Query object.
 * @param {Object} params.options - Options passed to insert.
 * @param {number} params.limit - Limit documents count.
 */
async function dbFind(params, callback, returnError = false) {
    if (!checkDatabaseReady()) return;
    if (!checkParams(params)) return console.log(`^1[MongoDB][ERROR] (exports.find) Invalid params object.^0`);

    let collection = getParamsCollection(params);
    if (!collection) return console.log(`^1[MongoDB][ERROR] (exports.find) Invalid collection "${params.collection}"^0`);

    const query = utils.safeObjectArgument(params.query);
    const options = utils.safeObjectArgument(params.options);

    let cursor = collection.find(query, options);
    if (params.limit) cursor = cursor.limit(params.limit);
    const allValues = await cursor.toArray();
    cursor.toArray((err, documents) => {
        if (err) {
            console.log(`^1[MongoDB][ERROR] (exports.find) Error "${err.message}".^0`);
            if (returnError) {
                utils.safeCallback(callback, false, err.message);
            }
            return;
        };
        utils.safeCallback(callback, true, utils.exportDocuments(documents));
    });
    process._tickCallback();
    return allValues;
}

/**
 * MongoDB findOne method
 * @param {Object} params - Params object
 * @param {Object} params.query - Query object.
 * @param {Object} params.options - Options passed to insert.
 */
async function dbFindOne(params, callback) {
    if (!checkDatabaseReady()) return;
    if (!checkParams(params)) return console.log(`^1[MongoDB][ERROR] (exports.findOne) Invalid params object.^0`);

    const collection = getParamsCollection(params);
    if (!collection) return console.log(`^1[MongoDB][ERROR] (exports.findOne) Invalid collection "${params.collection}"^0`);

    const query = utils.safeObjectArgument(params.query);
    const options = utils.safeObjectArgument(params.options);

    try {
        const result = await collection.findOne(query, options);
        if(callback) utils.safeCallback(callback, true, [result]);
        return result;
    } catch(err) {
        console.log(`^1[MongoDB][ERROR] (exports.findOne) ${err}^0`);
        return false;
    }
    process._tickCallback();
}

/**
 * MongoDB update method
 * @param {Object} params - Params object
 * @param {Object} params.query - Filter query object.
 * @param {Object} params.update - Update query object.
 * @param {Object} params.options - Options passed to insert.
 */
function dbUpdate(params, callback, isUpdateOne) {
    if (!checkDatabaseReady()) return;
    if (!checkParams(params)) return console.log(`^1[MongoDB][ERROR] (exports.update) Invalid params object.^0`);

    let collection = getParamsCollection(params);
    if (!collection) return console.log(`^1[MongoDB][ERROR] (exports.insert) Invalid collection "${params.collection}"^0`);

    const query = utils.safeObjectArgument(params.query);
    const update = params.pipeline || utils.safeObjectArgument(params.update);
    const options = utils.safeObjectArgument(params.options);

    const cb = (err, res) => {
        if (err) {
            console.log(`^1[MongoDB][ERROR] (exports.update) ${err.message}^0`);
            //utils.safeCallback(callback, false, err.message);
            return;
        }
        utils.safeCallback(callback, true, res.result.nModified);
    };
    isUpdateOne ? collection.updateOne(query, update, options, cb) : collection.updateMany(query, update, options, cb);
    process._tickCallback();
}

/**
 * MongoDB count method
 * @param {Object} params - Params object
 * @param {Object} params.query - Query object.
 * @param {Object} params.options - Options passed to insert.
 */
async function dbCount(params, callback) {
    if (!checkDatabaseReady()) return;
    if (!checkParams(params)) return console.log(`^1[MongoDB][ERROR] (exports.count) Invalid params object.^0`);

    let collection = getParamsCollection(params);
    if (!collection) return console.log(`^1[MongoDB][ERROR] (exports.insert) Invalid collection "${params.collection}"^0`);

    const query = utils.safeObjectArgument(params.query);
    const options = utils.safeObjectArgument(params.options);

    try {
        const count = await collection.countDocuments(query, options);
        if(callback) utils.safeCallback(callback, true, count);
        return count;
    } catch(err) {
        console.log(`^1[MongoDB][ERROR] (exports.count) ${err}^0`);
        return false;
    }
    process._tickCallback();
}

/**
 * MongoDB delete method
 * @param {Object} params - Params object
 * @param {Object} params.query - Query object.
 * @param {Object} params.options - Options passed to insert.
 */
function dbDelete(params, callback, isDeleteOne) {
    if (!checkDatabaseReady()) return;
    if (!checkParams(params)) return console.log(`^1[MongoDB][ERROR] (exports.delete) Invalid params object.^0`);

    let collection = getParamsCollection(params);
    if (!collection) return console.log(`^1[MongoDB][ERROR] (exports.insert) Invalid collection "${params.collection}"^0`);

    const query = utils.safeObjectArgument(params.query);
    const options = utils.safeObjectArgument(params.options);

    const cb = (err, res) => {
        if (err) {
            console.log(`^1[MongoDB][ERROR] (exports.delete) ${err.message}^0`);
            //utils.safeCallback(callback, false, err.message);
            return false;
        }
        utils.safeCallback(callback, true, res.result.n);
        return res.result.n;
    };
    isDeleteOne ? collection.deleteOne(query, options, cb) : collection.deleteMany(query, options, cb);
    process._tickCallback();
}

async function dbAggregate(params) {
    if (!checkDatabaseReady()) return;
    if (!checkParams(params)) return console.log(`^1[MongoDB][ERROR] (exports.aggregate) Invalid params object.^0`);

    const collection = getParamsCollection(params);
    if (!collection) return console.log(`^1[MongoDB][ERROR] (exports.aggregate) Invalid collection "${params.collection}"^0`);

    if (!params.pipeline) return console.log(`^1[MongoDB][ERROR] (exports.aggregate) Invalid pipeline^0`);

    try {
        const cursor = await collection.aggregate(params.pipeline);
        const result = await cursor.toArray();

        return result;
    } catch(err) {
        console.log(`^1[MongoDB][ERROR] (exports.aggregate) ${err}^0`);
        return false;
    }
}

async function dbBulkWrite(params) {
    if (!checkDatabaseReady()) return;
    if (!checkParams(params)) return console.log(`^1[MongoDB][ERROR] (exports.bulkWrite) Invalid params object.^0`);

    const collection = getParamsCollection(params);
    if (!collection) return console.log(`^1[MongoDB][ERROR] (exports.bulkWrite) Invalid collection "${params.collection}"^0`);

    if (!params.operations) return console.log(`^1[MongoDB][ERROR] (exports.bulkWrite) Invalid operations^0`);

    try {
        const result = await collection.bulkWrite(params.operations);
        return result;
    } catch(err) {
        console.log(`^1[MongoDB][ERROR] (exports.bulkWrite) ${err}^0`);
        return false;
    }
}

/* Exports definitions */

exports("isConnected", () => !!db);

exports("insert", dbInsert);
exports("insertOne", dbInsertOne);

exports("find", dbFind);
exports("findOne", dbFindOne);

exports("update", dbUpdate);
exports("updateOne", (params, callback) => {
    return dbUpdate(params, callback, true);
});

exports("count", dbCount);

exports("delete", dbDelete);
exports("deleteOne", (params, callback) => {
    return dbDelete(params, callback, true);
});

exports("aggregate", dbAggregate);

exports("bulkWrite", dbBulkWrite);
