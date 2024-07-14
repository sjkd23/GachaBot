import pool from './db';
import { Card, Rarity } from './definitions';
import { rarityToNumber } from './utils';

export async function insertPlayer(discord_id: string, username: string) {
    const query = 'INSERT INTO player (discord_id, username) VALUES ($1, $2)';
    const values = [discord_id, username];
    await pool.query(query, values);
}

async function generateUniqueCardID(): Promise<string> {
    let uniqueID = false;

    const query = 'SELECT * FROM card WHERE id = $1';
    let id = '';

    while (!uniqueID) {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const randomLetters = Array.from({ length: 2 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
        const randomNumbers = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
        const randomID = `${randomLetters}${randomNumbers}`;

        const result = await pool.query(query, [randomID]);

        if (result.rows.length === 0) {
            id = randomID;
            uniqueID = true;
        }
    }
    return id;
}

async function ensureUniqueCard(card: Card): Promise<void> {
    const query = `
        SELECT 1 FROM card 
        WHERE 
            LOWER(name) = LOWER($1) OR 
            LOWER(description) = LOWER($2) OR 
            LOWER(image_url) = LOWER($3)
    `;
    const values = [card.name, card.description, card.url];

    const result = await pool.query(query, values);

    if (result.rows.length > 0) {
        throw new Error('Card with the same name, description, or URL already exists.');
    }
}

export async function insertCard(name: string, base_score: number, rarity: Rarity, description: string, url: string, author: string = 'Base game card'): Promise<boolean> {

    const card: Card = { name, score: base_score, rarity, description, url, author }
    await ensureUniqueCard(card);
    const id = await generateUniqueCardID();
    const rarityNumber = await rarityToNumber(rarity);

    const query = 'INSERT INTO card (id, name, base_score, rarity, description, image_url, author) VALUES ($1, $2, $3, $4, $5, $6, $7)'
    const values = [id, name, base_score, rarityNumber, description, url, author];
    const result = await pool.query(query, values);


    if (result.rowCount && result.rowCount > 0) {
        return true;
    } else {
        return false;
    }
}

export async function getAllCards() {
    const query = 'SELECT * FROM card';
    const res = await pool.query(query);
    return res.rows;
}

export async function getPlayerCardInventory(discord_id: string) {
    const query = 'SELECT * FROM card_inventory WHERE discord_id = $1';
    const values = [discord_id];
    const res = await pool.query(query, values);
    return res.rows;
}

export async function insertItem(name: string, effect: string) {
    const query = 'INSERT INTO item (name, effect) VALUES ($1, $2)'
    const values = [name, effect];
    await pool.query(query, values);
}

export async function getAllItems() {
    const query = 'SELECT * FROM item';
    const res = await pool.query(query);
    return res.rows;
}

export async function givePlayerCard(discord_id: string, unique_card_id: string) {
    const checkQuery = 'SELECT 1 FROM card_inventory WHERE unique_card_id = $1';
    const checkValues = [unique_card_id];

    try {
        const checkRes = await pool.query(checkQuery, checkValues);

        if (checkRes.rows.length === 0) {
            throw new Error('Card with the provided unique ID does not exist.');
        }

        const updateQuery = 'UPDATE card_inventory SET discord_id = $1 WHERE unique_card_id = $2';
        const updateValues = [discord_id, unique_card_id];
        await pool.query(updateQuery, updateValues);
        console.log('Card successfully given to player.');
    } catch (err) {
        console.log('Error giving player card:');
        console.error(err);
    }
}