const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGO_CONNECTION);
  const app = express();
  app.use(express.json());
  app.use(
    express.urlencoded({
      extended: true,
    })
  );
  app.use(cors());

  const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
  });

  const Student = mongoose.model("Student", studentSchema);

  // autocomplete index (ie - more efficient, less effective)
  app.get("/searchone", async (req, res) => {
    try {
      let results;
      if (req.query.name) {
        results = await Student.aggregate([
          {
            $search: {
              index: "autocomplete",
              autocomplete: {
                query: req.query.name,
                path: "name",
                fuzzy: {
                  maxEdits: 1,
                },
                tokenOrder: "sequential",
              },
            },
          },
          {
            $project: {
              name: 1,
              _id: 1,
            },
          },
          {
            $limit: 10,
          },
        ]);
        if (results) return res.send(results);
      }
      res.send([]);
    } catch (error) {
      console.log(error);
      res.send([]);
    }
  });

  // default index (less efficient, more effective)
  app.get("/searchtwo", async (req, res) => {
    try {
      let results;
      if (req.query.name) {
        results = await Student.aggregate([
          {
            $search: {
              index: "default",
              compound: {
                must: [
                  {
                    text: {
                      query: req.query.name,
                      path: "name",
                      fuzzy: {
                        maxEdits: 1,
                      },
                    },
                  },
                ],
              },
            },
          },
          {
            $limit: 10,
          },
          {
            $project: {
              name: 1,
              _id: 1,
            },
          },
        ]);
        if (results) return res.send(results);
      }
      res.send([]);
    } catch (error) {
      console.log(error);
      res.send([]);
    }
  });

  app.get("/student/all", async (req, res) => {
    const students = await Student.find({});
    res.send({ students });
  });

  app.post("/student/create", async (req, res) => {
    if (req.body.name) {
      const student = await Student.create({ name: req.body.name });
      if (student) {
        return res.send(student);
      }
    }

    res.send({ message: "unable to create student" });
  });

  app.listen(3001, () => console.log("listening on 3001"));
}

/*

Autocomplete aka searchone index definition
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "name": [
        {
          "foldDiacritics": false,
          "maxGrams": 7,
          "minGrams": 3,
          "tokenization": "edgeGram",
          "type": "autocomplete"
        }  
      ]
    }
  }
}


default aka searchtwo index definition
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "name": {
        "analyzer": "lucene.standard",
        "searchAnalyzer": "lucene.standard",
        "type": "string"
      }
    }
  }
}

*/
