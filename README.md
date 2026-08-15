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

## Enable shared saving

1. Create a Supabase project.
2. Open the Supabase SQL Editor and run `supabase.sql`.
3. Put your Supabase project URL and anon/publishable browser key in `config.js`.
4. Deploy this repository as a static site (GitHub Pages, Netlify, Vercel, etc.).
5. Open the site and use **Copy share link**. Give that URL to the GM and players.

Do not put a Supabase `service_role` key in `config.js`. Only the browser anon/publishable key belongs there.

## Rule data

The first implementation includes the hulls, bridges, power plants, shields, engineering/helm/LSC modifications and weapons supplied in the project brief. Rules can be expanded in `app.js` as more equipment is added.

## Important

The share URL contains the secret ship UUID. Anyone who has the link can edit that ship, which is intentional for a GM/player shared sheet. Keep ship links private to the campaign.
