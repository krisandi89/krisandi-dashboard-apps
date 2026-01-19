const fs = require('fs').promises;

const paths = [
    "/Users/krisandisaptyanto/Library/CloudStorage/SynologyDrive-SandiFIle/PERSONAL/FAMILY/SANDI/Aplikasi Antigravity/Yt-Video-Youtube/Start Video Downloader.command",
    "/Users/krisandisaptyanto/Library/CloudStorage/SynologyDrive-SandiFIle/PERSONAL/FAMILY/SANDI/Aplikasi Antigravity/Meeting-Note-Geinus/start.command",
    "/Users/krisandisaptyanto/Library/CloudStorage/SynologyDrive-SandiFIle/PERSONAL/FAMILY/SANDI/Aplikasi Antigravity/Prompt-Json-Generator/start_app.command"
];

async function check() {
    for (const p of paths) {
        try {
            await fs.access(p);
            console.log(`✅ OK: ${p}`);
        } catch (e) {
            console.log(`❌ FAIL: ${p}`);
            console.error(e);
        }
    }
}

check();
