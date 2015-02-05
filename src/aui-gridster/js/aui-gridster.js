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

    createMap: function() {
        var counter,
            spaces = [];

        for (counter = 0; counter < this.get('spacesTotal'); counter += 1) {
            spaces[counter] = counter;
        }

        // spaces[2] = 1;
        // spaces[5] = 1;
        // spaces[6] = 1;
        // spaces[11] = 16;
        // spaces[12] = 16;
        // spaces[15] = 16;
        // spaces[9] = 14;
        // spaces[10] = 14;
        // spaces[13] = 14;
        // spaces[4] = 3;
        // spaces[7] = 3;
        // spaces[8] = 3;
        // spaces[6] = 7;
        // spaces[10] = 7;
        // spaces[11] = 7;
        // spaces[6] = 13;
        // spaces[9] = 5;
        // spaces[10] = 5;
        // spaces[5] = 13;
        // spaces[6] = 13;
        // spaces[7] = 13;
        // spaces[9] = 13;
        // spaces[10] =13;
        // spaces[11] = 13;
        // spaces[14] = 13;
        // spaces[15] = 13;

        this.set('spaces', spaces);
        this._buildMatrix();
    },

    initializer: function() {
        this.set('spacesTotal', Math.pow(this.get('edges'), 2));
        this.set('spacesNodes', Y.all('#' + this.get('contentBox').get('id') + ' .gridster-cell')._nodes);

        this.createMap();

        this._eventHandles = [];
    },

    destructor: function() {
        (new A.EventHandle(this._eventHandles)).detach();
    },

    getExpansions: function(pos) {
        return [
            this.northeast(pos),
            this.southeast(pos),
            this.southwestern(pos),
            this.northwestern(pos)
        ];
    },

    isNotEmpty: function(node) {
        return node.innerHTML !== '';
    },

    areNotEmpty: function(nodes) {
        return nodes.some(function(node) {
            return this.isNotEmpty(node);
        }, this);
    },

    areNotEmptyByCandidates: function(candidates) {
        var nodes = this.get('spacesNodes');

        return this.areNotEmpty(candidates.map(function(n) {
            return nodes[n];
        }));
    },

    isZoneFree: function(candidates, top, right, size) {
        return (top < size || right < size ||
            this.areNotEmptyByCandidates(candidates));
    },

    northeastListVertexes: function(pos, minDistance) {
        var external,
            internal,
            edges = this.get('edges'),
            vertexes = [],
            counter;

        for (counter = 0; counter < minDistance; counter += 1) {
            for (external = counter + 1; external >= 0; external -= 1) {
                if (external !== counter + 1) {
                    internal = counter + 1;
                    vertexes.push(pos - (edges * external) + internal);
                    continue;
                }

                for (internal = 0; internal <= external; internal += 1) {
                    vertexes.push(pos - (edges * external) + internal);
                }
            }
        }

        return vertexes;
    },

    northeast: function(pos) {
        var edges = this.get('edges'),
            candidates,
            regions = [],
            top = Math.floor(pos / edges),
            right = - (pos % edges) + edges - 1,
            minDistance = Math.min(top, right),
            region,
            ring;

        candidates = this.northeastListVertexes(pos, minDistance);

        for (ring = 1; ring < edges; ring += 1) {
            region = candidates.splice(0, 3 + 2 * (ring - 1));

            if (this.isZoneFree(candidates, top, right, ring)) {
                break;
            }

            regions.push(region);
        }

        return regions;
    },

    southeast: function() {

    },

    northwestern: function() {

    },

    southwestern: function() {

    },

    getExpansionCorners: function() {
        var counter,
            spacesTotal = this.get('spacesTotal');

        for (counter = 0; counter < spacesTotal; counter += 1) {
            console.log(this.getExpansions(counter));
        }
    },

    renderUI: function() {
        var counter,
            least,
            currentNode,
            currentEl,
            nodes = this.get('spacesNodes'),
            notDisplayedClassName = A.getClassName('gridster', 'cell', 'not', 'displayed'),
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

        this.getExpansionCorners();
    }
}, {
    /**
     * Static property provides a string to identify the CSS prefix.
     *
     * @property CSS_PREFIX
     * @type String
     * @static
     */
    CSS_PREFIX: A.getClassName('gridster'),

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
