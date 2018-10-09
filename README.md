# JS Benchmarks

It's just a collection of JS benchmarks. `npm start` or `node .` to run all tests, or `node lib/...` to run an individual test.

Please verify the tests and the results before drawing any conclusions, and ideally profile your application.


## Check if a string starts with a prefix

Tested in node 10.8.0 on Ubuntu 16.04 64bit.

- `string.indexOf(prefix) === 0` is the fastest by far on predictable inputs (probably because it caches the results) and good on random inputs.
- `string.substring(0, prefix.length) === prefix` is the fastest on random inputs and good on predictable inputs.
- `string.startsWith(prefix)` is good on all inputs.
