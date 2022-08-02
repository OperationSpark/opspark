module.exports.dummyAuth = {
  id: 131736381,
  token: "fauxToken",
  username: "livrush",
  password: "********",
};

module.exports.dummyUser = {
  login: "livrush",
  id: 23201987,
};

module.exports.dummyProject = {
  _id: "v4sZfMFaanbqaWeNS",
  name: "Function Master",
  desc: "Master the art of Functions",
  url: "https://github.com/OperationSpark/function-master",
  _session: "vJ3hbkCCwbei343Hz",
};

module.exports.dummyGistGood = `{
  "url": "https://api.github.com/gists/bcf378c040ea98e05d5bc946022e3c68",
  "id": "bcf378c040ea98e05d5bc946022e3c68",
  "html_url": "https://gist.github.com/bcf378c040ea98e05d5bc946022e3c68",
  "files": {
    "grade.txt": {
      "filename": "grade.txt",
      "raw_url": "https://gist.githubusercontent.com/livrush/bcf378c040ea98e05d5bc946022e3c68/raw/3206d9a7d81f21f4749df954222a3fcad3441112/grade.txt",
      "content": {"id":23201987,"requirementId":"v4sZfMFaanbqaWeNS","sessionId":"vJ3hbkCCwbei343Hz","type":"PROJECT","tests":16,"passes":16,"failures":0}
    }
  }
}`;

module.exports.dummyGistBad = {
  url: "https://api.github.com/gists/bcf378c040ea98e05d5bc946022e3c68",
  id: "bcf378c040ea98e05d5bc946022e3c68",
  html_url: "https://gist.github.com/bcf378c040ea98e05d5bc946022e3c68",
  files: {
    "grade.txt": {
      filename: "grade.txt",
      raw_url:
        "https://gist.githubusercontent.com/livrush/bcf378c040ea98e05d5bc946022e3c68/raw/c8295fd6cf953988c53c6db0127efe7fe3454eab/grade.txt",
      content:
        '{"id":23201987,"requirementId":"v4sZfMFaanbqaWeNS","sessionId":"vJ3hbkCCwbei343Hz","type":"PROJECT","tests":16,"passes":16,"failures":0}',
    },
  },
};

const dummySession = {
  sessionId: "Dnw6SEou4hYxBMpZP",
  name: "Bootcamp",
  title: "Bootcamp 28 Aug 2017 6pm",
  cohort: "bootcamp-28-aug-2017-6-pm",
  PROJECT: [
    {
      _id: "DkLWgh47DNaLK6yYY",
      name: "Underpants",
      desc: "Fun with functional Functions",
      url: "https://github.com/operationspark/underpants",
    },
    {
      _id: "L9YQQn63z4S7p6cba",
      name: "Scratch Pad",
      desc: "Practice the art of JavaScript by passing unit tests",
      url: "https://github.com/OperationSpark/scratch-pad",
    },
    {
      _id: "ZnRsPsdsMWPzfYZ2S",
      name: "Matchy",
      desc: "Practice all the ways to dynamically create and access data structures",
      url: "https://github.com/operationspark/matchy",
    },
    {
      _id: "v4sZfMFaanbqaWeNS",
      name: "Function Master",
      desc: "Master the art of Functions",
      url: "https://github.com/OperationSpark/function-master",
    },
  ],
};

module.exports.dummySession = dummySession;

const dummySession2 = {
  sessionId: "6uBQDL8A7Yq7qSgJa",
  name: "Prep",
  title: "Prep 18 Sep 2017 9am",
  cohort: "prep-18-sep-2017-9-am",
  PROJECT: [],
};

const dummySession3 = {
  sessionId: "cdvvyXikGpuEoSErx",
  name: "Fundamentals of Software Development",
  title: "Fundamentals of Software Development 20 Sep 2017 4pm",
  cohort: "fundamentals-of-software-development-20-sep-2017-4-pm",
  PROJECT: [
    {
      _id: "DkLWgh47DNaLK6yYY",
      name: "Underpants",
      desc: "Fun with functional Functions",
      url: "https://github.com/operationspark/underpants",
    },
    {
      _id: "E9C4wcXoKZYA8Dnp9",
      name: "Circularity",
      desc: "A motion poem using random number generation and velocity applied to circle shapes...",
      url: "https://github.com/OperationSpark/circularity",
    },
    {
      _id: "w8Rd3aN7G4ttHDzR8",
      name: "Runtime",
      desc: "A side-scroller game featuring our own HalleBot!",
      url: "https://github.com/OperationSpark/runtime",
    },
    {
      _id: "7RwfPpWenqLXg8Ewt",
      name: "My First Project!",
      desc: "A simple project for practicing debugging ",
      url: "https://github.com/OperationSpark/my-first-project",
    },
    {
      _id: "Xe7HfMW7P5YipdZMc",
      name: "First Website",
      desc: "A client-side web project into which we'll install many projects",
      url: "https://github.com/OperationSpark/first-website",
    },
    {
      _id: "T5LMsegDbMaSr8Z9K",
      name: "Portfolio Page",
      desc: "Add a portfolio page to your website project",
      url: "https://github.com/OperationSpark/portfolio",
    },
    {
      _id: "kpEPmPxBvinQDpp4A",
      name: "Platformer",
      desc: "A cannon - dodging, collectible - grabbing adventure game for Halleb0t",
      url: "https://github.com/OperationSpark/platformer",
    },
    {
      _id: "RbokJGa8sLNeadzcs",
      name: "Bouncing Box",
      desc: "A project that gives you a taste of game development on the web ",
      url: "https://github.com/OperationSpark/bouncing-box",
    },
  ],
};

const dummySessionAsd = {
  sessionId: 'isWGZJjnWRbRXhCiA',
  name: 'Advance Software Development',
  title: 'Advanced Software Development Jul 20 22 9am',
  cohort: 'advanced-software-development-Jul-20-22-9am',
  PROJECT: [
    {
      _id: 'L9YQQn63z4S7p6cba',
      name: 'Scratch Pad',
      desc: 'Practice the art of JavaScript by passing unit tests',
      url: 'https://github.com/OperationSpark/scratch-pad',
    },
    {
      _id: 'PJK9Pr5fmh8ZYGNE8',
      name: 'Studies',
      desc: 'An addition to your website project to record your programming studies',
      url: 'https://github.com/operationspark/studies-v2',
    },
    {
      _id: 'ZnRsPsdsMWPzfYZ2S',
      name: 'Matchy',
      desc: 'Practice all the ways to dynamically create and access data structures',
      url: 'https://github.com/operationspark/matchy',
    },
    {
      _id: 'v4sZfMFaanbqaWeNS',
      name: 'Function Master',
      desc: 'Master the art of Functions',
      url: 'https://github.com/OperationSpark/function-master',
    },
    {
      _id: '3MMh7sBM7FvGYYvrW',
      name: 'Well of HTML',
      desc: 'A run through of HTML elements',
      url: 'https://github.com/OperationSpark/${program}-${year}-${month}-well-of-html',
    },
    {
      _id: 'RDzTYJGHg34JJyb43',
      name: 'Product Project',
      desc: 'A real world data-driven app with drill-down, search and filter features',
      url: 'https://github.com/operationspark/product-project',
    },
    {
      _id: 'DkLWgh47DNaLK6yYY',
      name: 'Underpants',
      desc: 'Fun with functional Functions',
      url: 'https://github.com/operationspark/underpants',
    },
    {
      _id: 'pmMG4KckZeFHBnfGz',
      name: 'Lodown',
      desc: 'An npm functional programming library project',
      url: 'https://github.com/operationspark/lodown',
    },
    {
      _id: 'H5jymW66LEvSQRo4Q',
      name: "Let's Get Functional",
      desc: 'An exercise in problem solving in the functional idiom',
      url: 'https://github.com/OperationSpark/lets-get-functional',
    },
    {
      _id: 'Xe7HfMW7P5YipdZMc',
      name: 'First Website',
      desc: "A client-side web project into which we'll install many projects",
      url: 'https://github.com/OperationSpark/first-website',
    },
    {
      _id: 'aqpiasyTiZBphngQE',
      name: 'Billypedia',
      desc: "Gettin' jiggy with jQuery and Billy Higgins",
      url: 'https://github.com/OperationSpark/billypedia',
    },
  ],
};

module.exports.dummySessionAsd = dummySessionAsd;
module.exports.dummySessions = [
  dummySession,
  dummySession2,
  dummySession3,
];

module.exports.dummyTestFail = `{
  "stats": {
    "tests": 4,
    "passes": 0,
    "pending": 0,
    "failures": 4
  },
  "pending": [],
  "failures": [
    {
      "fullTitle": "Test 1",
      "err": {
        "message": "Error message",
        "stack": "Trace"
      }
    },
    {
      "fullTitle": "Test 2",
      "err": {
        "message": "Error message",
        "stack": "Trace"
      }
    },
    {
      "fullTitle": "Test 3",
      "err": {
        "message": "Error message",
        "stack": "Trace"
      }
    },
    {
      "fullTitle": "Test 4",
      "err": {
        "message": "Error message",
        "stack": "Trace"
      }
    }
  ],
  "passes": []
}`;

module.exports.dummyTestPass = `{
  "stats": {
    "tests": 4,
    "passes": 4,
    "pending": 0,
    "failures": 0
  },
  "pending": [],
  "failures": [],
  "passes": [
    { "fullTitle": "Test 1" },
    { "fullTitle": "Test 2" },
    { "fullTitle": "Test 3" },
    { "fullTitle": "Test 4" }
  ]
}`;

module.exports.dummyTest75 = `{
  "stats": {
    "tests": 4,
    "passes": 3,
    "pending": 0,
    "failures": 1
  },
  "pending": [],
  "failures": [
    {
      "fullTitle": "Test 1",
      "err": {
        "message": "Error message",
        "stack": "Trace"
      }
    }
  ],
  "passes": [
    { "fullTitle": "Test 2" },
    { "fullTitle": "Test 3" },
    { "fullTitle": "Test 4" }
  ]
}`;

module.exports.dummyTest85 = `{
  "stats": {
    "tests": 7,
    "passes": 6,
    "pending": 0,
    "failures": 1
  },
  "pending": [],
  "failures": [
    {
      "fullTitle": "Test 1",
      "err": {
        "message": "Error message",
        "stack": "Trace"
      }
    }
  ],
  "passes": [
    { "fullTitle": "Test 2" },
    { "fullTitle": "Test 3" },
    { "fullTitle": "Test 4" },
    { "fullTitle": "Test 5" },
    { "fullTitle": "Test 6" },
    { "fullTitle": "Test 7" }
  ]
}`;
