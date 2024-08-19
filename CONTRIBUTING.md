# Contribution Guide

## Introduction

This section aims to familiarise developers to the Delegit Dashboard [[GitHub](https://github.com/delegit-xyz/dashboard), [Demo](https://delegit-xyz.github.io/dashboard)] for the purpose of contributing to the project.

## Major Packages Used

- React 18
- SCSS for theme configuration and Styled Components [[docs](https://styled-components.com/docs)] for component styling.

## Environment Variables

Optionally apply the following environment variables in an environment file such as `.env` or with `yarn build` to customise the build of Polkadot Technical Fellowship dashboard:

```
# display an organisation label in the network bar
VITE_ORGANISATION="© Polkadot Fellows"

# provide a privacy policy url in the network bar
VITE_PRIVACY_URL=https://github.com/delegit-xyz/
```
