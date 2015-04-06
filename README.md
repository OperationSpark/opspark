# opspark
A node utility supporting installation and configuration of operation spark projects.

## Prerequisites

The opspark npm utility is designed to work with the Operation Spark website project, which starts with two lessons that you and your students should complete before installing and using the opspark npm utility.  The two prerequisites lessons are:

1. First Website: https://github.com/OperationSpark/first-website/blob/master/README.md
2. Portfolio Page: https://github.com/OperationSpark/portfolio/blob/master/README.md

Combined, these two prerequisites website lessons build-out and publish live, a cool website that includes a home page (`index.html`), which links to a portfolio page (`portfolio.html`).

The portfolio page is designed to automatically list all Operation Spark projects installed using the opspark npm utility.

These subsequent _sub-projects_ are installable through the `opspark` npm utility.  After installing the `opspark` npm utility (see instructions below), you will have access to certain commands via the commandline (again, see instructions below), which will allow you to select the project you want to install from a list of all installable projects.

On selecting a project to install, the project is downloaded and installed in the `projects/projectName` directory in the root directory of your website.

The projects can be games, simple apps, or programmer art - projects intended to illustrate, practice and problem solve in a certain area of software development.


## Installation

    npm install -g opspark

## Usage

### Initializing Your Profolio

If you've completed the portfolio.html lesson (see [Prerequisites](#prerequisites), above), then you'll need to initialize your portfolio by first running the command:

        os init-pf

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

## Help

To see built-in help, you can always run the command:

    os -h

This will list commands and optional flags available to you in the opspark npm utility.

## For Teachers and Developers

### Headstart

If you want to get a fast head-start, instead of having to step through the [prerequisites lessons](#prerequisites), you can simply install the fully completed first two lessons via the `opspark` npm utility.

To do this:

1. If you want to publish the website live on GitHub Pages, as is the pattern with our website project, you may first want to pair your Clould9 workspace with with a GitHub repository, so named for your GitHub username.  <a href="https://github.com/OperationSpark/first-website/blob/master/README.md" target="_blank">See the instructions to do so in the First Website lesson</a>.  If you don't want to publish your website, you can skip this step.

2.  If you've completed the optional step 1, clone a new Clould9 workspace using the ssh option from your website's GitHub repository and make it an HTML5 environment.

    If you skipped the optional step 1, the simply create a new Clould9 workspace, using HTML5.

3. Next, once your Clould9 workspace has finished spooling-up, globally install the opspark npm utility by running the command:
        npm install -g opspark

4. Finally, to install and initialize the website files, run the command:
       os init-ws

This will download a completed version of the `index.html` and `portfolio.html` files, and  initialize the `portfolio.html`.  You will probably want to change the default content and style, heh, heh!

### Keeping Master Files

For teachers or developers instructing classes, you may choose to install a project and keep the .master files, which usually include the fully completed project and sometimes teachers notes.  To to this, run the `os install` command and include the `-m` flag, like so:

    os install -m

After selecting and confirming installation, you'll find any master files in the hidden directory of `.master`