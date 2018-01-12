function Ball(GL, shaderProgram, slice) {
    this.gl = GL;

    this.modelMatrix = new Matrix4();
    this.positionBufferHandle = GL.createBuffer();
    this.normalBufferHandle = GL.createBuffer();
    this.positionData = null;
    this.normalData = null;
    this.aPosition = GL.getAttribLocation(shaderProgram, 'aPosition');
    this.aNormal = GL.getActiveAttrib(shaderProgram, 'aNormal');
    this.uModelMatrix = GL.getUniformLocation(shaderProgram, 'uModelMatrix');
    this.uViewMatrix = GL.getUniformLocation(shaderProgram, 'uViewMatrix');
    this.uProjectionMatrix = GL.getUniformLocation(shaderProgram, 'uProjectionMatrix');
    this.uNormalMatrix = GL.getUniformLocation(shaderProgram, 'uNormalMatrix');



    this.program = shaderProgram;


    this.uKa = GL.getUniformLocation(shaderProgram, 'uKa');
    this.uKd = GL.getUniformLocation(shaderProgram, 'uKd');
    this.uKs = GL.getUniformLocation(shaderProgram, 'uKs');
    this.uNs = GL.getUniformLocation(shaderProgram, 'uNs');
    this.uAlpha = GL.getUniformLocation(shaderProgram, 'uAlpha');

    this.color = [1.0, 1.0, 1.0, 1.0];
    this.position = [0.0, 0.0, 0.0];
    this.radius = 1;
    this.alpha = 1.0;
    this.ns = 10;

    let positionArray = new Array();
    let normalArray = new Array();


    let radius = 1.0;
    var angleSpan = 45.0 / slice;
    var tmp = new Array();
    for (var i = -90; i <= 90; i += angleSpan) {
        for (var j = 0; j <= 360; j += angleSpan) {
            var r = radius * Math.cos(radians(i));
            var x = r * Math.cos(radians(j));
            var y = radius * Math.sin(radians(i));
            var z = r * Math.sin(radians(j));
            tmp.push(x);
            tmp.push(y);
            tmp.push(z);
        }
    }

    var row = parseInt(180 / angleSpan) + 1;
    var col = parseInt(360 / angleSpan) + 1;
    var k = col * (row - 2) * 6 * 8;  //!!
    var count = 0;
    // for (var i = 0; i < row; i++) {
    //     if (i != 0 && i != row - 1) {
    //         for (var j = 0; j < col; j++) {
    //             k = i * col + j;
    //             //time1
    //             var pass = new Vector3([tmp[(k + col) * 3], tmp[(k + col) * 3 + 1], tmp[(k + col) * 3 + 2]]);
    //             pass.normalize();
    //             //push position
    //             positionArray.push(tmp[(k + col) * 3], tmp[(k + col) * 3 + 1], tmp[(k + col) * 3 + 2]);
    //             //push colorf
    //             //push normalize
    //             normalArray.push(pass.elements[0], pass.elements[1], pass.elements[2]);
    //
    //             var index = k + 1;
    //             if (j == (col - 1))
    //                 index -= col;
    //             //time2
    //             pass = new Vector3([tmp[index * 3], tmp[index * 3 + 1], tmp[index * 3 + 2]]);
    //             pass.normalize();
    //             //push position
    //             positionArray.push(tmp[index * 3], tmp[index * 3 + 1], tmp[index * 3 + 2]);
    //             //push color
    //             //push normalize
    //             normalArray.push(pass.elements[0], pass.elements[1], pass.elements[2]);
    //
    //             //time3
    //             pass = new Vector3([tmp[k * 3], tmp[k * 3 + 1], tmp[k * 3 + 2]]);
    //             pass.normalize();
    //             //push position
    //             positionArray.push(tmp[k * 3], tmp[k * 3 + 1], tmp[k * 3 + 2]);
    //             //push color
    //             //push normalize
    //             normalArray.push(pass.elements[0], pass.elements[1], pass.elements[2]);
    //         }
    //         for (var j = 0; j < col; j++) {
    //             k = i * col + j;
    //             //time4
    //             pass = new Vector3([tmp[(k - col) * 3], tmp[(k - col) * 3 + 1], tmp[(k - col) * 3 + 2]]);
    //             pass.normalize();
    //             positionArray.push(tmp[(k - col) * 3], tmp[(k - col) * 3 + 1], tmp[(k - col) * 3 + 2]);
    //             normalArray.push(pass.elements[0], pass.elements[1], pass.elements[2]);
    //
    //             var index = k - 1;
    //             if ((j == 0))
    //                 index += col;
    //             //time5
    //             pass = new Vector3([tmp[index * 3], tmp[index * 3 + 1], tmp[index * 3 + 2]]);
    //             pass.normalize();
    //             positionArray.push(tmp[index * 3], tmp[index * 3 + 1], tmp[index * 3 + 2]);
    //             normalArray.push(pass.elements[0], pass.elements[1], pass.elements[2]);
    //             //time6
    //             pass = new Vector3([tmp[k * 3], tmp[k * 3 + 1], tmp[k * 3 + 2]]);
    //             pass.normalize();
    //             positionArray.push(tmp[k * 3], tmp[k * 3 + 1], tmp[k * 3 + 2]);
    //             normalArray.push(pass.elements[0], pass.elements[1], pass.elements[2]);
    //         }
    //     }
    // }



    for (var i = -90; i <= 90; i += angleSpan) {
        for (var j = 0; j <= 360; j += angleSpan) {
            var r = radius * Math.cos(radians(i))
            var x = r * Math.cos(radians(j))
            var y = radius * Math.sin(radians(i))
            var z = r * Math.sin(radians(j))
            tmp.push(x)
            tmp.push(y)
            tmp.push(z)
        }
    }

    var row = parseInt(180 / angleSpan) + 1
    var col = parseInt(360 / angleSpan) + 1
    var k = col * (row - 2) * 6 * 8  //!!
    for (var i = 0; i < row; i++) {
        if (i != 0 && i != row - 1) {
            for (var j = 0; j < col; j++) {
                k = i * col + j

                positionArray.push(tmp[(k + col) * 3], tmp[(k + col) * 3 + 1], tmp[(k + col) * 3 + 2])
                normalArray.push(tmp[(k + col) * 3], tmp[(k + col) * 3 + 1], tmp[(k + col) * 3 + 2])

                var index = k + 1
                if (j == col - 1)
                    index -= col

                //time2
                positionArray.push(tmp[index * 3], tmp[index * 3 + 1], tmp[index * 3 + 2])
                //push color
                normalArray.push(tmp[index * 3], tmp[index * 3 + 1], tmp[index * 3 + 2])

                //time3
                positionArray.push(tmp[k * 3], tmp[k * 3 + 1], tmp[k * 3 + 2])
                normalArray.push(tmp[k * 3], tmp[k * 3 + 1], tmp[k * 3 + 2])

            }
            for (var j = 0; j < col; j++) {
                k = i * col + j
                //time4
                positionArray.push(tmp[(k - col) * 3], tmp[(k - col) * 3 + 1], tmp[(k - col) * 3 + 2])
                normalArray.push(tmp[(k - col) * 3], tmp[(k - col) * 3 + 1], tmp[(k - col) * 3 + 2])

                var index = k - 1
                if (j == 0)
                    index += col
                //time5
                positionArray.push(tmp[index * 3], tmp[index * 3 + 1], tmp[index * 3 + 2])
                normalArray.push(tmp[index * 3], tmp[index * 3 + 1], tmp[index * 3 + 2])

                //time6
                positionArray.push(tmp[k * 3], tmp[k * 3 + 1], tmp[k * 3 + 2])
                normalArray.push(tmp[k * 3], tmp[k * 3 + 1], tmp[k * 3 + 2])

            }
        }
    }




    this.positionData = new Float32Array(positionArray);
    this.normalData = new Float32Array(normalArray);
    this.vertexNum = normalArray.length / 3;

    this.setColor = function (color) {
        this.color = [color.r, color.g, color.b];
    };

    this.setUserColor = function () {
        this.color = [1.0, 1.0, 0.0];
        this.alpha = 0.2;
    };

    this.setPosition = function (x, y, z) {
        this.position = [x, y, z];
    };

    this.setRadius = function (R) { //resize the Ball
        this.radius = R;
    };

    this.draw = function (viewMatrix, projectionMatrix) {

        this.modelMatrix.setIdentity();
        this.modelMatrix.translate(this.position[0], this.position[1], this.position[2]);
        this.modelMatrix.scale(this.radius, this.radius, this.radius);


        var normalMatrix = new Matrix4();
        var gl = this.gl;

        normalMatrix.setInverseOf(this.modelMatrix);
        normalMatrix.transpose();


        gl.useProgram(this.program);

        gl.uniformMatrix4fv(this.uModelMatrix, false, this.modelMatrix.elements);
        gl.uniformMatrix4fv(this.uViewMatrix, false, viewMatrix.elements);
        gl.uniformMatrix4fv(this.uProjectionMatrix, false, projectionMatrix.elements);
        gl.uniformMatrix4fv(this.uNormalMatrix, false, normalMatrix.elements);

        gl.uniform3f(this.uKa, this.color[0], this.color[1], this.color[2]);
        gl.uniform3f(this.uKd, this.color[0], this.color[1], this.color[2]);
        gl.uniform3f(this.uKs, this.color[0], this.color[1], this.color[2]);
        gl.uniform1f(this.uNs, this.ns);
        gl.uniform1f(this.uAlpha, this.alpha);


        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBufferHandle);
        gl.bufferData(gl.ARRAY_BUFFER, this.positionData, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.aPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.aPosition);  // Enable the assignment of the buffer object


        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBufferHandle);
        gl.bufferData(gl.ARRAY_BUFFER, this.normalData, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.aNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.aNormal);  // Enable the assignment of the buffer object


        gl.drawArrays(gl.TRIANGLES, 0, this.vertexNum);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);

    };

    function radians(t) {
        return (t / 180) * Math.PI;
    }
}
