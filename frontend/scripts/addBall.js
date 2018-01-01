function ball(GL,shader){
     this.gl=GL;
    this.basicElements = [];
    var positionArray = new Array();
    var colorArray = new Array();
    var normalArray = new Array();
    this.modelMatrix = new Matrix4();
    this.positionBufferHandle = GL.createBuffer();
    this.normalBufferHandle = GL.createBuffer();
    this.vsPosition = GL.getAttribLocation(shader.program, 'vsPosition');
    this.vsNormal = GL.getActiveAttrib(shader.program, 'vsNormal');
    this.vertexNum = positionArray.length/3;

    this.vsKa = GL.getUniformLocation(GL.program, 'vsKa');
    this.vsKd = GL.getUniformLocation(GL.program, 'vsKd');
    this.vsKs = GL.getUniformLocation(GL.program, 'vsKs');

    this.addBall(radius,slice)
    {

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


    this.setPosition(x,y,z)
    {
        this.modelMatrix.setIdentity();
        this.modelMatrix.scale(this.radius,this.radius,this.radius);
        this.modelMatrix.translate(x,y,z);

    }

    this.setSize(R){//resize the ball
        this.radius = R;
        this.modelMatrix.setIdentity();
        this.modelMatrix.scale(this.radius,this.radius,this.radius);
    }

    this.draw = function (eyeMatrix,translateMatrix) {
        var mvpMatrix = new Matrix4(eyeMatrix*translateMatrix);
        var normalMatrix = new Matrix4();
        var gl = this.gl;

        mvpMatrix.multiply(this.modelMatrix);
        normalMatrix.setInverseOf(this.modelMatrix);
        normalMatrix.transpose();

        gl.uniformMatrix4fv(this.vsModelMatrix, false, this.modelMatrix.elements);
        gl.uniformMatrix4fv(this.vsMvpMatrix, false, mvpMatrix.elements);
        gl.uniformMatrix4fv(this.vsNormalMatrix, false, normalMatrix.elements);


        for(var i = 0; i != this.basicElements.length; ++i){
            console.log("start draw element")
            console.log()





            var basicElement = this.basicElements[i];
            var mtl = basicElement.mtl;


            gl.uniform3f(this.vsKa, mtl.Ka[0], mtl.Ka[1], mtl.Ka[2]);
            gl.uniform3f(this.vsKd, mtl.Kd[0], mtl.Kd[1], mtl.Kd[2]);
            gl.uniform3f(this.vsKs, mtl.Ks[0], mtl.Ks[1], mtl.Ks[2]);


            gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBufferHandle);
            gl.bufferData(gl.ARRAY_BUFFER, positionArray, gl.STATIC_DRAW);
            gl.vertexAttribPointer(this.vsPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.vsPosition);  // Enable the assignment of the buffer object


            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBufferHandle);
            gl.bufferData(gl.ARRAY_BUFFER, normalArray, gl.STATIC_DRAW);
            gl.vertexAttribPointer(this.vsNormal, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.vsNormal);  // Enable the assignment of the buffer object


            gl.drawArrays(gl.TRIANGLES, 0, this.vertexNum);

            gl.bindBuffer(gl.ARRAY_BUFFER, null);

        }


    };

    function radians(t){
        return (t/180)*Math.PI;
    }
}
