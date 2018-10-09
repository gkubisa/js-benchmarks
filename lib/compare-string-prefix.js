const Benchmark = require('benchmark')

// Test environment:
// - node 10.8.0
// - Ubuntu 16.04 64bit

new Benchmark.Suite('Compare String Prefix')

// The fastest when the input data is unpredictable.
.add('substring', {
    setup,
    fn: function () {
        mutateInput()
        result = startsWithUsingSubstring(string, prefix)
    },
    teardown
})

// The fastest by far, if the input data is predictable. It looks like indexOf caches the results in some way.
.add('indexOf', {
    setup,
    fn: function () {
        mutateInput()
        result = startsWithUsingIndexOf(string, prefix)
    },
    teardown
})

// Strangely, it falls behind both substring and indexOf in all cases, however, I'd expect it'd be optimized in the future.
.add('startsWith', {
    setup,
    fn: function () {
        mutateInput()
        result = string.startsWith(prefix)
    },
    teardown
})

// The same as substring.
.add('slice', {
    setup,
    fn: function () {
        mutateInput()
        result = startsWithUsingSlice(string, prefix)
    },
    teardown
})

// The same as substring.
.add('substr', {
    setup,
    fn: function () {
        mutateInput()
        result = startsWithUsingSubstr(string, prefix)
    },
    teardown
})

// Very slow - linear search and calls a native method per character.
.add('charCodeAt', {
    setup,
    fn: function () {
        mutateInput()
        result = startsWithUsingCharCodeAt(string, prefix)
    },
    teardown
})

// Very slow - linear search and creates a new string per character.
.add('[index]', {
    setup,
    fn: function () {
        mutateInput()
        result = startsWithUsingBracketNotation(string, prefix)
    },
    teardown
})

.on('start', function () {
    console.info(`Starting ${this.name}`)
})

.on('error', function ({ target: { name, error } }) {
    console.error(`    Error in ${name}:`, error)
})

.on('cycle', function({ target: { name } }) {
    console.info(`    Completed ${name}`)
})

.on('complete', function() {
    console.info(`Completed ${this.name}`)
    this
        .sort((benchmark1, benchmark2) => benchmark2.compare(benchmark1))
        .forEach((benchmark, _index, array) => {
            const bestBenchmark = array[0]
            const mean = benchmark.stats.mean
            const bestMean = bestBenchmark.stats.mean
            const timesSlower = mean / bestMean

            console.info(`    ${benchmark}; ${timesSlower > 1.001 ? timesSlower.toFixed(3) + ' times slower' : 'Fastest'}`)
        })
})

.run()

function setup() {
    const maxLength = 32
    let string = generateString()
    let prefix = generatePrefix(string)
    let result = false

    function generateString() {
        const length = Math.random() * maxLength | 0
        const characters = new Array(length)

        for (let i = 0; i < length; ++i) {
            characters[i] = String.fromCharCode(Math.random() * 127 | 0)
        }

        return characters.join('')
    }

    function generatePrefix(string) {
        const start = Math.random() < 0.5 ?
            0 :
            1 + (Math.random() * (string.length - 1)) | 0
        const end = start + (Math.random() * (string.length - start)) | 0
        const prefix = string.substring(start, end)

        return prefix
    }

    // Mutates the input data to measure performance of the actual prefix comparison algorithms.
    // Without the mutation, `indexOf` seems to use some aggressive caching which leaves the other
    // algorithms far behind, and its performance is only slightly affected by the size of the input strings.
    // With the mutation, the comparison of the algorithms is more fair.
    // The major downside of the mutation is that it is timed,
    // which somewhat blurs the relative performance difference between the algorithms.
    function mutateInput() {
        const random = Math.random()

        if (random < 0.5) {
            const character = String.fromCharCode(random * 127 | 0)

            string = character + string
            prefix = character + prefix
        } else {
            string = string.substring(1)
            prefix = prefix.substring(1)
        }
    }

    function startsWithUsingSubstring(string, prefix) {
        return string.substring(0, prefix.length) === prefix
    }

    function startsWithUsingSubstr(string, prefix) {
        return string.substr(0, prefix.length) === prefix
    }

    function startsWithUsingSlice(string, prefix) {
        return string.slice(0, prefix.length) === prefix
    }

    function startsWithUsingIndexOf(string, prefix) {
        return string.indexOf(prefix) === 0
    }

    function startsWithUsingCharCodeAt(string, prefix) {
        const length = prefix.length

        if (length > string.length) {
            return false
        }

        let index = -1

        while (++index < length) {
            if (prefix.charCodeAt(index) !== string.charCodeAt(index)) {
                return false
            }
        }

        return true
    }

    function startsWithUsingBracketNotation(string, prefix) {
        const length = prefix.length

        if (length > string.length) {
            return false
        }

        let index = -1

        while (++index < length) {
            if (prefix[index] !== string[index]) {
                return false
            }
        }

        return true
    }
}

function teardown() {
    if (result !== string.startsWith(prefix)) {
        throw new Error('Invalid result')
    }
}
