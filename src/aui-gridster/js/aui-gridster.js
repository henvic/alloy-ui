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
            levels = [],
            counter;

        for (counter = 0; counter < 16; counter += 1) {
            spaces[counter] = counter;
            levels[counter] = 1;
        }

        this.set('spaces', spaces);
        this.set('levels', levels);
    },

    initializer: function() {
        var cells = A.all('#' + this.get('contentBox').get('id') + ' .gridster-cell');

        this.set('cells', cells);

        this.createMap();

        cells.on('mouseover', A.bind(this.mouveOverHandler, this));

        this._eventHandles = [cells];
    },

    destructor: function() {
        (new A.EventHandle(this._eventHandles)).detach();
    },

    updatePosition: function(cell) {
        var adjacents = [],
            spaces = this.get('spaces'),
            levels = this.get('levels'),
            currentNode = this.get('cells').item(cell),
            level,
            first,
            counter;

        for (counter = 0; counter < 16; counter += 1) {
            if (spaces[counter] === cell) {
                adjacents.push(counter);
            }
        }

        if (adjacents.length === 0) {
            currentNode.setStyle('display', 'none');
            levels[cell] = 0;
            return;
        }

        level = Math.sqrt(adjacents.length);

        levels[cell] = level;

        first = Math.min.apply(this, adjacents);

        currentNode.setStyles({
            display: 'block',
            top: (Math.floor(first / 4) * 25) + '%',
            left: (first % 4) * 25 + '%',
            height: (level * 25) + '%',
            width: (level * 25) + '%'
        });
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
