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
    RESIZE_DIRECTION_KEYS: {
        br: 'BottomRight',
        bl: 'BottomLeft',
        tr: 'TopRight',
        tl: 'TopLeft'
    },

    INVERSE_RESIZE_DIRECTION_KEYS: {
        BottomRight: 'br',
        BottomLeft: 'bl',
        TopRight: 'tr',
        TopLeft: 'tl'
    },

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
        this._prepareBreakBrick(cell);
        this.updatePositions();
    },

    _prepareBreakBrick: function(cell) {
        var spaces = this.get('spaces'),
            levels = this.get('levels'),
            counter;

        cell = spaces[cell];

        for (counter = 0; counter < 16; counter += 1) {
            if (spaces[counter] === cell) {
                spaces[counter] = counter;
                levels[counter] = 1;
            }
        }
    },

    _reserveSpace: function(cell, receivers) {
        var spaces = this.get('spaces');

        receivers.forEach(function(rec) {
            this._prepareBreakBrick(rec);
        }, this);

        receivers.forEach(function(rec) {
            spaces[rec] = cell;
        }, this);
    },

    isCellEmpty: function(cell) {
        var currentNode = this.get('cells').item(cell);

        return currentNode.one('.gridster-cell-content').getHTML() === '';
    },

    isCellAvailable: function(cell) {
        var spaces = this.get('spaces');

        return this.isCellEmpty(spaces[cell]);
    },

    _isAdjacentCellAvailableLeft: function(cell, diagonalShown, counter) {
        var a = cell + counter,
            b = diagonalShown - counter;

        return !((a <= 15 && !this.isCellAvailable(a)) ||
            (b >= 0 && !this.isCellAvailable(b)));
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

    _syncArrowOnCell: function(direction, cell) {
        var level = this.get('levels')[cell],
            grouping,
            directions,
            opt,
            diagonal,
            dirX,
            dirY;

        if (level > 1) {
            this._displayArrowOnCell(cell, direction);
            return;
        }

        grouping = this.getGrouping(cell);

        directions = {
            BottomRight: [grouping[grouping.length - 1] + 5, 'Left', 'Top'],
            BottomLeft: [grouping[[0, 2, 6][level - 1]] + 3, 'Right', 'Top'],
            TopRight: [grouping[level - 1] - 3, 'Left', 'Bottom'],
            TopLeft: [grouping[0] - 5, 'Right', 'Bottom']
        };

        opt = directions[direction];

        diagonal = opt[0];
        dirX = opt[1];
        dirY = opt[2];

        if ((diagonal < 0 || diagonal > 15 ||
            (((((cell + 1) % 4) === 0) && (direction === 'TopRight' || direction === 'BottomRight')))) ||
            ((((cell + 1) % 4) === 1) && (direction === 'TopLeft' || direction === 'BottomLeft'))) {
            return;
        }

        if (this._areAdjacentCellsAvailable(cell, diagonal, level, dirX, dirY)) {
            this._displayArrowOnCell(cell, direction);
        }
    },

    _displayArrowOnCell: function(cell, direction) {
        var currentNode = this.get('cells').item(cell);

        currentNode.one('> .yui3-resize-handles-wrapper .yui3-resize-handle-' +
            this.INVERSE_RESIZE_DIRECTION_KEYS[direction]).setStyle('display', 'block');
    },

    syncControllerToCell: function(cell) {
        this.set('controllerCell', cell);

        this._hideAllResizingHandles();

        A.Array.each(['TopLeft', 'TopRight', 'BottomLeft', 'BottomRight'], function(direction) {
            this._syncArrowOnCell(direction, cell);
        }, this);

        this.fire('controller-sync');
    },

    hideControllers: function() {
        this._hideAllResizingHandles();
    },

    mouseOverCellHandler: function(event) {
        var index;

        if (!this.get('showController')) {
            return;
        }

        index = this.get('cells').indexOf(event.currentTarget);

        this.syncControllerToCell(index);
    },

    mouseLeaveGridsterHandler: function() {
        this.hideControllers();
    },

    _expandTopRight: function(cell) {
        var levels = this.get('levels'),
            level = levels[cell],
            grouping = this.getGrouping(cell),
            ne = grouping[level - 1],
            receivers;

        switch(level) {
            case 1:
                receivers = [ne + 1, ne - 3, ne - 4];
                break;
            case 2:
                receivers = [ne - 5, ne - 4, ne - 3, ne + 1, ne + 5];
                break;
            default:
                receivers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
        }

        this._reserveSpace(cell, receivers);
        this.updatePositions();
    },

    _expandBottomRight: function(cell) {
        var levels = this.get('levels'),
            level = levels[cell],
            grouping = this.getGrouping(cell),
            se = grouping[0],
            receivers;

        switch(level) {
            case 1:
                receivers = [se + 1, se + 4, se + 5];
                break;
            case 2:
                receivers = [se + 2, se + 6, se + 8, se + 9, se + 10];
                break;
            default:
                receivers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
        }

        this._reserveSpace(cell, receivers);
        this.updatePositions();
    },

    _expandBottomLeft: function(cell) {
        var levels = this.get('levels'),
            level = levels[cell],
            grouping = this.getGrouping(cell),
            nw,
            receivers;

        switch(level) {
            case 1:
                nw = grouping[0];
                receivers = [nw - 1, nw + 3, nw + 4];
                break;
            case 2:
                nw = grouping[2];
                receivers = [nw - 5, nw - 1, nw + 3, nw + 4, nw + 5];
                break;
            default:
                receivers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
        }

        this._reserveSpace(cell, receivers);
        this.updatePositions();
    },

    _expandTopLeft: function(cell) {
        var levels = this.get('levels'),
            level = levels[cell],
            grouping = this.getGrouping(cell),
            nw = grouping[0],
            receivers;

        switch(level) {
            case 1:
                receivers = [nw - 5, nw - 4, nw - 1];
                break;
            case 2:
                receivers = [nw + 3, nw - 1, nw - 3, nw - 4, nw - 5];
                break;
            default:
                receivers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
        }

        this._reserveSpace(cell, receivers);
        this.updatePositions();
    },

    _expandCell: function(cell, position, level) {
        var levels = this.get('levels'),
            spaces = this.get('spaces'),
            pastLevel = levels[spaces[cell]],
            counter;

        if (level === pastLevel) {
            return;
        }

        if (level < pastLevel) {
            this.breakBrick(cell);
            return;
        }

        counter = level - pastLevel;

        while (counter !== 0) {
            this[('_expand' + position)](cell);
            this.updatePositions();

            counter -= 1;
        }
    },

    _hideResizingHandles: function(cell) {
        cell.all('.yui3-resize-handle').setStyle('display', 'none');
    },

    _hideAllResizingHandles: function() {
        var cells = this.get('cells');

        cells.all('.yui3-resize-handle').setStyle('display', 'none');
    },

    _addResizingHandle: function(cell) {
        var cells = this.get('cells'),
            levels = this.get('levels'),
            currentNode = cells.item(cell),
            initialStyle,
            resize = new A.Resize({
            node: currentNode,
            handles: 'tr, br, bl, tl'
        });

        currentNode.plug(A.Plugin.Resize);

        currentNode.set('handles', 'tr, br, bl, tl');

        resize.plug(A.Plugin.ResizeConstrained, {
            preserveRatio: true,
            constrain: this.get('boundingBox')
        });

        this._hideResizingHandles(currentNode);

        resize.on('resize:resize', function(event) {
            var xD = 1,
                yD = 1,
                offset = event.dragEvent.info.offset,
                region = currentNode.get('region'),
                area = [],
                level = levels[cell],
                smaller;

            if (event.target.changeTopHandles) {
                yD = -1;
            }

            if (event.target.changeLeftHandles) {
                xD = -1;
            }

            smaller = (xD * offset[0] < 0 || yD * offset[1] < 0);

            if (level === 1 && smaller) {
                event.preventDefault();
                return;
            }

            if (smaller) {
                return;
            }

            cells.each(function(cell, pos) {
                if (cell.inRegion(region)) {
                    area.push(pos);
                }
            }, this);

            A.Array.some(area, function(item) {
                if (item !== cell && cells.item([item]).intersect(region).area > 0 && !this.isCellAvailable(item)) {
                    event.preventDefault();
                    return true;
                }
            }, this);
        }, this);

        resize.on('resize:start', function() {
            initialStyle = {
                top: currentNode.getStyle('top'),
                left: currentNode.getStyle('left'),
                height: currentNode.getStyle('height'),
                width: currentNode.getStyle('width')
            };

            currentNode.setStyle('z-index', currentNode.getStyle('z-index') + 1);
        });

        resize.on('resize:end', function(event) {
            var region = resize.get('node').get('region'),
                gridsterWidth = this.get('boundingBox').getStyle('width').slice(0, -2),
                levelF = 4 * region.width / gridsterWidth,
                newLevel = Math.ceil(levelF),
                level = levels[cell];

            currentNode.setStyle('z-index', currentNode.getStyle('z-index') - 1);

            // allowance to avoid expanding more than what is desired
            if ((newLevel - levelF) > 0.9) {
                newLevel -= 1;
            }

            if (newLevel === 0) {
                newLevel = 1;
            }

            if (level === newLevel) {
                setTimeout(function () {
                    currentNode.setStyles(initialStyle);
                }, 0);
                return;
            }

            event.preventDefault();

            this._expandCell(cell, this.RESIZE_DIRECTION_KEYS[resize.get('activeHandle')], newLevel);

        }, this);

        return resize;
    },

    _addResizingHandles: function() {
        var handles = [],
            cells = this.get('cells');

        if (this.get('resizingHandles')) {
            return;
        }

        cells.each(function(cell, pos) {
            handles.push(this._addResizingHandle(pos));
        }, this);

        this._hideAllResizingHandles();

        this.set('resizingHandles', handles);
    },

    initializer: function() {
        var boundingBox = this.get('boundingBox'),
            boundingBoxId = '#' + boundingBox.get('id'),
            cells = A.all(boundingBoxId + ' .gridster-content .gridster-cell');

        this.set('cells', cells);

        this._createLevels();

        cells.on('mouseenter', A.bind(this.mouseOverCellHandler, this));

        boundingBox.on('mouseleave', A.bind(this.mouseLeaveGridsterHandler, this), this);

        this._eventHandles = [cells];

        if (this.get('showController')) {
            this._addResizingHandles();
        }
    },

    destructor: function() {
        A.Array.each(this.get('resizingHandles'), function(resize) {
            resize.destroy();
        });

        (new A.EventHandle(this._eventHandles)).detach();
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

                if (value) {
                    this._addResizingHandles();
                }

                return value;
            }
        }
    }
});
