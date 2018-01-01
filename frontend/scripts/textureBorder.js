function radians(t){
    return (t/180)*Math.PI;
}

var isImageReady = false;

//
// const programInfo = {
//     program: shaderProgram,
//     attribLocations: {
//         vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition')
//     },
//     uniformLocations: {
//         projectionMatrix: gl.getUniformLocation(
//             shaderProgram,
//             'uProjectionMatrix'
//         ),
//         modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix')
//     }
// }



function TextureBorder(boundValue, imageSrc, glObject, borderShaderInfo) {
    this.vertexNum = 0;
    this.gl = glObject;
    this.positionData = null;
    this.coordsData = null;
    this.vsMvpMatrix = glObject.getUniformLocation(borderShaderInfo.program, 'vsMvpMatrix');
    this.fsKa = glObject.getUniformLocation(borderShaderInfo.program, 'fsKa');
    this.fsSampler = glObject.getUniformLocation(borderShaderInfo.program, 'fsSampler');
    this.vsPosition = glObject.getAttribLocation(borderShaderInfo.program, 'vsPosition');
    this.vsTexCoord  = glObject.getAttribLocation(borderShaderInfo.program, 'vsTexCoord');
    this.image = new Image();
    this.positionBufferHandle = null;
    this.coordsBufferHandle = null;
    this.textureHandle = null;
    this.positionBufferHandle = glObject.createBuffer();
    this.coordsBufferHandle = glObject.createBuffer();
    this.textureHandle = glObject.createTexture();

    var radius = boundValue;
    var slice = 10;
    var positionArray = new Array();
    var coordsArray = new Array();
    var angleSpan = 45.0/slice;
    var tmp = new Array();

    this.image.src = imageSrc;
    this.image.onload = function () {
        isImageReady= true;
    };

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
    for(var i = 0; i < row; i++){
        if(i != 0 && i != row - 1 ){
            for(var j = 0; j < col; j++){
                k = i * col + j;

                positionArray.push(tmp[(k + col) * 3], tmp[(k + col) * 3 + 1], tmp[(k + col) * 3 + 2]);
                coordsArray.push(j*1.0 / col, (i+1)*1.0 / row);

                var index = k + 1;
                if(j  == col-1)
                    index -= col;

                //time2
                positionArray.push(tmp[index * 3], tmp[index * 3 + 1], tmp[index * 3 + 2]);
                //push color
                coordsArray.push((j+1)*1.0 / col, i*1.0 / row);




                //time3
                positionArray.push(tmp[k * 3], tmp[k * 3 + 1], tmp[k * 3 + 2]);
                coordsArray.push(j*1.0 / col, i*1.0 / row);


            }
            for (var j = 0; j <col; j++){
                k = i * col + j;
                //time4
                positionArray.push(tmp[(k - col) * 3], tmp[(k - col) * 3 + 1], tmp[(k - col) * 3 + 2]);
                coordsArray.push(j*1.0 / col, (i - 1)*1.0 / row);



                var index = k - 1;
                if (j == 0)
                    index += col;
                //time5
                positionArray.push(tmp[index * 3], tmp[index * 3 + 1], tmp[index * 3 + 2]);
                coordsArray.push((j - 1)*1.0 / col,  i*1.0 / row);


                //time6
                positionArray.push(tmp[k * 3], tmp[k * 3 + 1], tmp[k * 3 + 2]);
                coordsArray.push(j*1.0 / col, i*1.0 / row);

            }
        }
    }
    this.positionData =new Float32Array(positionArray);
    this.coordsData =new Float32Array(coordsArray);
    this.vertexNum = positionArray.length / 3;
    this.draw = function (perspectiveMatrix) {

        if(!isImageReady){
            console.log("Image is not ready.");
            return;
        }

        var mvpMatrix = new Matrix4(perspectiveMatrix);
        var gl = this.gl;
        gl.uniformMatrix4fv(this.vsMvpMatrix, false, mvpMatrix.elements);

        gl.uniform4f(this.fsKa,1.0 ,1.0 ,1.0,1.0 );


        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBufferHandle);
        gl.bufferData(gl.ARRAY_BUFFER, this.positionData, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.vsPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vsPosition);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.coordsBufferHandle);
        gl.bufferData(gl.ARRAY_BUFFER, this.coordsData, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.vsTexCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vsTexCoord);


        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
        // Enable texture unit0
        gl.activeTexture(gl.TEXTURE0);
        // Bind the texture object to the target
        gl.bindTexture(gl.TEXTURE_2D, this.textureHandle);

        // Set the texture parameters
        //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        // Set the texture image
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, this.image);

        // Set the texture unit 0 to the sampler
        gl.uniform1i(this.fsSampler, 0);

        gl.useProgram(borderShaderInfo.program);


        gl.drawArrays(gl.TRIANGLES, 0, this.vertexNum);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
















    console.log(this.coordsData);
    console.log(this.positionData);
}