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

            gridster.on('controller-moved', function() {
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

        'should have arrows to all 4 directions': function() {
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

            Assert.areSame(amount, 4, 'Amount of directions');

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
                    NorthWest: false
                };

            cell.simulate('mouseover');

            function verify(arrow) {
                var direction = arrow.getData('direction'),
                    expected = expectedSet[direction],
                    display = false;

                if (arrow.getStyle('display') !== 'none') {
                    display = true;
                }

                Assert.areSame(expected, display, direction + ' arrow should be displayed: ' + expected);
            }

            arrows.each(verify, this);
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
