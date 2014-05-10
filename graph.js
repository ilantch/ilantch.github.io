/**
 * Created by User on 5/7/14.
 */

function nodesCtrl($scope) {

    reset();

    function reset() {
        $scope.nodes = [];
        $scope.firstOrderWeights = []; // node,node -> val
        $scope.secondOrderWeights = [];// node,node , node,node -> val
        $scope.treeVal = 0.0;
        $scope.selectedEdges = [];
        $scope.randText = "";
        $('#graphCanvas')[0].getContext('2d').clearRect(0,0,$('#graphCanvas')[0].width,$('#graphCanvas')[0].height);
    }

    // $scope.nodes=[{text:"I",id:0},{text:"am",id:1},{text:"Ilan",id:2},{text: "ALongWordWithLotsOFText",id:3},{text:"anotherWord",id:4}];

    $('#inputFile')[0].onchange = function(e) {
        if (e.target.files.length > 0) {

            reset();
            // read input
            var f  = e.target.files[0];
            var fr = new FileReader();
            fr.readAsText(f);
            fr.onload = function(e) {
                parseInputFile(e.target.result,$scope);
                $scope.$digest();
            };
        }
    }

    $scope.updateCanvas = function(nodeId) {
        parentVal = $('#node' + nodeId).val();
        if (parseInt(parentVal) === nodeId) {
            return;
        }
        if (parentVal == "") {
            clearEdge(nodeId,$scope.selectedEdges[nodeId]);
        }
        else {
            parentNum = parseInt(parentVal);
            // in input is legal
            if ((parentNum >= 0) && (parentNum < $scope.nodes.length)) {
                // if there was a number there
                clearEdge(nodeId,parentNum);

                // add a new edge
                addEdge(nodeId,parentNum);
            }
            console.log('UC');
        }
    }

    function clearEdge(nodeId,parentNum) {
        debugger;
        // if edge dont have data - do nothing
        if (! ($scope.selectedEdges[nodeId] >= 0) )  {
            return;
        }

        // edge properties
        to = nodeId;
        from = parentNum;

        // remove the edge from $scope
        $scope.selectedEdges[to] = undefined;

        // update score
        updateScores();

        // update canvas
        drawCanvas();
        // digest??
    }

    function addEdge(nodeId,parentNum) {
        // edge properties
        to = nodeId;
        from = parentNum;

        // add edge to $scope
        $scope.selectedEdges[to] = from;

        // update scores
        updateScores();

        // update canvas
        drawCanvas();
        // digest?
    }

    function updateScores(from,to,addedOrRemoved) {
        // run on all edges
        sum = 0.0;
        for (to1 in $scope.selectedEdges) {
            from1 = $scope.selectedEdges[to1];
            if (from1 >= 0) {
                sum += parseFloat($scope.firstOrderWeights[from1][to1]);
                for (to2= to1+1 ; to2 < $scope.selectedEdges.length ; to2++) {
                    from2 = $scope.selectedEdges[to2];
                    if (from2 >= 0) {
                        sum += parseFloat($scope.secondOrderWeights[from1][to1][from2][to2]);
                    }
                }
            }
        }
        $scope.treeVal = sum;
    }

    function drawCanvas() {
        var canvas = $('#graphCanvas')[0];
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0,0,canvas.width,canvas.height); // clear canvas

        // arrow colors:
        colors = ["lime","red","black","brown", "darkBlue", "orange", "lawnGreen", "purple"];
        for (to in $scope.selectedEdges) {
            ctx.beginPath();
            from = $scope.selectedEdges[to];
            if (from >= 0) {
                // find out where to put the arrows
                from_x  = $('#node' + from).parent()[0].offsetWidth/2; // middle of the word
                from_x += $('#node' + from).parent()[0].offsetLeft;
                from_x -= canvas.offsetLeft;

                to_x  = $('#node' + to).parent()[0].offsetWidth/2; // middle of the word
                to_x += $('#node' + to).parent()[0].offsetLeft;
                to_x -= canvas.offsetLeft;

                // draw the line
                debugger;
                color = colors[parseInt(Math.random()*colors.length)];
                ctx.fillStyle = color;
                ctx.strokeStyle = color;
                // right arrow will start slightly to the right
                rightArrow = (to_x > from_x);
                xPoint = rightArrow ? ((to_x + from_x)/2 + 3) : ((to_x + from_x)/2 - 3);
                yPoint = rightArrow ? (canvas.height - 2) : (canvas.height - 5);
                r      = rightArrow ? (Math.abs((to_x - from_x)/2) - 3) : (Math.abs((to_x - from_x)/2) + 3);
                ctx.arc(xPoint,yPoint , r, 0, Math.PI, true);
                ctx.stroke();
                // draw the traiangle (arrowhead)
                ctx.beginPath();
                rightArrow ? ctx.moveTo(to_x,canvas.height - 2)     : ctx.moveTo(to_x - 6,canvas.height - 4);
                rightArrow ? ctx.lineTo(to_x + 5,canvas.height - 9) : ctx.lineTo(to_x - 1,canvas.height - 11);
                rightArrow ? ctx.lineTo(to_x - 5,canvas.height - 9) : ctx.lineTo(to_x - 11,canvas.height - 11);
                ctx.fill();
            }
        }
    }

    function parseInputFile(fileText,scope) {
        var allLines = fileText.split("\n");
        scope.nodes = [];
        for (line in allLines) {
            if (allLines[line].trim()) {
//                debugger;
                currLine = allLines[line].trim().replace(/\s{2,}/g, ' ').split(" ");
                switch (currLine.shift()) {
                    case "nodes":
                        // define "root" node
                        currLine = ["root"].concat(currLine);
                        // define ids
                        for (i in currLine) {
                            scope.nodes[i] = {text:currLine[i], id:i};
                        }
                        numNodes = scope.nodes.length;
                        // define dimension of edges matrix
                        scope.firstOrderWeights  = new Array(numNodes );
                        scope.secondOrderWeights = new Array(numNodes );
                        for (i=0;i<numNodes ; i++) {
                            scope.firstOrderWeights[i] = new Array(numNodes );
                            scope.secondOrderWeights[i] = new Array(numNodes );
                            for (j=0;j<numNodes  ; j++) {
                                scope.secondOrderWeights[i][j] = new Array(numNodes );
                                for (k=0; k<numNodes ; k++) {
                                    scope.secondOrderWeights[i][j][k] = new Array(numNodes );
                                }
                            }
                        }
                        $scope.selectedEdges = new Array(numNodes);
//                        debugger;
                        break;
                    case "1stOrder":
//                        debugger;
                        for (edge in currLine) {
                            edge = currLine[edge].split(",");
                            scope.firstOrderWeights[edge[0]][edge[1]] = edge[2];
                        }
//                        debugger;
                        break;
                    case "2ndOrder":
                        for (edge in currLine ) {
                            edge = currLine[edge].split(",");
                            scope.secondOrderWeights[edge[0]][edge[1]][edge[2]][edge[3]] = edge[4];
                            scope.secondOrderWeights[edge[2]][edge[3]][edge[0]][edge[1]] = edge[4];
                        }
//                        debugger;
                        break;
                }
            }
        }
    }
    $scope.generateRandomModel = function() {
        debugger;
        if ($scope.randText == "") {
            window.alert("please insert text to randomize on");
            return;
        }

        nodes = $scope.randText.trim().replace(/\s{2,}/g, ' ').split(" ");

        n = nodes.length + 1;
        out  = "nodes " +  $scope.randText;
        out1 = "1stOrder ";
        for (i = 0 ; i < n ; i++ ) {
            for (j = 0 ; j < n ; j++ ) {
                if (j != i ) {
                    val = Math.random()*3;
                    out1 = out1 + i + "," + j + "," + val + " ";
                }
            }
        }

        out2 = "2ndOrder "
        for (i = 0 ; i < n ; i++ ) {
            for (j = 0 ; j < n ; j++ ) {
                if (j != i ) {
                    for (k = 0 ; k < n ; k++) {
                        for (l = 0 ; l < n ; l++) {
                            if ( ((i != k) || (j != l)) && (l != k) ) {
                                val = Math.random();
                                out2 = out2 + i + "," + j + "," + k + "," + l + "," + val + " ";
                            }
                        }
                    }
                }
            }
        }

        // reset tree vals
        reset();
        debugger;
        parseInputFile(out + "\n" + out1 + "\n" + out2,$scope);
//            $scope.$digest();
    }
}
