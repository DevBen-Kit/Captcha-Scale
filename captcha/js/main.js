(function($){
    var fn = {
        BallConfigCount: 3,
        BallPerBowlCount: 8,
        WinTolerance: .5,
        BallConfig: {
            Balls: [],
            Left: [],
            Right: []
        },
        Init: function(){
            fn.Create.Init();
            fn.Event.Init();
        },
        Create: {
            Init: function(){
                fn.Create.BallConfig();
            },
            BallConfig: function(){
                var colorRed = -1, colorBlue = -1, colorGreen = -1, randomWeight = 0;
                var redList = [];
                var blueList = [];
                var greenList = [];
                var weightList = [];
                var config = {};
                var tries = 0;

                for (var i = 0; i< BallConfig.BallCount; i++){
                    colorRed = fn.Data.GetRandomInt(0, 255);
                    colorBlue = fn.Data.GetRandomInt(0, 255);
                    colorGreen = fn.Data.GetRandomInt(0, 255);

                    while($.grep(redList, function() { return colorRed + 15 > this && colorRed - 15 < this; }).length > 0) {
                        colorRed = fn.Data.GetRandomInt(0, 255);
                    }

                    while($.grep(blueList, function() { return colorBlue + 15 > this && colorBlue - 15 < this; }).length > 0) {
                        colorBlue = fn.Data.GetRandomInt(0, 255);
                    }

                    while($.grep(greenList, function() { return colorGreen + 15 > this && colorGreen - 15 < this; }).length > 0) {
                        colorGreen = fn.Data.GetRandomInt(0, 255);
                    }

                    randomWeight = fn.Data.GetRandomInt(BallConfig.MinWeight, BallConfig.MaxWeight);
                    
                    redList.push(colorRed);
                    blueList.push(colorBlue);
                    greenList.push(colorGreen);
                    weightList.push(randomWeight);
                    config = {
                        Color: `rgb(${colorRed},${colorBlue},${colorGreen})`,
                        GradientColor: `rgb(${colorRed/2},${colorBlue/2},${colorGreen/2})`,
                        Weight: randomWeight,
                        Index: i
                    };

                    fn.BallConfig.Balls.push(config);
                    fn.Create.AddList($("#div_ball_list"), config);
                }

                var randomBallIndex, randomLeft, randomRight;
                var sumLeft = 0, sumRight = 0;

                do
                {
                    fn.BallConfig.Left = [];
                    fn.BallConfig.Right = [];

                    randomLeft = fn.Data.GetRandomInt(BallConfig.PerBowlMinCount, BallConfig.PerBowlMaxCount);
                    randomRight = fn.Data.GetRandomInt(BallConfig.PerBowlMinCount, BallConfig.PerBowlMaxCount);
                    sumLeft = 0;
                    sumRight = 0;
                    
                    for (var i = 0; i< randomLeft; i++){
                        randomBallIndex = fn.Data.GetRandomInt(0, fn.BallConfig.Balls.length - 1);

                        fn.BallConfig.Left.push(fn.BallConfig.Balls[randomBallIndex]);
                    }
                    
                    for (var i = 0; i< randomRight; i++){
                        randomBallIndex = fn.Data.GetRandomInt(0, fn.BallConfig.Balls.length - 1);

                        fn.BallConfig.Right.push(fn.BallConfig.Balls[randomBallIndex]);
                    }

                    $.each(fn.BallConfig.Left,function(){sumLeft += this.Weight;});
                    $.each(fn.BallConfig.Right,function(){sumRight += this.Weight;});
                } while(sumLeft == sumRight || fn.Data.IsWin(sumRight / (sumLeft + sumRight) * 100));

                fn.Event.Scale.Reset();
            },
            Ball: function(target, ballLineID, config, targetPercent){
                var ballLine = document.getElementById(ballLineID + Math.ceil((target.find("path").length + 1) / 20));

                if(ballLine.length == 0) 
                    ballLine = document.getElementById(ballLineID + 1);

                var ball = $("#template_ball");
                var newBall = document.createElementNS('http://www.w3.org/2000/svg',"path");
                var percent = targetPercent || fn.Data.GetRandomInt(150, 800) / 10;
                var totalLength = ballLine.getTotalLength();
                var linePosition = ballLine.getPointAtLength(totalLength / 100 * percent);

                newBall.setAttributeNS(null, 'd',  `M${linePosition.x},${linePosition.y} ` + ball.attr("d"));
                newBall.setAttributeNS(null, 'weight',  config.Weight);
                newBall.setAttributeNS(null, 'fill', `url(#gradient_${config.Index})`);

                target.prepend(newBall);
            },
            AddList: function(target, config) {
                var ball = $("#template_ball");
                var defGradientContainer = $("#def_ball_gradient");
                var defGradient = $("#template_gradient").clone();
                var newBall = document.createElementNS('http://www.w3.org/2000/svg',"path");
                
                defGradient.attr("id", `gradient_${config.Index}`);
                defGradient.find(".stop_1").get(0).setAttributeNS(null, 'stop-color', config.Color);
                defGradient.find(".stop_2").get(0).setAttributeNS(null, 'stop-color', config.GradientColor);

                defGradientContainer.append(defGradient);
                target.append(newBall);

                var count = target.find("path").length;
                var boxWidth = 55;
                var countWidth = count * boxWidth;

                newBall.setAttributeNS(null, 'd', `M${countWidth},25 ` + ball.attr("d"));
                newBall.setAttributeNS(null, 'weight', config.Weight);
                newBall.setAttributeNS(null, 'fill', `url(#gradient_${config.Index})`);
                newBall.setAttributeNS(null, 'config-index',  config.Index);

                target.get(0).setAttributeNS(null, 'viewBox', `${boxWidth} 0 ${countWidth} 50`);
            },
            Speech: function() {
                var divScale = $("#div_scale");
                var target = $("#div_speech");
                var div = $("<div>").addClass("div_speech_bubble");
                var randomSentence = global_seriousSentences[fn.Data.GetRandomInt(0, global_seriousSentences.length - 1)];
                var randomHeight = fn.Data.GetRandomInt(30, 260);

                var balls = $("#bowl_left_balls path, #bowl_right_balls path");
                var randomBall = balls.get(fn.Data.GetRandomInt(0, balls.length - 1));
                var randomBallRect = randomBall.getBoundingClientRect();

                div.text(randomSentence);
                div.css("top", randomHeight + "px");

                if (!(randomHeight + 50 > randomBallRect.top && randomHeight - 50 < randomBallRect.top)) {
                    if(randomHeight > randomBallRect.top) {
                        div.addClass("bubble_bottom");
                    }
                    else{
                        div.addClass("bubble_top");
                    }

                    if(randomBallRect.left > divScale.width() / 2) {
                        div.addClass("bubble_left");
                    }
                    else{
                        div.addClass("bubble_right");
                    }
                }

                target.append(div);

                setTimeout(function(){
                    div.remove();
                }, 10000);
            },
            Triangle: function(target, parent) {
                var divScale = $("#div_scale");
                var balls = $("#bowl_left_balls path, #bowl_right_balls path");
                var svgTriangle = document.createElementNS('http://www.w3.org/2000/svg',"svg");
                var polygonTriangle = $("#template_triangle").clone();
                var randomBall = balls.get(fn.Data.GetRandomInt(0, balls.length - 1));
                var ballRect = randomBall.getBoundingClientRect();
                var targetRect = target.get(0).getBoundingClientRect();
                var points = [];

                svgTriangle
                
                if (divScale.height() / 2 < ballRect.top) {
                    points.push({ x: ballRect.left, y: ballRect.top});
                    points.push({ x: ballRect.left, y: targetRect.top});
                    points.push({ x: ballRect.left + 50, y: targetRect.top});
                }
                else {
                    points.push({ x: ballRect.left, y: ballRect.top});
                    points.push({ x: ballRect.left, y: targetRect.top});
                    points.push({ x: ballRect.left + 50, y: targetRect.top});

                    svgTriangle.style.top = target.outerHeight();
                }

                if (divScale.width() / 2 < ballRect.left) {
                    
                }
                else {
                    
                }

                svgTriangle.append(polygonTriangle.get(0));
                parent.append(svgTriangle);

                svgTriangle.setAttributeNS(null, "viewBox", `0 0 300 390`);
                svgTriangle.setAttributeNS(null, "height", `300`);
                svgTriangle.setAttributeNS(null, "width", `390`);
                polygonTriangle.attr("points", `${points[0].x},${points[0].y} ${points[1].x},${points[1].y} ${points[2].x},${points[2].y}`);
            }
        },
        Event: {
            Init: function(){
                $("#btn_clear").on("click", fn.Event.Scale.Reset);
                $("#div_ball_list").on("mousedown touchstart", "path", fn.Event.Ball.New);
                $("#div_drag").on("mousemove touchmove", fn.Event.Ball.Move);
                $("#div_drag").on("mouseup touchend", fn.Event.Ball.Drop);

                fn.Event.SpeechInterval();
            },
            SpeechInterval: function(){
                setTimeout(function(){
                    fn.Create.Speech();
                    fn.Event.SpeechInterval();
                }, fn.Data.GetRandomInt(BallConfig.SpeechTimeoutMin, BallConfig.SpeechTimeoutMax));
            },
            Scale: {
                Reset: function() {
                    var groupLeft = $("#bowl_left_balls").empty();
                    var groupRight = $("#bowl_right_balls").empty();

                    $.each(fn.BallConfig.Left, function() {
                        fn.Create.Ball(groupLeft, "path_left_balls_", this);
                    });

                    $.each(fn.BallConfig.Right, function() {
                        fn.Create.Ball(groupRight, "path_right_balls_", this);
                    });
                    
                    fn.Event.Scale.Check();
                },
                Check: function(){
                    var leftBalls = $("#bowl_left_balls").find("path");
                    var rightBalls = $("#bowl_right_balls").find("path");
                    var leftWeight = 0;
                    var rightWeight = 0;

                    $.each(leftBalls, function(i, ball) {
                        leftWeight += ball.getAttribute("weight") * 1;
                    });

                    $.each(rightBalls, function(i, ball) {
                        rightWeight += ball.getAttribute("weight") * 1;
                    });

                    if (leftWeight <= 0 && rightWeight <= 0)
                        fn.Event.Scale.Rotate(50);
                    else
                        fn.Event.Scale.Rotate(rightWeight / (leftWeight + rightWeight) * 100);
                },
                Rotate: function(percent) {
                    var maxDegree = 80;
                    var maxOffset = 22;
                    var targetDegree = maxDegree / 100 * percent - maxDegree / 2;
                    var targetOffset = (maxOffset / 100 * percent - maxOffset / 2) * -1;

                    $("#img_scale_arm").css("transform", `rotate(${targetDegree}deg)`);
                    $("#img_scale_bowl_right").css("offset-distance", `${targetOffset}%`);
                    $("#img_scale_bowl_left").css("offset-distance", `${targetOffset}%`);

                    if (fn.Data.IsWin(percent)) {
                        setTimeout(fn.Event.Success, 3000);
                    }
                }
            },
            Ball: {
                New: function(event) {
                    var posX, posY;
                    var ball = $("#template_ball");
                    var clone = $(event.target).clone();
                    var svg = document.createElementNS('http://www.w3.org/2000/svg',"svg");

                    fn.DragInProcess = true;

                    if (event.type=="touchmove") {
                        posX = event.originalEvent.touches[0].clientX;
                        posY = event.originalEvent.touches[0].clientY;
                    }
                    else {
                        posX = event.pageX;
                        posY = event.pageY;
                    }

                    clone.get(0).setAttributeNS(null, 'd', `M0,25 ` + ball.attr("d"));
                    svg.setAttributeNS(null, 'viewBox', `0 0 50 50`);
                    svg.setAttributeNS(null, 'height', `30`);
                    svg.style.top = posY - 25;
                    svg.style.left = posX - 25;

                    $(svg).append(clone);
                    $("#div_drag").addClass("dragProcess").append(svg);
                },
                Move: function(event) {
                    var posX, posY;
                    var svg = $(event.target).find("svg").get(0);

                    if (fn.DragInProcess) {
                        if (event.type=="touchmove") {
                            posX = event.originalEvent.touches[0].clientX;
                            posY = event.originalEvent.touches[0].clientY;
                        }
                        else {
                            posX = event.pageX;
                            posY = event.pageY;
                        }

                        console.log({posX, posY});

                        if (svg) {
                            svg.style.top = posY - 25;
                            svg.style.left = posX - 25;
                        }
                    }
                },
                Drop: function(event) {
                    var svg = $(event.target).find("svg").get(0);
                    var path = $(event.target).find("path").get(0);
                    var imgBowlLeft = $("#img_scale_bowl_left").get(0);
                    var imgBowlRight = $("#img_scale_bowl_right").get(0);
                    var groupLeft = $("#bowl_left_balls");
                    var groupRight = $("#bowl_right_balls");
                    var configIndex = path.getAttribute("config-index");
                    var x = path.getBoundingClientRect().left;
                    var min = 5;
                    var max = 90;

                    if(fn.DragInProcess) {
                        fn.DragInProcess = false;

                        if(fn.Data.Collide(svg, imgBowlLeft)){
                            var leftX = imgBowlLeft.getBoundingClientRect().left;
                            var leftWidth = imgBowlLeft.getBoundingClientRect().width;
                            var percent = (x - leftX) / leftWidth * 100;

                            if(percent >= min && percent <= max){
                                fn.Create.Ball(groupLeft, "path_left_balls_", fn.BallConfig.Balls[configIndex], percent);
                                fn.Event.TextToBalls();
                                fn.Event.Scale.Check();
                            }
                        }

                        else if(fn.Data.Collide(svg, imgBowlRight)){
                            var rightX = imgBowlRight.getBoundingClientRect().left;
                            var rightWidth = imgBowlRight.getBoundingClientRect().width;
                            var percent = (x - rightX) / rightWidth * 100;
                            
                            if(percent >= min && percent <= max){
                                fn.Create.Ball(groupRight, "path_right_balls_", fn.BallConfig.Balls[configIndex], percent);
                                fn.Event.TextToBalls();
                                fn.Event.Scale.Check();
                            }
                        }

                        $("#div_drag").removeClass("dragProcess").empty();
                    }
                }
            },
            TextToBalls: function(){
                var list = $(".text_to_balls");
                var randomIndex = fn.Data.GetRandomInt(0, list.length - 1);

                if(randomIndex == 0)
                    list.get(randomIndex).innerText = "Balls";
                else
                    list.get(randomIndex).innerText = "balls";
            },
            Success: function() {
                window.top.postMessage("success", '*');
            }
        },
        Data: {
            GetRandomInt: function(min, max) {
                return Math.floor(Math.random() * (max - min + 1) + min);
            },
            Collide: function(element, target) {
                var rect1 = element.getBoundingClientRect();
                var rect2 = target.getBoundingClientRect();

                return !(
                    rect1.top > rect2.bottom ||
                    rect1.right < rect2.left ||
                    rect1.bottom < rect2.top ||
                    rect1.left > rect2.right
                );
            },
            IsWin: function (percent){
                return percent > 50 - BallConfig.WinTolerance && percent < 50 + BallConfig.WinTolerance;
            }
        }
    };

    fn.Init();
})(jQuery);