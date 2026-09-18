import fs from 'fs';
import path from 'path';

const styles = [
  {
    file: 'retro-80s.jpg',
    url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&h=600&q=85',
  },
  {
    file: 'cyberpunk.jpg',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&h=600&q=85',
  },
  {
    file: 'anime.jpg',
    url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&h=600&q=85',
  },
  {
    file: 'vintage.jpg',
    url: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=600&h=600&q=85',
  },
  {
    file: 'future.jpg',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&h=600&q=85',
  },
  {
    file: 'ceo.jpg',
    url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&h=600&q=85',
  },
  {
    file: 'superhero.jpg',
    url: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=600&h=600&q=85',
  },
  {
    file: 'space.jpg',
    url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=600&h=600&q=85',
  },
  {
    file: 'royal.jpg',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&h=600&q=85',
  },
  {
    file: 'y2k.jpg',
    url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=600&h=600&q=85',
  },
  {
    file: 'hollywood.jpg',
    url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&h=600&q=85',
  },
  {
    file: 'pixar.jpg',
    url: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&h=600&q=85',
  },
];

const destDir = path.resolve('./public/styles');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

async function run() {
  console.log('Downloading high-res curated style previews...');
  for (const item of styles) {
    const target = path.join(destDir, item.file);
    try {
      const res = await fetch(item.url);
      if (res.ok) {
        const buffer = await res.arrayBuffer();
        fs.writeFileSync(target, Buffer.from(buffer));
        console.log(`Saved: ${item.file} (${buffer.byteLength} bytes)`);
      } else {
        console.error(`Failed ${item.file}: Status ${res.status}`);
      }
    } catch (err) {
      console.error(`Error downloading ${item.file}:`, err);
    }
  }
  console.log('Completed downloading style previews.');
}

run();
