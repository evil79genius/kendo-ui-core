﻿(function() {
    var dataviz = kendo.dataviz,
        functions = dataviz.QRCodeFunctions,
        fields = dataviz.QRCodeFields,
        matrices,
        testVersions = [1, 10, 30],
        versionInformationTestVersions = [7,10,30],
        alignmentPatternTestVersions = {
            "2": [[18, 18]],
            "7": [[6,22],[22,22],[22,38],[38,22],[38,38]],
            "15": [[6,26],[6,48],[26,6],[48,6],[26,26],[26,48],[26,70],[48,26],[70,26],[48,48],[48,70],[70,48],[70,70]]
        },
        formatInformationTestValue = "101010101010100",
        versionInfromationTestValue = "101010101010101010";

    function printMatrix(matrix){
        console.log("");
        var str = "";
        for(var i = 0; i < matrix.length; i++){
            for(var j = 0; j < matrix[i].length; j++){
                str += (matrix[i][j] !== undefined ? matrix[i][j]: "x") + " ";
            }
            str += "\n";
        }
         console.log(str);
    }

    function createTestMatrices(versions){
        var size,
            matrices = [];
        for(var i =0; i < versions.length; i++){
            matrices.push(createTestMatrix(17 + 4 * versions[i]));
        }

        return matrices;
    }

    function createTestMatrix(size){
        var matrix = [];
        for(var i = 0; i < size; i++){
            matrix[i] = new Array(size);
        }
        return matrix;
    }

    function fillBlock(matrix, x1,y1,lengthX,lengthY, value){
        for(var i = x1; i < x1 + lengthX;i++){
            for(var j = y1; j < y1 + lengthY;j++){
                matrix[i][j] = value;
            }
        }
    }

    function checkFinderPattern(matrix, x1, y1){
        var correctlyFilled = true,
            idx;

        for(idx = 0; idx < 7; idx++){
             correctlyFilled = correctlyFilled && matrix[x1][y1 + idx] === 1;
             correctlyFilled = correctlyFilled && matrix[x1 + 6][y1 + idx] === 1;
             correctlyFilled = correctlyFilled && matrix[x1 + idx][y1] === 1;
             correctlyFilled = correctlyFilled && matrix[x1 + idx][y1 + 6] === 1;
        }

        for(idx = 1; idx < 6; idx++){
             correctlyFilled = correctlyFilled && matrix[x1 + 1][y1 + idx] === 0;
             correctlyFilled = correctlyFilled && matrix[x1 + 5][y1 + idx] === 0;
             correctlyFilled = correctlyFilled && matrix[x1 + idx][y1 + 1] === 0;
             correctlyFilled = correctlyFilled && matrix[x1 + idx][y1 + 5] === 0;
        }

        for(idx = 2; idx < 5; idx++){
            for(var j = 2; j < 5; j++){
                correctlyFilled = correctlyFilled && matrix[x1 + idx][y1 + j] === 1;
            }
        }

        return correctlyFilled;
    }

    function checkFinderPatternSeparators(matrix){
        var size = matrix.length,
            correctlyFilled = true,
            idx;
        for(idx = 0; idx < 8; idx++){
            correctlyFilled = correctlyFilled && matrix[idx][7] === 0;
            correctlyFilled = correctlyFilled && matrix[7][idx] === 0;
            correctlyFilled = correctlyFilled && matrix[idx][size - 8] === 0;
            correctlyFilled = correctlyFilled && matrix[7][size - 8 + idx] === 0;
            correctlyFilled = correctlyFilled && matrix[size - 8 + idx][7] === 0;
            correctlyFilled = correctlyFilled && matrix[size - 8][idx] === 0;
        }

        return correctlyFilled;
    }

    function checkFinderPatterns(matrix){
        var size = matrix.length,
            correctlyFilled = true,
            x1 = 0,
            y1 = 0,
            x2 = 0,
            y2 = size - 7,
            x3 = size - 7,
            y3 = 0;
        correctlyFilled = correctlyFilled && checkFinderPattern(matrix,x1,y1);
        correctlyFilled = correctlyFilled && checkFinderPattern(matrix,x2,y2);
        correctlyFilled = correctlyFilled && checkFinderPattern(matrix,x3,y3);
        correctlyFilled = correctlyFilled && checkFinderPatternSeparators(matrix);
        return correctlyFilled;
    }

    function fillFinderPatterns(matrix){
        var size = matrix.length;
        fillBlock(matrix, 0, 0, 8, 8, 1);
        fillBlock(matrix, 0, size - 8, 8, 8, 1);
        fillBlock(matrix, size - 8, 0, 8, 8, 1);
    }

    function checkTimingPatterns(matrix){
        var size = matrix.length,
            expectedModuleValue = 1,
            correctlyFilled = true;

        for(var idx = 8; idx < size - 8; idx++){
            correctlyFilled = correctlyFilled &&  matrix[6][idx] === expectedModuleValue;
            correctlyFilled = correctlyFilled &&  matrix[idx][6] === expectedModuleValue;
            expectedModuleValue ^= 1;
        }
        return correctlyFilled;
    }

    function checkAlignmentPattern(matrix, x, y){
        var idx,
            correctlyFilled = true;

        x-=2;
        y-=2;
        for(idx = 0; idx < 5;idx++){
            correctlyFilled = correctlyFilled &&  matrix[x][y + idx] === 1;
            correctlyFilled = correctlyFilled &&  matrix[x + idx][y] === 1;
            correctlyFilled = correctlyFilled &&  matrix[x + idx][y + 4] === 1;
            correctlyFilled = correctlyFilled &&  matrix[x + 4][y] === 1;
        }

        for(idx = 1; idx < 4;idx++){
            correctlyFilled = correctlyFilled &&  matrix[x + 1][y + idx] === 0;
            correctlyFilled = correctlyFilled &&  matrix[x + idx][y + 1] === 0;
            correctlyFilled = correctlyFilled &&  matrix[x + idx][y + 3] === 0;
            correctlyFilled = correctlyFilled &&  matrix[x + 3][y + 1] === 0;
        }

        correctlyFilled = correctlyFilled &&  matrix[x + 2][y + 2] === 1;

        return correctlyFilled;
    }

    function checkFormatInformation(matrix, valueString){
        var size = matrix.length,
            values = [],
            idx = 0,
            valueIdx = 0,
            correctPlacement = true;
        for(idx; idx < valueString.length; idx++){
            values.push(parseInt(valueString.charAt(valueString.length - idx - 1), 10));
        }

        for(idx=0,valueIdx = 0;idx < 8; idx++){
            correctPlacement = correctPlacement && values[valueIdx++] === matrix[8][size - idx - 1];
        }

        correctPlacement = correctPlacement && 1 === matrix[size - 8][8];

        for(idx = 0;idx < 7;idx++){
             correctPlacement = correctPlacement && values[valueIdx++] === matrix[size - 7 + idx][8];
        }

        valueIdx = 0;

        for(idx=0;idx < 9; idx++){
            if(idx !== 6){
                 correctPlacement = correctPlacement && values[valueIdx++] === matrix[idx][8];
            }
            else{
                 correctPlacement = correctPlacement && matrix[idx][8] === undefined;
            }
        }

        for(idx=0; idx < 8;idx++){
            if(7 - idx !== 6){
                 correctPlacement = correctPlacement && values[valueIdx++] === matrix[8][7 - idx];
            }
            else{
                 correctPlacement = correctPlacement && matrix[8][7 - idx] === undefined;
            }
        }
        return correctPlacement;
    }

    function checkVersionInfromation(matrix, valueString){
        var size = matrix.length,
            x1 = 0,
            y1 = size - 11,
            x2 = size - 11,
            y2 = 0,
            quotient,
            mod,
            correctPlacement = true;
            values = [];
        for(idx; idx < valueString.length; idx++){
            values.push(parseInt(valueString.charAt(valueString.length - idx - 1), 10));
        }


        for(var idx =0; idx < values.length; idx++){
            quotient = Math.floor(idx / 3);
            mod = idx % 3;
            correctPlacement = correctPlacement && matrix[x1 + quotient, y1 + mod] === values[idx];
            correctPlacement = correctPlacement && matrix[x1 + mod, y1 + quotient] === values[idx];
        }

        return correctPlacement;
    }

    module("module placement tests", {
    });

    test("test finder pattern placement", function(){
        var correctFinderPatternPlacement,
            matrices = createTestMatrices(testVersions);
        for(var i = 0; i < testVersions.length; i++){
            functions.addFinderPatterns([matrices[i]]);
            correctFinderPatternPlacement = checkFinderPatterns(matrices[i]);
            ok(correctFinderPatternPlacement, "finder pattern placement version: " + testVersions[i]);
        }
    });

    test("test timing pattern placement", function(){
        var correctTimingPatternPlacement,
            matrices = createTestMatrices(testVersions);
        for(var i = 0; i < testVersions.length; i++){
            fillFinderPatterns(matrices[i]);
            functions.addTimingFunctions([matrices[i]]);
            correctTimingPatternPlacement = checkTimingPatterns(matrices[i]);
            ok(correctTimingPatternPlacement, "timing pattern placement version: " + testVersions[i]);
        }
    });

    test("test no alignment patterns are added for version 1", function(){
        var matrix = createTestMatrix(21),
            noAlignmentPattern = true;
        functions.addAlignmentPatterns([matrix], 1);
        for(var i = 0; i < matrix.length; i++){
            for(var j = 0; j < matrix.length; j++){
                noAlignmentPattern = noAlignmentPattern && matrix[i][j] === undefined;
            }
        }
        ok(noAlignmentPattern);
    });

    test("test alignment pattern placement", function(){
        var correctAlignmentPatternPlacement,
            matrix,
            coordinates;
        for(var version in alignmentPatternTestVersions){
            correctAlignmentPatternPlacement = true;
            matrix = createTestMatrix(17 + 4 * version);
            fillFinderPatterns(matrix);
            functions.addAlignmentPatterns([matrix], version);

            coordinates = alignmentPatternTestVersions[version];
            for(var i=0; i < coordinates.length;i++){
                correctAlignmentPatternPlacement = correctAlignmentPatternPlacement &&
                    checkAlignmentPattern(matrix, coordinates[i][0], coordinates[i][1]);
            }

            ok(correctAlignmentPatternPlacement, "alignment pattern placement version: " + version);
        }
    });


    test("test format information placement", function(){
        var correctFormatPlacement,
            matrices = createTestMatrices(testVersions);
        for(var i = 0; i < testVersions.length; i++){
            functions.addFormatInformation([matrices[i]], formatInformationTestValue);
            correctFormatPlacement = checkFormatInformation(matrices[i], formatInformationTestValue);
            ok(correctFormatPlacement, "format information version: " + testVersions[i]);
        }
    });

     test("test version information placement", function(){
        var correctVersionPlacement,
            matrices = createTestMatrices(versionInformationTestVersions);
        for(var i = 0; i < versionInformationTestVersions.length; i++){
            functions.addVersionInformation([matrices[i]], versionInfromationTestValue);
            correctVersionPlacement = checkVersionInfromation(matrices[i], versionInfromationTestValue);
            ok(correctVersionPlacement, "version information version: " + versionInformationTestVersions[i]);
        }
    });

})();
