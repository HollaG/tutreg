This repository holds the code for the website running at [https://tutreg.com](https://tutreg.com).

# tutreg.com - An NUS Tutorial Registration Helper

### Relevant links
- [tutreg.com main site](https://tutreg.com)
- [tutreg.com companion extension](https://chromewebstore.google.com/detail/tutreg-companion-extensio/alklihigfndbjjihbglpfpadlmkcgdja?authuser=0&hl=en&pli=1)
- [tutreg.com companion extension Github](https://github.com/HollaG/tutreg-ext-chromium)
- [tutreg.com companion telegram bot](https://t.me/swaptutbot) (depreciating soon)
- [tutreg.com companion telegram bot Github](https://github.com/HollaG/tutreg-bot) (depreciating soon)
- [unofficial Firefox extension](https://github.com/CrunchyBiscuit19/TutReg-Companion-for-Firefox)

## Tech stack
This project is based off NextJS 12. (future plans to upgrade to NextJS@latest?)
### Frontend frameworks
- Chakra UI 2.7
- React DND
- Redux

### Backend
- MySQL
  - Storing course information
- Firebase
  - Storing user information


## Getting Started


### Contribution guide
I welcome any and all contributions. Put a PR in and I'll take a look at it.

### Prerequisites
- MySQL running on port 3306. I recommend downloading the XAMPP stack [here](https://www.apachefriends.org/)
- NodeJS v20 (tested, not sure if higher works. use NVM to manage your versions.)

### Setup 
#### MySQL setup
1. Click [here](https://drive.google.com/file/d/17dpXUMhedSnU1TUkOFiYW5hxBnUY4Cv5/view?usp=sharing) to download the MySQL table structure.
2. Create a database called "modreg" (without quotes).
3. Import the table structure into that database.
4. Create a MySQL user with corresponding password and take note of it.

#### Firebase setup
1. Firebase is only needed if you want to test the login system. Not necessary to work on the main site, just leave the .env entries blank.

#### Code setup
1. Fork and clone the repository.
2. Create an .env file as below:
```
MYSQL_HOST=localhost
MYSQL_USER=[YOUR_USER]
MYSQL_PASSWORD=[YOUR_PASSWORD]
MYSQL_DATABASE=modreg
MYSQL_PORT=3306
NEXT_PUBLIC_AY=[THE_CURRENT_ACAD_YEAR] # 2024-2025
NEXT_PUBLIC_SEM=[THE_CURRENT_SEM] # 1
NEXT_PUBLIC_BOT_NAME=[DEV_BOT_NANE] # Telegram bot. Not required.
BOT_TOKEN=[DEV_BOT_TOKEN] # Telegram bot. Not required
NEXT_PUBLIC_ROOT_URL=http://localhost

ADMIN_USER=[FIREBASE_USER] # send me an email for access
ADMIN_PASSWORD=[FIREBASE_PASSWORD] # send me an email for access

NEXT_PUBLIC_COLLECTION_NAME = "requests_dev"
NEXT_PUBLIC_REQUEST_INDEX_COLLECTION_NAME = "requestIndex_dev"
NEXT_PUBLIC_SYNC_COLLECTION_NAME = "userStorage_dev"
```


#### Startup
1. Run XAMPP and start modules "Apache" and "MySQL".
2. `cd` to the folder where tutreg is located and run `npm run dev`.


Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
