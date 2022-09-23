import express from "express";
import path from "path";
import fs from "fs";

//type imports
import { Request, Response } from "express";

//local imports
import { myDataSource, url } from "./database";
import { getSecondsTimestamp, encode } from "./utilities"

myDataSource.initialize()
    .then(() => { console.info("Database Initialized") })
    .catch(() => {console.error("Database Initialization failed") });

const app = express();
app.use(express.json())
const port = 3000;

app.get("/", async (req : Request, res : Response) => {
  const data = fs.readFile(path.resolve("src/createUrl.html"), "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("An error occurred");
    }

    return res.send(
      data
    );
  })
});

//TODO: add 404 
app.get("/:urlHash", async (req : Request, res : Response) => {
  try {

    const urlEntry = await myDataSource.getRepository(url).findOneBy({mini_url: req.params.urlHash});
    return res.send(urlEntry)

  } catch (err) {
    console.error(err);
    return res.status(500).send(err);
  }
});

//TODO: remove as this is only for testing
app.get("/debug/all", async (req : Request, res : Response) => {
  const allEntries = await myDataSource.getRepository(url).find();
  console.log(allEntries)
  return res.send(allEntries);
})

app.post("/create", async (req : Request, res : Response) => {
  try {
    const requestedFullURl = req.body.full_url;
    const urlRepo = myDataSource.getRepository(url);

    //TODO: add  body validation

    //check if record for the full_url already exists
    const preexistingEntry = await urlRepo.findOne({
      where: {
        full_url: requestedFullURl
      }
    })

    if(preexistingEntry) return res.send(preexistingEntry);

    //insert entry without mini_url
    await urlRepo.insert({
      full_url: req.body.full_url,
      creation_date: getSecondsTimestamp(),
      mini_url: encode(req.body.full_url)
    });

    //get new entry id
    const newlyCreatedEntry = await urlRepo.findOne({
      where: {
        full_url: requestedFullURl
      }
    });

    //update entry with encoded value
    if(newlyCreatedEntry !== null) {
      const newMiniUrlCode = encode(newlyCreatedEntry.id.toString());
      await urlRepo.update({id: newlyCreatedEntry.id}, {mini_url: newMiniUrlCode})
      
      //TODO: use an environment variable to send domain with URL code 
      return res.send({success: true, mini_url: newMiniUrlCode})
    } else {
      throw "Database write error"
    }

  } catch (err) {
    console.error(err);
    return res.status(500).send(err);
  }
});

app.use(
  express.static(path.resolve(__dirname, ".", "dist"), { maxAge: "30d" })
);

app.listen(port, function () {
  console.log(`Example app listening on port ${port}!`);
});