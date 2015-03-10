/**
 * The Gridster Utility
 *
 * NOTICE: THIS IS A PROTOTYPE. DON'T USE IT IN PRODUCTION, EVER.
 *
 * The code is not clean, neither maintainable.
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
    _buildMatrix: function() {
        var counter,
            spacesMatrix = [];

        for (counter = 0; counter < this.get('spacesTotal'); counter += 1) {
            var current = this.get('spaces')[counter];

            if (spacesMatrix[current] === undefined) {
                spacesMatrix[current] = [];
            }

            spacesMatrix[current].push(counter);
        }

        this.set('spacesMatrix', spacesMatrix);
    },

    map: function() {
        var counter,
            spaces = [];

        for (counter = 0; counter < this.get('spacesTotal'); counter += 1) {
            spaces[counter] = counter;
        }

        // spaces[1] = 0;
        // spaces[2] = 0;
        // spaces[5] = 0;

        this.set('spaces', spaces);
        this._buildMatrix();
    },

    getFreeAreas: function() {
        var edges = this.get('edges'),
            freePositions = [],
            freeAreas = [],
            counter,
            nodes = this.get('spacesNodes'),
            series = [],
            currentNode;

        for (counter = 0; counter < this.get('spacesTotal'); counter += 1) {
            currentNode = nodes[counter];

            if (this.isEmpty(currentNode)) {
                freePositions.push(counter);
            }

            series.push(counter);
        }

        series.forEach(function (vertex) {
            var usedPositions = 0;

            if (vertex % edges === 3) {
                return;
            }

            if (Math.floor(vertex / 4) % 4 === edges - 1) {
                return;
            }

            if (freePositions.indexOf(vertex) === -1) {
                usedPositions += 1;
            }

            if (freePositions.indexOf(vertex + 1) === -1) {
                usedPositions += 1;
            }

            if (freePositions.indexOf(vertex + edges) === -1) {
                usedPositions += 1;
            }

            if (freePositions.indexOf(vertex + edges + 1) === -1) {
                usedPositions += 1;
            }

            if (usedPositions > 1) {
                return;
            }


            freeAreas.push([
                vertex,
                vertex + 1,
                vertex + edges,
                vertex + edges + 1
            ]);

            if (freePositions.indexOf(vertex + 2) === -1) {
                usedPositions += 1;
            }

            if (freePositions.indexOf(vertex + edges + 2) === -1) {
                usedPositions += 1;
            }

            if (freePositions.indexOf(vertex + (2 * edges)) === -1) {
                usedPositions += 1;
            }

            if (freePositions.indexOf(vertex + (2 * edges) + 1) === -1) {
                usedPositions += 1;
            }

            if (freePositions.indexOf(vertex + (2 * edges) + 2) === -1) {
                usedPositions += 1;
            }

            if (usedPositions > 1) {
                return;
            }

            freeAreas.push([
                vertex,
                vertex + 1,
                vertex + edges,
                vertex + edges + 1,
                vertex + 2,
                vertex + edges + 2,
                vertex + (2 * edges),
                vertex + (2 * edges) + 1,
                vertex + (2 * edges) + 2
            ]);

        });

        if (freePositions.length === Math.pow(edges, 2)) {
            freeAreas.push(series.slice());
        }

        return freeAreas;
    },

    displayControllers: function (positions) {
        var controllers = this.get('controllers');

        controllers[positions[0]].southeast = true;
        controllers[positions[1]].southwest = true;
        controllers[positions[2]].northeast = true;
        controllers[positions[3]].northwest = true;
    },

    hideAllControllers: function() {
        var controllers = this.get('controllers');

        controllers.forEach(function(controller) {
            controller.southeast = false;
            controller.southwest = false;
            controller.northeast = false;
            controller.northwest = false;
        });
    },

    toggleControllers: function(freeAreas) {
        this.hideAllControllers();
        freeAreas.forEach(function(positions) {
            if (positions.length !== 4) {
                return;
            }

            this.displayControllers(positions);
        }, this);
    },

    setupControllers: function() {
        var counter,
            controllers = [],
            edges = this.get('edges');

        for (counter = 0; counter < Math.pow(edges, 2); counter += 1) {
            controllers[counter] = {};
        }

        this.set('controllers', controllers);
    },

    updateArrow: function (arrow, controller, cell) {
        ['northeast', 'northwest', 'southeast', 'southwest'].forEach(function (pos) {
            var region,
                node,
                arrowType = 'gridster-arrow-' + pos,
                computedArrowStyle;

            if (!arrow.classList.contains(arrowType)) {
                return;
            }

            if (!controller[pos]) {
                arrow.style.display = 'none';
                return;
            }

            arrow.style.display = 'block';

            node = A.one(this.get('spacesNodes')[cell]);

            region = node.get('region');

            computedArrowStyle = window.getComputedStyle(arrow);

            if (pos === 'northeast' || pos === 'northwest') {
                arrow.style.top = region[1] + 'px';
            }

            if (pos === 'southeast' || pos === 'southwest') {
                arrow.style.top = (region.bottom - computedArrowStyle.height.slice(0, -2)) + 'px';
            }

            if (pos === 'northwest' || pos === 'southwest') {
                arrow.style.left = region[0] + 'px';
            }

            if (pos === 'northeast' || pos === 'southeast') {
                arrow.style.left = (region.right - computedArrowStyle.width.slice(0, -2)) + 'px';
            }
        }, this);
    },

    tracker: function (event) {
        var cell = event.target.getData('cell'),
            arrows = this.get('arrows').getDOMNodes(),
            controller = this.get('controllers')[cell];

        this.set('activeCell', Number.parseInt(cell));

        arrows.forEach(function (arrow) {
            this.updateArrow(arrow, controller, cell);
        }, this);
    },

    update: function() {
        var map = this.map(),
            freeAreas = this.getFreeAreas(map);

        this.set('freeAreas', freeAreas);
        this.toggleControllers(freeAreas);
    },

    initializer: function() {
        var arrows = A.all('.gridster-arrow'),
            gridsterCells = A.all('#' + this.get('contentBox').get('id') + ' .gridster-cell'),
            spacesNodes = gridsterCells._nodes;

        this.setupControllers();

        this.set('arrows', arrows);
        this.set('spacesTotal', Math.pow(this.get('edges'), 2));
        this.set('spacesNodes', spacesNodes);

        this.update();

        gridsterCells.on('mouseenter', A.bind(this.tracker, this));
        arrows.on('click', A.bind(this.arrowClickHandler, this));
        this._eventHandles = [arrows, gridsterCells];
    },

    getActiveArea: function(direction, activeCell, areas) {
        var directionIndex,
            counter,
            length;

        switch (direction) {
            case 'southeast':
                directionIndex = 0;
                break;
            case 'southwest':
                directionIndex = 1;
                break;
            case 'northeast':
                directionIndex = 2;
                break;
            default:
                directionIndex = 3;
        }

        for (counter = 0, length = areas.length; counter < length; counter += 1) {
            if (areas[counter].length !== 4) {
                continue;
            }

            if (areas[counter][directionIndex] === activeCell) {
                return areas[counter];
            }
        }
    },

    getExpansionCell: function(activeArea, activeCell) {
        var nodes = this.get('spacesNodes'),
            counter,
            length;

        for (counter = 0, length = activeArea.length; counter < length; counter += 1) {
            if (!this.isEmpty(nodes[activeArea[counter]])) {
                return activeArea[counter];
            }
        }

        return activeCell;
    },

    arrowClickHandler: function(event) {
        var direction = event.target.getData('direction'),
            activeCell = this.get('activeCell'),
            freeAreas = this.get('freeAreas'),
            activeArea = this.getActiveArea(direction, activeCell, freeAreas);

            console.log('expansion cell = ' + this.getExpansionCell(activeArea, activeCell));
    },

    destructor: function() {
        (new A.EventHandle(this._eventHandles)).detach();
    },

    isEmpty: function(node) {
        return node.innerHTML === '';
    },

    updateAreas: function() {
        var counter,
            least,
            currentNode,
            currentEl,
            nodes = this.get('spacesNodes'),
            notDisplayedClassName = 'gridster-cell-not-displayed',
            spacesMatrix = this.get('spacesMatrix');

        for (counter = 0; counter < this.get('spacesTotal'); counter += 1) {
            currentNode = nodes[counter];
            currentEl = spacesMatrix[counter];

            if (currentEl === undefined) {
                currentNode.classList.add(notDisplayedClassName);
                continue;
            }

            if (currentNode.classList.contains(notDisplayedClassName)) {
                currentNode.classList.remove(notDisplayedClassName);
            }

            currentNode.style.width = (Math.sqrt(currentEl.length) * 25) + '%';
            currentNode.style.height = (Math.sqrt(currentEl.length) * 25) + '%';

            least = Math.min.apply(undefined, currentEl);

            if (counter > least) {
                currentNode.style.left = (((least % this.get('edges')) - 1) * 25) + '%';
                currentNode.style.top = ((Math.ceil(least / this.get('edges')) - 1) * 25) + '%';
            }
        }
    },

    renderUI: function() {
        this.updateAreas();
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
        edges: {
            validator: A.Lang.isNumber
        }
    }
});
