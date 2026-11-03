# Put CurtainCall's backend on the CurtainCall sheet (about 10 minutes)

Sheet: https://docs.google.com/spreadsheets/d/1i_w-YrD-vbBZ3Y4IR0qEaueLI5IHbEgF02bM8j_Bzzc/edit
The tabs, headers, colours and dropdowns are already made. The class list file is only **read**, never changed.
You need: a computer (not the phone), signed in to your Google account.

## A. Open the script editor
1. Open the CurtainCall sheet (link above). The title top-left should say **CurtainCall**.
2. Menu **Extensions → Apps Script**. A new tab opens.

## B. Paste the code
3. Open https://github.com/steph1420/choir-attendance/blob/curtaincall-stage1/apps-script/Code.gs
4. Click **Copy raw file** (two squares, top-right of the code).
5. In the Apps Script tab: click in the code box, **Ctrl+A**, then **Ctrl+V**. Click **💾 Save**.

## C. Run setup (one time)
6. In the drop-down next to **▶ Run**, choose **setup**, then click **▶ Run**.
7. Allow permissions: **Review permissions** → your account → (if shown) **Advanced → Go to … (unsafe)** → **Allow**. This is normal for your own script.
8. Wait for **Execution completed**. Nothing visible changes (the tabs already exist) — setup only checks them.

## D. Import the roster (one time; safe to repeat)
9. Go back to the sheet tab and **reload the page**. A new menu **CurtainCall** appears at the top (wait a few seconds).
10. Click **CurtainCall → Import roster**. Allow permissions again if asked.
11. It asks for the class list: paste the link of your class list file, click **OK**.
12. A box says "imported N new member(s)". Check the **Members** tab: Child ID (from Adm. No.), Section (the tab name) and Name (auto).
    Running it again later only adds new children; your Role/From/To/Note edits stay.

## E. Lock the private tabs
13. Right-click the **CareFlags** tab → **Protect sheet** → **Set permissions** → **Only you** → **Done**.
14. Right-click **CareFlags** again → **Hide sheet**.
15. Do the same (Protect → Only you, then Hide) for **Change log** (it keeps old copies of care notes).
Share this file with nobody else (or Viewer only with people you fully trust): hidden tabs can be un-hidden by anyone with access.

## F. Publish as a web app
16. In Apps Script: **Deploy → New deployment** → ⚙ next to "Select type" → **Web app**.
17. Description `CurtainCall`; Execute as **Me**; Who has access **Anyone** (the link is the key — don't share it publicly).
18. **Deploy**, allow if asked, then copy the **Web app URL** (starts `https://script.google.com/macros/s/`, ends `/exec`).

## G. Send it back
19. Paste the URL to Choir in chat (or paste it yourself: app ⚙ Settings → Backend (sync) → Save & reconnect).

If anything looks different or shows an error, send a screenshot. Don't click **Delete** on anything.

## Update the backend + set the team passcode (do this once after this update)
After this, the app only works for people who know the team passcode. The web-app link stays the same.

**A. Paste the new code**
1. Open the CurtainCall sheet → **Extensions → Apps Script**.
2. Open https://github.com/steph1420/choir-attendance/blob/curtaincall-stage1/apps-script/Code.gs → click **Copy raw file**.
3. In Apps Script: click in the code box → **Ctrl+A** → **Ctrl+V** → **💾 Save**.

**B. Set the team passcode**
4. Go back to the sheet tab and **reload the page** (so the menu updates).
5. Menu **CurtainCall → Set team passcode**. (If Google asks for permission, click Allow.)
6. Type a passcode of at least 6 characters (for example a short phrase only your team knows) → **OK**.
   Only a scrambled version is stored, so even you can't read it back — write it down somewhere safe.

**C. Publish the new version (same link)**
7. In Apps Script, top-right: **Deploy → Manage deployments**.
8. Click the **✏️ pencil** (edit) on the existing web app.
9. Under **Version**, choose **New version**. Leave everything else as it is.
10. Click **Deploy**. The URL shown should be the **same** as before. Done.

**D. Tell your team**
11. Share the passcode with teachers privately (not in a group chat with parents). The app asks for it once per device.
To change it later, just repeat step 5 — everyone will be asked for the new one.
