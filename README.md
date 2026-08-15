# Astrovoyage Ship Builder

A shared, persistent ship sheet for the Astrovoyage space TTRPG.

## Features

- Share one ship with the GM and players using a secret UUID link.
- Edit the same ship from multiple browsers.
- Hull, bridge, power plant, shields, modifications and weapons.
- Live/current Hull, Shield, Power and Cargo state.
- System damage tracking.
- Automatic cargo capacity, effective shield HP, command points, ship cost and monthly maintenance calculations.
- Campaign notes.
- Works locally in a browser before Supabase is configured.
- Vercel-ready static deployment.

## Deploy with Vercel

1. Create a Supabase project.
2. Open the Supabase SQL Editor and run `supabase.sql`.
3. In Vercel, import this GitHub repository.
4. In Vercel **Settings → Environment Variables**, add:
   - `SUPABASE_URL` = your Supabase project URL
   - `SUPABASE_ANON_KEY` = your Supabase anon/publishable browser key
5. Redeploy after adding the variables.
6. Open the deployed site and use **Copy share link**. Give that URL to the GM and players.

The frontend uses the browser-safe Supabase anon/publishable key. Never put a Supabase `service_role` key in Vercel environment variables intended for the browser or in the repository.

## Supabase configuration note

The current static frontend reads `window.SUPABASE_URL` and `window.SUPABASE_ANON_KEY`. If your Vercel deployment does not inject those values into the static page, use the included `config.js` as the deployment configuration file, or add a tiny Vercel build step that generates `config.js` from the two environment variables. Do not commit the actual secret values.

## Rule data

The first implementation includes the hulls, bridges, power plants, shields, engineering/helm/LSC modifications and weapons supplied in the project brief. Rules can be expanded in `app.js` as more equipment is added.

## Important

The share URL contains the secret ship UUID. Anyone who has the link can edit that ship, which is intentional for a GM/player shared sheet. Keep ship links private to the campaign.
