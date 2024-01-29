# fetch-file-action

This action fetches a file from a specified URL and saves it to
the action runner's file system.

## Inputs

### `url`

**Required** The URL to fetch the file from.

### `filename`

**Required** The name of the file to save the file as.

### `path`

**Optional** The path to save the file to.

## Example usage

```yaml
name: Fetch file example

on: [push]

jobs:
  fetch-file:
    runs-on: ubuntu-latest
    steps:
      - uses: foxtrotperry/fetch-file-action@v0
        with:
          url: 'https://example.com/some-file.txt'
          path: './some/custom/path'
          filename: 'custom_filename.txt'
```
