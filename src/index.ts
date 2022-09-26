import express from "express";
import path from "path";
import fs from "fs";

//type imports
import { Request, Response } from "express";
import { CreateResponse, CreateRequest } from "./models";

//local imports
import { myDataSource, url, config } from "./database";
import { getSecondsTimestamp, encode } from "./utilities";

myDataSource
  .initialize()
  .then(() => {
    console.info("Database Initialized");
  })
  .catch(() => {
    console.error("Database Initialization failed");
  });

const app = express();
app.use(express.json());
const port = 3000;
const domain = process.env.DOMAIN || "localhost";

const getView = (viewPath: string) => {
  return new Promise((res, rej) => {
    fs.readFile(path.resolve(viewPath), "utf8", (err, data) => {
      if (err) {
        console.error(err);
        rej("could not find resource " + viewPath);
      }

      res(data);
    });
  });
};

app.get("/", async (req: Request, res: Response) => {
  res.send(await getView("src/views/createUrl.html"));
});

app.get("/:urlHash", async (req: Request, res: Response) => {
  try {
    const urlEntry = await myDataSource
      .getRepository(url)
      .findOneBy({ mini_url: req.params.urlHash });

    if (!urlEntry) return res.send(await getView("src/views/404.html"));

    return res.redirect("http://" + urlEntry.full_url);
  } catch (err) {
    console.error(err);
    return res.status(500).send(err);
  }
});

//TODO: remove as this is only for testing
app.get("/debug/all", async (req: Request, res: Response) => {
  const allEntries = await myDataSource.getRepository(url).find();
  console.log(allEntries);
  return res.send(allEntries);
});

app.post("/create", async (req: Request, res: Response) => {
  try {
    const requestedFullURl = req.body.full_url;
    const urlRepo = myDataSource.getRepository(url);

    //TODO: add  body validation

    //check if record for the full_url already exists
    const preexistingEntry = await urlRepo.findOne({
      where: {
        full_url: requestedFullURl,
      },
    });

    if (preexistingEntry)
      return res.send(getURLCreationResponse(preexistingEntry));

    //insert entry without mini_url
    await urlRepo.insert({
      full_url: req.body.full_url,
      creation_date: getSecondsTimestamp(),
      mini_url: encode(req.body.full_url),
    });

    //get new entry id
    let newlyCreatedEntry = await urlRepo.findOne({
      where: {
        full_url: requestedFullURl,
      },
    });

    //update entry with encoded value
    if (newlyCreatedEntry !== null) {
      const newMiniUrlCode = encode(newlyCreatedEntry.id.toString());
      await urlRepo.update(
        { id: newlyCreatedEntry.id },
        { mini_url: newMiniUrlCode }
      );
      const updatedEntry = await urlRepo.findOne({
        where: { id: newlyCreatedEntry.id },
      });

      return res.send(getURLCreationResponse(updatedEntry));
    } else {
      throw "Database write error";
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send(err);
  }
});

const getURLCreationResponse = (urlEntity: url | null): CreateResponse => {
  if (urlEntity) {
    console.log({
      success: true,
      mini_url_code: urlEntity.mini_url,
      mini_url: "https://" + domain + ":" + port + "/" + urlEntity.mini_url,
    });

    return {
      success: true,
      mini_url_code: urlEntity.mini_url,
      mini_url: domain + ":" + port + "/" + urlEntity.mini_url,
    };
  } else {
    return {
      success: false,
      mini_url_code: "",
      mini_url: "",
    };
  }
};

app.use(
  express.static(path.resolve(__dirname, ".", "dist"), { maxAge: "30d" })
);

app.listen(port, async () => {
  console.log(`Example app listening on port ${port}!`);
});
