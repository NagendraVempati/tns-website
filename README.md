# TNS Infrasolutions - Electrical & Infrastructure

A responsive, buildless website for HT/LT line works, electrical line shifting, underground cable works and 11 kV / 33 kV substation infrastructure.

## Open the website

Open `index.html` directly, or run from this folder:

```powershell
python -m http.server 8768 --bind 127.0.0.1
```

Then visit http://127.0.0.1:8768.

## Files

- `index.html`: page content and structure
- `dist/styles.css`: responsive design, colors and motion
- `dist/app.js`: image annotations, service dialogs, sector tabs, mobile menu and email project enquiries
- `dist/assets/`: images and favicon
- `.openai/hosting.json`: Sites identity and deployment configuration
- `IMAGE-CREDITS.md`: generated imagery provenance and exact prompts

## Business details to personalize

The business name is TNS Infrasolutions. The intended domain is tnsinfrasolution.com. The lightning logo and ELECTRICAL & INFRASTRUCTURE tagline are preserved. The service area still needs adding. Sites currently reports the domain is already in use, so it has not been connected to this Site.

The project form opens the visitor's email app with a draft addressed to `sivaram@tnsinfrasolution.com`. The visitor must press Send in their email app; the static website does not send mail automatically. The footer includes phone and WhatsApp links for +91 99893 23228 and the business email. Instagram, X and YouTube icons are displayed without profile links, as requested; add the business profile URLs later. No visitor information is stored by this website. Google Fonts provides optional typefaces, with system-font fallbacks.

The two AI-generated images are illustrative service imagery rather than photographs of completed company projects. The original hero PNG is retained locally; the page uses optimized JPEGs.

## Validation

Checked in installed Chrome at desktop width and 320, 390 and 768 pixels: all images load, no horizontal page overflow, annotations open, sector tabs change content, service dialogs preselect the enquiry service, the original local brief generated and downloaded (since replaced by email composition), and mobile navigation opens/closes. No JavaScript runtime exceptions were observed.

## Hosting

For Git-based static hosting, publish this repository from its root directory. The entry page is `index.html`; keep the `dist` folder alongside it because it contains the styles, JavaScript and images. No build step is required. For GitHub Pages branch deployment, choose the branch containing these files and the `/ (root)` folder.

The `.openai/hosting.json` file records the previous Sites deployment configuration. It is not used by Git-based hosting; its old `dist` entry point no longer matches this root-based layout.

Local runtime files (`.tools`) and browser QA artifacts (`.qa`) are excluded from source commits. The original hero PNG is preserved in `source-assets` and is not included in the deployed static assets.
