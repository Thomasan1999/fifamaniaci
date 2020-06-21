import * as sharp from 'sharp';

// @ts-ignore
sharp(`src/assets/home-background-2.jpg`).webp({quality: 60}).toFile(`src/assets/home-background-2.webp`).catch(console.error);
