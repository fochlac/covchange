# covwatcher

[![codecov](https://codecov.io/gh/fochlac/covwatcher/branch/master/graph/badge.svg)](https://codecov.io/gh/fochlac/covwatcher) [![CircleCI](https://circleci.com/gh/fochlac/covwatcher.svg?style=svg)](https://circleci.com/gh/fochlac/covwatcher) [![npm](https://img.shields.io/npm/v/covwatcher.svg?style=svg)](https://www.npmjs.com/package/covwatcher)

This project allows you to upload coverage reports for both branches and pull requests, and will, if it has stored the coverage for the target branch, add a comment on bitbucket to the pullrequest, detailing the changes in coverage caused by this pull request.

-   [Installation](#installation)
-   [Documentation](#documentation)
-   [Changelog](#changelog)
-   [License](#license)

## Installation

Pick a folder and install the server:

```
npm install covwatcher
```

Next you have to provide a number of variables, either via setting environment variables (recommended) or by editing `./dist/config.js`.

```
COVWATCHER_PORT=8080 // port to be used by the server
COVWATCHER_ADDRESS=your.Server.com // address the server should use
COVWATCHER_APPROOT=/your/folder/ // full path to app root
COVWATCHER_STORAGE=/your/storage/folder/ // where to store all uploaded repositories
COVWATCHER_BITBUCKET=https://your.bitbucket.server:port/ // full url of your bitbucket server
COVWATCHER_BITBUCKET_KEY=SomeBitbucketAccessKey // the access key to be used when posting the comments
```

Finally setup the [covwatcher-client](https://github.com/fochlac/covwatcher-client) both for your branches and pullrequest in Jenkins (or whatever pipeline you use).

Tested with NodeJs v10

## Changelog

## License

[CC BY-NC-SA 3.0](License.md)
