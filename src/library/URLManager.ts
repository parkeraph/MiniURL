import IURLManager from "./interface/IURLManager";
import { URL } from "../database";
import {
  MiniURLCreateResponse,
  MiniURLCreateRequest,
  MiniURLGetResponse,
  MiniURLGetRequest,
} from "../models";
import { DataSource } from "typeorm";
import { encode, getSecondsTimestamp } from "../utilities";

export default class URLManager implements IURLManager {
  domain: string;
  port: number;
  dataSource: DataSource;

  constructor(dataSource: DataSource, domain: string, port: number) {
    this.dataSource = dataSource;
    this.domain = domain;
    this.port = port;
  }

  getMiniURL = async (
    request: MiniURLGetRequest
  ): Promise<MiniURLGetResponse> => {
    try {
      const urlEntry = await this.dataSource
        .getRepository(URL)
        .findOneBy({ mini_url: request.miniURLCode });

      if (!urlEntry)
        return {
          success: true,
          exists: false,
          fullURL: "",
        };

      return {
        success: true,
        exists: true,
        fullURL: urlEntry.full_url,
      };
    } catch (e) {
      return {
        success: false,
        exists: false,
        fullURL: "",
        error: String(e),
      };
    }
  };

  createMiniURL = async (
    request: MiniURLCreateRequest
  ): Promise<MiniURLCreateResponse> => {
    try {
      //check if the url has a http:// prefix, if not add
      if (!/^(http|https):\/\/.*/.test(request.full_url)) {
        request.full_url = "https://" + request.full_url;
      }

      const urlRepo = this.dataSource.getRepository(URL);

      //check if record for the full_url already exists
      const preexistingEntry = await urlRepo.findOne({
        where: {
          full_url: request.full_url,
        },
      });

      if (preexistingEntry) {
        return this.getURLCreationResponse(preexistingEntry);
      }

      //insert entry without mini_url
      await urlRepo.insert({
        full_url: request.full_url,
        creation_date: getSecondsTimestamp(),
        mini_url: encode(request.full_url),
      });

      //get new entry id
      let newlyCreatedEntry = await urlRepo.findOne({
        where: {
          full_url: request.full_url,
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

        return this.getURLCreationResponse(updatedEntry);
      } else {
        throw "Database write error";
      }
    } catch (e) {
      return {
        success: false,
        mini_url: "",
        mini_url_code: "",
        error: String(e),
      };
    }
  };

  getURLCreationResponse = (urlEntity: URL | null): MiniURLCreateResponse => {
    if (urlEntity) {
      console.log({
        success: true,
        mini_url_code: urlEntity.mini_url,
        mini_url:
          "https://" + this.domain + ":" + this.port + "/" + urlEntity.mini_url,
      });

      return {
        success: true,
        mini_url_code: urlEntity.mini_url,
        mini_url: this.domain + ":" + this.port + "/" + urlEntity.mini_url,
      };
    } else {
      return {
        success: false,
        mini_url_code: "",
        mini_url: "",
      };
    }
  };
}
