/*
  Create your own Test Data and add in test cases
*/


var {assert, expect} = require('chai')
const mongoMod = require('../lib/mongoClient')
global.logger = require('nodewinstonloggerclient')
const db = new mongoMod.mongoDbClient()
const CONF = require('./conf')
var logger = require('nodewinstonloggerclient')

var testData = {
  collName: 'inspections',
  docs: [
    {
      "inspectorId" : 1,
      "curStatus" : 1,
      "lastUpdatedTS" : 1535222623216,
      "entryTS" : 1535222623216,
      "venueTypeId" : 1,
      "location" : [
        45.5891279,
        -45.0446183
      ],
    },
    {
      "inspectorId" : 1,
      "curStatus" : 1,
      "lastUpdatedTS" : 1535222623216,
      "entryTS" : 1535222623216,
      "venueTypeId" : 1,
      "location" : [
        85.5891279,
        -15.0446183
      ],
    },
    {
      "inspectorId" : 1,
      "curStatus" : 1,
      "lastUpdatedTS" : 1535222623216,
      "entryTS" : 1535222623216,
      "venueTypeId" : 1,
      "location" : [
        45.5891279,
        -45.0446183
      ],
    }
  ]
}

before('Running Mongo Connection Test...', () => {
  it('It should connect to mongodb successfully', (done) => {
    db.connect(CONF.mongo, () => {
      done();
    }, (ex) => {
      done(new Error(`Error occured in connect ${ex}`));
    })
  });
})

describe('Testing getDocumentCountByQuery', () => {
  it('getDocumentCountByQuery - simple count', async () => {
    var item = await db.getDocumentCountByQuery('inspectionStatusMaster')
    expect(item).to.equal(4);
  })
})

describe('Testing insertDocumentWithIndex', () => {
  it('Inserting Single Document', async () => {
    var data = await db.insertDocumentWithIndex('inspections', {
      "inspectorId" : 1,
      "curStatus" : 1,
      "lastUpdatedTS" : 1535222623216,
      "entryTS" : 1535222623216,
      "venueTypeId" : 1,
      "location" : [
        45.5891279,
        -45.0446183
      ]
    })
    expect(data.result.n).to.equal(1);
    expect(data.result.ok).to.equal(1);
  });
})

describe('Testing findDocFieldsByFilter', () => {
  it('findDocFieldsByFilter - search', async () => {
    var item = await db.findDocFieldsByFilter('inspectors', {idx: 3}, {idx: 1}, 1);

    expect(item[0].idx).to.equal(3);
  });

  it('findDocFieldsByFilter - limit', async () => {
    var item = await db.findDocFieldsByFilter('inspections', {"curStatus" : 1}, {}, 2);

    expect(item.length).to.equal(2);
  });
})

describe('Testing findDocByAggregation', () => {
  it('findDocByAggregation - simple find', async () => {
    var item = await db.findDocByAggregation('inspectors', [{$match: {idx: 1}}])
    expect(item.length).to.equal(1);
    expect(item[0].idx).to.equal(1);
  })
})

describe('findOneAndUpdate', () => {
  it('findOneAndUpdate - simple', async () => {
    var item = await db.findOneAndUpdate('inspectors', {nm: 'Ohm 2'}, {nm: 'Ohm 2'})
    expect(item.value.nm === 'Ramesh')
  })
})

describe('modifyOneDocument', () => {
  it('modifyOneDocument - simple', async () => {
    var item = await db.modifyOneDocument('venues', {nm: 'Home'}, {$set: {nm: 'My Home'}})
    expect(item.result.n).to.equal(1);
    expect(item.result.ok).to.equal(1);
    expect(item.result.nModified).to.equal(1);
  })
})

