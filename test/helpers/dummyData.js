module.exports.dummyAuth = {
  id: 131736381,
  token: 'fauxToken',
  username: 'livrush',
  password: '********',
};

module.exports.dummyUser = {
  login: 'livrush',
  id: 23201987,
};

module.exports.dummyProject = {
  _id: 'v4sZfMFaanbqaWeNS',
  name: 'Function Master',
  desc: 'Master the art of Functions',
  url: 'https://github.com/OperationSpark/function-master',
  _session: 'vJ3hbkCCwbei343Hz',
};

module.exports.dummyGistGood = {
  url: 'https://api.github.com/gists/bcf378c040ea98e05d5bc946022e3c68',
  id: 'bcf378c040ea98e05d5bc946022e3c68',
  html_url: 'https://gist.github.com/bcf378c040ea98e05d5bc946022e3c68',
  files: {
    'grade.txt': {
      filename: 'grade.txt',
      raw_url: 'https://gist.githubusercontent.com/livrush/bcf378c040ea98e05d5bc946022e3c68/raw/3206d9a7d81f21f4749df954222a3fcad3441112/grade.txt',
      content: '{"id":23201987,"requirementId":"v4sZfMFaanbqaWeNS","sessionId":"vJ3hbkCCwbei343Hz","type":"PROJECT","tests":16,"passes":16,"failures":0}'
    }
  },
};

module.exports.dummyGistBad = {
  url: 'https://api.github.com/gists/bcf378c040ea98e05d5bc946022e3c68',
  id: 'bcf378c040ea98e05d5bc946022e3c68',
  html_url: 'https://gist.github.com/bcf378c040ea98e05d5bc946022e3c68',
  files: {
    'grade.txt': {
      filename: 'grade.txt',
      raw_url: 'https://gist.githubusercontent.com/livrush/bcf378c040ea98e05d5bc946022e3c68/raw/c8295fd6cf953988c53c6db0127efe7fe3454eab/grade.txt',
      content: '{"id":23201987,"requirementId":"v4sZfMFaanbqaWeNS","sessionId":"vJ3hbkCCwbei343Hz","type":"PROJECT","tests":16,"passes":16,"failures":0}'
    }
  },
};

const dummySession = {
  sessionId: 'Dnw6SEou4hYxBMpZP',
  name: 'Bootcamp',
  cohort: 'bootcamp-28-aug-2017-6-pm',
  PROJECT: [
    {
      _id: 'DkLWgh47DNaLK6yYY',
      name: 'Underpants',
      desc: 'Fun with functional Functions',
      url: 'https://github.com/operationspark/underpants'
    },
    {
      _id: 'L9YQQn63z4S7p6cba',
      name: 'Scratch Pad',
      desc: 'Practice the art of JavaScript by passing unit tests',
      url: 'https://github.com/OperationSpark/scratch-pad'
    },
    {
      _id: 'ZnRsPsdsMWPzfYZ2S',
      name: 'Matchy',
      desc: 'Practice all the ways to dynamically create and access data structures',
      url: 'https://github.com/operationspark/matchy'
    },
    {
      _id: 'v4sZfMFaanbqaWeNS',
      name: 'Function Master',
      desc: 'Master the art of Functions',
      url: 'https://github.com/OperationSpark/function-master'
    }
  ]
};

module.exports.dummySession = dummySession;

const dummySession2 = {
  sessionId: '6uBQDL8A7Yq7qSgJa',
  name: 'Prep',
  cohort: 'prep-18-sep-2017-9-am',
  PROJECT: [],
};

const dummySession3 = {
  sessionId: 'cdvvyXikGpuEoSErx',
  name: 'Fundamentals of Software Development',
  cohort: 'fundamentals-of-software-development-20-sep-2017-4-pm',
  PROJECT: [
    {
      _id: 'DkLWgh47DNaLK6yYY',
      name: 'Underpants',
      desc: 'Fun with functional Functions',
      url: 'https://github.com/operationspark/underpants'
    },
  ]
};

module.exports.dummySessions = [
  dummySession,
  dummySession2,
  dummySession3,
];

module.exports.dummyTestFail = `{
  "stats": {
    "suites": 4,
    "tests": 4,
    "passes": 0,
    "pending": 0,
    "failures": 4,
    "start": "2017-10-04T00:25:51.541Z",
    "end": "2017-10-04T00:25:51.573Z",
    "duration": 32
  },
  "pending": [],
  "failures": [
    {
      "title": "Should take an object, if this object has a noises array return them as a string separated by a space, if there are no noises return 'there are no noises'",
      "fullTitle": "Function Master maybeNoises() Should take an object, if this object has a noises array return them as a string separated by a space, if there are no noises return 'there are no noises'",
      "duration": 0,
      "currentRetry": 0,
      "err": {
        "message": "expected undefined to equal 'bark woof squeak growl'",
        "showDiff": false,
        "expected": "bark woof squeak growl",
        "stack": "AssertionError: expected undefined to equal 'bark woof squeak growl'\n    at Context.<anonymous> (test/index.spec.js:76:16)"
      }
    },
    {
      "title": "Should take a string of words and a word and return true if <word> is in <string of words>, otherwise return false.",
      "fullTitle": "Function Master hasWord() Should take a string of words and a word and return true if <word> is in <string of words>, otherwise return false.",
      "duration": 1,
      "currentRetry": 0,
      "err": {
        "message": "expected undefined to equal true",
        "showDiff": true,
        "expected": true,
        "stack": "AssertionError: expected undefined to equal true\n    at Function.assert.strictEqual (node_modules/chai/lib/chai/interface/assert.js:178:32)\n    at Context.<anonymous> (test/index.spec.js:85:16)"
      }
    },
    {
      "title": "Should take an object and return its values in an array",
      "fullTitle": "Function Master objectValues() Should take an object and return its values in an array",
      "duration": 3,
      "currentRetry": 0,
      "err": {
        "message": "expected undefined to deeply equal [ 'one', 'two', 'crayons', 'dangle' ]",
        "showDiff": true,
        "expected": [
          "one",
          "two",
          "crayons",
          "dangle"
        ],
        "stack": "AssertionError: expected undefined to deeply equal [ 'one', 'two', 'crayons', 'dangle' ]\n    at Function.assert.deepEqual (node_modules/chai/lib/chai/interface/assert.js:216:32)\n    at Context.<anonymous> (test/index.spec.js:20:16)"
      }
    },
    {
      "title": "Should take an object and return all its keys in a string each separated with a space",
      "fullTitle": "Function Master keysToString() Should take an object and return all its keys in a string each separated with a space",
      "duration": 0,
      "currentRetry": 0,
      "err": {
        "message": "expected undefined to equal 'a b ponies dingle'",
        "showDiff": false,
        "expected": "a b ponies dingle",
        "stack": "AssertionError: expected undefined to equal 'a b ponies dingle'\n    at Context.<anonymous> (test/index.spec.js:27:16)"
      }
    },
  ],
  "passes": []
}`;

module.exports.dummyTestPass = `{
  "stats": {
    "suites": 4,
    "tests": 4,
    "passes": 4,
    "pending": 0,
    "failures": 0,
    "start": "2017-10-04T00:25:51.541Z",
    "end": "2017-10-04T00:25:51.573Z",
    "duration": 32
  },
  "pending": [],
  "failures": [],
  "passes": [
    {
      "title": "Should take an object, if this object has a noises array return them as a string separated by a space, if there are no noises return 'there are no noises'",
      "fullTitle": "Function Master maybeNoises() Should take an object, if this object has a noises array return them as a string separated by a space, if there are no noises return 'there are no noises'",
      "duration": 0,
      "currentRetry": 0,
      "err": {
        "message": "expected undefined to equal 'bark woof squeak growl'",
        "showDiff": false,
        "expected": "bark woof squeak growl",
        "stack": "AssertionError: expected undefined to equal 'bark woof squeak growl'\n    at Context.<anonymous> (test/index.spec.js:76:16)"
      }
    },
    {
      "title": "Should take a string of words and a word and return true if <word> is in <string of words>, otherwise return false.",
      "fullTitle": "Function Master hasWord() Should take a string of words and a word and return true if <word> is in <string of words>, otherwise return false.",
      "duration": 1,
      "currentRetry": 0,
      "err": {
        "message": "expected undefined to equal true",
        "showDiff": true,
        "expected": true,
        "stack": "AssertionError: expected undefined to equal true\n    at Function.assert.strictEqual (node_modules/chai/lib/chai/interface/assert.js:178:32)\n    at Context.<anonymous> (test/index.spec.js:85:16)"
      }
    },
    {
      "title": "Should take an object and return its values in an array",
      "fullTitle": "Function Master objectValues() Should take an object and return its values in an array",
      "duration": 3,
      "currentRetry": 0,
      "err": {
        "message": "expected undefined to deeply equal [ 'one', 'two', 'crayons', 'dangle' ]",
        "showDiff": true,
        "expected": [
          "one",
          "two",
          "crayons",
          "dangle"
        ],
        "stack": "AssertionError: expected undefined to deeply equal [ 'one', 'two', 'crayons', 'dangle' ]\n    at Function.assert.deepEqual (node_modules/chai/lib/chai/interface/assert.js:216:32)\n    at Context.<anonymous> (test/index.spec.js:20:16)"
      }
    },
    {
      "title": "Should take an object and return all its keys in a string each separated with a space",
      "fullTitle": "Function Master keysToString() Should take an object and return all its keys in a string each separated with a space",
      "duration": 0,
      "currentRetry": 0,
      "err": {
        "message": "expected undefined to equal 'a b ponies dingle'",
        "showDiff": false,
        "expected": "a b ponies dingle",
        "stack": "AssertionError: expected undefined to equal 'a b ponies dingle'\n    at Context.<anonymous> (test/index.spec.js:27:16)"
      }
    },
  ]
}`;
