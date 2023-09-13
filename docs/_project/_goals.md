# Goals

- get create IR working for verity

## HOW 4D WORKS

- event loop
- on createIR event - then call api with sendRequestC format
- on cron call check-status

## FEATURES

| vendor   | create-ir |           check-ir           |                 cancel-ir                 |
| -------- | :-------: | :--------------------------: | :---------------------------------------: |
| verity   |     √     | status: √ -- download: issue |                     √                     |
| wis      |     √     |              √               | message: "WIS prefers you call to cancel" |
| oneguard |     √     |              √               |                     √                     |

## TEST SCRIPT

- done: verity create
- done: verity check -- issue with downloading pdf
- done: verity cancel
- done: wis create
- done: wis check -- done: download
- done: wis cancel -- done: message: WIS prefers you call to cancel
- done: oneguard create
- done: oneguard check -- done: download
- done: oneguard cancel
