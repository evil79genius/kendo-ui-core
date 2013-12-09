(function() {
    var createTreeView = TreeViewHelpers.fromOptions;
    var treeFromHtml = TreeViewHelpers.fromHtml;

    module("events", TreeViewHelpers.basicModule);

    test("selecting nodes triggers selected event and passes node as argument", function() {
        var selectedArgs;

        createTreeView({
            select: function(e) { selectedArgs = e; },
            dataSource: [ { text: "foo" } ]
        });

        var node = $(".k-item:first", treeview);

        node.find(".k-in").trigger("click");

        ok(selectedArgs);
        equal(selectedArgs.node, node[0]);
    });

    test("clicking expand button triggers expand event", function() {
        var expandArgs;

        createTreeView({
            expand: function(e) { expandArgs = e; },
            dataSource: [
                { text: "foo", items: [
                    { text: "food" }
                ] }
            ]
        });

        $(".k-plus", treeview)
            .trigger("click");

        ok(expandArgs);
        equal(expandArgs.node, $(".k-item")[0]);
    });

    test("clicking collapse button triggers collapse event", function() {
        var collapseArgs;

        createTreeView({
            collapse: function(e) { collapseArgs = e; },
            dataSource: [
                { text: "foo", expanded: true, items: [
                    { text: "food" }
                ] }
            ]
        });

        $(".k-minus", treeview)
            .trigger("click");

        ok(collapseArgs);
        equal(collapseArgs.node, $(".k-item")[0]);
    });

    module("drag & drop", {
        teardown: TreeViewHelpers.destroy
    });

    function moveNode(treeview, sourceText, destinationText) {
        var sourceNode = treeview.findByText(sourceText).find(".k-in:first"),
            destinationNode = treeview.findByText(destinationText).find(".k-in:first"),
            startOffset = sourceNode.offset(),
            endOffset = destinationNode.offset(),
            extend = $.extend,
            sourcePosition = {
                pageX: startOffset.left + 5,
                pageY: startOffset.top + 5,
                relatedTarget: sourceNode[0]
            },
            destinationPosition = {
                pageX: endOffset.left + 5,
                pageY: endOffset.top + 7,
                target: destinationNode[0]
            };

        sourceNode
            .trigger(extend({ type: "mousedown" }, sourcePosition));

        destinationNode
            .trigger(extend({ type: "mousemove" }, destinationPosition))
            .trigger(extend({ type: "mousemove" }, destinationPosition))
            .trigger(extend({ type: "mouseup" }, destinationPosition));
    }

    test("moving node triggers dragstart", function () {
        var dragStartTriggered;

        createTreeView({
            dragAndDrop: true,
            dataSource: [
                { text: "foo", expanded: true, items: [
                    { text: "bar" }
                ] },
                { text: "baz" }
            ],
            dragstart: function(e) { dragStartTriggered = e; }
        });

        moveNode(treeviewObject, "bar", "baz");

        ok(dragStartTriggered);
        equal(treeviewObject.text(dragStartTriggered.sourceNode), "bar");
    });

    test("dragstart can be prevented", function () {
        createTreeView({
            dragAndDrop: true,
            dataSource: [
                { text: "foo", expanded: true, items: [
                    { text: "bar" }
                ] },
                { text: "baz" }
            ],
            dragstart: function(e) { e.preventDefault(); }
        });

        moveNode(treeviewObject, "bar", "baz");

        equal(treeviewObject.text(treeviewObject.findByText("bar").parent().closest(".k-item")), "foo");
    });

    test("moving node triggers drag", function () {
        var dragTriggered;

        createTreeView({
            dragAndDrop: true,
            dataSource: [
                { text: "foo", expanded: true, items: [
                    { text: "bar" }
                ] },
                { text: "baz" }
            ],
            drag: function(e) { dragTriggered = e; }
        });

        moveNode(treeviewObject, "bar", "baz");

        ok(dragTriggered);
        equal(treeviewObject.text(dragTriggered.sourceNode), "bar");
        ok(dragTriggered.setStatusClass);
        equal(dragTriggered.statusClass, "add");
        ok(dragTriggered.pageX);
        ok(dragTriggered.pageY);
    });

    test("moving node triggers drop", function () {
        var dropTriggered;

        createTreeView({
            dragAndDrop: true,
            dataSource: [
                { text: "foo", expanded: true, items: [
                    { text: "bar" }
                ] },
                { text: "baz" }
            ],
            drop: function(e) { dropTriggered = e; }
        });

        moveNode(treeviewObject, "bar", "baz");

        ok(dropTriggered);
        equal(treeviewObject.text(dropTriggered.sourceNode), "bar");
        equal(dropTriggered.destinationNode, treeviewObject.findByText("baz")[0]);
        ok(dropTriggered.valid);
        equal(dropTriggered.dropPosition, "over");
    });

    test("drop event setValid sets event valid state", 1, function () {
        createTreeView({
            dragAndDrop: true,
            dataSource: [
                { text: "foo" },
                { text: "bar" }
            ],
            drop: function(e) {
                e.setValid(false);

                ok(!e.valid);
            }
        });

        moveNode(treeviewObject, "foo", "bar");
    });

    test("moving node triggers dragstart/drag/drop/dragend", function () {
        var dragEndTriggered;

        createTreeView({
            dragAndDrop: true,
            dataSource: [
                { text: "foo", expanded: true, items: [
                    { text: "bar" }
                ] },
                { text: "baz" }
            ],
            dragend: function(e) { dragEndTriggered = e; }
        });

        moveNode(treeviewObject, "bar", "baz");

        ok(dragEndTriggered);
        equal(treeviewObject.text(dragEndTriggered.sourceNode), "bar");
        equal(dragEndTriggered.destinationNode, treeviewObject.findByText("baz")[0]);
        equal(dragEndTriggered.dropPosition, "over");
        equal(dragEndTriggered.sourceNode, treeviewObject.findByText("bar")[0]);
    });

    test("drop event can be cancelled", function() {
        createTreeView({
            dragAndDrop: true,
            dataSource: [
                { text: "foo", expanded: true, items: [
                    { text: "bar" }
                ] },
                { text: "baz" }
            ],
            drop: function(e) {
                ok(e.preventDefault);
                e.preventDefault();
            }
        });

        moveNode(treeviewObject, "bar", "baz");

        equal(treeviewObject.findByText("foo").find(".k-group").length, 1);
        equal(treeviewObject.findByText("baz").find(".k-group").length, 0);
   });

   test("initialization of expanded nodes does not trigger expand events", function() {
       var triggered = false;

       createTreeView({
            dataSource: [
                { text: "foo", expanded: true, items: [
                    { text: "bar" }
                ] }
            ],
            expand: function() {
                triggered = true;
            }
        });

        ok(!triggered);
   });

   test("setting Node.loaded to false allows nodes to be refreshed", function() {
       var calls = 0;

       createTreeView({
           animation: false,
           dataSource: {
               data: [
                   { text: "foo" }
               ],
               schema: {
                   model: {
                       hasChildren: true,
                       children: {
                           transport: {
                               read: function(options) {
                                   calls++;
                                   options.success([ { text: "bar" } ]);
                               }
                           }
                       }
                   }
               }
            },
            expand: function(e) {
                this.dataItem(e.node).loaded(false);
            }
        });

        treeviewObject.expand(".k-item:first");
        treeviewObject.collapse(".k-item:first");
        treeviewObject.expand(".k-item:first");

        equal(calls, 2);
   });

   test("dataBound event is triggered after dataSource changes", function() {
       var calls = 0,
           args;

       createTreeView({
           dataSource: {
               transport: {
                   read: function(options) {
                       options.success([ { text: "foo" } ]);
                   }
               }
           },
           dataBound: function(e) {
               calls++;
               args = e;
           }
       });

       equal(calls, 1);
       ok(args);
       ok(typeof args.node == "undefined");
   });

   test("dataBound event is triggered from sublevel", function() {
       var calls = 0,
           args;

       createTreeView({
           dataSource: {
               transport: {
                   read: function(options) {
                       options.success([ { text: "foo", hasChildren: true } ]);
                   }
               }
           },
           dataBound: function(e) {
               calls++;
               args = e;
           }
       });

       treeviewObject.expand(".k-item");

       equal(calls, 2);
       ok(args.node.is(treeview.find(".k-item:first")));
   });

   test("selecting an item triggers change event", 1, function() {
       createTreeView({
           dataSource: [
               { text: "foo" }
           ],
           change: function() {
               ok(true);
           }
       });

       treeview.find(".k-in").trigger("click");
   });

   asyncTest("moving node to unfetched parent triggers dragend when the source node is available", 2, function () {
       var timeout = setTimeout(start, 3000);
       var calls = 0;

       createTreeView({
           dragAndDrop: true,
           dataSource: {
               transport: {
                   read: function(options) {
                       calls++;
                       if (calls == 1) {
                           options.success([ { text: "foo", hasChildren: true }, { text: "bar" } ]);
                       } else {
                           setTimeout(function() {
                               options.success([ { text: "baz" } ]);
                           }, 10);
                       }
                   }
               }
           },
           dragend: function(e) {
               clearTimeout(timeout);
               start();

               ok(e.sourceNode);
               equal(treeviewObject.text(e.sourceNode), "bar");
           }
       });

       moveNode(treeviewObject, "bar", "foo");
   });
})();
