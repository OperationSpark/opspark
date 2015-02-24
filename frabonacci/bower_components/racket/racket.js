(function (window) {
    window.opspark = window.opspark || {};
    
    function sortNumbersAscending(a, b) { return a - b; }
    
    function sortNumbersDecending(a, b) { return b - a; }
    
    function randomIntBetween(min, max) { 
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    
    // radians = degrees * Math.PI / 180 //
    function degreesToRadians(degrees) {
        return degrees * Math.PI / 180;
    }
    
    // degrees = radians * 180 / Math.PI //
    function radiansToDegrees(radians) {
        return radians * 180 / Math.PI;
    }
    
    var racket = {
        physikz: {
            addRandomVelocity: function (body, area, multiplierX, multiplierY) {
                if (!body.integrity) { _.extend(body, this.makeBody()); }
                
                multiplierX = (multiplierX) ? multiplierX : .6;
                multiplierY = (multiplierY) ? multiplierY : .5;
                
                var tx = randomIntBetween(0, area.width);
                var ty = randomIntBetween(0, area.height);
                var dx = Math.abs(tx - body.x);
                var dy = Math.abs(ty - body.y);
                var radians = Math.atan2(dy, dx);
                body.rotation = radiansToDegrees(radians);
                
                var rotationalDirection = (Math.round(Math.random()) === 1) ? 1 : -1;
                body.rotationalVelocity = randomIntBetween(1, 3) * rotationalDirection;
                var forceX = Math.cos(radians) * (Math.random() * multiplierX);
                var forceY = Math.sin(radians) * (Math.random() * multiplierY);
                
                body.velocityX = (tx > body.x) ? forceX : -forceX;
                body.velocityY = (ty > body.y) ? forceY : -forceY;
            },
            
            updatePosition: function (body) {
                body.x += body.velocityX;
                body.y += body.velocityY;
                body.rotation += body.rotationalVelocity;
            },
            
            updateRadialPositionInArea: function (body, area) {
                var radius = body.radius;
                var w  = area.width + radius * 2;
                var h = area.height + radius * 2;
                
                body.x = (body.x + radius + body.velocityX + w) % w - radius;
                body.y = (body.y + radius + body.velocityY + h) % h - radius;
                body.rotation += body.rotationalVelocity;
            },
            
            updateRadialPositionAndReboundInArea: function (body, area) {
                var radius = body.radius;
                var top = 0;
                var left = 0;
                var right = area.width;
                var bottom = area.height;
                
                body.x += body.velocityX;
                body.y += body.velocityY;
                body.rotation += body.rotationalVelocity;
                
                if (body.x + radius > right) {
                    body.x = right - radius;
                    body.velocityX *= -1;
                    
                } else if (body.x - radius < left) {
                    body.x = left + radius;
                    body.velocityX *= -1;
                }
                
                if (body.y + radius > bottom) {
                    body.y = bottom - radius;
                    body.velocityY *= -1;
                } else if (body.y - radius < top) {
                    body.y = top + radius;
                    body.velocityY *= -1;
                }
            },
            
            /*
             * getDistance: Using the Pythagorean Theorem, returns the 
             *      distance between two points.
             *
             * @return Number
             */
            getDistance: function (pointOne, pointTwo) {
                var dx = pointTwo.x - pointOne.x;
                var dy = pointTwo.y - pointOne.y;
                return Math.sqrt(dx * dx + dy * dy);
            },
            
            /*
             * hitTestRadial: Returns true if the distance is less than 
             *      the sum of the two radius.
             *
             * @return Boolean
             */
            hitTestRadial: function (distance, radiusOne, radiusTwo) { 
                return (distance < radiusOne + radiusTwo);
            },
            
            interact: function (bodies, spring) {
                for(var i = bodies.length - 1; i > 0; i--) {
                    var bodyA = bodies[i];
                    for(var j = i - 1; j > -1; j--) {
                        var bodyB = bodies[j];
                        
                        var dx = bodyB.x - bodyA.x;
                        var dy = bodyB.y - bodyA.y;
                        var distance = Math.sqrt(dx * dx + dy * dy);
                        var radiusCombined = bodyA.radius + bodyB.radius;
                        
                        if(distance < radiusCombined) {
                            var tx = bodyA.x + dx / distance * radiusCombined;
                            var ty = bodyA.y + dy / distance * radiusCombined;
                            var ax = (tx - bodyB.x) * spring;
                            var ay = (ty - bodyB.y) * spring;
                            bodyA.velocityX -= ax;
                            bodyA.velocityY -= ay;
                            bodyB.velocityX += ax;
                            bodyB.velocityY += ay;
                            
                            var impact = bodyA.volatility + bodyB.volatility;
                            bodyA.handleCollision(impact);
                            bodyB.handleCollision(impact);
                        }
                    }
                }
                
                // var total = bodies.length;
                // for(var i = 0; i < total - 1; i++) {
                //     var bodyA = bodies[i];
                //     for(var j = i + 1; j < total; j++) {
                //         var bodyB = bodies[j];
                        
                //         var dx = bodyB.x - bodyA.x;
                //         var dy = bodyB.y - bodyA.y;
                //         var distance = Math.sqrt(dx * dx + dy * dy);
                //         var radiusCombined = bodyA.radius + bodyB.radius + 6;
                        
                //         if(distance < radiusCombined) {
                //             var tx = bodyA.x + dx / distance * radiusCombined;
                //             var ty = bodyA.y + dy / distance * radiusCombined;
                //             var ax = (tx - bodyB.x) * spring;
                //             var ay = (ty - bodyB.y) * spring;
                //             bodyA.velocityX -= ax;
                //             bodyA.velocityY -= ay;
                //             bodyB.velocityX += ax;
                //             bodyB.velocityY += ay;
                            
                //             var impact = bodyA.volatility + bodyB.volatility;
                //             bodyA.handleCollision(impact);
                //             bodyB.handleCollision(impact);
                //         }
                //     }
                // }
            },
            
            makeBody: function (velocityX, velocityY, rotationalVelocity, density, integrity, volatility) {
                return {
                    velocityX: velocityX || 0,
                    velocityY: velocityY || 0,
                    rotationalVelocity: rotationalVelocity || 0,
                    density: density || 1,
                    integrity: integrity || 1,
                    volatility: volatility || 0,
                    
                    handleCollision: function (impact) {
                        // template method //
                    }
                };
            },
            
            degreesToRadians: degreesToRadians,
            radiansToDegrees: radiansToDegrees
        },
        
        num: {
            randomIntBetween: randomIntBetween,
            sortNumbersAscending: sortNumbersAscending,
            sortNumbersDecending: sortNumbersDecending
        }
    };
    window.opspark.racket = racket;
}(window));
