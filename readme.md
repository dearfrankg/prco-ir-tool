# prco-ir-tool

## INTRO

This tool provide an interface to provide inspection request management for the following vendors: WIS, Verity, and Oneguard.

- create inspection request
- check status of inspection request
- cancel inspection request

## INSTALLATION

    // install nvm
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash

    // update terminal
    source ~/.zshrc

    // install node
    nvm install v18.17.1

    // verify node
    node --version

    // install prco-ir-tool
    npm -g install @cogent-labs/prco-ir-tool

    // verify prco--r-tool
    npm -g ls

## CONFIGURE

create env file: `~/protected/prco-ir-tool-env`

    # wis_credentials format username,password

    wis_credentials=***,***
    wis_test_url=https://www.stage.wisinspections.com/wiswebservice.asmx?WSDL
    wis_prod_url=https://www.wisinspections.com/wiswebservice.asmx?WSDL
    wis_report_folder=/Users/frankg/Desktop/prco

    # oneguard_credentials format username,password

    oneguard_credentials=***,****
    oneguard_test_url=https://test.oneguardinspections.com/webService
    oneguard_prod_url=https://oneguardinspections.com/webService
    oneguard_report_folder=/Users/frankg/Desktop/prco

    # verity_api_key format test_key,prod_key

    verity_api_key=***
    verity_test_url=https://dev.verityinspections.com/app/api
    verity_prod_url=https://verityinspections.com/app/api
    verity_report_folder=/Users/frankg/Desktop/prco

## USAGE

    prco-ir-tool [options] -- requests...


    OPTIONS

    -h  --help              display usage help

    -c  --config_env_file   file containing environment variables
                            defaults to $HOME/protected/prco-check-status-env

    -o  --operation         cancel or check-status

    -v  --vendor            wis or oneguard or verity

    -e  --environment       environment to use: test or production
                            defaults to test

    Requests

    -- request-id,path-to-download


    EXAMPLES

    Get help

        prco-ir-tool -h


    Create Inspection Request

        prco-ir-tool -o create -e test -v oneguard -j '{
            "RequesterName": "BamaRama",
            "RequesterExt": "9809879879",
            "RequesterEmail": "sample@test.com",
            "ContractHolder": "Someone",
            "SaleDate": "2012-12-16T12:46:30",
            "SaleOdometer": "696969",
            "VehicleYear": "2007",
            "VehicleMake": "Ford",
            "VehicleModel": "FiveHundred",
            "Mileage": "696969",
            "VIN": "123456ABCD78910",
            "ContractNumber": "contract123",
            "ClaimNumber": "claim123",
            "InspectionType": "Automotive",
            "InspectionReasons": ["none", "none", "none"],
            "RepairSite": "BTTHL surfers",
            "Address1": "some street",
            "Address2": "some place",
            "City": "Lubbock",
            "State": "TX",
            "Zip": "79415",
            "Phone": "8182989730",
            "Contact": "cool"
        }'


    Check Status of Inspection Request

        prco-ir-tool -o check-status -e test -v oneguard -- 758317,/a/b 876321,/a/b


    Cancel Inspection Request

        prco-ir-tool -o cancel -e test -v oneguard -- 758317 876321

## AUTHOR

    Frank Gutierrez    npm.frankg@gmail.com

## LICENSE

    Copyright (c) 2020 Frank Gutierrez III

    Permission is hereby granted, free of charge, to any person obtaining a copy of this
    software and associated documentation files (the "Software"), to deal in the Software
    without restriction, including without limitation the rights to use, copy, modify, merge,
    publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons
    to whom the Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all copies or
    substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
    INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
    PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
    FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
    OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
    DEALINGS IN THE SOFTWARE.
