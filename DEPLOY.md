# Share / deploy the dashboard

The dashboard is a static website (HTML + JS, no server, no database), so it runs on any Windows, Mac, Linux or phone browser.

## Option 1 - Send one file (easiest, works offline)
Send `DWM_Dashboard_Standalone.html` by email / WhatsApp / Google Drive / USB.
The receiver double-clicks it. Windows users can also use `Start_Dashboard.bat`.
Edited the code? Run `python build_standalone.py` to rebuild this file.

## Option 2 - Public link in 2 minutes (Netlify Drop)
1. Open https://app.netlify.com/drop  2. Drag the `website` folder onto the page.
3. Copy the link it gives you and share it. (Free account needed to keep it permanently.)

## Option 3 - GitHub Pages (permanent link)
1. Create a GitHub repository and upload this whole project folder (keep `.github/workflows/pages.yml`).
2. Repository > Settings > Pages > Source: **GitHub Actions**.
3. Push to `main`; the site is published at `https://<your-name>.github.io/<repo>/`.

## Option 4 - Share the whole project
Send `DWM_Mini_Project.zip`. Unzip, then open `website/index.html` or run `run_website.py` in PyCharm.

## Notes
* Uploaded CSVs never leave the user's browser; reports and datasets are saved in that browser (localStorage), so each device keeps its own history.
* To use your own data: header buttons A / B > Upload (CSV with a header row and one yes/no style target column).
