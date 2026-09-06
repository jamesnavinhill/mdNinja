mdNinja design edits

> ✅ **Status: all items implemented & verified 2026-09-06.** See [ADR 0009](../decisions/0009-ui-overhaul-and-github-oauth.md) for the plan, decisions, and verification checklist.
>
> **GitHub OAuth deployment nuance:** ensure `NEXT_PUBLIC_APP_URL` in Vercel byte-for-byte matches the origin registered on the GitHub OAuth App (registered callback is the apex `https://mdninja.navinhill.com/api/auth/callback/github`). Register the `www` variant too, or set the env to the apex.

## icons

multiple libraries
able to change folder/sidebar icons

## 'Saved' icon

should auto-hide after a few ticks

## 'Edit' icon 

icon only. same icon as now.

## 'Split' icon

icon only -same as now

## sidebar filetree

default the filetree as thus:

mdninja
audit
changelog
decisions
diagrams
notes
research
roadmaps
standards
docs
.agents
mdninja (project root --dont put this in the ui! just a note to you)

## Defaults 

#cea1ce -accent
SystemSans -Font
14px -font size
1.65 -line height
960 -doc width

## Fonts

only two work for sure:
System Sans and JetBrains Mono
But i cant tell which of the other 3 -- i think inter, bc they all go to the same looking one
so fix that but i think well default to system sans for now until you get the fonts fixed

## Light Mode

some text areas --like code blocks are coming thru also light and not ledgible

## Accent palettes in settings

remove the weird white/black blocks
remove the random color dots

ALL THIS slop copy in the settings oh my lawdd ..

REMOVE!!!::
'tailor visual..' slop!
'adapts to dark &..' slop!!
'live accent color for..' slop!!!
'icon engine architecture:mdninja.. HOLY FUCKING CHRIST IS THIS THE MOST STUPID WASTE OF MY FUCKIGN SCREEN I HAVE EVER SEEN!!!!' slop slop slop!

## Checkboxes on markdown docs

hard to see, white checkmark on a grey box.. i guess can see it on light mode hardly
use the accent - nice and clean

## GitHub 

- told me the url wasn't trusted.
is it actually wired up for me to add my accounts and repos>
i see slop in the ui still i think with mock nonsense. remove all fucking nonsense from the ui. its not a toy not a fucking communication board. not a status update. get it out. keep it out.


## Search

works! except if all the file tree is closed, it basically works a filter which is ok, but would be nice if it would surface the file being searched, even if that means opening the parent dir it is in.. idk something clean. its nice now, but that one missing bit..

