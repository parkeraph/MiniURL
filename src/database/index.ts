import { DataSource } from "typeorm";

const dataSource = new DataSource({
  type: "sqlite",
  database: __dirname + "/../../MiniURL.db",
  entities: [__dirname + "/../**/*.entity.{js,ts}"],
  logging: true,
  synchronize: true,
});

export { dataSource };
export { default as URL } from "./entity/URL.entity";
