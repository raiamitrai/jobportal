import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function makeTransparent() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const imgPath = "C:/Users/asus/.gemini/antigravity-ide/brain/69a560e5-0da2-4e41-a87c-ad1f7937898e/login_3d_briefcase_resume_1787056429095.jpg";
  const imgBase64 = fs.readFileSync(imgPath).toString('base64');
  const dataUrl = `data:image/jpeg;base64,${imgBase64}`;

  const resultPngBase64 = await page.evaluate(async (src) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const width = canvas.width;
        const height = canvas.height;

        // Flood-fill or edge-based transparency detection for checkerboard background:
        // Checkerboard pixels have low saturation and high brightness (grays/whites like (240,240,240), (200,200,200), (220,220,220))
        // Let's use flood fill from edges (0,0), (width-1,0), (0,height-1), (width-1,height-1)
        const visited = new Uint8Array(width * height);
        const queue = [];

        function isBg(r, g, b) {
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const diff = max - min;
          // Checkerboard is strictly neutral gray/white (diff < 15 and brightness > 170)
          return diff <= 18 && min >= 170;
        }

        // Push perimeter points
        for (let x = 0; x < width; x++) {
          queue.push([x, 0], [x, height - 1]);
        }
        for (let y = 0; y < height; y++) {
          queue.push([0, y], [width - 1, y]);
        }

        let head = 0;
        while (head < queue.length) {
          const [x, y] = queue[head++];
          const idx = y * width + x;
          if (visited[idx]) continue;
          visited[idx] = 1;

          const p = idx * 4;
          const r = data[p];
          const g = data[p + 1];
          const b = data[p + 2];

          if (isBg(r, g, b)) {
            data[p + 3] = 0; // Transparent!

            // Check 4 neighbors
            if (x > 0 && !visited[idx - 1]) queue.push([x - 1, y]);
            if (x < width - 1 && !visited[idx + 1]) queue.push([x + 1, y]);
            if (y > 0 && !visited[idx - width]) queue.push([x, y - 1]);
            if (y < height - 1 && !visited[idx + width]) queue.push([x, y + 1]);
          }
        }

        // Soften / antialias edges
        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png').split(',')[1]);
      };
      img.src = src;
    });
  }, dataUrl);

  await browser.close();
  const outputPath = 'd:/job portal/frontend/public/login-3d-transparent.png';
  fs.writeFileSync(outputPath, Buffer.from(resultPngBase64, 'base64'));
  console.log('Transparent PNG generated successfully at:', outputPath);
}

makeTransparent().catch(console.error);
