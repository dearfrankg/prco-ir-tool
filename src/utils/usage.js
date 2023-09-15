const usage = `
        NAME

            prco-ir-tool AKA prco inspection request tool

        USAGE:

            prco-ir-tool [options] -- requests...

        OPTIONS:

            -h, --help              display usage help

            -c, --config_env_file   file containing environment variables
                                    defaults to $HOME/protected/prco-check-status-env

            -o, --operation         cancel or check-status

            -v, --vendor            wis or oneguard or verity

            -e, --environment       environment to use: test or production
                                    defaults to test

        REQUESTS:

            request-id,path-to-download

        EXAMPLES:

            Get help:

                prco-ir-tool -h

            Example usage:

                prco-ir-tool \\
                    --operation check-status \\
                    --environment test \\
                    --vendor oneguard -- 758317,/a/b 876321,/q/a

            Example using shortcuts:

                prco-ir-tool -o check-status -e production -v wis -- 758317,/a/b 876321,/q/a


`;

module.exports = {
  usage,
};
