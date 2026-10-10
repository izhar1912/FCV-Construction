# FCV forms → Google Sheet + emails: setup (about 10 minutes)

## A. Create the sheet and backend (do this while signed in as **fcvsupport@gmail.com**)
Emails are sent from whichever Google account deploys the script, so this must be fcvsupport@gmail.com.

1. Go to sheets.google.com → create a blank spreadsheet. Name it **FCV Website Leads**.
2. Menu **Extensions → Apps Script**. Delete the sample code, paste in the whole of `Code.gs`, click **Save**.
3. In the function dropdown pick **setup** → **Run**. Approve the permissions
   (Advanced → "Go to project (unsafe)" → Allow). Two tabs appear: **Quote Requests** and **Contact Messages**.
4. **Deploy → New deployment → ⚙ Select type: Web app**
   - Execute as: **Me (fcvsupport@gmail.com)**
   - Who has access: **Anyone**
   - Click **Deploy** and copy the **Web app URL** (ends in `/exec`).
5. *(Recommended test)* Run **testQuoteSubmission**, then **testContactSubmission**. Each adds a row and sends both emails
   (the "customer" is fcvsupport@gmail.com itself, so you can see both emails in that inbox).

## B. Connect the website
1. Open `forms.js` and replace `PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE` with the URL from step A4.
2. Copy everything in this zip over your project folder (the `Images` folder is unchanged and not included).
3. **Delete the old `pricing-2.html`**, because it is now `pricing.html`.
4. Upload/publish. Submit both forms once on the live site to confirm.

> If you ever edit `Code.gs` later: **Deploy → Manage deployments → ✏ → Version: New version → Deploy**.
> The URL stays the same.

## What happens on every submission
| Step | Detail |
|---|---|
| Sheet | New row in **Quote Requests** (pricing form) or **Contact Messages** (contact form). Last two columns are **Quote Status** (dropdown, starts as *New*) and **Actual Price** (fill in after the site visit). |
| Visitor | Redirected to `thank-you.html`. |
| Customer email | Branded confirmation from fcvsupport@gmail.com with their details, the rough estimate, and the note that pricing can change after the site visit. Replies go to quote@fcvrestoration.com. |
| Company email | A different, internal alert sent to fcvsupport@gmail.com **and** quote@fcvrestoration.com with call / email / open-in-sheet buttons. Replying goes straight to the customer. |

## Good to know
- Gmail limits scripts to about **100 recipients per day** on a free @gmail.com account. Each submission uses 3 (1 customer + 2 company), so roughly 30 submissions a day. Google Workspace allows 1,500.
- Settings (phone, address, recipients, status list, website link) are in the `CONFIG` block at the top of `Code.gs`.
- If an email ever fails, the row is still saved. Check **Apps Script → Executions** for the error.
