import path from "path";
import fs from "fs";
import IViewManager from "./interface/IViewManager";

export default class ViewManager implements IViewManager {
  getView = async (viewPath: string): Promise<string> => {
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
}
