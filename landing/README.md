# Landing page

A static marketing page for the 75 Hard app: what the app does and the rules of the challenge. Plain HTML and CSS, no build step.

```bash
# Preview it
python3 -m http.server 4000 --directory landing
# then open http://localhost:4000
```

The sign-up and sign-in buttons point at the local app (`http://localhost:3000`). Swap those URLs in `index.html` for your production app before deploying. Any static host works (Vercel, Netlify, GitHub Pages, S3).
