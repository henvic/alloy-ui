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
                '<button data-direction="NorthWest">NW</button>' +
                '<button data-direction="Break">BK</button></div>',

    BUTTON_SIZE: 5,

    _createLevels: function() {
        var spaces = this.get('spaces'),
            levels = [],
            counter;

        for (counter = 0; counter < 16; counter += 1) {
            levels[counter] = 0;
        }

        for (counter = 0; counter < 16; counter += 1) {
            levels[spaces[counter]] += 1;
        }

        this.set('levels', levels);
    },

    getGrouping: function(cell) {
        var spaces = this.get('spaces'),
            counter,
            adjacents = [];

        for (counter = 0; counter < 16; counter += 1) {
            if (spaces[counter] === cell) {
                adjacents.push(counter);
            }
        }

        return adjacents;
    },

    breakBrick: function(cell) {
        var spaces = this.get('spaces'),
            levels = this.get('levels'),
            counter;

        for (counter = 0; counter < 16; counter += 1) {
            if (spaces[counter] === cell) {
                spaces[counter] = counter;
                levels[counter] = 1;
            }
        }

        this.updatePositions();
    },

    isCellEmpty: function(cell) {
        var currentNode = this.get('cells').item(cell);

        return currentNode.getHTML() === '';
    },

    isCellAvailable: function(cell) {
        var spaces = this.get('spaces');

        return this.isCellEmpty(spaces[cell]);
    },

    _isAdjacentCellAvailableLeft: function(cell, diagonalShown, counter) {
        var a = cell + counter,
            b = diagonalShown - counter;

        return !((a <= 15 && !this.isCellAvailable(a)) ||
            (cell >= 0 && !this.isCellAvailable(b)));
    },

    _isAdjacentCellAvailableRight: function(cell, diagonalShown, counter) {
        var a = cell - counter,
            b = diagonalShown + counter;

        return !((a >= 0 && !this.isCellAvailable(a)) ||
            (b <= 15 && !this.isCellAvailable(b)));
    },

    _isAdjacentCellAvailableTop: function(cell, diagonalShown, counter) {
        var a = cell + (4 * counter),
            b = diagonalShown - (4 * counter);

        return !((a <= 15 && !this.isCellAvailable(a)) ||
            (b >= 0 && !this.isCellAvailable(b)));
    },

    _isAdjacentCellAvailableBottom: function(cell, diagonalShown, counter) {
        var a = cell - (4 * counter),
            b = diagonalShown + (4 * counter);

        return !((a >= 0 && !this.isCellAvailable(a)) ||
            (b <= 15 && !this.isCellAvailable(b)));
    },

    _areAdjacentCellsAvailable: function(cell, diagonal, level, dirX, dirY) {
        var spaces = this.get('spaces'),
            methodX = '_isAdjacentCellAvailable' + dirX,
            methodY = '_isAdjacentCellAvailable' + dirY,
            counter;

        if (!this.isCellAvailable(spaces[diagonal])) {
            return false;
        }

        for (counter = 1; counter <= level; counter += 1) {
            if (!this[methodX](cell, spaces[diagonal], counter) ||
                !this[methodY](cell, spaces[diagonal], counter)) {
                return false;
            }
        }

        return true;
    },

    _verifyNorthBoundaryCell: function(cell) {
        return Math.floor(cell / 4) === 0;
    },

    _verifySouthBoundaryCell: function(cell) {
        return Math.floor(cell / 4) === 3;
    },

    _verifyWestBoundaryCell: function(cell) {
        return (cell % 4 === 0);
    },

    _verifyEastBoundaryCell: function(cell) {
        return cell % 4 === 3;
    },

    _verifyBoundary: function(direction, vector, cells) {
        if (direction.indexOf(vector) === -1) {
            return false;
        }

        return cells.some(this['_verify' + vector + 'BoundaryCell']);
    },

    _verifyBoundaries: function(direction, grouping) {
        return ['North', 'South', 'West', 'East'].some(function(vector) {
            return this._verifyBoundary(direction, vector, grouping);
        }, this);
    },

    _verifyDirection: function(cell, diagonal, level, dirX, dirY) {
        return (diagonal < 0 || diagonal > 15 ||
            !this._areAdjacentCellsAvailable(cell, diagonal, level, dirX, dirY));
    },

    _syncArrowToCell: function(arrow, cell) {
        var direction = arrow.getData('direction'),
            level = this.get('levels')[cell],
            currentNode = this.get('cells').item(cell),
            grouping = this.getGrouping(cell),
            directions,
            opt;

        directions = {
            SouthEast: [grouping[grouping.length - 1] + 5, 'Left', 'Top'],
            SouthWest: [grouping[[0, 2, 6][level - 1]] + 3, 'Right', 'Top'],
            NorthEast: [grouping[level - 1] - 3, 'Left', 'Bottom'],
            NorthWest: [grouping[0] - 5, 'Right', 'Bottom']
        };

        if ((currentNode.getStyle('display') === 'none') ||
            this._verifyBoundaries(direction, grouping) ||
            (direction === 'Break' && level < 2)) {
            this._hideArrow(arrow);
            return;
        }

        opt = directions[direction];

        if (direction !== 'Break' && this._verifyDirection(cell, opt[0], level, opt[1], opt[2])) {
            this._hideArrow(arrow);
            return;
        }

        this._moveArrowToCell(arrow, cell);
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

    _moveBreakArrowToCell: function(arrow, cell) {
        var currentNode = this.get('cells').item(cell);

        arrow.setStyles({
            'display': 'block',
            'top': (
                A.Number.parse(currentNode.getStyle('top').slice(0, -1)) +
                (A.Number.parse(currentNode.getStyle('height').slice(0, -1)) * 0.55) -
                this.BUTTON_SIZE) + '%',
            'left': (
                A.Number.parse(currentNode.getStyle('left').slice(0, -1)) +
                (A.Number.parse(currentNode.getStyle('width').slice(0, -1)) * 0.55) -
                this.BUTTON_SIZE) + '%'
        });
    },

    syncControllerToCell: function(cell) {
        var arrows = this.get('arrows');

        this.set('controllerCell', cell);

        arrows.each(function(arrow) {
            this._syncArrowToCell(arrow, cell);
        }, this);

        this.fire('controller-sync');
    },

    _hideArrow: function(arrow) {
        arrow.setStyle('display', 'none');
    },

    hideControllers: function() {
        var arrows = this.get('arrows');

        arrows.setStyle('display', 'none');
    },

    mouseOverCellHandler: function(event) {
        var target,
            parentNode,
            children,
            index;

        if (!this.get('showController')) {
            return;
        }

        target = event.target;
        parentNode = target.get('parentNode');
        children = parentNode.get('children');
        index = children.indexOf(target);

        this.syncControllerToCell(index);
    },

    mouseLeaveGridsterHandler: function() {
        this.hideControllers();
    },

    _clickBreakArrowOnCell: function(cell) {
        this.breakBrick(cell);
    },

    arrowClickHandler: function(event) {
        var direction = event.target.getData('direction'),
            method = '_click' + direction + 'ArrowOnCell',
            controllerCell = this.get('controllerCell'),
            gridster = this;

        this[method](controllerCell);

        setTimeout(function() {
            gridster.syncControllerToCell(controllerCell);
        }, 0);

        this.fire('controller-action-' + direction);
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

        this._createLevels();

        this.set('arrows', arrows);

        cells.on('mouseover', A.bind(this.mouseOverCellHandler, this));

        arrows.on('click', A.bind(this.arrowClickHandler, this));

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
        var gridster = this,
            counter,
            controllerCell = this.get('controllerCell');

        for (counter = 0; counter < 16; counter += 1) {
            this._updatePosition(counter);
        }

        this.fire('positions-change', {
            spaces: this.get('spaces')
        });

        setTimeout(function() {
            if (controllerCell) {
                gridster.syncControllerToCell(controllerCell);
            }
        }, 0);
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
        spaces: {
            valueFn: function() {
                var spaces = [],
                    counter;

                for (counter = 0; counter < 16; counter += 1) {
                    spaces[counter] = counter;
                }

                return spaces;
            }
        },

        showController: {
            value: false,
            validator: A.Lang.isBoolean,
            setter: function(value) {
                if (!value) {
                    this.hideControllers();
                }

                return value;
            }
        }
    }
});
