import pool from './db';

export async function insertPlayer(discord_id: string, username: string) {
    const query = 'INSERT INTO player (discord_id, username) VALUES ($1, $2)';
    const values = [discord_id, username];
    await pool.query(query, values);
}

export async function insertCard(name: string, base_score: number, rarity: number, description: string, series: string, image_url: string, ) {
    const query = 'INSERT INTO card (name, base_score, rarity, description, series, image_url) VALUES ($1, $2, $3, $4, $5, $6)'
    const values = [name, base_score, rarity, description, series, image_url];
    await pool.query(query, values);
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