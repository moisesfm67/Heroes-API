const ICrud = require("../interfaces/interfaceCrud");
const Mongoose = require("mongoose");
const STATUS = {
    DISCONNECTED: 0,
    CONNECTED: 1,
    CONNECTING: 2,
    DISCONNECTING: 3,
};

class MongoDB extends ICrud {
    constructor(connection, schema) {
        super();

        this._schema = schema;
        this._connection = connection;
    }

    async isConnected() {
        const state = this._connection.readyState;

        if (state === STATUS.CONNECTED) return true;

        if (state === STATUS.CONNECTING) {
            await new Promise((resolve) => setTimeout(resolve, 1000));

            return this.isConnected();
        }

        if (state === STATUS.DISCONNECTING) return false;

        if (state === STATUS.DISCONNECTED) return false;
    }

    static connect() {
        console.log("Connecting to MongoDB...", process.env.MONGO_DB_URL);
        Mongoose.connect(
            process.env.MONGO_DB_URL, {
                useNewUrlParser: true,
            },
            (error) => {
                if (!error) return;

                console.log("Connection failed with MongoDB: ", error);
            }
        );

        const connection = Mongoose.connection;

        connection.once("open", () => console.log("MONGODB: Connected database!"));

        return connection;
    }

    create(item) {
        return this._schema.create(item);
    }

    read(query, skip = 0, limit = 10) {
        return this._schema.find(query).skip(skip).limit(limit);
    }

    update(id, item) {
        return this._schema.updateOne({ _id: id }, { $set: item });
    }

    delete(id) {
        return this._schema.deleteOne({ _id: id });
    }
}

module.exports = MongoDB;