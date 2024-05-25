---@meta
-- VS Code Extention for Intellisense and Linting: sumneko.lua

---@overload fun(name: string, method: function)
exports = {}

---@alias BsonObjectId {id: {[string]: string}} an Mongo Object Id in BSON format

---**`SERVER`**
---<br/>Returns if the connection to the MongoDB server is established.
---@return boolean
function exports.mongodb:isConnected() end


---**`SERVER`**
---<br/>Insert an array of documents into a collection.
---@param params {collection: string, documents: table[], options?: table}
---@param callback fun(success: boolean, insertedCount: number, insertedIds: BsonObjectId[])
---<hr/><a href="https://www.mongodb.com/docs/manual/reference/method/db.collection.insert/">MongoDB Documentation</a>
function exports.mongodb:insert(params, callback) end


---**`SERVER`**
---<br/>Insert one document into a collection.
---@param params {collection: string, document: table, options?: table}
---@param callback fun(success: boolean, insertedId: BsonObjectId)
---@return BsonObjectId | false insertedId or false if the operation failed
---<hr/><a href="https://www.mongodb.com/docs/manual/reference/method/db.collection.insertOne/">MongoDB Documentation</a>
function exports.mongodb:insertOne(params, callback) end


---**`SERVER`**
---<br/>Find documents in a collection.
---@param params {collection: string, query: table, options?: table, limit?: number}
---@param callback fun(success: boolean, documents: table[])
---@return table[] | false documents or false if the operation failed
---<hr/><a href="https://www.mongodb.com/docs/manual/reference/method/db.collection.find/">MongoDB Documentation</a>
function exports.mongodb:find(params, callback) end


---**`SERVER`**
---<br/>Find one document in a collection.
---@param params {collection: string, query: table, options?: table}
---@param callback fun(success: boolean, documents: table[])
---@return table | false document or false if the operation failed
---<hr/><a href="https://www.mongodb.com/docs/manual/reference/method/db.collection.findOne/">MongoDB Documentation</a>
function exports.mongodb:findOne(params, callback) end


---**`SERVER`**
---<br/>Update documents in a collection.
---@param params {collection: string, query: table, update: table, options?: table}
---@param callback fun(success: boolean, modifiedCount: number)
---@return number | false modifiedCount or false if the operation failed
---<hr/><a href="https://www.mongodb.com/docs/manual/reference/method/db.collection.updateMany/">MongoDB Documentation</a>
function exports.mongodb:update(params, callback) end


---**`SERVER`**
---<br/>Update one document in a collection.
---@param params {collection: string, query: table, update: table, options?: table}
---@param callback fun(success: boolean, modifiedCount: number)
---@return number | false modifiedCount or false if the operation failed
---<hr/><a href="https://www.mongodb.com/docs/manual/reference/method/db.collection.updateOne/">MongoDB Documentation</a>
function exports.mongodb:updateOne(params, callback) end


---**`SERVER`**
---<br/>Count documents in a collection.
---@param params {collection: string, query: table}
---@param callback fun(success: boolean, count: number)
---@return number | false count or false if the operation failed
---<hr/><a href="https://www.mongodb.com/docs/manual/reference/method/db.collection.count/">MongoDB Documentation</a>
function exports.mongodb:count(params, callback) end


---**`SERVER`**
---<br/>Delete documents in a collection.
---@param params {collection: string, query: table, options?: table}
---@param callback fun(success: boolean, deletedCount: number)
---@return number | false deletedCount or false if the operation failed
---<hr/><a href="https://www.mongodb.com/docs/manual/reference/method/db.collection.deleteMany/">MongoDB Documentation</a>
function exports.mongodb:delete(params, callback) end


---**`SERVER`**
---<br/>Delete one document in a collection.
---@param params {collection: string, query: table, options?: table}
---@param callback fun(success: boolean, deletedCount: number)
---@return number | false deletedCount or false if the operation failed
---<hr/><a href="https://www.mongodb.com/docs/manual/reference/method/db.collection.deleteOne/">MongoDB Documentation</a>
function exports.mongodb:deleteOne(params, callback) end


---**`SERVER`**
---<br/>Bulk write operations in a collection.
---@param params {collection: string, operations: table[]}
---@return boolean success
---<hr/><a href="https://www.mongodb.com/docs/manual/reference/method/db.collection.bulkWrite/">MongoDB Documentation</a>
function exports.mongodb:bulkWrite(params) end


---**`SERVER`**
---<br/>Aggregate documents in a collection.
---@param params {collection: string, pipeline: table[]}
---@return table[] | false documents or false if the operation failed
---<hr/><a href="https://www.mongodb.com/docs/manual/reference/method/db.collection.aggregate/">MongoDB Documentation</a>
function exports.mongodb:aggregate(params) end