function addBall(radius,slice) {
//        if(!isFloat(radius) | !isFloat(slice)){
//            return console.log("The parameter is not float");
//        }

    var angleSpan = 45.0/slice;
    var tmp = new Array();
    for (var i = -90; i <= 90; i+= angleSpan){
        for(var j = 0; j < 360; j += angleSpan){
            var r = radius*Math.cos(radians(i));
            var x = r*Math.cos(radians(j));
            var y = radius*Math.sin(radians(i));
            var z = r*Math.sin(radians(j));
            tmp.push(x);
            tmp.push(y);
            tmp.push(z);
        }
    }

    var row = 180 / angleSpan + 1;
    var col = 360 / angleSpan;
    var k = col * (row - 2) * 6 * 8;  //!!
    var count = 0;
    for(var i = 0; i < row; i++){
        if(i != 0 && i != row - 1 ){
            for(var j = 0; j < col; j++){
                k = i * col + j;
                //time1
                var pass = new Vector3([tmp[(k + col)*3],tmp[(k + col)*3+1],tmp[(k + col)*3+2]]);
                pass.normalize();
                //push position
                positionArray.push(tmp[(k + col) * 3], tmp[(k + col) * 3 + 1], tmp[(k + col) * 3 + 2]);
                //push color
                colorArray.push(1.0,1.0,1.0);
                //push normalize
                normalArray.push(pass.elements[0],pass.elements[1],pass.elements[2]);

                var index = k + 1;
                if(j == (col-1))
                    index -= col;
                //time2
                pass = new Vector3([tmp[index * 3], tmp[index * 3 + 1], tmp[index * 3 + 2]]);
                pass.normalize();
                //push position
                positionArray.push(tmp[index * 3], tmp[index * 3 + 1], tmp[index * 3 + 2]);
                //push color
                colorArray.push(1.0,1.0,1.0);
                //push normalize
                normalArray.push(pass.elements[0],pass.elements[1],pass.elements[2]);

                //time3
                pass = new Vector3([tmp[index * 3], tmp[index * 3 + 1], tmp[index * 3 + 2]]);
                pass.normalize();
                //push position
                positionArray.push(tmp[k * 3], tmp[k * 3 + 1], tmp[k * 3 + 2]);
                //push color
                colorArray.push(1.0,1.0,1.0);
                //push normalize
                normalArray.push(pass.elements[0],pass.elements[1],pass.elements[2]);
            }
            for (var j = 0; j <col; j++){
                k = i * col + j;
                //time4
                pass = new Vector3([tmp[(k - col) * 3], tmp[(k - col) * 3 + 1], tmp[(k - col) * 3 + 2]]);
                pass.normalize();
                positionArray.push(tmp[(k - col) * 3], tmp[(k - col) * 3 + 1], tmp[(k - col) * 3 + 2]);
                colorArray.push(1.0,1.0,1.0);
                normalArray.push(pass.elements[0],pass.elements[1],pass.elements[2]);

                var index = k - 1;
                if ((j == 0))
                    index += col;
                //time5
                pass = new Vector3([tmp[index * 3], tmp[index * 3 + 1], tmp[index * 3 + 2]]);
                pass.normalize();
                positionArray.push(tmp[index * 3], tmp[index * 3 + 1], tmp[index * 3 + 2]);
                colorArray.push(1.0,1.0,1.0);
                normalArray.push(pass.elements[0],pass.elements[1],pass.elements[2]);
                //time6
                pass = new Vector3([tmp[k * 3], tmp[k * 3 + 1], tmp[k * 3 + 2]]);
                pass.normalize();
                positionArray.push(tmp[k * 3], tmp[k * 3 + 1], tmp[k * 3 + 2]);
                colorArray.push(1.0,1.0,1.0);
                normalArray.push(pass.elements[0],pass.elements[1],pass.elements[2]);

            }
        }
    }
}



function isFloat(n){
    return n % 1 !== 0;
}

function radians(t){
    return (t/180)*Math.PI;
}