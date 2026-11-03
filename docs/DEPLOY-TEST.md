# Put CurtainCall's backend on the TEST sheet (about 10 minutes)

> **Now superseded for real use by [DEPLOY.md](DEPLOY.md) (the dedicated CurtainCall sheet).** Keep this page only for the TEST sheet.

This only uses the **TEST** sheet. It does not touch the school roster.
You need: a computer (not the phone), signed in to your Google account.

## A. Open the TEST sheet's script editor
1. Open this link: https://docs.google.com/spreadsheets/d/1UGipn6RO-ylhvxE65wrnoRELnyEVE-wjuzsM7Wn7590/edit
2. Check the title at the top-left. It should be your **TEST** sheet. If it isn't, stop and message Choir.
3. In the menu, click **Extensions → Apps Script**. A new tab opens.

## B. Paste the code
4. Open this link in another tab: https://github.com/steph1420/choir-attendance/blob/curtaincall-stage1/apps-script/Code.gs
5. Click the **Copy raw file** button (two overlapping squares, top-right of the code).
6. Go back to the Apps Script tab. Click inside the big code box, press **Ctrl+A**, then **Ctrl+V**. The old text is replaced.
7. Click the **💾 Save** icon (or press Ctrl+S).

## C. Create the tabs (one time)
8. At the top, find the drop-down next to **▶ Run** and choose **setup**.
9. Click **▶ Run**.
10. Google asks for permission:
    - Click **Review permissions** → choose your account.
    - If you see "Google hasn't verified this app", click **Advanced** → **Go to (project name) (unsafe)**. This is normal for your own script.
    - Click **Allow**.
11. Wait until the bottom says **Execution completed**. Your TEST sheet now has new tabs (Events, Costumes, Props, Notes …).

## C2. Lock the CareFlags tab (only you can open it)
Care notes are private, so only you should be able to change or see this tab.
1. Go back to the TEST sheet tab. At the bottom, find the tab named **CareFlags**.
   (If you don't see it, it appears after the app first saves a care flag — come back and do this then.)
2. Right-click **CareFlags** → **Protect sheet**. A panel opens on the right.
3. Click **Set permissions**.
4. Choose **Restrict who can edit this range** → **Only you**. Click **Done**.
5. Right-click **CareFlags** again → **Hide sheet**. Now people who open the sheet don't see it.
6. Do the same two things (Protect → Only you, then Hide) for the **Change log** tab, because it keeps old copies of care notes.

Important: protecting and hiding stop *editing* and *casual viewing*. Anyone you give access to the whole sheet could still un-hide it to read it. So **share the TEST sheet with nobody else** (or only as "Viewer" with people you fully trust). The app itself still works, because the script runs as you.

## D. Publish it as a web app
12. Top-right, click **Deploy → New deployment**.
13. Click the ⚙ gear next to "Select type" → choose **Web app**.
14. Fill in:
    - Description: `CurtainCall TEST`
    - Execute as: **Me**
    - Who has access: **Anyone**  (the app has no Google sign-in yet; the link is the key — don't share it publicly)
15. Click **Deploy**. Allow permissions again if asked.
16. Copy the **Web app URL** (it starts with `https://script.google.com/macros/s/` and ends with `/exec`).

## E. Send it back
17. Paste that URL to Choir in chat. (You can also paste it yourself in the app: ⚙ Settings → Backend (sync) → Save & reconnect.)

If anything looks different or shows an error, take a screenshot and send it. Don't click **Delete** on anything.
