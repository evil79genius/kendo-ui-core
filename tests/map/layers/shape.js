(function() {
    var dataviz = kendo.dataviz,
        g = dataviz.geometry,
        d = dataviz.drawing,

        map = dataviz.map,
        ShapeLayer = map.layers.ShapeLayer,
        Location = map.Location;

    (function() {
        var map;
        var layer;
        var pointData = [{
            "type": "Point",
            "coordinates": [-105.01621, 39.57422]
        }];

        // ------------------------------------------------------------
        module("Shape Layer / Markers", {
            setup: function() {
                map = new MapMock();
                map.markers = { add: $.noop };
                layer = new ShapeLayer(map);
            }
        });

        test("adds marker when parsing points", function() {
            map.markers = {
                add: function() { ok(true); }
            };

            layer._load(pointData);
        });

        test("removes old markers on _load", function() {
            map.markers.remove = function() { ok(true); }

            layer._load(pointData);
            layer._load(pointData);
        });

        test("sets default marker options", function() {
            map.options.markerDefaults = { foo: true };

            map.markers = {
                add: function(marker) { ok(marker.options.foo); }
            };

            layer._load(pointData);
        });

        test("sets marker location", function() {
            map.markers = {
                add: function(marker) {
                    deepEqual(marker.options.location, [39.57422, -105.01621]);
                }
            };

            layer._load(pointData);
        });

        test("sets marker dataItem", function() {
            map.markers = {
                add: function(marker) {
                    deepEqual(marker.dataItem, pointData[0]);
                }
            };

            layer._load(pointData);
        });

        test("does not add marker when markerCreated is cancelled", 0, function() {
            map.markers = {
                add: function() { ok(false); }
            };
            map.bind("markerCreated", function(e) { e.preventDefault(); });

            layer._load(pointData);
        });

        test("adds circle when markerCreated is cancelled", function() {
            map.bind("markerCreated", function(e) { e.preventDefault(); });

            layer.surface.draw = function(shape) {
                ok(shape instanceof d.Circle);
            };

            layer._load(pointData);
        });

        test("does not add circle when markerCreated and shapeCreated are cancelled", 0, function() {
            map.bind("markerCreated", function(e) { e.preventDefault(); });
            map.bind("shapeCreated", function(e) { e.preventDefault(); });

            layer.surface.draw = function(shape) {
                ok(false);
            };

            layer._load(pointData);
        });

        test("triggers markerCreated on map", function() {
            map.bind("markerCreated", function() { ok(true); });

            layer._load(pointData);
        });

        test("does not trigger shapeCreated on map", 0, function() {
            map.bind("shapeCreated", function() { ok(false); });

            layer._load(pointData);
        });

        test("triggers shapeCreated on map if markerCreated is cancelled", function() {
            map.bind("markerCreated", function(e) { e.preventDefault(); });
            map.bind("shapeCreated", function() { ok(true); });

            layer._load(pointData);
        });
    })();
})();
