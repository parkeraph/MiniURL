import { DataSource } from "typeorm"

const myDataSource = new DataSource({
    type: "sqlite",
    database: __dirname + "/../../MiniURL.db",
    entities: [__dirname + "/../**/*.entity.{js,ts}"],
    logging: true,
    synchronize: true,
})

export { myDataSource }
export { url } from './entity/url.entity'