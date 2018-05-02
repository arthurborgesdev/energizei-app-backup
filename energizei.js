var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var express = require('express');

var app = express();

var dbURL = 'mongodb://localhost:27017/pm5560';

app.set('views', './public/views');
app.set('view engine', 'pug');
app.use(express.static('public'));

app.get('/api', function(req, res) {

  MongoClient.connect(dbURL, function(err, db) {
    assert.equal(null, err);
    console.log("Connected correctly to server");

    voltageTime(db, res, function(results) {
        res.json(results);
        db.close();
        res.end();
    });

  });
});

app.get('/chart', function(req, res) {
  //res.send('Hello World');

  MongoClient.connect(dbURL, function(err, db) {
    assert.equal(null, err);
    console.log("Connected correctly to server");

    voltageTime(db, res, function(results) {
        //res.json(results);
        var labels = results.map(function(l) {
          return l.time;
        });
        var data = results.map(function(d) {
          return d.voltageAN;
        });
        res.send(labels + data);
        db.close();
        res.end();
    });

  });
});

app.get('/pug', function(req, res) {
  //res.send('Hello World');

  MongoClient.connect(dbURL, function(err, db) {
    assert.equal(null, err);
    console.log("Connected correctly to server");

    voltageTime(db, res, function(results) {
        //res.json(results);
        var labels = results.map(function(l) {
          return l.time;
        });
        var data = results.map(function(d) {
          return d.voltageAN;
        });
        res.render('index.pug', { "data.datasets.label": labels, "data.datasets.data": data});
        db.close();
        res.end();
    });

  });
});



/*
app.get('/chart', function(req, res) {
  res.render('index');
});
*/

app.listen(3000, function() {
  console.log("Energizei app listening on port 3000!");
})

var voltageTime = function(db, res, callback) {
  var collection = db.collection("santaMonica");
  collection.aggregate(
    //[ { "$match": { "time_ms": {$gte: 1486653961335 , $lte: 1486653968335} } },
    [ { "$match": { "time_iso": {$gte: "2017-01-18T15:26:01.335Z" , $lte: "2017-01-19T16:35:35.335Z" } } },
      { "$project": { time: "$time_iso", voltageAN: "$meter_data_basic.voltage.AN", _id:0 } }
    ],
    function(err, results) {
      assert.equal(err, null);
      callback(results);
    }
  );
}

