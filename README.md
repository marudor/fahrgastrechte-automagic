# fahrgastrechte-automagic

It's a pain to fill out Fahrgastrechte. I tried to make it easier.

## Requirements

- node 10 (LTS) (If your OS doesn't provide this I suggest you use https://github.com/jasongin/nvs)
- yarn (https://yarnpkg.com)
- pdftk

## Defaults

There is a `defaults.json.example` rename it to `defaults.json` and fill out relevant Fields.
If you do not have a Bahncard 100 remove the content of `bahncard100`

## Signature

You can add a `signature.png` to the root of this folder to automatically add your signature.
You may need to experiment a bit with the size - I suggest you use a transparent background for it.

## running

- `yarn`
- `yarn build`
- `yarn start`
