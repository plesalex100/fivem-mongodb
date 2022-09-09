# FiveM MongoDB wrapper
## Description
This resource is a simple MongoDB wrapper for [FiveM](https://fivem.net/). It's running on top of [MongoDB Node Driver](https://mongodb.github.io/node-mongodb-native/).

## Installation

1. Clone this repository to `resources/mongodb` folder.
2. Copy `mongodb/database.cfg` to your server root directory.
3. Add the following lines to your server config:
```
exec "database.cfg"
start mongodb
```
4. Change `mongodb_url` and `mongodb_database` in `database.cfg`.
5. Run `npm install` in `resources/mongodb` directory.

## Usage

Every callback accepts `success<boolean>` as its first argument. If `success` is `false`, second argument contains error message.

## exports.mongodb.isConnected
* `returns status<boolean>`

Returns true if database connection is established.

## exports.mongodb.insert(params, callback);
* `params<Object>` - params object
* `params.collection<string>` - collection name
* `params.documents<Object>` - an array of documents to insert
* `params.options<Object>` - optional settings object. See [collection.insertMany in docs](http://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#insertMany)
* `callback(success<boolean>, insertedCount<number>, insertedIds<Array>)` - callback (optional)
Inserts an array of documents into MongoDB.

## exports.mongodb.insertOne(params, callback);
* `params<Object>` - params object
* `params.collection<string>` - collection name
* `params.document<Object>` - document object
* `params.options<Object>` - optional settings object. See [collection.insertMany in docs](http://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#insertMany)
* `callback(success<boolean>, insertedCount<number>, insertedIds<Array>)` - callback (optional)

Inserts a single document into MongoDB.

## exports.mongodb.find(params, callback);
* `params<Object>` - params object
* `params.collection<string>` - collection name
* `params.query<Object>` - filter query object
* `params.options<Object>` - optional settings object. See [collection.find in docs](http://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#find)
* `params.limit<number>` - limit documents count
* `callback(success<boolean>, documents<Array>)` - callback (optional)
* `returns results<Array>`

Performs a find query.

Example (Lua):
```lua
exports.mongodb:find({ collection = "users", query = { adminLevel = { ['$gte'] = 1 } }, options = {
    projection = {
        _id = 0,
        name = 1,
        adminLevel = 1
    }
}}, function (success, result)
    if not success then return end
    for i in pairs(result) do
       print("Name: "..result[i].name..", Admin Level: "..result[i].adminLevel) 
    end
end)

-- async method
local admins = exports.mognodb:find({collection = "users", query = { adminLevel = { ['$gte'] = 1 } }, options = {
    projection = {
        _id = 0,
        name = 1,
        adminLevel = 1
    }
}})
if admins then
    for i in pairs(admins) do
       print("Name: "..admins[i].name..", Admin Level: "..admins[i].adminLevel) 
    end
end
```

## exports.mongodb.findOne(params, callback);
* `params<Object>` - params object
* `params.collection<string>` - collection name
* `params.query<Object>` - filter query object
* `params.options<Object>` - optional settings object. See [collection.find in docs](http://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#find)
* `callback(success<boolean>, documents<Array>)` - callback (optional)
* `returns result<Object>`

Example (Lua):
```lua
exports.mongodb:findOne({ collection = "users", query = { _id = id }, options = {
    projection = {
        _id = 0,
        name = 1
    }
}}, function (success, result)
    if not success then
        print("Error message: "..tostring(result))
        return
    end

    print("User name is "..result[1].name)
end)

-- async method
local user = exports.mognodb:findOne({collection = "users", query = { _id = id }, options = {
    projection = {
        _id = 0,
        name = 1
    }
}})
if user then
    print("User name is "..user.name)
end
```

## exports.mongodb.update(params, callback);
* `params<Object>` - params object
* `params.collection<string>` - collection name
* `params.query<Object>` - filter query object
* `params.update<Object>` - update query object
* `params.pipeline<Array>` - pipeline query array | if pipeline exists, update parametere becomes unused
* `params.options<Object>` - optional settings object. See [collection.updateMany in docs](http://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#updateMany)
* `callback(success<boolean>, updatedCount<number>)` - callback (optional)

Update multiple documents on MongoDB.

Example (Lua):
```lua
-- without pipeline
exports.mongodb:update({ collection = "users", query = { eligibile = { ['$exists'] = true }, update = {
    ['$unset'] = {
        eligible = 1
    }
}})
exports.mongodb:update({ collection = "users", query = { hoursPlayed = { ['$gte'] = 10, ['$lte'] = 100 } }, update = {
    ['$set'] = {
        eligible = true
    }
}}, function (success, nModified)
    if not success then return end
    print(nModified.." users are now eligible (have between 10 and 100 hours played)")
end)

-- using pipeline
exports.mongodb:update({ collection = "users", query = {}, pipeline = {
    {
        ['$unset'] = "eligible"
    },
    {
        ['$match'] = { hoursPlayed = { ['$gte'] = 10, ['$lte'] = 100 } }
    },
    {
        ['$set'] = { eligible = true }
    }
})
```

## exports.mongodb.updateOne(params, callback);
* `params<Object>` - params object
* `params.collection<string>` - collection name
* `params.query<Object>` - filter query object
* `params.update<Object>` - update query object
* `params.pipeline<Array>` - pipeline query array | if pipeline exists, update parametere becomes unused
* `params.options<Object>` - optional settings object. See [collection.updateMany in docs](http://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#updateMany)
* `callback(success<boolean>, updatedCount<number>)` - callback (optional)

Update a single document on MongoDB.

## exports.mongodb.count(params, callback);
* `params<Object>` - params object
* `params.collection<string>` - collection name
* `params.query<Object>` - filter query object
* `params.options<Object>` - optional settings object. See [collection.countDocuments in docs](http://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#countDocuments)
* `callback(success<boolean>, count<number>)` - callback (optional)
* `returns result<Int>`

Gets the number of documents matching the filter.

Example (Lua)
```lua
-- async method
local adminsCount = exports.mognodb:find({collection = "users", query = { adminLevel = { ['$gte'] = 1 } })
print("There are in total "..adminsCount.." admins")
```

## exports.mongodb.delete(params, callback);
* `params<Object>` - params object
* `params.collection<string>` - collection name
* `params.query<Object>` - filter query object
* `params.options<Object>` - optional settings object. See [collection.deleteMany in docs](http://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#deleteMany)
* `callback(success<boolean>, deletedCount<number>)` - callback (optional)

Delete multiple documents on MongoDB.

Example (Lua):
```lua
exports.mongodb:delete({collection = "userPunish", query = { expireDate = { ['$lte'] = os.time() } } }, function(success, deleteCount)
    print("Deleted "..deleteCount.." documents")
end)
```

## exports.mongodb.deleteOne(params, callback);
* `params<Object>` - params object
* `params.collection<string>` - collection name
* `params.query<Object>` - filter query object
* `params.options<Object>` - optional settings object. See [collection.deleteMany in docs](http://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#deleteOne)
* `callback(success<boolean>, deletedCount<number>)` - callback (optional)

Delete a document on MongoDB.

## exports.mongodb.aggregate(params);
* `params<Object>` - params object
* `params.collection<string>` - collection name
* `params.pipeline<Array>` - pipeline query array
* `returns results<Array>`

Perform an aggregation on MongoDB

Example (Lua):
```lua
local results = exports.mongodb:aggregate({collection = "users", pipeline = {
    {
        -- project only the name, wallet and bank
        ['$project'] = {
            name: 1,
            wallet: "$userMoney.wallet",
            bank: "$userMoney.bank"
        }
    },
    {
        -- add total field that is equal to wallet field + bank field
        ['$addFields'] = {
            total: {$add: ["$wallet", "$bank"]}
        }
    },
    {
        -- sort documents by total, in descending order
        ['$sort'] = {
            total: -1
        }
    }
    {
        -- limit documents to 10
        ['$limit'] = 10
    }
}})
-- print top 10 richest players on the server.
for i in pairs(results) do
    print("#"..i.." User "..results[i].name.." Total: $"..results[i].total)
end
```
