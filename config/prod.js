// export default {
//     dbURL: 'mongodb+srv://E33:Eh205768807@cluster0.cf0hmxr.mongodb.net/',
//     dbName: 'toy_db',
// }

import dotenv from 'dotenv'
dotenv.config()

export default {
    dbURL: process.env.ATLAS_URL,
    dbName: process.env.ATLAS_DBNAME,
}
