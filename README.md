# opspark
A node utility supporting installation and configuration of operation spark projects.

**Table of Contents**

- [opspark](#opspark)
  - [Prerequisites](#prerequisites)
  - [Publishing Projects and Updates to Your Website](#publishing-projects-and-updates-to-your-website)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Initializing Your Portfolio](#initializing-your-portfolio)
    - [Installing Projects](#installing-projects)
    - [Testing Projects](#testing-projects)
    - [Submitting Projects](#submitting-projects)
    - [Shelving Projects](#shelving-projects)
    - [Uninstalling Projects](#uninstalling-projects)
    - [Pair Programming on Projects](#pair-programming-on-projects)
  - [Help](#help)
  - [For Teachers and Developers](#for-teachers-and-developers)
    - [Headstart](#headstart)
    - [Keeping Master Files](#keeping-master-files)

## Prerequisites

The `opspark` npm utility is designed to work with the Operation Spark website project, which starts with two lessons that you and your students should complete before installing and using the `opspark` npm utility.  The two prerequisites lessons are:

1. <a href="https://github.com/OperationSpark/first-website/blob/master/README.md" target="_blank">First Website: Available here...</a>
2. <a href="https://github.com/OperationSpark/portfolio/blob/master/README.md" target="_blank">Portfolio Page: Available here...</a>

Combined, these two prerequisites website lessons build-out and publish live, a cool website that includes a home page (`index.html`), which links to a portfolio page (`portfolio.html`).

The portfolio page is designed to automatically list all Operation Spark projects installed using the `opspark` npm utility.

These subsequent _sub-projects_ are installable through the `opspark` npm utility.  After installing the `opspark` npm utility (see instructions below), you will have access to certain commands via the commandline (again, see instructions below), which will allow you to select the project you want to install from a list of all installable projects.

On selecting a project to install, the project is downloaded and installed in the `projects/projectName` directory in the root directory of your website, and if any bower components are required, they are installed during this process so the student is ready to begin straight away.

The projects can be games, simple apps, or programmer art - projects intended to illustrate, practice and problem solve in a certain area of software development.

## Publishing Projects and Updates to Your Website

Remember that in our <a href="https://github.com/OperationSpark/first-website/blob/master/README.md" target="_blank">First Website lesson</a>, we pushed our changes to our GitHub Pages website by executing the typical `git` workflow commands of:

    git add -A
    git commit -m "A commit message describing our changes"
    git push

When updating your website or publishing a completed project to your live website, remember that you'll need to run the same `git` commands.

## Installation

    npm install -g opspark

## Usage

### Initializing Your Portfolio

If you've completed the portfolio.html lesson (see [Prerequisites](#prerequisites), above), then you'll need to initialize your portfolio by first running the command:

    os init-pf

Running this command will write a few script tags to the `portfolio.html`, allowing installed projects to appear dynamically as new `<li>` entries in the `<ul id="portfolio">` list in the `portfolio.html` page.

It's not necessary to run this command before installing and working on projects - previously installed projets will still show up in the portfolio list after initialization, **but**, it will make working on the live project easier, because _if_ the portfolio page is initialized, the project can be viewed in a browser while in development in Clould9 or locally, by navigating to the portfolio page, and selecting the project from the list.  Student's can then make changes to their code, save, refresh the browser, etc.

### Installing Projects

1. To get a list of installable projects, run:

        os install

    You'll be presented with a list of installable projects:

    <img src="https://raw.githubusercontent.com/OperationSpark/opspark/master/img/list.png">

2. Select the project you want to install using the arrow keys

    <img src="https://raw.githubusercontent.com/OperationSpark/opspark/master/img/use-arrow-keys.png">

3. Once you've selected the project using the arrow keys, press `Return`.  You'll then be asked to confirm:

    <img src="https://raw.githubusercontent.com/OperationSpark/opspark/master/img/confirm.png">

    Press enter to confirm, and the installation will take place:

<img src="https://raw.githubusercontent.com/OperationSpark/opspark/master/img/installing.png">

...and when complete, you'll see the message:

<img src="https://raw.githubusercontent.com/OperationSpark/opspark/master/img/installed.png">

You're ready to roll!

Now, to begin working on our project, typically you will go into the directory of the project you just installed (for example, if you installed the _frabonacci_ project, you'll find it at `projects/frabonacci`), and open the file `index.html`.  Again, if you installed the **frabonacci** project, you'll open the `index.html` file at:

    projects/frabonacci/index.html

Have fun!

### Testing projects

Coming soon...

### Submitting projects

Coming soon...

### Shelving projects

Coming soon...

### Uninstalling projects

Coming soon...

### Pair Programming on Projects

Coming soon...

## Help

To see built-in help, you can always run the command:

    os -h

This will list commands and optional flags available to you in the `opspark` npm utility.

For more personable help, tug on the sleeve of one of your awesome Operation Spark developers teaching your bootcamp, or, contact us via our Slack chat group.  If you're not a member of our Slack group, please request an invitation via our website at <a href="operationspark.org">operationspark.org</a>.

## For Teachers and Developers

### Headstart

If you want to get a fast head-start, instead of having to step through the [prerequisites lessons](#prerequisites), you can simply install the fully completed first two lessons via the `opspark` npm utility.

To do this:

1. If you want to publish the website live on GitHub Pages, as is the pattern with our website project, you will first want to create a GitHub repository, so named for your GitHub username, as in, my-github-username.github.io, and then clone it into a new Clould9 workspace (step 2).  <a href="https://github.com/OperationSpark/first-website/blob/master/README.md" target="_blank">See the instructions to do so in the First Website lesson on setting up the GitHub repository for a GitHub Pages website</a>.

    If you don't want to publish your website, you can skip this step and move on to step 2.

2.  If you've completed the optional step 1, clone a new Clould9 workspace using the ssh option from your website's GitHub repository and make it an HTML5 environment.

    If you skipped the optional step 1, the simply create a new Clould9 workspace, using HTML5.

3. Next, once your Clould9 workspace has finished spooling-up, globally install the opspark npm utility by running the command:

        npm install -g opspark

4. Finally, to install and initialize the website files, run the command:

        os init-ws

This will download a completed version of the `index.html` and `portfolio.html` files, and  initialize the `portfolio.html`.  You will probably want to change the default content and style with your own content, if you're going to publish it, heh, heh!

### Keeping Master Files

For teachers or developers instructing classes, you may choose to install a project and keep the .master files, which usually include the fully completed project and sometimes teachers notes.  To to this, run the `os install` command and include the `-m` flag, like so:

    os install -m

After selecting and confirming installation, you'll find any master files in the hidden directory of `.master`.
