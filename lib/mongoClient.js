var mongoClient = require("mongodb").MongoClient,
  db,
  logger = require('nodewinstonlogger');

function isObject(obj) {
  return Object.keys(obj).length > 0 && obj.constructor === Object;
}

class mongoDbClient {
  async connect(conn, onSuccess, onFailure){
    try {
      var connection = await mongoClient.connect(conn.url, { useNewUrlParser: true });
      this.db = connection.db(conn.dbName);
      logger.info("MongoClient Connection successfull.");
      onSuccess();
    }
    catch(ex) {
      logger.error("Error caught,", ex);
      onFailure(ex);
    }
  }

  async getNextSequence(coll) {
    return await this.db.collection("counters").findOneAndUpdate({
        _id: coll
      },
      {$inc: {seq: 1}},
      {projections: {seq: 1},
        upsert: true,
        returnOriginal: false
      }
    );
  }

  async insertDocumentWithIndex(coll, doc) {
    try {
      if(!isObject(doc)){
        throw Error("mongoClient.insertDocumentWithIndex: document is not an object");
        return;
      }
      var index = await this.getNextSequence(coll);
      doc.idx = index.value.seq;
      return await this.db.collection(coll).insertOne(doc);
    }
    catch(e) {
      logger.error("mongoClient.insertDocumentWithIndex: Error caught,", e);
      return Promise.reject(e);
    }
  }

  async findDocFieldsByFilter(coll, query, projection, lmt) {
    if(!query){
      throw Error("mongoClient.findDocFieldsByFilter: query is not an object");
    }
    return await this.db.collection(coll).find(query, {
      projection: projection || {},
      limit: lmt || 0
    }).toArray();
  }

  async findDocByAggregation(coll, query) {
    if(!query.length){
      throw Error("mongoClient.findDocByAggregation: query is not an object");
    }
    return this.db.collection(coll).aggregate(query).toArray();
  }

  async getDocumentCountByQuery(coll, query) {
    return this.db.collection(coll).estimatedDocumentCount(query || {})
  }

  async findOneAndUpdate(coll, query, values, option) {
    if(!(isObject(values) && isObject(query))){
      throw Error("mongoClient.UpdateDocument: values and query should be an object");
    }
    return this.db.collection(coll).findOneAndUpdate(query, {$set : values}, option || {})
  }

  async modifyOneDocument(coll, query, values, option) {
    if(!(isObject(values) && isObject(query))){
      throw Error("mongoClient.ModifyOneDocument: values, query and option should be an object");
    }
    return await this.db.collection(coll).updateOne(query, values, option || {})
  }
}

module.exports = {
  mongoDbClient: mongoDbClient
}
