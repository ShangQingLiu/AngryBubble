function Ball(GL, shaderProgram, slice) {
    this.gl = GL;

    this.modelMatrix = new Matrix4();
    this.positionBufferHandle = GL.createBuffer();
    this.normalBufferHandle = GL.createBuffer();
    this.positionData = null;
    this.normalData = null;
    this.vsPosition = GL.getAttribLocation(shaderProgram, 'vsPosition');
    this.vsNormal = GL.getActiveAttrib(shaderProgram, 'vsNormal');
    this.vsModelMatrix = GL.getUniformLocation(shaderProgram, 'vsModelMatrix');
    this.vsNormalMatrix = GL.getUniformLocation(shaderProgram, 'vsNormalMatrix');
    this.program = shaderProgram;


    this.fsKa = GL.getUniformLocation(shaderProgram, 'fsKa');

    this.color = [1.0, 1.0, 1.0, 1.0];
    this.position = [];
    this.radius = 1;

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
    for (var i = 0; i < row; i++) {
        if (i != 0 && i != row - 1) {
            for (var j = 0; j < col; j++) {
                k = i * col + j;
                //time1
                var pass = new Vector3([tmp[(k + col) * 3], tmp[(k + col) * 3 + 1], tmp[(k + col) * 3 + 2]]);
                pass.normalize();
                //push position
                positionArray.push(tmp[(k + col) * 3], tmp[(k + col) * 3 + 1], tmp[(k + col) * 3 + 2]);
                //push color
                //push normalize
                normalArray.push(pass.elements[0], pass.elements[1], pass.elements[2]);

                var index = k + 1;
                if (j == (col - 1))
                    index -= col;
                //time2
                pass = new Vector3([tmp[index * 3], tmp[index * 3 + 1], tmp[index * 3 + 2]]);
                pass.normalize();
                //push position
                positionArray.push(tmp[index * 3], tmp[index * 3 + 1], tmp[index * 3 + 2]);
                //push color
                //push normalize
                normalArray.push(pass.elements[0], pass.elements[1], pass.elements[2]);

                //time3
                pass = new Vector3([tmp[k * 3], tmp[k * 3 + 1], tmp[k * 3 + 2]]);
                pass.normalize();
                //push position
                positionArray.push(tmp[k * 3], tmp[k * 3 + 1], tmp[k * 3 + 2]);
                //push color
                //push normalize
                normalArray.push(pass.elements[0], pass.elements[1], pass.elements[2]);
            }
            for (var j = 0; j < col; j++) {
                k = i * col + j;
                //time4
                pass = new Vector3([tmp[(k - col) * 3], tmp[(k - col) * 3 + 1], tmp[(k - col) * 3 + 2]]);
                pass.normalize();
                positionArray.push(tmp[(k - col) * 3], tmp[(k - col) * 3 + 1], tmp[(k - col) * 3 + 2]);
                normalArray.push(pass.elements[0], pass.elements[1], pass.elements[2]);

                var index = k - 1;
                if ((j == 0))
                    index += col;
                //time5
                pass = new Vector3([tmp[index * 3], tmp[index * 3 + 1], tmp[index * 3 + 2]]);
                pass.normalize();
                positionArray.push(tmp[index * 3], tmp[index * 3 + 1], tmp[index * 3 + 2]);
                normalArray.push(pass.elements[0], pass.elements[1], pass.elements[2]);
                //time6
                pass = new Vector3([tmp[k * 3], tmp[k * 3 + 1], tmp[k * 3 + 2]]);
                pass.normalize();
                positionArray.push(tmp[k * 3], tmp[k * 3 + 1], tmp[k * 3 + 2]);
                normalArray.push(pass.elements[0], pass.elements[1], pass.elements[2]);
            }
        }
    }

    this.positionData = new Float32Array(positionArray);
    this.normalData = new Float32Array(normalArray);
    this.vertexNum = normalArray.length / 3;

    this.setColor = function (color) {
        this.color = [color.r, color.g, color.b, 1.0];
    };

    this.setUserColor = function () {
        this.color = [1.0, 1.0, 0.0, 0.2];
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

        var mvpMatrix = new Matrix4(projectionMatrix);
        mvpMatrix.multiply(viewMatrix);
        mvpMatrix.multiply(this.modelMatrix);
        var normalMatrix = new Matrix4();
        var gl = this.gl;

        normalMatrix.setInverseOf(this.modelMatrix);
        normalMatrix.transpose();


        gl.useProgram(this.program);

        gl.uniformMatrix4fv(this.vsModelMatrix, false, this.modelMatrix.elements);
        gl.uniformMatrix4fv(this.vsMvpMatrix, false, mvpMatrix.elements);
        gl.uniformMatrix4fv(this.vsNormalMatrix, false, normalMatrix.elements);

        gl.uniform4f(this.fsKa, this.color[0], this.color[1], this.color[2], this.color[3]);


        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBufferHandle);
        gl.bufferData(gl.ARRAY_BUFFER, this.positionData, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.vsPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vsPosition);  // Enable the assignment of the buffer object


        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBufferHandle);
        gl.bufferData(gl.ARRAY_BUFFER, this.normalData, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.vsNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vsNormal);  // Enable the assignment of the buffer object


        gl.drawArrays(gl.TRIANGLES, 0, this.vertexNum);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);

    };

    function radians(t) {
        return (t / 180) * Math.PI;
    }
}
