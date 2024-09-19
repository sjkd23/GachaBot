import pool from './db';
import { Card, Player, PlayerInventory, Rarity, Series } from './constants/definitions';
import { hasBeen24Hours, numberToRarity, parseTimestamp, rarityToNumber } from './utils/misc';
import { processAndUploadToCloudinary } from './utils/api';

export async function insertPlayer(discord_id: string, username: string) {
    const query = 'INSERT INTO player (discord_id, username) VALUES ($1, $2)';
    const values = [discord_id, username];
    await pool.query(query, values);

}


export async function getPlayer(discord_id: string): Promise<Player> {
    const query = 'SELECT * FROM player WHERE discord_id = $1'
    const res = await pool.query(query, [discord_id]);

    const row = res.rows[0];

    const player: Player = {
        discord_id: row.discord_id,
        username: row.username,
        wallet: row.wallet
    }
    return player;
}

export async function validPlayer(discord_id: string): Promise<boolean> {
    const query = 'SELECT * FROM player WHERE discord_id = $1';
    const res = await pool.query(query, [discord_id]);

    if (res.rows.length > 0) {
        return true;
    } else {
        return false;
    }
}

export async function getUserRole(discord_id: string): Promise<string> {
    const query = 'SELECT role FROM player WHERE discord_id = $1'

    const res = await pool.query(query, [discord_id]);

    return res.rows[0].role;
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

export async function insertCard(name: string, rarity: Rarity, description: string, url: string, author: string, series: Series): Promise<boolean> {

    const image = await processAndUploadToCloudinary(url, rarity);

    const id = await generateUniqueCardID();
    const card: Card = { id, name, rarity, description, url: image, author, series }
    await ensureUniqueCard(card);
    const rarityNumber = await rarityToNumber(rarity);

    const query = 'INSERT INTO card (id, name, rarity, description, url, author, series_id) VALUES ($1, $2, $3, $4, $5, $6, $7)'
    const values = [id, name, rarityNumber, description, image, author, series.id];
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

    if (series) {
        const seriesID = await getSeriesID(series);
        params.push(seriesID);
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
            series: await idToSeries(row.series_id)
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
    const series = await idToSeries(row.series_id);
    const card: Card = { id: row.id, name: row.name, description: row.description, rarity: rarity, url: row.url, author: row.author, series }

    return card;
}

export async function addCardToPlayerInventory(discord_id: string, card_id: string): Promise<number> {
    const query = 'SELECT * FROM player_card_inventory WHERE discord_id = $1 AND card_id = $2';
    const values = [discord_id, card_id];

    const res = await pool.query(query, values);

    if (res.rows.length > 0) {
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

    if (newAmount >= 0) {
        const query = 'UPDATE player SET wallet = $2 WHERE discord_id = $1';
        const values = [id, newAmount];
        await pool.query(query, values);

        return newAmount;
    } else {
        return newAmount;
    }
}

export async function getPlayerCards(discord_id: string): Promise<Card[]> {
    const invQuery = 'SELECT card_id FROM player_card_inventory WHERE discord_id = $1'
    const invRes = await pool.query(invQuery, [discord_id]);

    if (invRes.rows.length === 0) {
        return [];
    }

    const values: string[] = invRes.rows.map(row => row.card_id);

    const query = `SELECT * FROM card WHERE id = ANY($1::text[])`;
    const res = await pool.query(query, [values])
    const cards: Card[] = await Promise.all(
        res.rows.map(async (row) => ({
            id: row.id,
            name: row.name,
            description: row.description,
            rarity: await numberToRarity(row.rarity),
            url: row.url,
            author: row.author,
            series: await idToSeries(row.series_id)
        }))
    );
    return cards;
}

export async function getPlayerItems(discord_id: string): Promise<PlayerInventory[]> {

    const query = `
        SELECT i.name, i.description, pi.quantity
        FROM player_item_inventory pi
        JOIN item i ON pi.item_id = i.id
        WHERE pi.discord_id = $1
    `;
    const res = await pool.query(query, [discord_id]);

    if (res.rows.length === 0) {
        return [];
    }

    const playerInventory: PlayerInventory[] = res.rows.map((row: any) => ({
        item: {
            name: row.name,
            description: row.description
        },
        quantity: row.quantity
    }));

    return playerInventory;
}

export async function getAllSeries(): Promise<Series[]> {
    const query = 'SELECT * FROM series ORDER BY name';
    const res = await pool.query(query);

    const series: Series[] = await Promise.all(
        res.rows.map(async (row) => ({
            id: row.id,
            name: row.name,
            description: row.description
        }))
    );
    return series;
}

export async function getSeriesID(series: string): Promise<number> {
    const query = 'SELECT id FROM series WHERE name = $1'
    const res = await pool.query(query, [series])

    return res.rows[0].id;
}

export async function idToSeries(seriesID: number): Promise<Series> {
    const query = 'SELECT * FROM series WHERE id = $1'
    const res = await pool.query(query, [seriesID]);

    const series: Series[] = await Promise.all(
        res.rows.map(async (row) => ({
            id: row.id,
            name: row.name,
            description: row.description
        }))
    );
    return series[0];
}
export async function checkDailyCalendarTime(discord_id: string): Promise<{ canUse: boolean; timeLeft?: number }> {
    const query = 'SELECT last_use FROM daily_calendar WHERE discord_id = $1 LIMIT 1';
    const res = await pool.query(query, [discord_id]);

    if (res.rows.length > 0) {
        const lastUsedTimestamp = parseTimestamp(res.rows[0].last_use);
        const { expired, timeLeft } = hasBeen24Hours(lastUsedTimestamp);

        if (expired) {
            await addToCalendar(discord_id);
            return { canUse: true };
        } else {
            return { canUse: false, timeLeft };
        }
    } else {
        await addToCalendar(discord_id);
        return { canUse: true };
    }
}


export async function addToCalendar(discord_id: string): Promise<void> {
    const query = `
      INSERT INTO daily_calendar (discord_id, last_use)
      VALUES ($1, NOW())
      ON CONFLICT (discord_id) DO UPDATE
      SET last_use = EXCLUDED.last_use
    `;

    await pool.query(query, [discord_id]);
}
