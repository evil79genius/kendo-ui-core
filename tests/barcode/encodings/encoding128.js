(function() {
    var dataviz = kendo.dataviz,
        encodings = dataviz.encodings,
        encoding,
        quietZoneLength = encodings.code128.fn.options.quietZoneLength,
        expectedResultsSingleState = [{
                message: "state C only value",
                value: "34375658282916",
                expected: [quietZoneLength, 2, 1, 1, 2, 3, 2, 1, 3, 1, 1, 2, 3, 1, 3, 2, 1, 1, 3, 3, 3, 1, 1, 2, 1, 3, 1, 2, 3, 1, 1, 3, 2, 2, 1, 1, 2, 3, 2, 2, 2, 1, 1, 1, 2, 3, 1, 2, 2, 2, 2, 1, 2, 1, 3, 2, 3, 3, 1, 1, 1, 2, quietZoneLength]
            },{
                message: "state C single value with checkdigit less than 10",
                value: "00",
                expected: [quietZoneLength, 2, 1, 1, 2, 3, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 3, 3, 1, 1, 1, 2, quietZoneLength]
            },{
                message: "state C value starts with 0",
                value: "0064327491624344",
                expected: [quietZoneLength, 2, 1, 1, 2, 3, 2, 2, 1, 2, 2, 2, 2, 1, 1, 1, 4, 2, 2, 2, 3, 2, 1, 2, 1, 1, 4, 2, 2, 1, 1, 4, 1, 2, 1, 2, 1, 4, 3, 1, 1, 1, 1, 1, 1, 2, 3, 3, 1, 1, 3, 2, 1, 3, 1, 1, 1, 3, 1, 2, 3, 2, 3, 3, 1, 1, 1, 2, quietZoneLength]
            },{
                message: "encode in state B instead of state A",
                value: "TESTB",
                expected:[quietZoneLength, 2, 1, 1, 2, 1, 4, 2, 1, 3, 3, 1, 1, 1, 3, 2, 1, 1, 3, 2, 1, 3, 1, 1, 3, 2, 1, 3, 3, 1, 1, 1, 3, 1, 1, 2, 3, 2, 3, 1, 1, 1, 3, 2, 3, 3, 1, 1, 1, 2, quietZoneLength]   
            },{
                message: "state B only value",
                value: "_730" + String.fromCharCode(127) + "#'",
                expected: [quietZoneLength, 2, 1, 1, 2, 1, 4, 1, 1, 1, 2, 2, 4, 3, 1, 2, 1, 3, 1, 2, 2, 1, 1, 3, 2, 1, 2, 3, 1, 2, 2, 1, 1, 4, 1, 1, 3, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 1, 2, 2, 1, 3, 3, 1, 1, 2, 3, 3, 1, 1, 1, 2, quietZoneLength]
            },{
                message: "state B only value",
                value: "0`~k{ ",
                expected: [quietZoneLength, 2, 1, 1, 2, 1, 4, 1, 2, 3, 1, 2, 2, 1, 1, 1, 4, 2, 2, 1, 3, 1, 1, 4, 1, 2, 4, 1, 2, 1, 1, 4, 1, 2, 1, 2, 1, 2, 1, 2, 2, 2, 2, 2, 1, 1, 3, 3, 1, 2, 3, 3, 1, 1, 1, 2, quietZoneLength]
            },{
                message: "state A only value",
                value: String.fromCharCode(0) + "@" + String.fromCharCode(10) + String.fromCharCode(27),
                expected: [quietZoneLength, 2, 1, 1, 4, 1, 2, 1, 1, 1, 4, 2, 2, 2, 3, 2, 1, 2, 1, 1, 4, 2, 2, 1, 1, 4, 1, 2, 1, 2, 1, 1, 1, 4, 3, 1, 1, 2, 3, 3, 1, 1, 1, 2, quietZoneLength]
            }],
    expectedResultsMultistateValues = [{
        message: "state A shift state B",
        value: String.fromCharCode(6) + "b" + String.fromCharCode(30),
        expected: [quietZoneLength,2,1,1,4,1,2,1,1,2,4,1,2,4,1,1,3,1,1,1,2,1,4,2,1,1,3,1,1,4,1,1,2,3,1,2,2,2,3,3,1,1,1,2,quietZoneLength]
    },{
        message: "state A double shift state B",
        value: String.fromCharCode(6) + "b" + String.fromCharCode(30) + "b",
        expected: [quietZoneLength,2,1,1,4,1,2,1,1,2,4,1,2,4,1,1,3,1,1,1,2,1,4,2,1,1,3,1,1,4,1,4,1,1,3,1,1,1,2,1,4,2,1,2,4,1,1,1,2,2,3,3,1,1,1,2,quietZoneLength]
    },{
        message: "state A move state B",
        value: String.fromCharCode(6) + "bb",
        expected: [quietZoneLength,2,1,1,4,1,2,1,1,2,4,1,2,1,1,4,1,3,1,1,2,1,4,2,1,1,2,1,4,2,1,2,3,1,2,1,2,2,3,3,1,1,1,2,quietZoneLength]
    },{
        message: "state B shift state A",
        value: "b" + String.fromCharCode(6) + "b",
        expected: [quietZoneLength,2,1,1,2,1,4,1,2,1,4,2,1,4,1,1,3,1,1,1,1,2,4,1,2,1,2,1,4,2,1,1,2,3,1,2,2,2,3,3,1,1,1,2,quietZoneLength]
    },{
        message: "state B double shift state A",
        value: "b" + String.fromCharCode(6) + "b" + String.fromCharCode(6),
        expected: [quietZoneLength,2,1,1,2,1,4,1,2,1,4,2,1,4,1,1,3,1,1,1,1,2,4,1,2,1,2,1,4,2,1,4,1,1,3,1,1,1,1,2,4,1,2,4,1,1,1,3,1,2,3,3,1,1,1,2,quietZoneLength]
    },{
        message: "state B move state A",
        value: "b" + String.fromCharCode(10)+ String.fromCharCode(17),
        expected: [quietZoneLength,2,1,1,2,1,4,1,2,1,4,2,1,3,1,1,1,4,1,1,4,2,2,1,1,1,2,1,1,4,2,1,3,1,1,4,1,2,3,3,1,1,1,2,quietZoneLength]
    },{
        message: "state C move state A",
        value: "0123" + String.fromCharCode(10),
        expected: [quietZoneLength,2,1,1,2,3,2,2,2,2,1,2,2,3,1,2,1,3,1,3,1,1,1,4,1,1,4,2,2,1,1,2,1,2,1,2,3,2,3,3,1,1,1,2,quietZoneLength]
    },{
        message: "state C move state B - digit at the end",
        value: "1012345678" + "9",
        expected: [quietZoneLength, 2, 1, 1, 2, 3, 2, 2, 2, 1, 3, 1, 2, 1, 1, 2, 2, 3, 2, 1, 3, 1, 1, 2, 3, 3, 3, 1, 1, 2, 1, 2, 4, 1, 1, 1, 2, 1, 1, 4, 1, 3, 1, 3, 2, 1, 1, 2, 2, 1, 2, 4, 2, 1, 1, 2, 3, 3, 1, 1, 1, 2, quietZoneLength]
    },{
        message: "state C move state B",
        value: "0123" + "b",
        expected: [quietZoneLength,2,1,1,2,3,2,2,2,2,1,2,2,3,1,2,1,3,1,1,1,4,1,3,1,1,2,1,4,2,1,4,1,1,3,1,1,2,3,3,1,1,1,2,quietZoneLength]
    },{
        message: "state A move state C",
        value: String.fromCharCode(10) + "0123",
        expected: [quietZoneLength,2,1,1,4,1,2,1,4,2,2,1,1,1,1,3,1,4,1,2,2,2,1,2,2,3,1,2,1,3,1,3,1,2,3,1,1,2,3,3,1,1,1,2,quietZoneLength]
    },{
        message: "state B move state C",
        value: "b" + "0123",
        expected: [quietZoneLength,2,1,1,2,1,4,1,2,1,4,2,1,1,1,3,1,4,1,2,2,2,1,2,2,3,1,2,1,3,1,2,1,3,1,1,3,2,3,3,1,1,1,2,quietZoneLength]
    }],
    expectedResultsFNC4Values = [{
        message: "single FNC state A", 
        value: String.fromCharCode(10 + 128),
        expected: [quietZoneLength,2,1,1,4,1,2,3,1,1,1,4,1,1,4,2,2,1,1,1,1,2,3,3,1,2,3,3,1,1,1,2,quietZoneLength]
    },{
        message: "single FNC state B", 
        value: String.fromCharCode(32 + 128),
        expected: [quietZoneLength,2,1,1,2,1,4,1,1,4,1,3,1,2,1,2,2,2,2,3,1,1,1,4,1,2,3,3,1,1,1,2,quietZoneLength]
    },{
        message: "state A single FNC state A", 
        value: String.fromCharCode(10) + String.fromCharCode(10 + 128),
        expected: [quietZoneLength,2,1,1,4,1,2,1,4,2,2,1,1,3,1,1,1,4,1,1,4,2,2,1,1,4,1,1,2,1,2,2,3,3,1,1,1,2,quietZoneLength]
    },{
        message: "state A single FNC state B", 
        value: String.fromCharCode(10) + String.fromCharCode(100 + 128),
        expected: [quietZoneLength, 2, 1, 1, 4, 1, 2, 1, 4, 2, 2, 1, 1, 1, 1, 4, 1, 3, 1, 1, 1, 4, 1, 3, 1, 1, 4, 1, 2, 2, 1, 2, 2, 3, 1, 1, 2, 2, 3, 3, 1, 1, 1, 2, quietZoneLength]
    },{
        message: "FNC A FNC B", 
        value: String.fromCharCode(10 + 128) + String.fromCharCode(100 + 128),
        expected: [quietZoneLength, 2, 1, 1, 4, 1, 2, 3, 1, 1, 1, 4, 1, 1, 4, 2, 2, 1, 1, 1, 1, 4, 1, 3, 1, 1, 1, 4, 1, 3, 1, 1, 4, 1, 2, 2, 1, 2, 1, 3, 1, 3, 1, 2, 3, 3, 1, 1, 1, 2, quietZoneLength]
    },{
        message: "FNC B FNC A", 
        value: String.fromCharCode(100 + 128) + String.fromCharCode(10 + 128),
        expected: [quietZoneLength, 2, 1, 1, 2, 1, 4, 1, 1, 4, 1, 3, 1, 1, 4, 1, 2, 2, 1, 3, 1, 1, 1, 4, 1, 3, 1, 1, 1, 4, 1, 1, 4, 2, 2, 1, 1, 2, 4, 1, 1, 1, 2, 2, 3, 3, 1, 1, 1, 2, quietZoneLength]
    },{
        message: "FNC A FNC B FNC A - FNC block shift a -> b", 
        value: String.fromCharCode(10 + 128) + String.fromCharCode(100 + 128) + String.fromCharCode(10 + 128),
        expected: [quietZoneLength, 2, 1, 1, 4, 1, 2, 3, 1, 1, 1, 4, 1, 3, 1, 1, 1, 4, 1, 1, 4, 2, 2, 1, 1, 4, 1, 1, 3, 1, 1, 1, 4, 1, 2, 2, 1, 1, 4, 2, 2, 1, 1, 2, 1, 3, 1, 3, 1, 2, 3, 3, 1, 1, 1, 2, quietZoneLength]
    },{
        message: "FNC A state A - no move after FNC with same state", 
        value: String.fromCharCode(10 + 128) + String.fromCharCode(10),
        expected: [quietZoneLength, 2, 1, 1, 4, 1, 2, 3, 1, 1, 1, 4, 1, 1, 4, 2, 2, 1, 1, 1, 4, 2, 2, 1, 1, 3, 3, 2, 1, 1, 1, 2, 3, 3, 1, 1, 1, 2, quietZoneLength]
    },{
        message: "FNC A state B - shift after FNC", 
        value: String.fromCharCode(10 + 128) + String.fromCharCode(100),
        expected: [quietZoneLength, 2, 1, 1, 4, 1, 2, 3, 1, 1, 1, 4, 1, 1, 4, 2, 2, 1, 1, 4, 1, 1, 3, 1, 1, 1, 4, 1, 2, 2, 1, 1, 3, 1, 1, 4, 1, 2, 3, 3, 1, 1, 1, 2, quietZoneLength]
    },{
        message: "FNC A state C - move after FNC", 
        value: String.fromCharCode(10 + 128) + "0001",
        expected: [quietZoneLength, 2, 1, 1, 4, 1, 2, 3, 1, 1, 1, 4, 1, 1, 4, 2, 2, 1, 1, 1, 1, 3, 1, 4, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 1, 1, 2, 3, 1, 3, 2, 3, 3, 1, 1, 1, 2, quietZoneLength]
    },{
        message: "FNC B FNC B FNC B state B - no move after FNC block with same state", 
        value: String.fromCharCode(100 + 128) + String.fromCharCode(100 + 128) + String.fromCharCode(100 + 128) + String.fromCharCode(100),
        expected: [quietZoneLength, 2, 1, 1, 2, 1, 4, 1, 1, 4, 1, 3, 1, 1, 1, 4, 1, 3, 1, 1, 4, 1, 2, 2, 1, 1, 4, 1, 2, 2, 1, 1, 4, 1, 2, 2, 1, 1, 1, 4, 1, 3, 1, 1, 1, 4, 1, 3, 1, 1, 4, 1, 2, 2, 1, 4, 1, 3, 1, 1, 1, 2, 3, 3, 1, 1, 1, 2, quietZoneLength]
    }];

    module("code128", {
        setup: function() {
            encoding = new encodings.code128();
        },
        teardown: function(){
            encoding = null;
        }
    });

    test("test code 128 single state values", function() {
        var result, 
            expectedResult;
        for(var i = 0; i < expectedResultsSingleState.length; i++){
           
            result = encoding.encode(expectedResultsSingleState[i].value, 300, 100).pattern;
            expectedResult = expectedResultsSingleState[i].expected;
            
            ok(comparePatterns(result, expectedResult), expectedResultsSingleState[i].message);
        }
    }); 

    test("test code 128 multi state values", function() {
        var result, 
            expectedResult;
        for(var i = 0; i < expectedResultsMultistateValues.length; i++){                      
            result = encoding.encode(expectedResultsMultistateValues[i].value, 300, 100).pattern;
            expectedResult = expectedResultsMultistateValues[i].expected;                      
            ok(comparePatterns(result, expectedResult), expectedResultsMultistateValues[i].message);
        }
    });  

    test("test code 128 FNC4 values", function() {
        var result, 
            expectedResult;
        for(var i = 0; i < expectedResultsFNC4Values.length; i++){
            result = encoding.encode(expectedResultsFNC4Values[i].value, 300, 100).pattern;
            expectedResult = expectedResultsFNC4Values[i].expected;
            
            ok(comparePatterns(result, expectedResult), expectedResultsFNC4Values[i].message);
        }
    });                 

    test("test invalid character error", function() {
        var thrownError = false;
        try{
            encoding.encode("AASaT*" + string.fromCharCode(256), 300, 100);
        }
        catch (ex){
            thrownError = true;
        }
        ok(thrownError);
    });

    test("test base unit calculation", function() {
        var width = 200,
            height = 100,
            value = String.fromCharCode(100 + 128) + String.fromCharCode(100 + 128) + String.fromCharCode(100 + 128) + String.fromCharCode(100),
            result,
            expectedResult = fixed(width / (123 + 2 * quietZoneLength), 2);

            result = encoding.encode(value, width, height).baseUnit;
            equal(fixed(result, 2), expectedResult);
    });

})();
