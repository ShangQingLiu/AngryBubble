const OTHERLINE = 0, MTLLIBLINE = 1, POSITIONLINE = 2, COORDSLINE = 3, NORMALINE = 4;
const USEMTLLINE = 5, FACELINE = 6;
const NEWMTLLINE = 7, KALINE  = 8, KDLINE = 9, KSLINE = 10, MAP_KD_LINE = 11;
const NSLINE = 12;

$.ajaxSettings.ajax = false;



function ObjObject(filePath, _gl, _shaderProgram){
    this.basicElements = [];
    this.program = _shaderProgram;
    this.gl = _gl;
    this.uModelMatrix = _gl.getUniformLocation(this.program, 'uModelMatrix');
    this.uViewMatrix = _gl.getUniformLocation(this.program, 'uViewMatrix');
    this.uProjectionMatrix = _gl.getUniformLocation(this.program, 'uProjectionMatrix');
    this.uNormalMatrix = _gl.getUniformLocation(this.program, 'uNormalMatrix');
    this.uSampler = _gl.getUniformLocation(this.program, 'uSampler');

    this.aPosition = _gl.getAttribLocation(this.program, 'aPosition');
    this.aNormal  = _gl.getAttribLocation(this.program, 'aNormal');
    this.aTextureCoord  = _gl.getAttribLocation(this.program, 'aTextureCoord');
    this.uKa = _gl.getUniformLocation(this.program, 'uKa');
    this.uKd = _gl.getUniformLocation(this.program, 'uKd');
    this.uKs = _gl.getUniformLocation(this.program, 'uKs');
    this.uNs = _gl.getUniformLocation(this.program, 'uNs');


    this.modelMatrix = new Matrix4();
    this.modelMatrix.setRotate(270, 1, 0, 0);

    this.draw = function (viewMatrix, projectionMatrix) {
        var normalMatrix = new Matrix4();
        var gl = this.gl;


        gl.useProgram(this.program);
        normalMatrix.setInverseOf(this.modelMatrix);
        normalMatrix.transpose();

        gl.uniformMatrix4fv(this.uModelMatrix, false, this.modelMatrix.elements);
        gl.uniformMatrix4fv(this.uViewMatrix, false, viewMatrix.elements);
        gl.uniformMatrix4fv(this.uProjectionMatrix, false, projectionMatrix.elements);
        gl.uniformMatrix4fv(this.uNormalMatrix, false, normalMatrix.elements);



        for(var i = 0; i != this.basicElements.length; ++i){



            var basicElement = this.basicElements[i];
            var mtl = basicElement.mtl;

            if(!basicElement.ready.imageReady){
                console.log("data not prepared")
                return;
            }


            gl.uniform3f(this.uKa, mtl.Ka[0], mtl.Ka[1], mtl.Ka[2]);
            gl.uniform3f(this.uKd, mtl.Kd[0], mtl.Kd[1], mtl.Kd[2]);
            gl.uniform3f(this.uKs, mtl.Ks[0], mtl.Ks[1], mtl.Ks[2]);
            gl.uniform1f(this.uNs, mtl.Ns);



            gl.bindBuffer(gl.ARRAY_BUFFER, basicElement.positionBufferHandle);
            gl.bufferData(gl.ARRAY_BUFFER, basicElement.positionData, gl.STATIC_DRAW);
            gl.vertexAttribPointer(this.aPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.aPosition);  // Enable the assignment of the buffer object

            gl.bindBuffer(gl.ARRAY_BUFFER, basicElement.coordBufferHandle);
            gl.bufferData(gl.ARRAY_BUFFER, basicElement.textureCoordData, gl.STATIC_DRAW);
            gl.vertexAttribPointer(this.aTextureCoord, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.aTextureCoord);  // Enable the assignment of the buffer object


            gl.bindBuffer(gl.ARRAY_BUFFER, basicElement.normalBufferHandle);
            gl.bufferData(gl.ARRAY_BUFFER, basicElement.normalData, gl.STATIC_DRAW);
            gl.vertexAttribPointer(this.aNormal, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.aNormal);  // Enable the assignment of the buffer object


            gl.uniform1i(this.uSampler, 0)

            gl.activeTexture(gl.TEXTURE0)
            gl.bindTexture(gl.TEXTURE_2D, basicElement.textureHandle);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)


            gl.drawArrays(gl.TRIANGLES, 0, basicElement.vertexNum);

            gl.bindBuffer(gl.ARRAY_BUFFER, null);

        }


    };


    var objStr;
    var tempDir = filePath.split('/');
    var dirPath = "";
    for(var i = 0; i != tempDir.length - 1; ++i){
        dirPath += tempDir[i] + '/';
    }

    $.get(filePath, function (content) {
        objStr = content;
    });
    var lines = objStr.split('\n');
    var positionBuffer = [];
    var coordsBuffer = [];
    var normalBuffer = [];
    var currentElement = null;
    var mtls = null;

    var n = lines.length;
    var index = 0;
    for(index = 0; index != n; ++index){
        var line = lines[index];
        switch (getType(line)){
            case OTHERLINE:
                continue;
            case MTLLIBLINE:
                mtls = getMtls(line, dirPath);
                continue;
            case POSITIONLINE:
                positionBuffer.push(getVector(line));
                continue;
            case COORDSLINE:
                coordsBuffer.push(getVector(line));
                continue;
            case NORMALINE:
                normalBuffer.push(getVector(line));
                continue;
            case USEMTLLINE:
                break;
            default:
                continue;
        }
        break;
    }

    var isUseTexture = coordsBuffer.length != 0;
    var isGiveNormal = normalBuffer.length != 0;


    for(;index!=n;++index){
        var line = lines[index];
        switch (getType(line)){
            case USEMTLLINE:
                if(currentElement != null){
                    this.basicElements.push(currentElement);
                }
                var mtlName = getSecondStr(line);
                currentElement = new BasicElement(_gl);
                currentElement.mtl = mtls[mtlName];
                continue;
            case FACELINE:
                var indexVector = getVector(line);
                if(isUseTexture){
                    var position0 = positionBuffer[indexVector[0] - 1];
                    var position1 = positionBuffer[indexVector[2] - 1];
                    var position2 = positionBuffer[indexVector[4] - 1];
                    var position4 = positionBuffer[indexVector[6] - 1];

                    var normalVector = getNormal(position0, position1, position2);
                    for(var i = 0; i != 3; ++i){
                        var positionVector = positionBuffer[indexVector[i*2] - 1];
                        for(var j = 0; j != 3; ++j){
                            currentElement.vertexPositions.push(positionVector[j]);
                            currentElement.vertexNormals.push(normalVector[j]);
                        }
                    }
                    for(var i = 1; i != 4; ++i){
                        var positionVector = positionBuffer[indexVector[i*2] - 1];
                        for(var j = 0; j != 3; ++j){
                            currentElement.vertexPositions.push(positionVector[j]);
                            currentElement.vertexNormals.push(normalVector[j]);
                        }
                    }

                    for (var i = 0; i != 3; ++i){
                        var coords = coordsBuffer[indexVector[i*2 + 1] - 1];
                        for(var j = 0; j != 2; ++j){
                            currentElement.textureCoords.push(coords[j]);
                        }
                    }
                    for (var i = 1; i != 4; ++i){
                        var coords = coordsBuffer[indexVector[i*2 + 1] - 1];
                        for(var j = 0; j != 2; ++j){
                            currentElement.textureCoords.push(coords[j]);
                        }
                    }


                }
                // if(isGiveNormal){
                //     for(var i = 0; i != 3; ++i){
                //         var positionVector = positionBuffer[indexVector[i*2] - 1];
                //         var normalVector = normalBuffer[indexVector[i*2+1] - 1];
                //         for(var j = 0; j != 3; ++j){
                //             currentElement.vertexPositions.push(positionVector[j]);
                //             currentElement.vertexNormals.push(normalVector[j]);
                //         }
                //     }
                // }
                else{
                    var position0 = positionBuffer[indexVector[0] - 1];
                    var position1 = positionBuffer[indexVector[1] - 1];
                    var position2 = positionBuffer[indexVector[2] - 1];
                    var normalVector = getNormal(position0, position1, position2);
                    for(var i = 0; i != 3; ++i){
                        var positionVector = positionBuffer[indexVector[i] - 1];
                        for(var j = 0; j != 3; ++j){
                            currentElement.vertexPositions.push(positionVector[j]);
                            currentElement.vertexNormals.push(normalVector[j]);
                        }
                    }

                }

                continue;
        }

    }
    this.basicElements.push(currentElement);
    console.log(this)
    for(var i = 0; i != this.basicElements.length; ++i){
        this.basicElements[i].prepareData();
    }


}

function getNormal(p1, p2, p3) {
    var getSub = function(va, vb){
        var vc = [0.0, 0.0, 0.0];
        for(var i = 0; i != 3; ++i){
            vc[i] = va[i] - vb[i];
        }
        return vc;
    };
    var getCross = function (u, v) {
        var crossResult = [0.0, 0.0, 0.0];
        crossResult[0] = u[1]*v[2] - u[2]*v[1];
        crossResult[1] = u[2]*v[0] - u[0]*v[2];
        crossResult[2] = u[0]*v[1] - u[1]*v[0];
        return crossResult;
    };

    var v1 = getSub(p2, p1);
    var v2 = getSub(p3, p2);
    var result = getCross(v1, v2);
    return result;
}

function getVector(line) {
    var strs = line.split(' ');
    var numbers = [];
    for(var i = 0; i != strs.length; ++i){
        if(i == 0){
            continue;
        }
        var tempNumbers = strs[i].split('/');
        for(var j = 0; j != tempNumbers.length; ++j){
            numbers.push(parseFloat(tempNumbers[j]));
        }
    }
    return numbers;
}

function getType(line) {
    var len = line.length;
    if(len == 0){
        return OTHERLINE;
    }
    var type = OTHERLINE;
    var featureStr = line.split(' ')[0];
    switch (featureStr){
        case 'mtllib':
            type = MTLLIBLINE;
            break;
        case 'v':
            type = POSITIONLINE;
            break;
        case 'vt':
            type = COORDSLINE;
            break;
        case 'vn':
            type = NORMALINE;
            break;
        case 'usemtl':
            type = USEMTLLINE;
            break;
        case 'f':
            type = FACELINE;
            break;
        case 'newmtl':
            type = NEWMTLLINE;
            break;
        case 'Ka':
            type = KALINE;
            break;
        case 'Kd':
            type = KDLINE;
            break;
        case 'Ks':
            type = KSLINE;
            break;
        case 'Ns':
            type = NSLINE;
            break;
        case 'map_Kd':
            type = MAP_KD_LINE;
            break;
        default:
            type = OTHERLINE;
            break;
    }
    return type;
}

function getSecondStr(line) {
    return line.split(' ')[1];
}

function getMtls(line, dirPath){
    var filePath = dirPath + line.split(' ')[1];
    var mtlStr = 0;
    var mtls = {};
    var currentMtl = null, currentMtlName = '';
    $.get(filePath, function (content) {
        mtlStr = content;
    });
    var lines = mtlStr.split('\n');
    var n = lines.length;
    for(var i = 0; i != n; ++i){
        var line = lines[i];
        switch (getType(line)){
            case OTHERLINE:
                continue;
            case NEWMTLLINE:
                if(currentMtl != null){
                    mtls[currentMtlName] = currentMtl;
                }
                currentMtlName = getSecondStr(line);
                currentMtl = new MTLInfo();
                continue;
            case KALINE:
                currentMtl.Ka = getVector(line);
                continue;
            case KDLINE:
                currentMtl.Kd = getVector(line);
                continue;
            case KSLINE:
                currentMtl.Ks = getVector(line);
                continue;
            case KALINE:
                currentMtl.Ka = getVector(line);
                continue;
            case NSLINE:
                currentMtl.Ns = parseFloat(getSecondStr(line));
                continue;
            case MAP_KD_LINE:
                currentMtl.map_Kd = dirPath + getSecondStr(line);
                continue;
        }
    }
    mtls[currentMtlName] = currentMtl;
    return mtls;
}

function BasicElement(gl) {
    this.vertexPositions = [];
    this.positionData = null;
    this.textureCoords = [];
    this.textureCoordData = null;
    this.vertexNormals = [];
    this.normalData = null;
    this.mtl = new MTLInfo();
    this.vertexNum = 0;
    this.positionBufferHandle = null;
    this.normalBufferHandle = null;
    this.coordBufferHandle = null;
    this.textureHandle = gl.createTexture();
    this.positionBufferHandle = gl.createBuffer();
    this.normalBufferHandle = gl.createBuffer();
    this.coordBufferHandle = gl.createBuffer();
    this.image = new Image();

    this.prepareData = function () {
        this.positionData = new Float32Array(this.vertexPositions);
        this.normalData = new Float32Array(this.vertexNormals);
        this.textureCoordData = new Float32Array(this.textureCoords);
        this.vertexNum = this.vertexPositions.length / 3;
        this.image.src = this.mtl.map_Kd;
        let image = this.image;
        let textureHandle = this.textureHandle;
        this.ready = {};
        this.ready.imageReady = false;
        let ready = this.ready;
        this.image.onload = function () {


            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
            // Enable texture unit0;
            gl.activeTexture(gl.TEXTURE0);
            // Bind the texture object to the target
            gl.bindTexture(gl.TEXTURE_2D, textureHandle)

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
            ready.imageReady = true;

        };
    }
}

function MTLInfo() {
    this.Ka = [0.0, 0.0, 0.0];
    this.Ks = [0.0, 0.0, 0.0];
    this.Kd = [1.0, 1.0, 1.0];
    this.Ns = 1000.0;
    this.map_Kd = "";
}
















