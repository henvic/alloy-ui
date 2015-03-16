YUI.add('aui-gridster-tests', function(Y) {

    var Assert = Y.Assert,
        suite = new Y.Test.Suite('aui-gridster'),
        gridster;

    suite.add(new Y.Test.Case({
        name: 'gridster',

        setUp: function() {
            gridster = new Y.Gridster({
                boundingBox: '#gridster',
                contentBox: '#gridster .gridster-content'
            }).render();
        },

        tearDown: function() {
            gridster.destructor();
            gridster = null;
        },

        'should be positioned at the proper places': function() {
            var cells = gridster.get('cells'),
                spaces = gridster.get('spaces'),
                expectedSet;

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

            // block cell: [top, left, height, width]
            // hidden cell: undefined

            expectedSet = [
                ['0%', '0%', '25%', '25%'],
                ['0%', '25%', '25%', '25%'],
                undefined,
                undefined,
                undefined,
                ['25%', '0%', '50%', '50%'],
                undefined,
                ['0%', '50%', '50%', '50%'],
                undefined,
                undefined,
                undefined,
                ['50%', '50%', '50%', '50%'],
                ['75%', '0%', '25%', '25%'],
                ['75%', '25%', '25%', '25%'],
                undefined,
                undefined
            ];

            cells.forEach(function(cell) {
                var number = cell.getAttribute('data-cell'),
                    expected = expectedSet[number],
                    computedStyle = window.getComputedStyle(cell);

                if (!expected) {
                    Assert.areSame('none', computedStyle.display, 'display for position ' + number);
                    return;
                }

                Assert.areSame('block', computedStyle.display, 'display for position ' + number);
                Assert.areSame(expected[0], cell.style.top, 'top for position ' + number);
                Assert.areSame(expected[1], cell.style.left, 'left for position ' + number);
                Assert.areSame(expected[2], cell.style.height, 'height for position ' + number);
                Assert.areSame(expected[3], cell.style.width, 'width for position ' + number);
            });
        }
    }));

    Y.Test.Runner.add(suite);

}, '', {
    requires: ['test', 'aui-gridster', 'node-screen']
});
