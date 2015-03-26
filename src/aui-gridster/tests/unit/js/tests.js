YUI.add('aui-gridster-tests', function(Y) {

    var Assert = Y.Assert,
        suite = new Y.Test.Suite('aui-gridster'),
        gridster;

    suite.add(new Y.Test.Case({
        name: 'gridster',

        setUp: function() {
            gridster = new Y.Gridster({
                boundingBox: '#gridster'
            }).render();
        },

        tearDown: function() {
            gridster.destructor();
            gridster = null;
        },

        'should update to grid with three large blocks positioned': function() {
            var cells = gridster.get('cells'),
                spaces = gridster.get('spaces'),
                levels = gridster.get('levels'),
                expectedSet,
                pos;

            spaces[15] = 11;
            spaces[14] = 11;
            spaces[10] = 11;

            spaces[4] = 5;
            spaces[8] = 5;
            spaces[9] = 5;

            spaces[2] = 7;
            spaces[3] = 7;
            spaces[6] = 7;

            gridster.updatePositions();

            // block cell: [top, left, height, width, level]
            // hidden cell: undefined

            expectedSet = [
                ['0%', '0%', '25%', '25%', 1],
                ['0%', '25%', '25%', '25%', 1],
                undefined,
                undefined,
                undefined,
                ['25%', '0%', '50%', '50%', 2],
                undefined,
                ['0%', '50%', '50%', '50%', 2],
                undefined,
                undefined,
                undefined,
                ['50%', '50%', '50%', '50%', 2],
                ['75%', '0%', '25%', '25%', 1],
                ['75%', '25%', '25%', '25%', 1],
                undefined,
                undefined
            ];

            function testCell(number) {
                var expected = expectedSet[number],
                    cell = cells.item(number),
                    level = levels[number],
                    computedStyle = window.getComputedStyle(cell.getDOMNode());

                if (!expected) {
                    Assert.areSame('none', computedStyle.display, 'display for position ' + number);
                    Assert.areSame(0, level);
                    return;
                }

                Assert.areSame('block', computedStyle.display, 'display for position ' + number);
                Assert.areSame(expected[0], cell.getStyle('top'), 'top for position ' + number);
                Assert.areSame(expected[1], cell.getStyle('left'), 'left for position ' + number);
                Assert.areSame(expected[2], cell.getStyle('height'), 'height for position ' + number);
                Assert.areSame(expected[3], cell.getStyle('width'), 'width for position ' + number);
                Assert.areSame(expected[4], level);
            }

            for (pos = 0; pos < 16; pos += 1) {
                testCell(pos);
            }
        },

        'should have only base / small blocks positioned': function() {
            var cells = gridster.get('cells'),
                expectedSet,
                pos;

            // cell: [top, left, height, width]

            expectedSet = [
                ['0%', '0%', '25%', '25%'],
                ['0%', '25%', '25%', '25%'],
                ['0%', '50%', '25%', '25%'],
                ['0%', '75%', '25%', '25%'],
                ['25%', '0%', '25%', '25%'],
                ['25%', '25%', '25%', '25%'],
                ['25%', '50%', '25%', '25%'],
                ['25%', '75%', '25%', '25%'],
                ['50%', '0%', '25%', '25%'],
                ['50%', '25%', '25%', '25%'],
                ['50%', '50%', '25%', '25%'],
                ['50%', '75%', '25%', '25%'],
                ['75%', '0%', '25%', '25%'],
                ['75%', '25%', '25%', '25%'],
                ['75%', '50%', '25%', '25%'],
                ['75%', '75%', '25%', '25%']
            ];

            function testCell (number) {
                var expected = expectedSet[number],
                    cell = cells.item(number),
                    computedStyle = window.getComputedStyle(cell.getDOMNode());

                Assert.areSame('block', computedStyle.display, 'display for position ' + number);
                Assert.areSame(expected[0], cell.getStyle('top'), 'top for position ' + number);
                Assert.areSame(expected[1], cell.getStyle('left'), 'left for position ' + number);
                Assert.areSame(expected[2], cell.getStyle('height'), 'height for position ' + number);
                Assert.areSame(expected[3], cell.getStyle('width'), 'width for position ' + number);
            }

            for (pos = 0; pos < 16; pos += 1) {
                testCell(pos);
            }
        },

        'should listen to mouse over cell event': function() {
            var cell = gridster.get('cells').item(8),
                moved;

            gridster.once('controller-sync', function() {
                moved = true;
            });

            cell.simulate('mouseover');

            Assert.isTrue(moved, 'Controller movement fired.');
        },

        'should listen to mouse leaving gridster': function() {
            gridster.get('boundingBox').simulate('mouseout');
        },

        'should have arrows as NodeList': function() {
            Assert.isTrue(gridster.get('arrows') instanceof Y.NodeList);
        },

        'should have arrows for all 4 directions and 1 reset': function() {
            var directions,
                arrows = gridster.get('arrows'),
                amount = 0,
                key;

            directions = {
                SouthEast: false,
                SouthWest: false,
                NorthEast: false,
                NorthWest: false
            };

            arrows.each(function(arrow) {
                directions[arrow.getData('direction')] = true;
                amount += 1;
            });

            Assert.areSame(amount, 5, 'Amount of buttons');

            for (key in directions) {
                if (directions.hasOwnProperty(key)) {
                    Assert.isTrue(directions[key]);
                }
            }
        },

        'should have arrows to the SE only for the 0th cell': function() {
            var arrows = gridster.get('arrows'),
                cell = gridster.get('cells').item(0),
                expectedSet = {
                    SouthEast: true,
                    SouthWest: false,
                    NorthEast: false,
                    NorthWest: false,
                    Break: false
                };

            cell.simulate('mouseover');

            function verify(arrow) {
                var direction = arrow.getData('direction'),
                    expected = expectedSet[direction],
                    display = false;

                if (arrow.getStyle('display') !== 'none') {
                    display = true;
                }

                Assert.areSame(expected, display,
                    direction + ' arrow should be displayed: ' + expected + ' for cell ' + cell);
            }

            arrows.each(verify, this);
        },

        'should have arrows limited by the edge boundaries and breaks': function() {
            var spaces = gridster.get('spaces'),
                arrows = gridster.get('arrows'),
                cells = gridster.get('cells'),
                cell,
                arrowsCellSet,
                arrowsExpectedPos;

            spaces[15] = 11;
            spaces[14] = 11;
            spaces[10] = 11;

            spaces[4] = 5;
            spaces[8] = 5;
            spaces[9] = 5;

            spaces[2] = 7;
            spaces[3] = 7;
            spaces[6] = 7;

            gridster.updatePositions();

            arrowsCellSet = {
                SouthEast: [0, 1, 5],
                SouthWest: [1, 7],
                NorthEast: [5, 12, 13],
                NorthWest: [11, 13],
                Break: [5, 7, 11]
            };


            arrowsExpectedPos = {
                SouthEast: {
                    0: {
                        top: '20%',
                        left: '20%'
                    },
                    1: {
                        top: '20%',
                        left: '45%'
                    },
                    5: {
                        top: '70%',
                        left: '45%'
                    }
                },
                SouthWest: {
                    1: {
                        top: '20%',
                        left: '25%'
                    },
                    7: {
                        top: '50%',
                        left: '50%'
                    }
                },
                NorthEast: {
                    5: {
                        top: '25%',
                        left: '50%'
                    },
                    12: {
                        top: '75%',
                        left: '25%'
                    },
                    13: {
                        top: '75%',
                        left: '50%'
                    }
                },
                NorthWest: {
                    11: {
                        top: '50%',
                        left: '50%'
                    },
                    13: {
                        top: '75%',
                        left: '25%'
                    }
                },
                Break: {
                    5: {
                        top: '47.5%',
                        left: '22.5%'
                    },
                    7: {
                        top: '22.5%',
                        left: '72.5%'
                    },
                    11: {
                        top: '72.5%',
                        left: '72.5%'
                    }
                }
            };

            function verify(arrow) {
                var direction = arrow.getData('direction'),
                    expectDisplay = arrowsCellSet[direction].indexOf(cell) !== -1,
                    position = arrowsExpectedPos[direction][cell],
                    display = false;

                if (arrow.getStyle('display') !== 'none') {
                    display = true;
                }

                Assert.areSame(expectDisplay, display,
                    direction + ' arrow displayed: ' + expectDisplay + ' for cell ' + cell);

                if (!display) {
                    return;
                }

                Assert.areSame(position.top, arrow.getStyle('top'),
                    direction + ' point top position for cell ' + cell);

                Assert.areSame(position.left, arrow.getStyle('left'),
                    direction + ' point left position for cell ' + cell);
            }

            for (cell = 0; cell < 16; cell += 1) {
                cells.item(cell).simulate('mouseover');
                arrows.each(verify, this);
            }
        },

        'should have arrows limited by the edge boundaries': function() {
            var arrows = gridster.get('arrows'),
                cells = gridster.get('cells'),
                cell,
                expectedSet = {
                    SouthEast: [0, 1, 2, 4, 5, 6, 8, 9, 10],
                    SouthWest: [1, 2, 3, 5, 6, 7, 9, 10, 11],
                    NorthEast: [4, 5, 6, 8, 9, 10, 12, 13, 14],
                    NorthWest: [5, 6, 7, 9, 10, 11, 13, 14, 15],
                    Break: []
                };

            function verify(arrow) {
                var direction = arrow.getData('direction'),
                    expected = expectedSet[direction].indexOf(cell) !== -1,
                    display = false;

                if (arrow.getStyle('display') !== 'none') {
                    display = true;
                }

                Assert.areSame(expected, display,
                    direction + ' arrow should be displayed: ' + expected + ' for cell ' + cell);
            }

            for (cell = 0; cell < 16; cell += 1) {
                cells.item(cell).simulate('mouseover');
                arrows.each(verify, this);
            }
        },

        'should hide arrows if active cell is in hidden state': function() {
            var spaces = gridster.get('spaces'),
                arrows = gridster.get('arrows');

                spaces[6] = 5;
                spaces[9] = 5;
                spaces[10] = 5;

                gridster.updatePositions();

                gridster.syncControllerToCell(6);

                Assert.isTrue(Y.Array.every(arrows.getStyle('display'), function(actual) {
                    return actual === 'none';
                }), 'Arrows should not be displayed on top of not visible cell');
        },

        'should get groupings': function() {
            var spaces = gridster.get('spaces'),
                groupings = [
                    [0], [1], [], [],
                    [], [4, 5, 8, 9],
                    [], [2, 3, 6, 7], [], [], [],
                    [10, 11, 14, 15],
                    [12], [13], [], []
                ],
                counter;

            spaces[15] = 11;
            spaces[14] = 11;
            spaces[10] = 11;

            spaces[4] = 5;
            spaces[8] = 5;
            spaces[9] = 5;

            spaces[2] = 7;
            spaces[3] = 7;
            spaces[6] = 7;

            gridster.updatePositions();

            function areSameArray(expected, actual) {
                Assert.areSame(expected.length, actual.length);
                Assert.isTrue(actual.every(function(element, index) {
                    return element === expected[index];
                }));
            }

            for (counter = 0; counter < 16; counter += 1) {
                areSameArray(groupings[counter], gridster.getGrouping(counter));
            }
        },

        'should break bricks with area larger than one': function() {
            var spaces = gridster.get('spaces'),
                grouping,
                groupings = [
                    [0], [1], [2], [3], [],
                    [4, 5, 8, 9],
                    [6], [7], [], [], [],
                    [10, 11, 14, 15],
                    [12], [13], [], []
                ],
                counter;

            spaces[15] = 11;
            spaces[14] = 11;
            spaces[10] = 11;

            spaces[4] = 5;
            spaces[8] = 5;
            spaces[9] = 5;

            spaces[2] = 7;
            spaces[3] = 7;
            spaces[6] = 7;


            gridster.updatePositions();

            grouping = gridster.getGrouping(7);

            Assert.areSame(4, grouping.length);

            gridster.breakBrick(7);

            grouping = gridster.getGrouping(7);

            Assert.areSame(1, grouping.length);
            Assert.areSame(7, grouping[0]);

            function areSameArray(expected, actual) {
                Assert.areSame(expected.length, actual.length);
                Assert.isTrue(actual.every(function(element, index) {
                    return element === expected[index];
                }));
            }

            for (counter = 0; counter < 16; counter += 1) {
                areSameArray(groupings[counter], gridster.getGrouping(counter));
            }
        },

        'should remove controller node on gridster destruction': function() {
            var controllerNode = gridster.get('controllerNode');

            gridster.destructor();

            Assert.isNull(controllerNode.get('parentNode'));
            Assert.isNull(Y.one('.gridster-controller-arrows'));

            // avoid error message due to invoking destructor at teardown also
            gridster = new Y.Gridster({
                boundingBox: '#gridster'
            }).render();
        }
    }));

    Y.Test.Runner.add(suite);

}, '', {
    requires: ['test', 'aui-gridster', 'node-screen', 'node-event-simulate']
});
