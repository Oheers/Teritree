class Town {

    constructor(townID, leader, spawnX, spawnY, name, colourID, description, invite_only, invite_code) {
        this.invite_only = invite_code;
        this._townID = townID;
        this._leader = leader;
        this._spawnX = spawnX;
        this._spawnY = spawnY;
        this._name = name;
        this._colourID = colourID;
        this._description = description;
        this._invite_only = invite_only;
        this._invite_code = invite_code;

        this._claims = {}
    }

    addClaim(chunkID, claim) {
        this._claims[chunkID] = claim;
    }

    get townID() {
        return this._townID;
    }

    get leader() {
        return this._leader;
    }

    set leader(value) {
        this._leader = value;
    }

    get spawnX() {
        return this._spawnX;
    }

    set spawnX(value) {
        this._spawnX = value;
    }

    get spawnY() {
        return this._spawnY;
    }

    set spawnY(value) {
        this._spawnY = value;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    get colourID() {
        return this._colourID;
    }

    set colourID(value) {
        this._colourID = value;
    }

    get description() {
        return this._description;
    }

    set description(value) {
        this._description = value;
    }

    get invite_only() {
        return this._invite_only;
    }

    set invite_only(value) {
        this._invite_only = value;
    }

    get invite_code() {
        return this._invite_code;
    }

    set invite_code(value) {
        this._invite_code = value;
    }
}

module.exports = {
    Town
}