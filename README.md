# RTP Arquivos Downloader

As I wanted to archive some footage, I made a quick and dirty script to bulk download full programs from RTP Arquivos, the video vault for a portuguese TV channel, using YT-DLP. Download is synchronous to not hammer their servers. It supports both none and paginated pages.
When running it will prompt you for a program link [(example)](https://arquivos.rtp.pt/programas/liga-dos-ultimos-2005/).

<br />

## Usage
<br />

Install the dependecies.
```
npm install
```

Build it.
```
npm run build
```

Run it.
```
npm run start
```

For development, use `npm run build:watch` to watch for changes and build automatically.