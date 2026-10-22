# gator

A command-line RSS feed aggregator. Follow blogs, let `gator` collect their posts into
PostgreSQL in the background, and read them from your terminal.

Built in TypeScript with [Drizzle ORM](https://orm.drizzle.team/) and PostgreSQL, as part of
the [Boot.dev](https://boot.dev) "Build a Blog Aggregator" course.

## Requirements

| | Version | Why |
|---|---|---|
| [Node.js](https://nodejs.org) | 20 or later | the CLI runs on Node; global `fetch` is used to pull feeds |
| [PostgreSQL](https://www.postgresql.org/download/) | 13 or later | stores users, feeds and posts; needs `gen_random_uuid()` |

Developed against Node 24 and PostgreSQL 16.

## Install

```bash
git clone https://github.com/dkbozkurt/bootDev-blogAggregator-ts.git
cd bootDev-blogAggregator-ts
npm install
```

## Set up the database

Create an empty database for `gator`:

```bash
createdb gator
```

Then create a config file at **`~/.gatorconfig.json`** — note it lives in your home
directory, not in the repo, because it holds your database password:

```json
{
  "db_url": "postgres://username:password@localhost:5432/gator?sslmode=disable",
  "current_user_name": ""
}
```

Replace `username` and `password` with your own PostgreSQL credentials. Leave
`current_user_name` empty; `gator` fills it in when you register or log in.

Finally, create the tables:

```bash
npm run migrate
```

## Usage

Every command runs through `npm start`:

```bash
npm start <command> [arguments]
```

If an argument begins with a dash, put `--` first so npm passes it through:
`npm start -- browse -5`.

### Getting started

```bash
npm start register alice                                  # create a user and log in as them
npm start addfeed "Hacker News" "https://hnrss.org/newest" # add a feed and follow it
npm start agg 30s                                         # collect posts every 30s (Ctrl-C to stop)
npm start browse 5                                        # read the 5 newest posts
```

Leave `agg` running in one terminal while you use `gator` in another. It fetches **one**
feed per tick — whichever was fetched longest ago — so adding more feeds does not mean
hammering anyone's server.

> Be considerate with the interval. `agg 1s` against a handful of feeds is a lot of requests
> to someone else's blog. Start at `30s` or more.

### Commands

| Command | What it does |
|---|---|
| `register <name>` | Create a user and log in as them |
| `login <name>` | Switch to an existing user |
| `users` | List all users, marking the current one |
| `reset` | Delete every user — and, by cascade, all feeds, follows and posts |
| `addfeed <name> <url>` | Add a feed and follow it *(login required)* |
| `feeds` | List every feed with whoever added it |
| `follow <url>` | Follow a feed someone else added *(login required)* |
| `following` | List the feeds you follow *(login required)* |
| `unfollow <url>` | Stop following a feed *(login required)* |
| `agg <duration>` | Collect posts in a loop until Ctrl-C. Duration is `500ms`, `30s`, `10m`, `1h` |
| `browse [limit]` | Read the newest posts from feeds you follow (default 2) *(login required)* |

### A typical session

```bash
npm start register alice
npm start addfeed "Boot.dev Blog" "https://blog.boot.dev/index.xml"
npm start addfeed "Hacker News" "https://hnrss.org/newest"

npm start agg 1m        # leave this running in its own terminal

npm start following     # in another terminal
npm start browse 10
```

Another user can follow a feed alice already added:

```bash
npm start register bob
npm start feeds                                  # see what exists
npm start follow "https://hnrss.org/newest"
npm start browse
```

## How it works

`gator` keeps four tables:

- **users** — who is using the program
- **feeds** — RSS feeds, each owned by the user who added it, plus when it was last fetched
- **feed_follows** — which users follow which feeds (many-to-many)
- **posts** — individual articles, unique by URL

`agg` loops forever. On each tick it picks the feed with the oldest `last_fetched_at`
(never-fetched feeds come first), downloads it, and stores any posts it has not seen before.
`browse` then walks posts → feeds → feed_follows to show only what the current user follows.

Who you are is remembered in `~/.gatorconfig.json`, since a CLI program keeps no state of its
own between runs.

### Project layout

```
src/
  index.ts              entry point: parses argv, dispatches to a command
  commands.ts           command registry, handlers, the agg loop
  config.ts             reads and writes ~/.gatorconfig.json
  schema.ts             table definitions
  lib/
    rss.ts              fetches and parses RSS XML
    db/
      index.ts          database connection
      queries/          one module per table
      *.sql             generated migrations
```

## Development

After changing `src/schema.ts`, generate and apply a migration:

```bash
npm run generate   # writes a new .sql file from the schema
npm run migrate    # applies any migrations that have not run yet
```

Migrations are committed to the repo, so anyone cloning it gets the same database structure.

## License

ISC
