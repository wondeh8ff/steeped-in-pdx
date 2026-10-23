# Steeped in Portland

A podcast-first site for Shaii Flores. Static HTML and CSS; no install, build, account, or API key required.

## Preview locally

Run `python3 -m http.server 4173` in this folder, then open http://localhost:4173.

## Content

`index.html` contains the five full episodes and season trailer verified against https://www.youtube.com/@SteepedinPDX/videos on October 22, 2026. Full episodes are listed newest first. The featured episode is the latest full conversation, rather than a trailer. Durations are rounded to the minutes displayed on YouTube.

To add a guest episode, move the previous featured episode into the episode grid and replace the featured title, guest, video URL, thumbnail ID, duration, episode number, and hero link. Guests appear with their published episodes; no unconfirmed future guests are advertised. YouTube thumbnails remain hosted by YouTube.

The guest suggestion link prepares an email to the existing contact address. Visitors review and send it in their own email app. Nothing is submitted automatically, and the site does not collect or store responses. The old app waitlist script is retained in the repository for reference but is not called by this website.

## Staging and release

Work is committed locally on `codex/podcast-staging`, separate from `main`. GitHub upload is pending write access: the connector returned 403 and local Git authentication failed. Staging is prepared for a separate Vercel project, with crawler exclusion configured only in the staging deployment. The hosted preview is pending project creation and connector access. No production domain or DNS configuration is changed. The visible staging label appears on hosts other than steepedinportland.com and www.steepedinportland.com.

The original entry file was `Index.html` with an uppercase I. The new standard entry file is `index.html`. Before a future production release, confirm the existing hosting provider serves that entry file. The staging crawler exclusion must not be copied to production. Review and merge only after Shaii approves the site.

Original artwork and team credits are retained from the existing repository. Public sources: https://steepedinportland.com/ and the YouTube channel above.
