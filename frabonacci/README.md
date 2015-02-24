Frabonacci
===

A motion poem making use of the golden ratio to generate an animate artistic patterns, inspired by the work of the great Gabriel Mulzer.

Also at: http://bit.ly/frabonacci

**Table of Contents**


## Installation

Create a new Cloud9 workspace and clone the project from github.com:

1. From your Cloud9 Dashboard, find in the upper left corner and click the green button, "Create New Workspace" > "Clone From URL":

    <img src="https://raw.githubusercontent.com/OperationSpark/using-c9/master/img/clone-new-workspace.png">

2. In the "Source URL" form input, copy and paste in the following URL (see A):
    
        https://github.com/OperationSpark/frabonacci.git
    
    Then, in the environment selection box, select "HTML5" (see B).  Finally, click the green button "Create" (see C).
    
    <img src="https://raw.githubusercontent.com/OperationSpark/frabonacci/master/img/clone-workspace-html5.png">

3. Wait for the workspace to finish spooling (while spooling up, you'll see a spinning gear on the newly created workspace in the sidebar), and once the workspace is completed, click the green button, "START EDITING".

    <img src="https://raw.githubusercontent.com/OperationSpark/using-c9/master/img/whatever-project-start-editing.png">

4. Now, when the workspace is loaded, select the command-line in the bottom window pane, and enter the command `bower install`, then press `Enter`, like this:

    <img src="https://raw.githubusercontent.com/OperationSpark/using-c9/master/img/whatever-project-bower-install.png">

    You'll see some text flying by on the command-line as some required files are installed... and when complete, you'll see something like this:
    
    <img src="https://raw.githubusercontent.com/OperationSpark/using-c9/master/img/whatever-project-bower-installed.png">

Nice, you're in business...

***

## Overview

### Specs

The portrait of the programmer as a young artist continues, using random number generation, color, and velocity applied to circles in this little motion poem.  As usual, we're going to be drawing to an HTML5 Canvas element using the drawing API of the CreateJS module, EaselJS, and our helper library, draw, that simplifies the drawing process somewhat.

### Take Away

Using the draw line API to create a cool randomized piece of art.

Some concepts you'll learn are:

* Drawing with CreateJS and our draw utility.
* Leveraging the power of built-in and 3rd party API (DRY), like Math and opspark-draw.
* Variable declaration and initialization.
* Function invocation and passing arguments to functions.
* Conditional statements - making decisions in code.
* Using built-in trigonometry functions to calculate coordinates in a cartesian system.
* Pair programming.

### Entering Code

As we work through the app, you'll find `// TODO //` notes in our `app.js` file, and _under_ these `TODO` lines is where you'll enter the code we need to type.  It's important you enter the code you need to type for the step under these `TODO` place markers, because code is executed in a particular order.

So, to complete a lesson step, _find_ the `TODO` place marker in the appropriate JavaScript file:

**EXAMPLE**

<img src="https://raw.githubusercontent.com/OperationSpark/using-c9/master/img/find-todo.png">

...then put your cursor on the line below the `TODO`, and enter the code from the current lesson step:

**EXAMPLE**

<img src="https://raw.githubusercontent.com/OperationSpark/using-c9/master/img/todo-done.png">

Sweet!

### Type of App : Web

Note that **this app will run _in a web browser_**, preferably Chrome.

***

## Lesson Steps

### TODO : 1 Declare Variables

````javascript
// TODO 1 : Declare our variables //
var
    settings,
    values,
    i,
    shape, 
    template;
````


### TODO 2 : Initialize our App

````javascript
// TODO 2 : Implement the initialize() function //
function initialize() {
    values = _.clone(settings[settings.activeDataSet]);
    i = values.max;
    template = ui.makeTemplate();
}
````


### TODO 3 : Implement our Shape Drawing Function

````javascript
// TODO 3 : Implement the drawShape function //
function drawShape() {
    values.goldenAngle *= values.degrade;
    
    values.rotation += values.goldenAngle;
    values.rotation -= Math.floor(values.rotation / 360) * 360;
    
    values.radius *= values.radiusGrowthFactor;
    
    shape = template.clone();
    shape.x = Math.cos(values.rotation * Math.PI / 180) * values.radius + (canvas.width / 2);
    shape.y = Math.sin(values.rotation * Math.PI / 180) * values.radius + (canvas.height / 2);
    shape.rotation = values.rotation;
    
    view.addChildAt(shape, 0);
}
````

### TODO 4 : Implement our Update Function

````javascript

// TODO 4 : Implement the update function //
function update() {
    if (i) {
        drawShape();
        i--;
    }
}
````

## RUN THE APP!

Ok, you've probably done this before: we're gonna run the app! 
Alrighty, to run the app, YOU MUST open the file at:

    index.html

And with the index.html tab selected in the editor (see A), you can simply press the green play button (see B).

This will start an Apache web server in a new tab of the Console View, the bottom window pane of the Cloud9 IDE.

Once Apache has booted, you can click the URL (see C):

    https://frabonacci-jfraboni.c9.io/index.html
    
...this will open a new tab with the appliation running.

Once this tab opens, we recommend popping out the tab into Chrome, into a separate browser tab. To do so, click on the popout button on the right side of the preview tab (see A), like so:


### TODO 5 : Implement the Apply Scale Function

````javascript
// TODO 5 : Implement the applyScale //
function applyScale(shape) {
    values.scaleX += values.growthX;
    values.scaleY += values.growthY;
    
    shape.scaleX = values.scaleX;
    shape.scaleY = values.scaleX;
}
````

### TODO 6 : Call the Apply Scale Function

Inside the `update()` function, on the line _below_ the call to the `drawShape()` function, invoke the `applyScale()` function, passing the shape as an argument.  Your `update()` function will now look like this:

````javascript
function update() {
    if (i) {
        drawShape();
        applyScale(shape);
        i--;
    }
}
````

### TODO 7 : Your Turn - Remove Shapes and Reinitialize

You'll need to figure out how to remove all the shapes we've drawn so far, then start over!

First thing to do, setup your `update()` method with an `else` condition and code block, like so:

````javascript
function update() {
    if (i) {
        drawShape();
        applyScale(shape);
        i--;
    } else {
        // you're remove shape code here //
        
    }
}
````

To remove all children, will give you some tools - the `view` object exposes the API:

* `numChildren`
* `removeChildAt(index)`

...you'll want to make use of these methods to solve the problem at hand.

Give'r!