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

module.exports.dummySession = {
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

module.exports.dummyProjectsDirectory = [
  'billypedia',
  'product-project',
  'scratch-pad',
  'underpants',
];
