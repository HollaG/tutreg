This repository holds the code for the website running at [https://tutreg.com](https://tutreg.com).

This is a Next.JS 12 project.

## Getting Started

Prerequisites

-   MySQL running on port 3306

First, clone the repository.

Then, create a .env file with the following variables:

MYSQL_HOST=localhost
MYSQL_USER=[replace with your user]
MYSQL_PASSWORD=[replace with your password]
MYSQL_DATABASE=modreg
MYSQL_PORT=3306
NEXT_PUBLIC_AY=[replace with the current academic year]
NEXT_PUBLIC_SEM=[replace with the current sem]
NEXT_PUBLIC_BOT_NAME=[replace with the development bot name]
BOT_TOKEN=[replace with your development bot token]
NEXT_PUBLIC_ROOT_URL=[replace with the development URL, with a trailing slash]

ADMIN_USER=[contact me for the user]
ADMIN_PASSWORD=[contact me for the password]

NEXT_PUBLIC_COLLECTION_NAME = "requests_dev"
NEXT_PUBLIC_REQUEST_INDEX_COLLECTION_NAME = "requestIndex_dev"
NEXT_PUBLIC_SYNC_COLLECTION_NAME = "userStorage_dev"

Click [here](https://drive.google.com/file/d/17dpXUMhedSnU1TUkOFiYW5hxBnUY4Cv5/view?usp=sharing) to download the MySQL table structure.

Then, run MySql, and type

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
