# This bot using baileys to run
(view in code to see it properly)



install dependencies
npm install @whiskeysockets/baileys qrcode-terminal axios cheerio


# Project Structure
you can follow this structure or create your own path

botdirectory/
│
├── auth/                              
│
├── data/
│   ├── roles.json                    
│   ├── moderole.json                
├── handlers/
|   ├── tagall/
│   │   └── tagall.js
│   ├── welcome/
│   │   └── welcome.js
│   │
│   ├── linkfilter/
│   │   └── linkfilter.js
│   │
│   ├── timeout/
│   │   └── timeout.js
│   │
│   ├── roles/
│   │   └── role.js
│   │       
│
├── index.js                          # Entry point bot
├── package.json
└── package-lock.json




