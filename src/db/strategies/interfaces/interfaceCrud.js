class NotImplementedException extends Error {
    constructor() {
        super("NotImplementedException");
    }
}

class ICrud {
    create(item) {
        throw new NotImplementedException();
    }

    read(query, skip, limit) {
        throw new NotImplementedException();
    }

    update(id, item, upsert) {
        throw new NotImplementedException();
    }

    delete(id) {
        throw new NotImplementedException();
    }

    isConnected() {
        throw new NotImplementedException();
    }

    connect() {
        throw new NotImplementedException();
    }

    defineModel() {
        throw new NotImplementedException();
    }
}

module.exports = ICrud;