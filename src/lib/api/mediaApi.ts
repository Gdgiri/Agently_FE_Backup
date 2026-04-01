
import axios from 'axios';

const CLOUDINARY_API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = import.meta.env.VITE_CLOUDINARY_API_SECRET;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;


// Helper to generate SHA-1 signature using Web Crypto API
async function generateSignature(params: Record<string, string>, secret: string) {
    const sortedKeys = Object.keys(params).sort();
    const signatureString = sortedKeys.map(key => `${key}=${params[key]}`).join('&') + secret;

    const msgUint8 = new TextEncoder().encode(signatureString);
    const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const mediaApi = {
    upload: async (file: File) => {
        if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !CLOUDINARY_CLOUD_NAME) {
            console.error('Cloudinary credentials missing in .env');
            throw new Error('Cloudinary configuration error');
        }

        const timestamp = Math.round(new Date().getTime() / 1000).toString();

        // For simple uploads, we just need timestamp
        const params = {
            timestamp: timestamp,
        };

        const signature = await generateSignature(params, CLOUDINARY_API_SECRET);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', CLOUDINARY_API_KEY);
        formData.append('timestamp', timestamp);
        formData.append('signature', signature);

        const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;

        const response = await axios.post(url, formData);

        // Transform Cloudinary response to match expected format
        return {
            data: {
                success: true,
                data: {
                    url: response.data.secure_url,
                    publicId: response.data.public_id
                }
            }
        };
    },
    delete: async (publicId: string) => {
        if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !CLOUDINARY_CLOUD_NAME) {
            throw new Error('Cloudinary configuration error');
        }

        const timestamp = Math.round(new Date().getTime() / 1000).toString();
        const params = {
            public_id: publicId,
            timestamp: timestamp,
        };

        const signature = await generateSignature(params, CLOUDINARY_API_SECRET);

        const formData = new FormData();
        formData.append('public_id', publicId);
        formData.append('api_key', CLOUDINARY_API_KEY);
        formData.append('timestamp', timestamp);
        formData.append('signature', signature);

        const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/destroy`;

        const response = await axios.post(url, formData);
        return response.data;
    }
};
