# Goals

Provide a command that allows you to use the following APIs:

- create inspection request
- check status of inspection request
- cancel inspection request

## HOW 4D WORKS

- 4d calls prco-ir-tool for all api requests
- 4d has a cron job that calls the check-status api on occasion

## prco-ir-tool FEATURES

| vendor   | create-ir |           check-ir           |                 cancel-ir                 |
| -------- | :-------: | :--------------------------: | :---------------------------------------: |
| verity   |     √     | status: √ -- download: issue |                     √                     |
| wis      |     √     |              √               | message: "WIS prefers you call to cancel" |
| oneguard |     √     |              √               |                     √                     |

## ISSUES

- verity download has issues

## PRODUCT SIGN-OFF

| feature                             | sign-off |
| ----------------------------------- | -------- |
| install documentation               |          |
| api documentation                   |          |
| api testing tool                    |          |
| prco-ir-tool test environment       |          |
| prco-ir-tool production environment |          |
| 4d to prco-ir-tool test             |          |
| download to google drive test       |          |
|                                     |          |
|                                     |          |
|                                     |          |
