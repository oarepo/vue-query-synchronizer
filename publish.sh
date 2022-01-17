#!/bin/bash

(
  cd dist
  npm version ${GITHUB_REF#refs/tags/}
  cat package.json
)

npm publish --access public dist/
