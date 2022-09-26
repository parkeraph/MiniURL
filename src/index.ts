import express from "express";
import path from "path";

//type imports
import { Request, Response } from "express";

//local imports
import { dataSource, URL } from "./database";
import { getSecondsTimestamp, encode } from "./utilities";
import { URLManager, ViewManager } from "./library";
import { rmSync } from "fs";

dataSource
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

const viewManager = new ViewManager();
const urlManager = new URLManager(dataSource, domain, port);

app.get("/", async (req: Request, res: Response) => {
  try {
    const page = await viewManager.getView("src/views/createUrl.html");
    res.send(page);
  } catch (e) {
    //TODO: lets handle this better, maintain consistency between other routes
    //or start a new org standard for 'view routes'
    res.status(500).send(e);
  }
});

app.get("/:urlHash", async (req: Request, res: Response) => {
  //TODO: add body validation

  const response = await urlManager.getMiniURL({
    miniURLCode: req.params.urlHash,
  });

  if (response.success) {
    return response.exists
      ? res.redirect(response.fullURL)
      : res.send(await viewManager.getView("src/views/404.html"));
  } else {
    //TODO: create an error page, maybe templatize the 404 page for all error status?
    return res.status(500).send(response);
  }
});

app.post("/create", async (req: Request, res: Response) => {
  //TODO: validate type here
  const response = await urlManager.createMiniURL(req.body);

  if (response.success) {
    return res.send(response);
  } else {
    return res.status(500).send(response);
  }
});

app.use(
  express.static(path.resolve(__dirname, ".", "dist"), { maxAge: "30d" })
);

app.listen(port, async () => {
  console.log(`Example app listening on port ${port}!`);
});
