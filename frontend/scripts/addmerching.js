let tempPositionData;
let tempNormalData;
let tempVertexNum;
let faces = [];





function Merching(GL, shaderProgram) {
    this.gl = GL;

    this.modelMatrix = new Matrix4();
    this.positionBufferHandle = GL.createBuffer();
    this.normalBufferHandle = GL.createBuffer();
    this.positionData = null;
    this.normalData = null;
    this.vsPosition = GL.getAttribLocation(shaderProgram, 'vsPosition');
    this.vsNormal = GL.getAttribLocation(shaderProgram, 'vsNormal');
    this.vsModelMatrix = GL.getUniformLocation(shaderProgram, 'vsModelMatrix');
    this.vsNormalMatrix = GL.getUniformLocation(shaderProgram, 'vsNormalMatrix');
    this.program = shaderProgram;


    this.fsKa = GL.getUniformLocation(shaderProgram, 'fsKa');

    this.color = [1.0, 1.0, 1.0, 1.0];
    this.position = [0.0,0.0,0.0];
    this.radius = 1;

    let positionArray = new Array();
    let normalArray = new Array();

    let slice = 1;
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
                //push colorf
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



    var edgeTable = new Int32Array([
        0x0, 0x109, 0x203, 0x30a, 0x406, 0x50f, 0x605, 0x70c,
        0x80c, 0x905, 0xa0f, 0xb06, 0xc0a, 0xd03, 0xe09, 0xf00,
        0x190, 0x99, 0x393, 0x29a, 0x596, 0x49f, 0x795, 0x69c,
        0x99c, 0x895, 0xb9f, 0xa96, 0xd9a, 0xc93, 0xf99, 0xe90,
        0x230, 0x339, 0x33, 0x13a, 0x636, 0x73f, 0x435, 0x53c,
        0xa3c, 0xb35, 0x83f, 0x936, 0xe3a, 0xf33, 0xc39, 0xd30,
        0x3a0, 0x2a9, 0x1a3, 0xaa, 0x7a6, 0x6af, 0x5a5, 0x4ac,
        0xbac, 0xaa5, 0x9af, 0x8a6, 0xfaa, 0xea3, 0xda9, 0xca0,
        0x460, 0x569, 0x663, 0x76a, 0x66, 0x16f, 0x265, 0x36c,
        0xc6c, 0xd65, 0xe6f, 0xf66, 0x86a, 0x963, 0xa69, 0xb60,
        0x5f0, 0x4f9, 0x7f3, 0x6fa, 0x1f6, 0xff, 0x3f5, 0x2fc,
        0xdfc, 0xcf5, 0xfff, 0xef6, 0x9fa, 0x8f3, 0xbf9, 0xaf0,
        0x650, 0x759, 0x453, 0x55a, 0x256, 0x35f, 0x55, 0x15c,
        0xe5c, 0xf55, 0xc5f, 0xd56, 0xa5a, 0xb53, 0x859, 0x950,
        0x7c0, 0x6c9, 0x5c3, 0x4ca, 0x3c6, 0x2cf, 0x1c5, 0xcc,
        0xfcc, 0xec5, 0xdcf, 0xcc6, 0xbca, 0xac3, 0x9c9, 0x8c0,
        0x8c0, 0x9c9, 0xac3, 0xbca, 0xcc6, 0xdcf, 0xec5, 0xfcc,
        0xcc, 0x1c5, 0x2cf, 0x3c6, 0x4ca, 0x5c3, 0x6c9, 0x7c0,
        0x950, 0x859, 0xb53, 0xa5a, 0xd56, 0xc5f, 0xf55, 0xe5c,
        0x15c, 0x55, 0x35f, 0x256, 0x55a, 0x453, 0x759, 0x650,
        0xaf0, 0xbf9, 0x8f3, 0x9fa, 0xef6, 0xfff, 0xcf5, 0xdfc,
        0x2fc, 0x3f5, 0xff, 0x1f6, 0x6fa, 0x7f3, 0x4f9, 0x5f0,
        0xb60, 0xa69, 0x963, 0x86a, 0xf66, 0xe6f, 0xd65, 0xc6c,
        0x36c, 0x265, 0x16f, 0x66, 0x76a, 0x663, 0x569, 0x460,
        0xca0, 0xda9, 0xea3, 0xfaa, 0x8a6, 0x9af, 0xaa5, 0xbac,
        0x4ac, 0x5a5, 0x6af, 0x7a6, 0xaa, 0x1a3, 0x2a9, 0x3a0,
        0xd30, 0xc39, 0xf33, 0xe3a, 0x936, 0x83f, 0xb35, 0xa3c,
        0x53c, 0x435, 0x73f, 0x636, 0x13a, 0x33, 0x339, 0x230,
        0xe90, 0xf99, 0xc93, 0xd9a, 0xa96, 0xb9f, 0x895, 0x99c,
        0x69c, 0x795, 0x49f, 0x596, 0x29a, 0x393, 0x99, 0x190,
        0xf00, 0xe09, 0xd03, 0xc0a, 0xb06, 0xa0f, 0x905, 0x80c,
        0x70c, 0x605, 0x50f, 0x406, 0x30a, 0x203, 0x109, 0x0])

//tritable
    var triangleTable = new Int32Array([
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        0, 8, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        0, 1, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        1, 8, 3, 9, 8, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        1, 2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        0, 8, 3, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        9, 2, 10, 0, 2, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        2, 8, 3, 2, 10, 8, 10, 9, 8, -1, -1, -1, -1, -1, -1, -1,
        3, 11, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        0, 11, 2, 8, 11, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        1, 9, 0, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        1, 11, 2, 1, 9, 11, 9, 8, 11, -1, -1, -1, -1, -1, -1, -1,
        3, 10, 1, 11, 10, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        0, 10, 1, 0, 8, 10, 8, 11, 10, -1, -1, -1, -1, -1, -1, -1,
        3, 9, 0, 3, 11, 9, 11, 10, 9, -1, -1, -1, -1, -1, -1, -1,
        9, 8, 10, 10, 8, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        4, 7, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        4, 3, 0, 7, 3, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        0, 1, 9, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        4, 1, 9, 4, 7, 1, 7, 3, 1, -1, -1, -1, -1, -1, -1, -1,
        1, 2, 10, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        3, 4, 7, 3, 0, 4, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1,
        9, 2, 10, 9, 0, 2, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1,
        2, 10, 9, 2, 9, 7, 2, 7, 3, 7, 9, 4, -1, -1, -1, -1,
        8, 4, 7, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        11, 4, 7, 11, 2, 4, 2, 0, 4, -1, -1, -1, -1, -1, -1, -1,
        9, 0, 1, 8, 4, 7, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1,
        4, 7, 11, 9, 4, 11, 9, 11, 2, 9, 2, 1, -1, -1, -1, -1,
        3, 10, 1, 3, 11, 10, 7, 8, 4, -1, -1, -1, -1, -1, -1, -1,
        1, 11, 10, 1, 4, 11, 1, 0, 4, 7, 11, 4, -1, -1, -1, -1,
        4, 7, 8, 9, 0, 11, 9, 11, 10, 11, 0, 3, -1, -1, -1, -1,
        4, 7, 11, 4, 11, 9, 9, 11, 10, -1, -1, -1, -1, -1, -1, -1,
        9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        9, 5, 4, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        0, 5, 4, 1, 5, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        8, 5, 4, 8, 3, 5, 3, 1, 5, -1, -1, -1, -1, -1, -1, -1,
        1, 2, 10, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        3, 0, 8, 1, 2, 10, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1,
        5, 2, 10, 5, 4, 2, 4, 0, 2, -1, -1, -1, -1, -1, -1, -1,
        2, 10, 5, 3, 2, 5, 3, 5, 4, 3, 4, 8, -1, -1, -1, -1,
        9, 5, 4, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        0, 11, 2, 0, 8, 11, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1,
        0, 5, 4, 0, 1, 5, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1,
        2, 1, 5, 2, 5, 8, 2, 8, 11, 4, 8, 5, -1, -1, -1, -1,
        10, 3, 11, 10, 1, 3, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1,
        4, 9, 5, 0, 8, 1, 8, 10, 1, 8, 11, 10, -1, -1, -1, -1,
        5, 4, 0, 5, 0, 11, 5, 11, 10, 11, 0, 3, -1, -1, -1, -1,
        5, 4, 8, 5, 8, 10, 10, 8, 11, -1, -1, -1, -1, -1, -1, -1,
        9, 7, 8, 5, 7, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        9, 3, 0, 9, 5, 3, 5, 7, 3, -1, -1, -1, -1, -1, -1, -1,
        0, 7, 8, 0, 1, 7, 1, 5, 7, -1, -1, -1, -1, -1, -1, -1,
        1, 5, 3, 3, 5, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        9, 7, 8, 9, 5, 7, 10, 1, 2, -1, -1, -1, -1, -1, -1, -1,
        10, 1, 2, 9, 5, 0, 5, 3, 0, 5, 7, 3, -1, -1, -1, -1,
        8, 0, 2, 8, 2, 5, 8, 5, 7, 10, 5, 2, -1, -1, -1, -1,
        2, 10, 5, 2, 5, 3, 3, 5, 7, -1, -1, -1, -1, -1, -1, -1,
        7, 9, 5, 7, 8, 9, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1,
        9, 5, 7, 9, 7, 2, 9, 2, 0, 2, 7, 11, -1, -1, -1, -1,
        2, 3, 11, 0, 1, 8, 1, 7, 8, 1, 5, 7, -1, -1, -1, -1,
        11, 2, 1, 11, 1, 7, 7, 1, 5, -1, -1, -1, -1, -1, -1, -1,
        9, 5, 8, 8, 5, 7, 10, 1, 3, 10, 3, 11, -1, -1, -1, -1,
        5, 7, 0, 5, 0, 9, 7, 11, 0, 1, 0, 10, 11, 10, 0, -1,
        11, 10, 0, 11, 0, 3, 10, 5, 0, 8, 0, 7, 5, 7, 0, -1,
        11, 10, 5, 7, 11, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        10, 6, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        0, 8, 3, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        9, 0, 1, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        1, 8, 3, 1, 9, 8, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1,
        1, 6, 5, 2, 6, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        1, 6, 5, 1, 2, 6, 3, 0, 8, -1, -1, -1, -1, -1, -1, -1,
        9, 6, 5, 9, 0, 6, 0, 2, 6, -1, -1, -1, -1, -1, -1, -1,
        5, 9, 8, 5, 8, 2, 5, 2, 6, 3, 2, 8, -1, -1, -1, -1,
        2, 3, 11, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        11, 0, 8, 11, 2, 0, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1,
        0, 1, 9, 2, 3, 11, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1,
        5, 10, 6, 1, 9, 2, 9, 11, 2, 9, 8, 11, -1, -1, -1, -1,
        6, 3, 11, 6, 5, 3, 5, 1, 3, -1, -1, -1, -1, -1, -1, -1,
        0, 8, 11, 0, 11, 5, 0, 5, 1, 5, 11, 6, -1, -1, -1, -1,
        3, 11, 6, 0, 3, 6, 0, 6, 5, 0, 5, 9, -1, -1, -1, -1,
        6, 5, 9, 6, 9, 11, 11, 9, 8, -1, -1, -1, -1, -1, -1, -1,
        5, 10, 6, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        4, 3, 0, 4, 7, 3, 6, 5, 10, -1, -1, -1, -1, -1, -1, -1,
        1, 9, 0, 5, 10, 6, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1,
        10, 6, 5, 1, 9, 7, 1, 7, 3, 7, 9, 4, -1, -1, -1, -1,
        6, 1, 2, 6, 5, 1, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1,
        1, 2, 5, 5, 2, 6, 3, 0, 4, 3, 4, 7, -1, -1, -1, -1,
        8, 4, 7, 9, 0, 5, 0, 6, 5, 0, 2, 6, -1, -1, -1, -1,
        7, 3, 9, 7, 9, 4, 3, 2, 9, 5, 9, 6, 2, 6, 9, -1,
        3, 11, 2, 7, 8, 4, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1,
        5, 10, 6, 4, 7, 2, 4, 2, 0, 2, 7, 11, -1, -1, -1, -1,
        0, 1, 9, 4, 7, 8, 2, 3, 11, 5, 10, 6, -1, -1, -1, -1,
        9, 2, 1, 9, 11, 2, 9, 4, 11, 7, 11, 4, 5, 10, 6, -1,
        8, 4, 7, 3, 11, 5, 3, 5, 1, 5, 11, 6, -1, -1, -1, -1,
        5, 1, 11, 5, 11, 6, 1, 0, 11, 7, 11, 4, 0, 4, 11, -1,
        0, 5, 9, 0, 6, 5, 0, 3, 6, 11, 6, 3, 8, 4, 7, -1,
        6, 5, 9, 6, 9, 11, 4, 7, 9, 7, 11, 9, -1, -1, -1, -1,
        10, 4, 9, 6, 4, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        4, 10, 6, 4, 9, 10, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1,
        10, 0, 1, 10, 6, 0, 6, 4, 0, -1, -1, -1, -1, -1, -1, -1,
        8, 3, 1, 8, 1, 6, 8, 6, 4, 6, 1, 10, -1, -1, -1, -1,
        1, 4, 9, 1, 2, 4, 2, 6, 4, -1, -1, -1, -1, -1, -1, -1,
        3, 0, 8, 1, 2, 9, 2, 4, 9, 2, 6, 4, -1, -1, -1, -1,
        0, 2, 4, 4, 2, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        8, 3, 2, 8, 2, 4, 4, 2, 6, -1, -1, -1, -1, -1, -1, -1,
        10, 4, 9, 10, 6, 4, 11, 2, 3, -1, -1, -1, -1, -1, -1, -1,
        0, 8, 2, 2, 8, 11, 4, 9, 10, 4, 10, 6, -1, -1, -1, -1,
        3, 11, 2, 0, 1, 6, 0, 6, 4, 6, 1, 10, -1, -1, -1, -1,
        6, 4, 1, 6, 1, 10, 4, 8, 1, 2, 1, 11, 8, 11, 1, -1,
        9, 6, 4, 9, 3, 6, 9, 1, 3, 11, 6, 3, -1, -1, -1, -1,
        8, 11, 1, 8, 1, 0, 11, 6, 1, 9, 1, 4, 6, 4, 1, -1,
        3, 11, 6, 3, 6, 0, 0, 6, 4, -1, -1, -1, -1, -1, -1, -1,
        6, 4, 8, 11, 6, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        7, 10, 6, 7, 8, 10, 8, 9, 10, -1, -1, -1, -1, -1, -1, -1,
        0, 7, 3, 0, 10, 7, 0, 9, 10, 6, 7, 10, -1, -1, -1, -1,
        10, 6, 7, 1, 10, 7, 1, 7, 8, 1, 8, 0, -1, -1, -1, -1,
        10, 6, 7, 10, 7, 1, 1, 7, 3, -1, -1, -1, -1, -1, -1, -1,
        1, 2, 6, 1, 6, 8, 1, 8, 9, 8, 6, 7, -1, -1, -1, -1,
        2, 6, 9, 2, 9, 1, 6, 7, 9, 0, 9, 3, 7, 3, 9, -1,
        7, 8, 0, 7, 0, 6, 6, 0, 2, -1, -1, -1, -1, -1, -1, -1,
        7, 3, 2, 6, 7, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        2, 3, 11, 10, 6, 8, 10, 8, 9, 8, 6, 7, -1, -1, -1, -1,
        2, 0, 7, 2, 7, 11, 0, 9, 7, 6, 7, 10, 9, 10, 7, -1,
        1, 8, 0, 1, 7, 8, 1, 10, 7, 6, 7, 10, 2, 3, 11, -1,
        11, 2, 1, 11, 1, 7, 10, 6, 1, 6, 7, 1, -1, -1, -1, -1,
        8, 9, 6, 8, 6, 7, 9, 1, 6, 11, 6, 3, 1, 3, 6, -1,
        0, 9, 1, 11, 6, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        7, 8, 0, 7, 0, 6, 3, 11, 0, 11, 6, 0, -1, -1, -1, -1,
        7, 11, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        7, 6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        3, 0, 8, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        0, 1, 9, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        8, 1, 9, 8, 3, 1, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1,
        10, 1, 2, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        1, 2, 10, 3, 0, 8, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1,
        2, 9, 0, 2, 10, 9, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1,
        6, 11, 7, 2, 10, 3, 10, 8, 3, 10, 9, 8, -1, -1, -1, -1,
        7, 2, 3, 6, 2, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        7, 0, 8, 7, 6, 0, 6, 2, 0, -1, -1, -1, -1, -1, -1, -1,
        2, 7, 6, 2, 3, 7, 0, 1, 9, -1, -1, -1, -1, -1, -1, -1,
        1, 6, 2, 1, 8, 6, 1, 9, 8, 8, 7, 6, -1, -1, -1, -1,
        10, 7, 6, 10, 1, 7, 1, 3, 7, -1, -1, -1, -1, -1, -1, -1,
        10, 7, 6, 1, 7, 10, 1, 8, 7, 1, 0, 8, -1, -1, -1, -1,
        0, 3, 7, 0, 7, 10, 0, 10, 9, 6, 10, 7, -1, -1, -1, -1,
        7, 6, 10, 7, 10, 8, 8, 10, 9, -1, -1, -1, -1, -1, -1, -1,
        6, 8, 4, 11, 8, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        3, 6, 11, 3, 0, 6, 0, 4, 6, -1, -1, -1, -1, -1, -1, -1,
        8, 6, 11, 8, 4, 6, 9, 0, 1, -1, -1, -1, -1, -1, -1, -1,
        9, 4, 6, 9, 6, 3, 9, 3, 1, 11, 3, 6, -1, -1, -1, -1,
        6, 8, 4, 6, 11, 8, 2, 10, 1, -1, -1, -1, -1, -1, -1, -1,
        1, 2, 10, 3, 0, 11, 0, 6, 11, 0, 4, 6, -1, -1, -1, -1,
        4, 11, 8, 4, 6, 11, 0, 2, 9, 2, 10, 9, -1, -1, -1, -1,
        10, 9, 3, 10, 3, 2, 9, 4, 3, 11, 3, 6, 4, 6, 3, -1,
        8, 2, 3, 8, 4, 2, 4, 6, 2, -1, -1, -1, -1, -1, -1, -1,
        0, 4, 2, 4, 6, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        1, 9, 0, 2, 3, 4, 2, 4, 6, 4, 3, 8, -1, -1, -1, -1,
        1, 9, 4, 1, 4, 2, 2, 4, 6, -1, -1, -1, -1, -1, -1, -1,
        8, 1, 3, 8, 6, 1, 8, 4, 6, 6, 10, 1, -1, -1, -1, -1,
        10, 1, 0, 10, 0, 6, 6, 0, 4, -1, -1, -1, -1, -1, -1, -1,
        4, 6, 3, 4, 3, 8, 6, 10, 3, 0, 3, 9, 10, 9, 3, -1,
        10, 9, 4, 6, 10, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        4, 9, 5, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        0, 8, 3, 4, 9, 5, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1,
        5, 0, 1, 5, 4, 0, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1,
        11, 7, 6, 8, 3, 4, 3, 5, 4, 3, 1, 5, -1, -1, -1, -1,
        9, 5, 4, 10, 1, 2, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1,
        6, 11, 7, 1, 2, 10, 0, 8, 3, 4, 9, 5, -1, -1, -1, -1,
        7, 6, 11, 5, 4, 10, 4, 2, 10, 4, 0, 2, -1, -1, -1, -1,
        3, 4, 8, 3, 5, 4, 3, 2, 5, 10, 5, 2, 11, 7, 6, -1,
        7, 2, 3, 7, 6, 2, 5, 4, 9, -1, -1, -1, -1, -1, -1, -1,
        9, 5, 4, 0, 8, 6, 0, 6, 2, 6, 8, 7, -1, -1, -1, -1,
        3, 6, 2, 3, 7, 6, 1, 5, 0, 5, 4, 0, -1, -1, -1, -1,
        6, 2, 8, 6, 8, 7, 2, 1, 8, 4, 8, 5, 1, 5, 8, -1,
        9, 5, 4, 10, 1, 6, 1, 7, 6, 1, 3, 7, -1, -1, -1, -1,
        1, 6, 10, 1, 7, 6, 1, 0, 7, 8, 7, 0, 9, 5, 4, -1,
        4, 0, 10, 4, 10, 5, 0, 3, 10, 6, 10, 7, 3, 7, 10, -1,
        7, 6, 10, 7, 10, 8, 5, 4, 10, 4, 8, 10, -1, -1, -1, -1,
        6, 9, 5, 6, 11, 9, 11, 8, 9, -1, -1, -1, -1, -1, -1, -1,
        3, 6, 11, 0, 6, 3, 0, 5, 6, 0, 9, 5, -1, -1, -1, -1,
        0, 11, 8, 0, 5, 11, 0, 1, 5, 5, 6, 11, -1, -1, -1, -1,
        6, 11, 3, 6, 3, 5, 5, 3, 1, -1, -1, -1, -1, -1, -1, -1,
        1, 2, 10, 9, 5, 11, 9, 11, 8, 11, 5, 6, -1, -1, -1, -1,
        0, 11, 3, 0, 6, 11, 0, 9, 6, 5, 6, 9, 1, 2, 10, -1,
        11, 8, 5, 11, 5, 6, 8, 0, 5, 10, 5, 2, 0, 2, 5, -1,
        6, 11, 3, 6, 3, 5, 2, 10, 3, 10, 5, 3, -1, -1, -1, -1,
        5, 8, 9, 5, 2, 8, 5, 6, 2, 3, 8, 2, -1, -1, -1, -1,
        9, 5, 6, 9, 6, 0, 0, 6, 2, -1, -1, -1, -1, -1, -1, -1,
        1, 5, 8, 1, 8, 0, 5, 6, 8, 3, 8, 2, 6, 2, 8, -1,
        1, 5, 6, 2, 1, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        1, 3, 6, 1, 6, 10, 3, 8, 6, 5, 6, 9, 8, 9, 6, -1,
        10, 1, 0, 10, 0, 6, 9, 5, 0, 5, 6, 0, -1, -1, -1, -1,
        0, 3, 8, 5, 6, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        10, 5, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        11, 5, 10, 7, 5, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        11, 5, 10, 11, 7, 5, 8, 3, 0, -1, -1, -1, -1, -1, -1, -1,
        5, 11, 7, 5, 10, 11, 1, 9, 0, -1, -1, -1, -1, -1, -1, -1,
        10, 7, 5, 10, 11, 7, 9, 8, 1, 8, 3, 1, -1, -1, -1, -1,
        11, 1, 2, 11, 7, 1, 7, 5, 1, -1, -1, -1, -1, -1, -1, -1,
        0, 8, 3, 1, 2, 7, 1, 7, 5, 7, 2, 11, -1, -1, -1, -1,
        9, 7, 5, 9, 2, 7, 9, 0, 2, 2, 11, 7, -1, -1, -1, -1,
        7, 5, 2, 7, 2, 11, 5, 9, 2, 3, 2, 8, 9, 8, 2, -1,
        2, 5, 10, 2, 3, 5, 3, 7, 5, -1, -1, -1, -1, -1, -1, -1,
        8, 2, 0, 8, 5, 2, 8, 7, 5, 10, 2, 5, -1, -1, -1, -1,
        9, 0, 1, 5, 10, 3, 5, 3, 7, 3, 10, 2, -1, -1, -1, -1,
        9, 8, 2, 9, 2, 1, 8, 7, 2, 10, 2, 5, 7, 5, 2, -1,
        1, 3, 5, 3, 7, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        0, 8, 7, 0, 7, 1, 1, 7, 5, -1, -1, -1, -1, -1, -1, -1,
        9, 0, 3, 9, 3, 5, 5, 3, 7, -1, -1, -1, -1, -1, -1, -1,
        9, 8, 7, 5, 9, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        5, 8, 4, 5, 10, 8, 10, 11, 8, -1, -1, -1, -1, -1, -1, -1,
        5, 0, 4, 5, 11, 0, 5, 10, 11, 11, 3, 0, -1, -1, -1, -1,
        0, 1, 9, 8, 4, 10, 8, 10, 11, 10, 4, 5, -1, -1, -1, -1,
        10, 11, 4, 10, 4, 5, 11, 3, 4, 9, 4, 1, 3, 1, 4, -1,
        2, 5, 1, 2, 8, 5, 2, 11, 8, 4, 5, 8, -1, -1, -1, -1,
        0, 4, 11, 0, 11, 3, 4, 5, 11, 2, 11, 1, 5, 1, 11, -1,
        0, 2, 5, 0, 5, 9, 2, 11, 5, 4, 5, 8, 11, 8, 5, -1,
        9, 4, 5, 2, 11, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        2, 5, 10, 3, 5, 2, 3, 4, 5, 3, 8, 4, -1, -1, -1, -1,
        5, 10, 2, 5, 2, 4, 4, 2, 0, -1, -1, -1, -1, -1, -1, -1,
        3, 10, 2, 3, 5, 10, 3, 8, 5, 4, 5, 8, 0, 1, 9, -1,
        5, 10, 2, 5, 2, 4, 1, 9, 2, 9, 4, 2, -1, -1, -1, -1,
        8, 4, 5, 8, 5, 3, 3, 5, 1, -1, -1, -1, -1, -1, -1, -1,
        0, 4, 5, 1, 0, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        8, 4, 5, 8, 5, 3, 9, 0, 5, 0, 3, 5, -1, -1, -1, -1,
        9, 4, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        4, 11, 7, 4, 9, 11, 9, 10, 11, -1, -1, -1, -1, -1, -1, -1,
        0, 8, 3, 4, 9, 7, 9, 11, 7, 9, 10, 11, -1, -1, -1, -1,
        1, 10, 11, 1, 11, 4, 1, 4, 0, 7, 4, 11, -1, -1, -1, -1,
        3, 1, 4, 3, 4, 8, 1, 10, 4, 7, 4, 11, 10, 11, 4, -1,
        4, 11, 7, 9, 11, 4, 9, 2, 11, 9, 1, 2, -1, -1, -1, -1,
        9, 7, 4, 9, 11, 7, 9, 1, 11, 2, 11, 1, 0, 8, 3, -1,
        11, 7, 4, 11, 4, 2, 2, 4, 0, -1, -1, -1, -1, -1, -1, -1,
        11, 7, 4, 11, 4, 2, 8, 3, 4, 3, 2, 4, -1, -1, -1, -1,
        2, 9, 10, 2, 7, 9, 2, 3, 7, 7, 4, 9, -1, -1, -1, -1,
        9, 10, 7, 9, 7, 4, 10, 2, 7, 8, 7, 0, 2, 0, 7, -1,
        3, 7, 10, 3, 10, 2, 7, 4, 10, 1, 10, 0, 4, 0, 10, -1,
        1, 10, 2, 8, 7, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        4, 9, 1, 4, 1, 7, 7, 1, 3, -1, -1, -1, -1, -1, -1, -1,
        4, 9, 1, 4, 1, 7, 0, 8, 1, 8, 7, 1, -1, -1, -1, -1,
        4, 0, 3, 7, 4, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        4, 8, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        9, 10, 8, 10, 11, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        3, 0, 9, 3, 9, 11, 11, 9, 10, -1, -1, -1, -1, -1, -1, -1,
        0, 1, 10, 0, 10, 8, 8, 10, 11, -1, -1, -1, -1, -1, -1, -1,
        3, 1, 10, 11, 3, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        1, 2, 11, 1, 11, 9, 9, 11, 8, -1, -1, -1, -1, -1, -1, -1,
        3, 0, 9, 3, 9, 11, 1, 2, 9, 2, 11, 9, -1, -1, -1, -1,
        0, 2, 11, 8, 0, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        3, 2, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        2, 3, 8, 2, 8, 10, 10, 8, 9, -1, -1, -1, -1, -1, -1, -1,
        9, 10, 2, 0, 9, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        2, 3, 8, 2, 8, 10, 0, 1, 8, 1, 10, 8, -1, -1, -1, -1,
        1, 10, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        1, 3, 8, 9, 1, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        0, 9, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        0, 3, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]);

    this.connectBall = function (radius1, center1, radius2, center2) {
        faces = [];
        var size = 30;
        var size3 = size * size * size;
        var axisMin = -5;
        var axisMax = 5;
        var axisRange = axisMax - axisMin;
        var points = [];
        var values = [];
        for (var k = 0; k < size; k++) {
            for (var j = 0; j < size; j++) {
                for (var i = 0; i < size; i++) {
                    // actual values

                    var x = axisMin + axisRange * i / (size - 1);
                    var y = axisMin + axisRange * j / (size - 1);
                    var z = axisMin + axisRange * k / (size - 1);
                    var v = new Float32Array(3);
                    v[0] = x;
                    v[1] = y;
                    v[2] = z;

                    points.push(v);
                }
            }
        }

        // initialize values
        for (var i = 0; i < size3; i++)
            values[i] = 0;
        processBall(points, values, radius1, center1);
        processBall(points, values, radius2, center2);
        marchingCubes(points, values, 0.7);

        function processBall(points, values, radius, center) {

            for (var i = 0; i < values.length; i++) {
                var dx = center.x - points[i][0];
                var dy = center.y - points[i][1];
                var dz = center.z - points[i][2];

                var distanceToSquared = dx * dx + dy * dy + dz * dz;

                var OneMinusD2 = 1.0 - distanceToSquared;
                values[i] += Math.exp(-(OneMinusD2 * OneMinusD2));

            }
        }
    }


    function marchingCubes(points, values, isolevel) {
// number of cubes along a side
        var size = Math.round(Math.pow(values.length, 1 / 3));



        var verticeArray = new Array();
// Generate a list of 3D points and values at those points


// Marching Cubes Algorithm

        var size2 = size * size;

// Vertices may occur along edges of cube, when the values at the edge's endpoints
//   straddle the isolevel value.
// Actual position along edge weighted according to function values.
        var vlist = new Array(12);

        Face3 = function (a, b, c, normal, color, materialIndex) {

            this.a = a;
            this.b = b;
            this.c = c;

            this.normal = normal instanceof Vector3 ? normal : new Vector3();
            this.vertexNormals = normal instanceof Array ? normal : [];


            this.vertexColors = color instanceof Array ? color : [];

            this.vertexTangents = [];

            this.materialIndex = materialIndex;
            this.centroid = new Vector3();

        };

        var vertexIndex = 0;

        for (var z = 0; z < size - 1; z++)
            for (var y = 0; y < size - 1; y++)
                for (var x = 0; x < size - 1; x++) {

                    // index of base point, and also adjacent points on cube
                    var p = x + size * y + size2 * z,
                        px = p + 1,
                        py = p + size,
                        pxy = py + 1,
                        pz = p + size2,
                        pxz = px + size2,
                        pyz = py + size2,
                        pxyz = pxy + size2;

                    // store scalar values corresponding to vertices
                    var value0 = values[p],
                        value1 = values[px],
                        value2 = values[py],
                        value3 = values[pxy],
                        value4 = values[pz],
                        value5 = values[pxz],
                        value6 = values[pyz],
                        value7 = values[pxyz];


                    // place a "1" in bit positions corresponding to vertices whose
                    //   isovalue is less than given constant.


                    var cubeindex = 0;
                    if (value0 < isolevel) cubeindex |= 1;
                    if (value1 < isolevel) cubeindex |= 2;
                    if (value2 < isolevel) cubeindex |= 8;
                    if (value3 < isolevel) cubeindex |= 4;
                    if (value4 < isolevel) cubeindex |= 16;
                    if (value5 < isolevel) cubeindex |= 32;
                    if (value6 < isolevel) cubeindex |= 128;
                    if (value7 < isolevel) cubeindex |= 64;

                    // bits = 12 bit number, indicates which edges are crossed by the isosurface
                    var bits = edgeTable[cubeindex];

                    // if none are crossed, proceed to next iteration
                    if (bits === 0) continue;

                    // check which edges are crossed, and estimate the point location
                    //    using a weighted average of scalar values at edge endpoints.
                    // store the vertex in an array for use later.
                    var mu = 0.5;

                    function lerp(i1, i2, t) {
                        let result = new Array();
                        let a = points[i1];
                        let b = points[i2];

                        result[0] = a[0] + t * (b[0] - a[0]);
                        result[1] = a[1] + t * (b[1] - a[1]);
                        result[2] = a[2] + t * (b[2] - a[2]);
                        return result;
                    }

                    // bottom of the cube
                    if (bits & 1) {
                        mu = (isolevel - value0) / (value1 - value0);
                        //vlist[0] = points[p].clone().lerp( points[px], mu );
                        vlist[0] = lerp(p, px, mu);
                    }
                    if (bits & 2) {
                        mu = (isolevel - value1) / (value3 - value1);
                        //vlist[1] = points[px].clone().lerp( points[pxy], mu );
                        vlist[1] = lerp(px, pxy, mu);

                    }
                    if (bits & 4) {
                        mu = (isolevel - value2) / (value3 - value2);
                        //vlist[2] = points[py].clone().lerp( points[pxy], mu );
                        vlist[2] = lerp(py, pxy, mu);
                    }
                    if (bits & 8) {
                        mu = (isolevel - value0) / (value2 - value0);
                        //vlist[3] = points[p].clone().lerp( points[py], mu );
                        vlist[3] = lerp(p, py, mu);
                    }
                    // top of the cube
                    if (bits & 16) {
                        mu = (isolevel - value4) / (value5 - value4);
                        //vlist[4] = points[pz].clone().lerp( points[pxz], mu );
                        vlist[4] = lerp(pz, pxz, mu);
                    }
                    if (bits & 32) {
                        mu = (isolevel - value5) / (value7 - value5);
                        //vlist[5] = points[pxz].clone().lerp( points[pxyz], mu );
                        vlist[5] = lerp(pxz, pxyz, mu);
                    }
                    if (bits & 64) {
                        mu = (isolevel - value6) / (value7 - value6);
                        //vlist[6] = points[pyz].clone().lerp( points[pxyz], mu );
                        vlist[6] = lerp(pyz, pxyz, mu);
                    }
                    if (bits & 128) {
                        mu = (isolevel - value4) / (value6 - value4);
                        //vlist[7] = points[pz].clone().lerp( points[pyz], mu );
                        vlist[7] = lerp(pz, pyz, mu);
                    }
                    // vertical lines of the cube
                    if (bits & 256) {
                        mu = (isolevel - value0) / (value4 - value0);
                        //vlist[8] = points[p].clone().lerp( points[pz], mu );
                        vlist[8] = lerp(p, pz, mu);
                    }
                    if (bits & 512) {
                        mu = (isolevel - value1) / (value5 - value1);
                        //vlist[9] = points[px].clone().lerp( points[pxz], mu );
                        vlist[9] = lerp(px, pxz, mu);
                    }
                    if (bits & 1024) {
                        mu = (isolevel - value3) / (value7 - value3);
                        //vlist[10] = points[pxy].clone().lerp( points[pxyz], mu );
                        vlist[10] = lerp(pxy, pxyz, mu);
                    }
                    if (bits & 2048) {
                        mu = (isolevel - value2) / (value6 - value2);
                        //vlist[11] = points[py].clone().lerp( points[pyz], mu );
                        vlist[11] = lerp(py, pyz, mu);
                    }

                    // construct triangles -- get correct vertices from triTable.
                    var i = 0;

                    cubeindex <<= 4;  // multiply by 16...
                    // "Re-purpose cubeindex into an offset into triTable."
                    //  since each row really isn't a row.

                    // the while loop should run at most 5 times,
                    //   since the 16th entry in each row is a -1.
                    while (triangleTable[cubeindex + i] != -1) {
                        var index1 = triangleTable[cubeindex + i];
                        var index2 = triangleTable[cubeindex + i + 1];
                        var index3 = triangleTable[cubeindex + i + 2];

                        verticeArray.push(vlist[index1]);

                        verticeArray.push(vlist[index2]);

                        verticeArray.push(vlist[index3]);

                        var face = new Face3(vertexIndex, vertexIndex + 1, vertexIndex + 2);
                        faces.push(face);

                        //faceVertexUvs[ 0 ].push( [ new THREE.Vector2(0,0), new THREE.Vector2(0,1), new THREE.Vector2(1,1) ] );

                        vertexIndex += 3;
                        i += 3;
                    }

                }

        mergeVertices(faces, verticeArray);



        computeFaceNormals(faces, verticeArray);

        function mergeVertices(faces, vertices) {

            var verticesMap = {}; // Hashmap for looking up vertice by position coordinates (and making sure they are unique)
            var unique = [], changes = [];

            var v, key;
            var precisionPoints = 4; // number of decimal points, eg. 4 for epsilon of 0.0001
            var precision = Math.pow(10, precisionPoints);
            var i, il, face;
            var indices, k, j, jl, u;

            // reset cache of vertices as it now will be changing.
            var __tmpVertices = undefined;

            for (i = 0, il = vertices.length; i < il; i++) {

                v = vertices[i];

                key = Math.round(v[0] * precision) + '_' + Math.round(v[1] * precision) + '_' + Math.round(v[2] * precision);

                if (verticesMap[key] === undefined) {

                    verticesMap[key] = i;
                    unique.push(vertices[i]);
                    changes[i] = unique.length - 1;

                } else {

                    //console.log('Duplicate vertex found. ', i, ' could be using ', verticesMap[key]);
                    changes[i] = changes[verticesMap[key]];

                }

            }



            // if faces are completely degenerate after merging vertices, we
            // have to remove them from the geometry.
            var faceIndicesToRemove = [];

            for (i = 0, il = faces.length; i < il; i++) {

                face = faces[i];

                face.a = changes[face.a];
                face.b = changes[face.b];
                face.c = changes[face.c];

                indices = [face.a, face.b, face.c];

                var dupIndex = -1;

                // if any duplicate vertices are found in a Face3
                // we have to remove the face as nothing can be saved
                for (var n = 0; n < 3; n++) {
                    if (indices[n] == indices[(n + 1) % 3]) {

                        dupIndex = n;
                        faceIndicesToRemove.push(i);
                        break;

                    }
                }

            }

            for (i = faceIndicesToRemove.length - 1; i >= 0; i--) {
                var idx = faceIndicesToRemove[i];

                faces[idx] = 0;

                /* for ( j = 0, jl = this.faceVertexUvs.length; j < jl; j ++ ) {

                     this.faceVertexUvs[ j ].splice( idx, 1 );*/

            }


            // Use unique set of vertices

            //ar diff = this.vertices.length - unique.length;
            vertices = unique;


        }

        function divideScalar(centroid, s) {

            if (s !== 0) {

                centroid.x /= s;
                centroid.y /= s;
                centroid.z /= s;

            } else {

                centroid.x = 0;
                centroid.y = 0;
                centroid.z = 0;

            }

            return centroid;

        }

        function computeCentroids(faces, vertices) {

            var f, fl, face;

            for (f = 0, fl = faces.length; f < fl; f++) {

                face = faces[f];
                face.centroid = (0, 0, 0);

                face.centroid = (vertices[face.a], vertices[face.b]
                    , vertices[face.c]);
                divideScalar(face.centroid, 3);

                faces[f] = face;

            }


        }

        function subVectors(a, b, c) {

            c.x = a[0] - b[0];
            c.y = a[1] - b[1];
            c.z = a[2] - b[2];

            return c;

        }

        function computeFaceNormals(faces, vertices) {

            var cb = new Vector3(), ab = new Vector3();

            for (var f = 0, fl = faces.length; f < fl; f++) {

                var face = faces[f];

                var vA = vertices[face.a];
                var vB = vertices[face.b];
                var vC = vertices[face.c];

                subVectors(vC, vB, cb);
                subVectors(vA, vB, ab);

                var tx = cb.y * ab.z - ab.y * cb.z;
                var ty = cb.z * ab.x - cb.x * ab.z;
                var tz = cb.x * ab.y - cb.y * ab.x;
                cb.x = tx;
                cb.y = ty;
                cb.z = tz;
                cb.normalize();

                face.normal = cb;

                faces[f] = face;

            }
        }



        var fixverticeArray = new Array();
        for (var i = 0; i < verticeArray.length; i++) {

            fixverticeArray.push(verticeArray[i][0]);
            fixverticeArray.push(verticeArray[i][1]);
            fixverticeArray.push(verticeArray[i][2]);
        }


        tempPositionData = new Float32Array(fixverticeArray);


        var tmpface = new Array();
        for (var j = 0; j < faces.length; j++) {
            tmpface.push(faces[j].normal);
        }

        var fixtmpface = new Array();
        for (var i = 0; i < tmpface.length; i++) {
            fixtmpface.push(tmpface[i].x);
            fixtmpface.push(tmpface[i].y);
            fixtmpface.push(tmpface[i].z);
        }
        var temp = [];


        for (let i = 0; i < fixtmpface.length; ++i) {
            temp.push(fixtmpface[i]);

        }
        for (let i = 0; i < fixtmpface.length; ++i) {
            temp.push(fixtmpface[i]);

        }
        for (let i = 0; i < fixtmpface.length; ++i) {
            temp.push(fixtmpface[i]);

        }

        tempNormalData = new Float32Array(temp);
        tempVertexNum = temp.length / 3;


    }





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
        gl.bufferData(gl.ARRAY_BUFFER, tempPositionData, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.vsPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vsPosition);  // Enable the assignment of the buffer object


        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBufferHandle);
        gl.bufferData(gl.ARRAY_BUFFER, tempNormalData, gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.vsNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vsNormal);  // Enable the assignment of the buffer object


        gl.drawArrays(gl.TRIANGLES, 0, tempVertexNum);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);

    };

    function radians(t) {
        return (t / 180) * Math.PI;
    }
}


