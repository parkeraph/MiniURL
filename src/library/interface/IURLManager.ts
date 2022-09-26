import {
  MiniURLCreateRequest,
  MiniURLCreateResponse,
  MiniURLGetRequest,
  MiniURLGetResponse,
} from "../../models";

import { URL } from "../../database";
import { DataSource } from "typeorm";

export default interface IURLManager {
  domain: string;
  port: number;
  dataSource: DataSource;

  getMiniURL(request: MiniURLGetRequest): Promise<MiniURLGetResponse>;
  createMiniURL(request: MiniURLCreateRequest): Promise<MiniURLCreateResponse>;
  getURLCreationResponse(urlEntity: URL | null): MiniURLCreateResponse;
}
