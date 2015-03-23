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
    TPL_CONTROLLER_ARROWS: '<div class="gridster-controller-arrows">' +
                '<button data-direction="SouthEast">SE</button>' +
                '<button data-direction="SouthWest">SW</button>' +
                '<button data-direction="NorthEast">NE</button>' +
                '<button data-direction="NorthWest">NW</button></div>',

    BUTTON_SIZE: 5,

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

    _moveArrowToCell: function(arrow, cell) {
        var direction = arrow.getData('direction'),
            method = '_move' + direction + 'ArrowToCell';

        this[method](arrow, cell);
    },

    _moveNorthEastArrowToCell: function(arrow, cell) {
        var currentNode = this.get('cells').item(cell);

        arrow.setStyles({
            'display': 'block',
            'top': currentNode.getStyle('top'),
            'left': (
            A.Number.parse(currentNode.getStyle('left').slice(0, -1)) +
            A.Number.parse(currentNode.getStyle('width').slice(0, -1)) -
            this.BUTTON_SIZE) + '%'
        });
    },

    _moveNorthWestArrowToCell: function(arrow, cell) {
        var currentNode = this.get('cells').item(cell);

        arrow.setStyles({
            'display': 'block',
            'top': currentNode.getStyle('top'),
            'left': currentNode.getStyle('left')
        });
    },

    _moveSouthEastArrowToCell: function(arrow, cell) {
        var currentNode = this.get('cells').item(cell);

        arrow.setStyles({
            'display': 'block',
            'top': (
                A.Number.parse(currentNode.getStyle('top').slice(0, -1)) +
                A.Number.parse(currentNode.getStyle('height').slice(0, -1)) -
                this.BUTTON_SIZE) + '%',
            'left': (
                A.Number.parse(currentNode.getStyle('left').slice(0, -1)) +
                A.Number.parse(currentNode.getStyle('width').slice(0, -1)) -
                this.BUTTON_SIZE) + '%'
        });
    },

    _moveSouthWestArrowToCell: function(arrow, cell) {
        var currentNode = this.get('cells').item(cell);

        arrow.setStyles({
            'display': 'block',
            'top': (
                A.Number.parse(currentNode.getStyle('top').slice(0, -1)) +
                A.Number.parse(currentNode.getStyle('height').slice(0, -1)) -
                this.BUTTON_SIZE) + '%',
            'left': currentNode.getStyle('left')
        });
    },

    moveControllerToCell: function(cell) {
        var arrows = this.get('arrows');

        arrows.each(function(arrow) {
            this._moveArrowToCell(arrow, cell);
        }, this);

        this.fire('controller-moved');
    },

    hideControllers: function() {
        var arrows = this.get('arrows');

        arrows.setStyle('display', 'none');
    },

    mouseOverCellHandler: function(event) {
        var target = event.target,
            parentNode = target.get('parentNode'),
            children = parentNode.get('children'),
            index = children.indexOf(target);

        this.moveControllerToCell(index);
    },

    mouseLeaveGridsterHandler: function() {
        this.hideControllers();
    },

    initializer: function() {
        var boundingBox = this.get('boundingBox'),
            boundingBoxId = '#' + boundingBox.get('id'),
            cells = A.all(boundingBoxId + ' .gridster-content .gridster-cell'),
            controllerNode = this.get('boundingBox').appendChild(this.TPL_CONTROLLER_ARROWS),
            arrows;

        this.set('controllerNode', controllerNode);

        arrows = A.all(boundingBoxId + ' .gridster-controller-arrows button');

        this.set('cells', cells);

        this.createMap();

        this.set('arrows', arrows);

        cells.on('mouseover', A.bind(this.mouseOverCellHandler, this));

        boundingBox.on('mouseleave', A.bind(this.mouseLeaveGridsterHandler, this), this);

        this._eventHandles = [cells, arrows];
    },

    destructor: function() {
        (new A.EventHandle(this._eventHandles)).detach();
        this.get('boundingBox').removeChild(this.get('controllerNode'));
    },

    _updatePosition: function(cell) {
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
            this._updatePosition(counter);
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
