import { chromium } from 'playwright';
import fs from 'fs';

async function makeLogoTransparent() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const imgPath = "d:/job portal/frontend/public/careonix-brand-logo.png";
  const imgBase64 = fs.readFileSync(imgPath).toString('base64');
  const dataUrl = `data:image/png;base64,${imgBase64}`;

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

        // Make background white transparent
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // If white / near-white background
          if (r > 240 && g > 240 && b > 240) {
            data[i + 3] = 0;
          } else if (r > 220 && g > 220 && b > 220) {
            // Smooth alpha falloff for antialiasing
            const brightness = (r + g + b) / 3;
            data[i + 3] = Math.max(0, Math.min(255, Math.round((255 - brightness) * 8)));
          }
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png').split(',')[1]);
      };
      img.src = src;
    });
  }, dataUrl);

  await browser.close();
  const outputPath = 'd:/job portal/frontend/public/careonix-logo-transparent.png';
  fs.writeFileSync(outputPath, Buffer.from(resultPngBase64, 'base64'));
  console.log('Transparent logo saved at:', outputPath);
}

makeLogoTransparent().catch(console.error);
