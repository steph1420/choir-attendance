# CurtainCall — Blueprint overview (Stage 0, part 1)
Status: **PROPOSED** blueprint. Name **CurtainCall** chosen by Steve (t13u). Feature plan approved by Steve (t8u, t10u, t11u). Nothing below is LOCKED unless marked LOCKED with Steve's turn id.

## Vision
CurtainCall grows A-02 (choir attendance) into an app for running school plays and performances: who is in which item, where they stand, what they wear and hold, whether they are here, plus notes, notices and a big-screen cast. It must feel easier than a notepad and a pile of sheets, on a phone first, and work offline with sync to Google Sheets.

Names: the live app shows real names, loaded at runtime from Steve's sheets. Agents use codenames and placeholder data only (repos, mockups, chats); this blueprint uses placeholders such as `C-child 03`, `Tailor-D`, `School-LF`.

## First production (placeholder data)
Parents' Day 2027 at School-LF: performances 2027-01-30 and 2027-01-31. Items: Welcome Song, Medley, EMP play "The Elves and the Shoemaker" (5 songs). Rehearsals in Golden Hours (1st 07:40–08:30, 2nd 10:30–11:20). Choir: 30 children (21 Singer, 9 Action, plus Prop roles).

## Modules
| # | Module | Core |
|---|---|---|
| 1 | Members & cast | members, groups, parts, back-up child, sizes, care flags (later) |
| 2 | Parts tree | nested groups any depth, bird's-eye tree + matrix, gaps and double-bookings |
| 3 | Show plan | production, running order, scenes, songs/tracks, who's-in-what |
| 4 | Rehearsals & attendance | P/A/E (Late dev option), offline sync, sessions, remarks, stars, call list, plan, readiness, clashes |
| 5 | Stage & movement | standing grid, positions per item, action notes, entrances/exits |
| 6 | Costumes & props | per-child costume checklist, Tailor-D order list, props list, checks, photos |
| 7 | Parent requests | asked → confirmed → received → returned, due dates, reminders, linked to props |
| 8 | Show day | check-in, run sheet with cues, headcount, hand-over, two shows |
| 9 | Parents & consent | consent per child, what-to-bring |
| 10 | Template maker | categories, variables, ready notices, builds on daily report maker |
| 11 | Reports | attendance % + low flag, daily report, readiness board, archive |
| 12 | Notes (top priority) | Keep-easy, Obsidian-rich: text, checklist, draw, links, tags, sharing, export |
| 13 | Screencast | mirror, draw, custom view, curated views, phone remote |

## Stages (detail in 05-STAGES.md)
0 Blueprint + mockups → 1 Live base (GitHub Pages + Apps Script on TEST) → 1.1 Parts tree → 1.2 Notes core → 1.3 Show plan + call list → 1.4 Costumes, props, parent requests → 1.5 Show day → 2 Notes deep + templates → 2.1 Screencast → 3 Stage & polish → 4 Later.

## Files
01-DATA-MODEL · 02-SHEET-SCHEMA · 03-NAVIGATION · 04-UI-PRINCIPLES · 05-STAGES · 06-OPEN-QUESTIONS · 07-DECISIONS · 08-IPAD-POWER-PLAN · 09-DUTIES-DATES-PLAN
