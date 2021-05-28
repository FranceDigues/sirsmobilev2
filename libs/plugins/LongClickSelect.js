import Feature from "ol/Feature";
import { Style } from "ol/style";
import { Circle, LineString } from "ol/geom";
import { Interaction } from "ol/interaction";
import { Vector as VectorSource } from "ol/source";
import { Vector as VectorLayer, Group } from "ol/layer";
import ImageSource from "ol/source/Image";
import { transform } from 'ol/proj';
import { Pixel } from 'ol/pixel';

/**
 * @classdesc
 * Base class that calls user-defined functions on a long click
 * `down` and `up` events.
 *
 * @constructor
 * @param {LongClickOptions} opt_options Options.
 * @extends {Interaction} Interaction.
 * @api
 */
let LongClick = /*@__PURE__*/ (function (Interaction) {
  function LongClick(opt_options) {
    Interaction.call(this, {
      handleStartEvent: LongClick.handleStartEvent
    });

    let options = opt_options ? opt_options : {};

    /**
     * @type {number}
     * @private
     */
    this.delay_ = typeof options.delay === "number" ? options.delay : 400;

    /**
     * @type {number|null}
     * @private
     */
    this.timeoutId_ = null;

    /**
     * @type {Pixel}
     * @private
     */
    this.trackedPixel_ = null;

    /**
     * @type {boolean}
     * @private
     */
    this.handlingLongClick_ = false;

  }

  if (Interaction) LongClick.__proto__ = Interaction;
  LongClick.prototype = Object.create(Interaction && Interaction.prototype);
  LongClick.prototype.constructor = LongClick;

  /**
   *
   * @param {import("ol/MapBrowserEvent.js").default} mapBrowserEvent Event.
   * @return {boolean}
   * @this {LongClick}
   * @private
   */
  LongClick.prototype.handleStartEvent = function (mapBrowserEvent) {
    return true;
  }

  /**
   *
   * @param {import("ol/MapBrowserEvent.js").default} mapBrowserEvent Event.
   * @return {boolean}
   * @this {LongClick}
   * @private
   */
  LongClick.prototype.handleDragEvent = function (mapBrowserEvent) {
    return true;
  }

  /**
   *
   * @param {import("ol/MapBrowserEvent.js").default} mapBrowserEvent Event.
   * @return {boolean}
   * @this {LongClick}
   * @private
   */
  LongClick.prototype.handleStopEvent = function (mapBrowserEvent) {
    return true;
  }

  /**
   * Handle Event.
   * @param {import("ol/MapBrowserEvent.js").default} mapBrowserEvent Map browser event.
   * @return {boolean} `false` to stop event propagation.
   * @this {LongClick}
   * @private
   */
  LongClick.prototype.handleEvent = function (mapBrowserEvent) {
    if (mapBrowserEvent) {
      switch (mapBrowserEvent.type) {
        case "pointerdown":
          this.handlePointerDownEvent_(mapBrowserEvent);
          return true;
        case "pointerup":
          this.handlePointerUpEvent_(mapBrowserEvent);
          return true;
        case "pointerdrag":
          this.handlePointerDragEvent_(mapBrowserEvent);
          return true;
        default:
          return true;
      }
    }
    return true;
  };

  /**
   * Handling Pointer event (down).
   * @param {import("ol/MapBrowserEvent.js").default} mapBrowserEvent Map browser event.
   * @return {boolean} return always `true`.
   * @this {LongClick}
   * @private
   */
  LongClick.prototype.handlePointerDownEvent_ = function (mapBrowserEvent) {
    if (typeof this.timeoutId_ === "number") {
      this.abortLongClick_();
    } else if (this.handlingLongClick_) {
      this.stopLongClick_(mapBrowserEvent);
    } else {
      this.timeoutId_ = window.setTimeout(() => {
        this.startLongClick_(mapBrowserEvent);
      }, this.delay_);
      this.trackedPixel_ = mapBrowserEvent.pixel;
    }
  };

  /**
   * Handling Pointer event (hover).
   * @param {import("ol/MapBrowserEvent.js").default} mapBrowserEvent Map browser event.
   * @return {boolean} return always `true`.
   * @this {LongClick}
   * @private
   */
  LongClick.prototype.handlePointerDragEvent_ = function (mapBrowserEvent) {
    if (this.handlingLongClick_) {
      this.stopLongClick_();
      this.abortLongClick_();
      return this.handleDragEvent(mapBrowserEvent);
    } else if (Array.isArray(mapBrowserEvent)) {
      let deltaX = mapBrowserEvent.pixel[0] - this.trackedPixel_[0];
      let deltaY = mapBrowserEvent.pixel[1] - this.trackedPixel_[1];
      if (deltaX * deltaX + deltaY * deltaY >= 24 * 24) {
        this.abortLongClick_();
      }
    }
    return true;
  };

  /**
   * Handling Pointer event (up).
   * @param {import("ol/MapBrowserEvent.js").default} mapBrowserEvent Map browser event.
   * @return {boolean} return always `true`.
   * @this {LongClick}
   * @private
   */
  LongClick.prototype.handlePointerUpEvent_ = function (mapBrowserEvent) {
    if (typeof this.timeoutId_ === "number") {
      this.stopLongClick_();
      this.abortLongClick_();
    } else if (this.handlingLongClick_) {
      this.stopLongClick_();
      this.abortLongClick_();
    }
    return true;
  };

  /**
   * Abort the Long Click.
   * @this {LongClick}
   * @private
   */
  LongClick.prototype.abortLongClick_ = function () {
    window.clearTimeout(this.timeoutId_);
    this.timeoutId_ = null;
    this.trackedPixel_ = null;
    this.handlingLongClick_ = false;
  };

  /**
   * Start the Long Click.
   * @param {import("ol/MapBrowserEvent.js").default} mapBrowserEvent Map browser event.
   * @this {LongClick}
   * @private
   */
  LongClick.prototype.startLongClick_ = function (mapBrowserEvent) {
    this.timeoutId_ = null;
    this.handlingLongClick_ = true;
    this.handleStartEvent(mapBrowserEvent);
  };

  /**
   * Stop the Long Click.
   * @param {import("ol/MapBrowserEvent.js").default} mapBrowserEvent Map browser event.
   * @this {LongClick}
   * @private
   */
  LongClick.prototype.stopLongClick_ = function (mapBrowserEvent) {
    this.handleStopEvent(mapBrowserEvent);
    this.trackedPixel_ = null;
    this.handlingLongClick_ = false;
  };

  return LongClick;
})(Interaction);

/**
 * @classdesc
 * Handles selection of vector data. A `features` array is maintained
 * internally to store the selected feature(s). Which features are selected is
 * determined by the `condition` option, and optionally the `toggle` or
 * `add`/`remove` options.
 *
 * @constructor
 * @param {LongClickOptions} opt_options Options.
 * @extends {LongClick} LongClick.
 * @api
 */
export let LongClickSelect = /*@__PURE__*/ (function (LongClick) {
  function LongClickSelect(opt_options) {
    LongClick.call(this, {
      handleStartEvent: LongClickSelect.handleStartEvent,
      handleDragEvent: LongClickSelect.handleDragEvent,
      handleStopEvent: LongClickSelect.handleStopEvent
    });

    let options = opt_options ? opt_options : {};

    /**
     * @private
     * @type {Style}
     */
    this.circleStyle = options.circleStyle ? options.circleStyle : null;

    /**
     * @private
     * @type {VectorLayer}
     */
    this.layer = null;

    /**
     * @private
     * @type {Circle}
     */
    this.circle_ = new Circle([NaN, NaN])

    /**
     * @type {Pixel}
     * @private
     */
    this.startPixel_ = null;

    /**
     * @type {Pixel}
     * @private
     */
    this.endPixel_ = null;

    /**
     * @type {number}
     * @private
     */
    this.minRadius_ = typeof options.minRadius === "number" ? options.minRadius : 20;

    /**
     * @type {number}
     * @private
     */
    this.maxRadius_ = typeof options.maxRadius === "number" ? options.maxRadius : null;

    /**
     * @type {number|null}
     * @private
     */
    this.radiusTimeoutId_ = null;

    /**
     * @private
     * @type {ConditionType|true}
     */
    this.condition_ = options.condition ? options.condition : true;

    /**
     * @private
     * @type {MapBrowserEvent|null}
     */
    this.tmpMapBrowserEvent = null;

    /**
     * @private
     * @type {Array<Feature>}
     */
    this.features = [];

    let layerFilter;
    if (typeof options.layers === "function") {
      layerFilter = options.layers;
    } else if (Array.isArray(options.layers)) {
      let layers = options.layers;
      /**
       * @param {Layer} layer Layer.
       * @return {boolean} Include.
       */
      layerFilter = function (layer) {
        return layers.includes(layer);
      };
    } else {
      layerFilter = () => {
        return true;
      };
    }

    /**
     * @private
     * @type {function(Layer): boolean}
     */
    this.layerFilter_ = layerFilter;

    /**
     * @private
     * @type {function(Layer): boolean}
     */
    this.endClickAction = options.endClick ? options.endClick :
    /**
      * @return {boolean} Include.
      * @param {any} argument Any king of argument.
      */
    endClickAction = function (argument) {
      return true;
    }
  }

  if (LongClick) LongClickSelect.__proto__ = LongClick;
  LongClickSelect.prototype = Object.create(LongClick && LongClick.prototype);
  LongClickSelect.prototype.constructor = LongClickSelect;

  /**
   * Calcule distance between 2 points.
   * @param {Coordinate} c1 Coordinate 1.
   * @param {Coordinate} c2 Coordinate 2.
   * @return {number} Distance.
   * @this {LongClickSelect}
   * @private
   */
  LongClickSelect.prototype.cosineDistance = function (c1, c2) {
    const line = new LineString([c1, c2]);
    return Math.round(line.getLength() * 100) / 100;
  };

  /**
   * Set new size for Circle.
   * @param {MapBrowserEvent} mapBrowserEvent Map browser event
   * @param {Pixel} startPixel_ Pixel on the center of the circle.
   * @param {Pixel} endPixel_ Pixel on the circumference of the circle.
   * @this {LongClickSelect}
   * @private
   */
  LongClickSelect.prototype.setPixels = function(mapBrowserEvent, startPixel_, endPixel_) {
    let mapProjection = mapBrowserEvent.map.getView().getProjection();
    let startCoord = transform(mapBrowserEvent.map.getCoordinateFromPixel(startPixel_), mapProjection, 'EPSG:4326');
    let endCoord = transform(mapBrowserEvent.map.getCoordinateFromPixel(endPixel_), mapProjection, 'EPSG:4326');
    let radius = this.cosineDistance(startCoord, endCoord);

    this.circle_.setCenter(startCoord);
    this.circle_.setRadius(radius);
    this.circle_.transform('EPSG:4326', mapProjection);
    mapBrowserEvent.map.render();
  }

  /**
   * Init and/or Set circle's layer to map. Begin to increasing radius.
   * @param {MapBrowserEvent} mapBrowserEvent Map browser event
   * @this {LongClickSelect}
   * @private
   */
  LongClickSelect.prototype.handleStartEvent = function (mapBrowserEvent) {
    if (!this.condition_) {
      return;
    }

    if (!this.layer) {
      this.layer = new VectorLayer({
        name: 'interactionCircle',
        visible: true,
        source: new VectorSource(),
        style: this.circleStyle
      });
      mapBrowserEvent.map.addLayer(this.layer);
    }
    let source = this.layer.getSource();
    source.clear();
    source.addFeature(new Feature({
      geometry: this.circle_,
      name: 'CircleInteraction'
    }));
    this.tmpMapBrowserEvent = Object.assign({}, mapBrowserEvent);

    this.startPixel_ = mapBrowserEvent.pixel;
    this.endPixel_ = [
      mapBrowserEvent.pixel[0] + this.minRadius_,
      mapBrowserEvent.pixel[1]
    ];
    this.setPixels(mapBrowserEvent, this.startPixel_, this.endPixel_);
    this.radiusTimeoutId_ = window.setTimeout(() => {
      this.increaseRadius_(mapBrowserEvent);
    }, 2);
    return true;
  };

  /**
   * @param {MapBrowserEvent} mapBrowserEvent Map browser event
   * @this {LongClickSelect}
   * @private
   */
  LongClickSelect.prototype.handleDragEvent = function (mapBrowserEvent) {
    if (!this.condition_) {
      return true;
    }

    let stopEvent = false;
    if (this.condition_ && Array.isArray(this.startPixel_)) {
      let deltaX = mapBrowserEvent.pixel[0] - this.startPixel_[0];
      let deltaY = mapBrowserEvent.pixel[1] - this.startPixel_[1];

      if (deltaX * deltaX + deltaY * deltaY >= 24 * 24) {
        this.removeCircle_();
      } else {
        stopEvent = true;
      }
    }
    return !stopEvent;
  };

  /**
   * Sort and store feature in `features`.
   * @param {MapBrowserEvent} mapBrowserEvent Map browser event
   * @this {LongClickSelect}
   * @private
   */
  LongClickSelect.prototype.handleStopEvent = function (mapBrowserEvent) {
    if (!this.condition_) {
      return;
    }

    if (!mapBrowserEvent) {
      mapBrowserEvent = this.tmpMapBrowserEvent;
    }
    if (mapBrowserEvent && mapBrowserEvent.type === "pointerdown" && Array.isArray(this.startPixel_)) {
      let circleExtent = this.layer.getSource().getFeatures()[0].getGeometry().getExtent();
      let centerPixel = this.startPixel_;
      let centerCoord = mapBrowserEvent.map.getCoordinateFromPixel(centerPixel);
      let radiusSquared = Math.pow(this.endPixel_[0] - this.startPixel_[0], 2);
      let features = [];

      // Identifies features which have at least one point in the circle.
      this.forEachVectorSources_(mapBrowserEvent.map.getLayers(), (source) => {
        source.forEachFeatureIntersectingExtent(circleExtent, (feature) => {
          let closestPixel = mapBrowserEvent.map.getPixelFromCoordinate(
            feature.getGeometry().getClosestPoint(centerCoord)
          );

          // Ensure that the closest pixel is in the circle.
          var deltaX = closestPixel[0] - centerPixel[0];
          var deltaY = closestPixel[1] - centerPixel[1];
          if (deltaX * deltaX + deltaY * deltaY <= radiusSquared && feature.get('name') !== 'CircleInteraction') {
            features.push(feature);
          }
        });
      }, this.layerFilter_);
      this.features = features;

      // Do action endClick
      this.endClickAction(this.features);
    }
    // Always remove the circle.
    this.removeCircle_();

    return true;
  };

  /**
   * Call callback only if layer has vector source. Or recursive
   * @param {any} layers Any type of layers.
   * @param {function} callback Callback.
   * @param {function} layerFiler Specific layer sort function.
   * @this {LongClickSelect}
   * @private
   */
  LongClickSelect.prototype.forEachVectorSources_ = function (layers, callback, layerFiler) {
    layers.forEach((layer) => {
      // This is a group of layers. Call this method recursively.
      if (layer instanceof Group) {
        this.forEachVectorSources_(layer.getLayers(), callback, layerFiler);
      }
      // This is a single layer. Check if this layer should be included.
      else if (layer instanceof VectorLayer && layerFiler(layer)) {
        let source = layer.getSource();

        // Ensure that the layer has a vector source.
        if (source instanceof VectorSource) {
          callback.call(this, source);
        } else if (source instanceof ImageSource) {
          callback.call(this, source.getSource());
        }
      }
    });
  }

  /**
   * Increase radius.
   * @param {MapBrowserEvent} mapBrowserEvent Map browser event.
   * @this {LongClickSelect}
   * @private
   */
  LongClickSelect.prototype.increaseRadius_ = function (mapBrowserEvent) {
    this.endPixel_[0] += 0.25;
    if (typeof this.maxRadius_ === 'number') {
      this.endPixel_[0] = Math.min(this.endPixel_[0], this.startPixel_[0] + this.maxRadius_);
    }
    this.setPixels(mapBrowserEvent, this.startPixel_, this.endPixel_);
    this.radiusTimeoutId_ = window.setTimeout(
      () => {
        this.increaseRadius_(mapBrowserEvent);
      }, 2);
  }

  /**
   * Remove Circle from layer's source.
   * @this {LongClickSelect}
   * @private
   */
  LongClickSelect.prototype.removeCircle_ = function () {
    this.startPixel_ = null;
    this.endPixel_ = null;
    if (this.layer) {
      this.layer.getSource().clear();
    }
    window.clearTimeout(this.radiusTimeoutId_);
    this.radiusTimeoutId_ = null;
  }

  return LongClickSelect;
})(LongClick);
