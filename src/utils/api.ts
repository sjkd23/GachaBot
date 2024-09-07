import { UploadApiResponse } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'stream';
import axios from 'axios';
import sharp from 'sharp';
import { Rarity } from '../constants/definitions';
import { insertCard } from '../dbFunctions';

const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


async function uploadToCloudinary(buffer: Buffer, publicId: string): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { public_id: publicId },
            (error: any, result: UploadApiResponse) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        // Create a readable stream from the buffer and pipe it to the upload stream
        const readableStream = new Readable();
        readableStream.push(buffer);
        readableStream.push(null); // End the stream
        readableStream.pipe(uploadStream);
    });
}

// Main function to process and upload image to Cloudinary
export async function processAndUploadToCloudinary(imageUrl: string, rarity: Rarity): Promise<string> {
    try {
        // Step 1: Fetch the image from the URL
        const response = await axios({
            url: imageUrl,
            responseType: 'arraybuffer',
        });

        const imageBuffer = Buffer.from(response.data, 'binary');
        const publicId = `images/${uuidv4()}`;

        try {
            let red, green, blue = 1;
            if(rarity === 'common') {
                red = 187;
                green = 190;
                blue = 187;
            } else if(rarity === 'uncommon') {
                red = 179;
                green = 236;
                blue = 209;
            } else if(rarity === 'rare') {
                red = 255;
                green = 166;
                blue = 197;
            } else if(rarity === 'legendary') {
                red = 244;
                green = 136;
                blue = 48;
            }

            // Step 2: Add a border using sharp
            const borderedImageBuffer = await sharp(imageBuffer)
                .extend({
                    top: 5, bottom: 5, left: 5, right: 5,
                    background: { r: red, g: green, b: blue, alpha: 1 }, // Example green border
                })
                .toBuffer();

            // Step 3: Upload the bordered image to Cloudinary
            const borderedUploadResult = await uploadToCloudinary(borderedImageBuffer, publicId);
            return borderedUploadResult.secure_url; // Return the URL with the border

        } catch (borderError) {
            console.error('Failed to add border, uploading original image:', borderError);

            // Step 4: If border processing fails, upload the original image
            const originalUploadResult = await uploadToCloudinary(imageBuffer, publicId);
            return originalUploadResult.secure_url; // Return the URL of the original image
        }

    } catch (error) {
        console.error('Error processing and uploading image:', error);
        throw error;
    }
}
