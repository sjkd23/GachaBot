import pool from './db';
import { Card, Rarity } from './constants/definitions';
import { numberToRarity, rarityToNumber } from './utils/misc';
import { processAndUploadToCloudinary } from './utils/api';

export async function insertPlayer(discord_id: string, username: string) {
    const query = 'INSERT INTO player (discord_id, username) VALUES ($1, $2)';
    const values = [discord_id, username];
    await pool.query(query, values);
}

export async function generateUniqueCardID(): Promise<string> {
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
            LOWER(url) = LOWER($3)
    `;
    const values = [card.name, card.description, card.url];

    const result = await pool.query(query, values);

    if (result.rows.length > 0) {
        throw new Error('Card with the same name, description, or URL already exists.');
    }
}

export async function insertCard(name: string, rarity: Rarity, description: string, url: string, author: string, series: string = 'Wanderer'): Promise<boolean> {

    const image = await processAndUploadToCloudinary(url, rarity);

    const id = await generateUniqueCardID();
    const card: Card = { id, name, rarity, description, url: image, author, series }
    await ensureUniqueCard(card);
    const rarityNumber = await rarityToNumber(rarity);

    const query = 'INSERT INTO card (id, name, rarity, description, url, author) VALUES ($1, $2, $3, $4, $5, $6)'
    const values = [id, name, rarityNumber, description, image, author];
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

export async function checkCardList({
    id,
    name,
    rarity,
    url,
    author,
    series,
}: {
    id?: string,
    name?: string;
    rarity?: Rarity;
    url?: string;
    author?: string;
    series?: string;
} = {}): Promise<Card[]> {

    let content: string[] = [];
    const params: any[] = [];

    if (id) {
        params.push(id);
        content.push(`id = $${params.length}`);
    }
    if (name) {
        params.push(name);
        content.push(`name = $${params.length}`);
    }

    if (rarity) {
        const rarityNumber = await rarityToNumber(rarity);
        params.push(rarityNumber);
        content.push(`rarity = $${params.length}`);
    }

    if (url) {
        params.push(url);
        content.push(`url = $${params.length}`);
    }

    if (author) {
        params.push(author);
        content.push(`author = $${params.length}`);
    }

    if(series) {
        params.push(series);
        content.push(`series = $${params.length}`);
    }

    const query = content.length === 0
        ? 'SELECT * FROM card'
        : `SELECT * FROM card WHERE ${content.join(' AND ')}`;

    const res = await pool.query(query, params);

    const cards: Card[] = await Promise.all(
        res.rows.map(async (row) => ({
            id: row.id,
            name: row.name,
            description: row.description,
            rarity: await numberToRarity(row.rarity),
            url: row.url,
            author: row.author,
            series: row.series
        }))
    );

    return cards;
}


export async function getCard(id: string): Promise<Card> {

    const query = 'SELECT * FROM card WHERE id = $1';
    const values = [id];

    const res = await pool.query(query, values)
    const row = res.rows[0];
    const rarity = await numberToRarity(row.rarity);
    const card: Card = { id: row.id, name: row.name, description: row.description, rarity: rarity, url: row.url, author: row.author, series: row.series }

    return card;
}

export async function addCardToPlayerInventory(discord_id: string, card_id: string): Promise<number> {
    const query = 'SELECT * FROM player_card_inventory WHERE discord_id = $1 AND card_id = $2';
    const values = [discord_id, card_id];

    const res = await pool.query(query, values);

    if (res.rowCount! > 0) {
        const newQuantity = res.rows[0].quantity + 1;
        const updateQuery = `UPDATE player_card_inventory
                             SET quantity = $3
                             WHERE discord_id = $1 AND card_id = $2`;

        await pool.query(updateQuery, [discord_id, card_id, newQuantity]);

        return newQuantity;
    } else {
        const insertQuery = 'INSERT INTO player_card_inventory (discord_id, card_id) VALUES ($1, $2)';
        await pool.query(insertQuery, values);

        return 1;
    }
}

export async function changeWallet(id: string, amount: number): Promise<number> {
    const findQuery = 'SELECT * FROM player WHERE discord_id = $1';
    const findRes = await pool.query(findQuery, [id]);

    const newAmount = findRes.rows[0].wallet + amount;

    console.log(newAmount)
    if (newAmount >= 0) {
        const query = 'UPDATE player SET wallet = $2 WHERE discord_id = $1';
        const values = [id, newAmount];
        await pool.query(query, values);

        return newAmount;
    } else {
        return newAmount;
    }
}

export async function getAllSeries(): Promise<string[]> {
    const query = 'SELECT DISTINCT series FROM card';

    const res = await pool.query(query);
    const allSeries: string[] = [];

    if (res.rowCount! > 0) {
        for (let row of res.rows) {
            allSeries.push(row.series);
        }
    }
    return allSeries;
}