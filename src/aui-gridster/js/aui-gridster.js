/**
 * The Gridster Utility
 *
 * @module aui-gridster
 */

/**
 * A base class for Gridster
 *
 * Check the [live demo](http://alloyui.com/examples/gridster/).
 *
 * @class A.Gridster
 * @extends Base
 * @param {Object} config Object literal specifying widget configuration
 *     properties.
 * @constructor
 */

A.Gridster = A.Base.create('gridster', A.Widget, [], {
    createMap: function() {
        var spaces = [],
            counter;

        for (counter = 0; counter < 16; counter += 1) {
            spaces[counter] = counter;
        }

        this.set('spaces', spaces);
    },

    initializer: function() {
        var cellsNodeList = A.all('#' + this.get('contentBox').get('id') + ' .gridster-cell'),
            cells = cellsNodeList._nodes;

        this.set('cells', cells);

        this.createMap();

        this._eventHandles = [cellsNodeList];
    },

    destructor: function() {
        (new A.EventHandle(this._eventHandles)).detach();
    },

    updatePosition: function(cell) {
        var adjacents = [],
            spaces = this.get('spaces'),
            nodes = this.get('cells'),
            currentNode = nodes[cell],
            notDisplayedClassName = 'gridster-cell-hidden',
            level,
            first,
            counter;

        for (counter = 0; counter < 16; counter += 1) {
            if (spaces[counter] === cell) {
                adjacents.push(counter);
            }
        }

        if (adjacents.length === 0) {
            currentNode.classList.add(notDisplayedClassName);
            return;
        }

        level = Math.sqrt(adjacents.length);

        first = Math.min.apply(this, adjacents);

        currentNode.classList.remove(notDisplayedClassName);

        currentNode.style.top = (Math.floor(first / 4) * 25) + '%';
        currentNode.style.left = (first % 4) * 25 + '%';
        currentNode.style.height = (level * 25) + '%';
        currentNode.style.width = (level * 25) + '%';
    },

    updatePositions: function() {
        var counter;

        for (counter = 0; counter < 16; counter += 1) {
            this.updatePosition(counter);
        }
    },

    renderUI: function() {
        this.updatePositions();
    }
}, {
    /**
     * Static property provides a string to identify the CSS prefix.
     *
     * @property CSS_PREFIX
     * @type String
     * @static
     */
    CSS_PREFIX: 'gridster',

    /**
     * Static property used to define the default attribute
     * configuration for the `A.Gridster`.
     *
     * @property ATTRS
     * @type Object
     * @static
     */
    ATTRS: {
    }
});
