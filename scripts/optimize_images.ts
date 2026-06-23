import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const STAYS_DIR = path.join(process.cwd(), 'public', 'stays');

async function processDirectory(dirPath: string) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (entry.isFile() && /\.(jpg|jpeg|png|webp|avif)$/i.test(entry.name)) {
      try {
        const tempPath = `${fullPath}.tmp`;
        const metadata = await sharp(fullPath).metadata();
        
        let s = sharp(fullPath);
        
        // Resize if width > 1600
        if (metadata.width && metadata.width > 1600) {
          s = s.resize(1600, null, { withoutEnlargement: true });
        }

        // Output same format, but optimized
        if (/\.(jpg|jpeg)$/i.test(entry.name)) {
          s = s.jpeg({ quality: 80, mozjpeg: true });
        } else if (/\.png$/i.test(entry.name)) {
          s = s.png({ quality: 80, compressionLevel: 9 });
        } else if (/\.webp$/i.test(entry.name)) {
          s = s.webp({ quality: 80 });
        }
        
        await s.toFile(tempPath);
        
        // Overwrite original
        fs.renameSync(tempPath, fullPath);
        // console.log(`Optimized: ${fullPath}`);
      } catch (err) {
        console.error(`Error processing ${fullPath}:`, err);
      }
    }
  }
}

async function run() {
  console.log('Starting image optimization...');
  await processDirectory(STAYS_DIR);
  console.log('Finished image optimization.');
}

run();
