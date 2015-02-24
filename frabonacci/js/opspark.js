(function (window) {
    window.opspark = window.opspark || {};
    
    var 
        draw = window.opspark.draw,
        createjs = window.createjs;
    
    window.opspark.makeApp = function (updateable) {
        var 
            _stage, 
            _canvas, 
            _updateable, 
            _app, 
            _fps;
        
        _canvas = document.getElementById('canvas');
        _stage  = new createjs.Stage(_canvas);
        
        _updateable = (updateable) ? [].concat(updateable) : [];
        
        _app = {
            canvas: _canvas,
            stage: _stage,
            view: new createjs.Container(),
            
            addUpdateable: function(updateable) {
                _updateable.push(updateable);
                return _app;
            },
            
            removeUpdateable: function(updateable) {
                var index = _updateable.indexOf(updateable);
                if (index !== -1) {
                    _updateable.splice(index, 1);
                }
                return _app;
            },

            update: function(e) {
                for (var i = 0; i < _updateable.length; i++) {
                    _updateable[i].update();
                }
                // always update the stage last //
                _stage.update();
            }
        };
        
        
        window.addEventListener('resize', resizeCanvas, false);
        function resizeCanvas(e) {
            _canvas.width = window.innerWidth;
            _canvas.height = window.innerHeight;
            if (e) { _app.update(e) }
        }
        resizeCanvas();
        
        _app.stage.addChild(_app.view);
        
        _fps = draw.fps('#000');
        _stage.addChildAt(_fps, 1);
        _app.addUpdateable(_fps);
        
        createjs.Ticker.setFPS(60);
        createjs.Ticker.on('tick', _app.update);

        return _app;
    };
}(window));