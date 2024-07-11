"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.givePlayerCard = exports.getAllItems = exports.insertItem = exports.getPlayerCardInventory = exports.getAllCards = exports.insertCard = exports.insertPlayer = void 0;
const db_1 = __importDefault(require("./db"));
function insertPlayer(discord_id, username) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = 'INSERT INTO player (discord_id, username) VALUES ($1, $2)';
        const values = [discord_id, username];
        yield db_1.default.query(query, values);
    });
}
exports.insertPlayer = insertPlayer;
function insertCard(name, base_score, rarity, description, series, image_url) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = 'INSERT INTO card (name, base_score, rarity, description, series, image_url) VALUES ($1, $2, $3, $4, $5, $6)';
        const values = [name, base_score, rarity, description, series, image_url];
        yield db_1.default.query(query, values);
    });
}
exports.insertCard = insertCard;
function getAllCards() {
    return __awaiter(this, void 0, void 0, function* () {
        const query = 'SELECT * FROM card';
        const res = yield db_1.default.query(query);
        return res.rows;
    });
}
exports.getAllCards = getAllCards;
function getPlayerCardInventory(discord_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = 'SELECT * FROM card_inventory WHERE discord_id = $1';
        const values = [discord_id];
        const res = yield db_1.default.query(query, values);
        return res.rows;
    });
}
exports.getPlayerCardInventory = getPlayerCardInventory;
function insertItem(name, effect) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = 'INSERT INTO item (name, effect) VALUES ($1, $2)';
        const values = [name, effect];
        yield db_1.default.query(query, values);
    });
}
exports.insertItem = insertItem;
function getAllItems() {
    return __awaiter(this, void 0, void 0, function* () {
        const query = 'SELECT * FROM item';
        const res = yield db_1.default.query(query);
        return res.rows;
    });
}
exports.getAllItems = getAllItems;
function givePlayerCard(discord_id, unique_card_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const checkQuery = 'SELECT 1 FROM card_inventory WHERE unique_card_id = $1';
        const checkValues = [unique_card_id];
        try {
            const checkRes = yield db_1.default.query(checkQuery, checkValues);
            if (checkRes.rows.length === 0) {
                throw new Error('Card with the provided unique ID does not exist.');
            }
            const updateQuery = 'UPDATE card_inventory SET discord_id = $1 WHERE unique_card_id = $2';
            const updateValues = [discord_id, unique_card_id];
            yield db_1.default.query(updateQuery, updateValues);
            console.log('Card successfully given to player.');
        }
        catch (err) {
            console.log('Error giving player card:');
            console.error(err);
        }
    });
}
exports.givePlayerCard = givePlayerCard;
