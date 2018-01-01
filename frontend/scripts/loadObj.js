const OTHERLINE = 0, MTLLIBLINE = 1, POSITIONLINE = 2, COORDSLINE = 3, NORMALINE = 4;
const USEMTLLINE = 5, FACELINE = 6;
const NEWMTLLINE = 7, KALINE  = 8, KDLINE = 9, KSLINE = 10, MAP_KD_LINE = 11;


function Obj(filepath, glObject){
    this.basicElements = [];
    this.gl = glObject;
    this.vsModelMatrix = glObject.getUniformLocation(glObject.program, 'vsModelMatrix');
    this.vsMvpMatrix = glObject.getUniformLocation(glObject.program, 'vsMvpMatrix');
    this.vsNormalMatrix = glObject.getUniformLocation(glObject.program, 'vsNormalMatrix');

    this.vsKa = glObject.getUniformLocation(glObject.program, 'vsKa');
    this.vsKd = glObject.getUniformLocation(glObject.program, 'vsKd');
    this.vsKs = glObject.getUniformLocation(glObject.program, 'vsKs');

    this.vsPosition = glObject.getAttribLocation(glObject.program, 'vsPosition');
    this.vsNormal  = glObject.getAttribLocation(glObject.program, 'vsNormal');


    this.modelMatrix = new Matrix4();
    this.modelMatrix.setRotate(270, 1, 0, 0);

    this.draw = function (eyeMatrix) {
        var mvpMatrix = new Matrix4(eyeMatrix);
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


            gl.bindBuffer(gl.ARRAY_BUFFER, basicElement.positionBufferHandle);
            gl.bufferData(gl.ARRAY_BUFFER, basicElement.positionData, gl.STATIC_DRAW);
            gl.vertexAttribPointer(this.vsPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.vsPosition);  // Enable the assignment of the buffer object


            gl.bindBuffer(gl.ARRAY_BUFFER, basicElement.normalBufferHandle);
            gl.bufferData(gl.ARRAY_BUFFER, basicElement.normalData, gl.STATIC_DRAW);
            gl.vertexAttribPointer(this.vsNormal, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.vsNormal);  // Enable the assignment of the buffer object


            gl.drawArrays(gl.TRIANGLES, 0, basicElement.vertexNum);

            gl.bindBuffer(gl.ARRAY_BUFFER, null);

        }


    };


    var objStr;
    var tempDir = filepath.split('/');
    var dirPath = "";
    for(var i = 0; i != tempDir.length - 1; ++i){
        dirPath += tempDir[i] + '/';
    }

    $.get(filepath, function (content) {
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
                currentElement = new BasicElement(glObject);
                currentElement.mtl = mtls[mtlName];
                continue;
            case FACELINE:
                var indexVector = getVector(line);
                if(isUseTexture){
                    console.log("This function is dealing with the this without texture");
                    break;
                }
                if(isGiveNormal){
                    for(var i = 0; i != 3; ++i){
                        var positionVector = positionBuffer[indexVector[i*2] - 1];
                        var normalVector = normalBuffer[indexVector[i*2+1] - 1];
                        for(var j = 0; j != 3; ++j){
                            currentElement.vertexPositions.push(positionVector[j]);
                            currentElement.vertexNormals.push(normalVector[j]);
                        }
                    }
                }
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
            case MAP_KD_LINE:
                currentMtl.map_Kd = getSecondStr(line);
        }
    }
    mtls[currentMtlName] = currentMtl;
    return mtls;
}

function BasicElement(gl) {
    this.vertexPositions = [];
    this.positionData = null;
    this.tuxtureCoords = [];
    this.vertexNormals = [];
    this.normalData = null;
    this.mtl = new MTLInfo();
    this.vertexNum = 0;
    this.positionBufferHandle = null;
    this.normalBufferHandle = null;
    this.positionBufferHandle = gl.createBuffer();
    this.normalBufferHandle = gl.createBuffer();

    this.prepareData = function () {
        this.positionData = new Float32Array(this.vertexPositions);
        this.normalData = new Float32Array(this.vertexNormals);
        this.vertexNum = this.vertexPositions.length / 3;
    }
}

function MTLInfo() {
    this.Ka = [0.0, 0.0, 0.0];
    this.Ks = [0.0, 0.0, 0.0];
    this.Kd = [1.0, 1.0, 1.0];
    this.map_Kd = "";
}
















