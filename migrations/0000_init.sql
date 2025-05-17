CREATE TABLE IF NOT EXISTS "users" (
    "id" serial PRIMARY KEY,
    "username" text NOT NULL UNIQUE,
    "password" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "high_scores" (
    "id" serial PRIMARY KEY,
    "max_generations" integer NOT NULL,
    "max_population" integer NOT NULL,
    "longest_pattern" integer NOT NULL,
    "grid_size" integer NOT NULL,
    "date" timestamp NOT NULL,
    "session_id" text NOT NULL
);


