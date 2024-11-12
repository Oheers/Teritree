class Claim {

    constructor(chunkID, townID, isPublic) {
        this._chunkID = chunkID;
        this._townID = townID;
        this._isPublic = isPublic;
    }

    get chunkID() {
        return this._chunkID;
    }

    get townID() {
        return this._townID;
    }

    set townID(value) {
        this._townID = value;
    }

    get isPublic() {
        return this._isPublic;
    }

    set isPublic(value) {
        this._isPublic = value;
    }
}

module.exports = {
    Claim
}