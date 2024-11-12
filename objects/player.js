class Player {

    constructor (accountID, socketID, townID, x, y, joinEpoch, competitionsWon, displayName, townRank, serverRank, itemID) {
        this._accountID = accountID;
        this._socketID = socketID;
        this._townID = townID;
        this._x = x;
        this._y = y;
        this._lastMoveTime = Date.now();
        this._lastActiveTime = Date.now();
        this._joinEpoch = joinEpoch;
        this._competitionsWon = competitionsWon;
        this._displayName = displayName;
        this._townRank = townRank;
        this._serverRank = serverRank;
        this._itemID = itemID;
        this._lastPositionRecalibration = Date.now();
    }

    setActive() {
        this._lastActiveTime = Date.now();
    }

    get accountID() {
        return this._accountID;
    }

    get townID() {
        return this._townID;
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    get lastMoveTime() {
        return this._lastMoveTime;
    }

    get joinEpoch() {
        return this._joinEpoch;
    }

    get competitionsWon() {
        return this._competitionsWon;
    }

    get displayName() {
        return this._displayName;
    }

    get townRank() {
        return this._townRank;
    }

    get serverRank() {
        return this._serverRank;
    }

    get lastPositionRecalibration() {
        return this._lastPositionRecalibration;
    }

    set townID(value) {
        this._townID = value;
    }

    set x(value) {
        this._x = value;
    }

    set y(value) {
        this._y = value;
    }

    set lastMoveTime(value) {
        this._lastMoveTime = value;
    }

    set competitionsWon(value) {
        this._competitionsWon = value;
    }

    set displayName(value) {
        this._displayName = value;
    }

    set townRank(value) {
        this._townRank = value;
    }

    set serverRank(value) {
        this._serverRank = value;
    }

    set lastPositionRecalibration(time) {
        this._lastPositionRecalibration = time;
    }

    get itemID() {
        return this._itemID;
    }

    set itemID(value) {
        this._itemID = value;
        this.setActive()
    }

    get socketID() {
        return this._socketID;
    }

    set socketID(value) {
        this._socketID = value;
    }
}

module.exports = {
    Player
}