import { createHash } from 'node:crypto';
import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Include every lazy chunk. A changed core file creates a new, atomic offline pack.
export function offlineBuild() {
  let outDir;
  return {
    name: 'starlight-offline-build', apply: 'build',
    configResolved(config) { outDir = path.resolve(config.root, config.build.outDir); },
    async closeBundle() {
      const files = [];
      async function walk(directory) {
        for (const entry of await readdir(directory, { withFileTypes: true })) {
          const target = path.join(directory, entry.name);
          if (entry.isDirectory()) await walk(target); else files.push(target);
        }
      }
      await walk(outDir);
      const template = await readFile(path.join(outDir, 'sw.js'), 'utf8');
      const core = [], audio = [], hash = createHash('sha256'), audioHash = createHash('sha256');
      hash.update(template);
      let audioBytes = 0;
      for (const file of files.sort()) {
        const relative = path.relative(outDir, file).split(path.sep).join('/');
        const url = '/' + relative.split('/').map(encodeURIComponent).join('/');
        if (/\.mp3$/.test(relative)) {
          audio.push(url); audioBytes += (await stat(file)).size;
          audioHash.update(relative); audioHash.update(await readFile(file));
        }
        else if (relative !== 'sw.js' && /\.(html|js|css|png|ico|webmanifest|ttf|woff2?|txt)$/.test(relative)) {
          core.push(url); hash.update(relative); hash.update(await readFile(file));
        }
      }
      const audioRelease = audioHash.digest('hex').slice(0, 16);
      const release = hash.update(audioRelease).digest('hex').slice(0, 16);
      const worker = template
        .replace("'__RELEASE__'", JSON.stringify(release))
        .replace('__AUDIO_RELEASE__', audioRelease)
        .replace('/* CORE_ASSETS */ []', JSON.stringify(core))
        .replace('/* AUDIO_ASSETS */ []', JSON.stringify(audio))
        .replace('/* AUDIO_BYTES */ 0', String(audioBytes));
      await writeFile(path.join(outDir, 'sw.js'), worker);
      console.log(`Offline ${release}: ${core.length} core assets; optional music ${(audioBytes / 1048576).toFixed(1)} MB`);
    },
  };
}
