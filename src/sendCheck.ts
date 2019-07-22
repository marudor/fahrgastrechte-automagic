import { promises as fs } from 'fs';
import { outputFolder, syncFile } from './paths';

async function setSend() {
  const files = await fs.readdir(outputFolder, 'utf8');

  const last = files[files.length - 1];

  await fs.writeFile(syncFile, last, 'utf8');
}

if (process.argv[2] === 'send') {
  setSend();
}
