"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var core_1 = require('@angular/core');
var view_dimensions_helper_1 = require('../common/view-dimensions.helper');
var color_helper_1 = require('../common/color.helper');
var base_chart_component_1 = require('../common/base-chart.component');
var d3_1 = require('../d3');
var BarHorizontalComponent = (function (_super) {
    __extends(BarHorizontalComponent, _super);
    function BarHorizontalComponent() {
        _super.apply(this, arguments);
        this.legend = false;
        this.showGridLines = true;
        this.activeEntries = [];
        this.barPadding = 8;
        this.roundDomains = false;
        this.activate = new core_1.EventEmitter();
        this.deactivate = new core_1.EventEmitter();
        this.margin = [10, 20, 10, 20];
        this.xAxisHeight = 0;
        this.yAxisWidth = 0;
    }
    BarHorizontalComponent.prototype.update = function () {
        var _this = this;
        _super.prototype.update.call(this);
        this.zone.run(function () {
            _this.dims = view_dimensions_helper_1.calculateViewDimensions({
                width: _this.width,
                height: _this.height,
                margins: _this.margin,
                showXAxis: _this.xAxis,
                showYAxis: _this.yAxis,
                xAxisHeight: _this.xAxisHeight,
                yAxisWidth: _this.yAxisWidth,
                showXLabel: _this.showXAxisLabel,
                showYLabel: _this.showYAxisLabel,
                showLegend: _this.legend,
                legendType: _this.schemeType
            });
            _this.xScale = _this.getXScale();
            _this.yScale = _this.getYScale();
            _this.setColors();
            _this.legendOptions = _this.getLegendOptions();
            _this.transform = "translate(" + _this.dims.xOffset + " , " + _this.margin[0] + ")";
        });
    };
    BarHorizontalComponent.prototype.getXScale = function () {
        this.xDomain = this.getXDomain();
        var scale = d3_1.default.scaleLinear()
            .range([0, this.dims.width])
            .domain(this.xDomain);
        return this.roundDomains ? scale.nice() : scale;
    };
    BarHorizontalComponent.prototype.getYScale = function () {
        this.yDomain = this.getYDomain();
        var spacing = this.yDomain.length / (this.dims.height / this.barPadding + 1);
        return d3_1.default.scaleBand()
            .rangeRound([this.dims.height, 0])
            .paddingInner(spacing)
            .domain(this.yDomain);
    };
    BarHorizontalComponent.prototype.getXDomain = function () {
        var values = this.results.map(function (d) { return d.value; });
        var min = Math.min.apply(Math, [0].concat(values));
        var max = Math.max.apply(Math, values);
        return [min, max];
    };
    BarHorizontalComponent.prototype.getYDomain = function () {
        return this.results.map(function (d) { return d.name; });
    };
    BarHorizontalComponent.prototype.onClick = function (data) {
        this.select.emit(data);
    };
    BarHorizontalComponent.prototype.setColors = function () {
        var domain;
        if (this.schemeType === 'ordinal') {
            domain = this.yDomain;
        }
        else {
            domain = this.xDomain;
        }
        this.colors = new color_helper_1.ColorHelper(this.scheme, this.schemeType, domain, this.customColors);
    };
    BarHorizontalComponent.prototype.getLegendOptions = function () {
        var opts = {
            scaleType: this.schemeType,
            colors: undefined,
            domain: []
        };
        if (opts.scaleType === 'ordinal') {
            opts.domain = this.yDomain;
            opts.colors = this.colors;
        }
        else {
            opts.domain = this.xDomain;
            opts.colors = this.colors.scale;
        }
        return opts;
    };
    BarHorizontalComponent.prototype.updateYAxisWidth = function (_a) {
        var width = _a.width;
        this.yAxisWidth = width;
        this.update();
    };
    BarHorizontalComponent.prototype.updateXAxisHeight = function (_a) {
        var height = _a.height;
        this.xAxisHeight = height;
        this.update();
    };
    BarHorizontalComponent.prototype.onActivate = function (item) {
        var idx = this.activeEntries.findIndex(function (d) {
            return d.name === item.name && d.value === item.value && d.series === item.series;
        });
        if (idx > -1) {
            return;
        }
        this.activeEntries = [item].concat(this.activeEntries);
        this.activate.emit({ value: item, entries: this.activeEntries });
    };
    BarHorizontalComponent.prototype.onDeactivate = function (item) {
        var idx = this.activeEntries.findIndex(function (d) {
            return d.name === item.name && d.value === item.value && d.series === item.series;
        });
        this.activeEntries.splice(idx, 1);
        this.activeEntries = this.activeEntries.slice();
        this.deactivate.emit({ value: item, entries: this.activeEntries });
    };
    BarHorizontalComponent.decorators = [
        { type: core_1.Component, args: [{
                    selector: 'ngx-charts-bar-horizontal',
                    template: "\n    <ngx-charts-chart\n      [view]=\"[width, height]\"\n      [showLegend]=\"legend\"\n      [legendOptions]=\"legendOptions\"\n      [activeEntries]=\"activeEntries\"\n      (legendLabelClick)=\"onClick($event)\"\n      (legendLabelActivate)=\"onActivate($event)\"\n      (legendLabelDeactivate)=\"onDeactivate($event)\">\n      <svg:g [attr.transform]=\"transform\" class=\"bar-chart chart\">\n        <svg:g ngx-charts-x-axis\n          *ngIf=\"xAxis\"\n          [xScale]=\"xScale\"\n          [dims]=\"dims\"\n          [showGridLines]=\"showGridLines\"\n          [showLabel]=\"showXAxisLabel\"\n          [labelText]=\"xAxisLabel\"\n          [tickFormatting]=\"xAxisTickFormatting\"\n          (dimensionsChanged)=\"updateXAxisHeight($event)\">\n        </svg:g>\n        <svg:g ngx-charts-y-axis\n          *ngIf=\"yAxis\"\n          [yScale]=\"yScale\"\n          [dims]=\"dims\"\n          [showLabel]=\"showYAxisLabel\"\n          [labelText]=\"yAxisLabel\"\n          [tickFormatting]=\"yAxisTickFormatting\"\n          (dimensionsChanged)=\"updateYAxisWidth($event)\">\n        </svg:g>\n        <svg:g ngx-charts-series-horizontal\n          [xScale]=\"xScale\"\n          [yScale]=\"yScale\"\n          [colors]=\"colors\"\n          [series]=\"results\"\n          [dims]=\"dims\"\n          [gradient]=\"gradient\"\n          [activeEntries]=\"activeEntries\"\n          (select)=\"onClick($event)\"\n          (activate)=\"onActivate($event)\"\n          (deactivate)=\"onDeactivate($event)\"\n        />\n      </svg:g>\n    </ngx-charts-chart>\n  ",
                    changeDetection: core_1.ChangeDetectionStrategy.OnPush,
                    styleUrls: ['../common/base-chart.component.scss'],
                    encapsulation: core_1.ViewEncapsulation.None
                },] },
    ];
    /** @nocollapse */
    BarHorizontalComponent.ctorParameters = function () { return []; };
    BarHorizontalComponent.propDecorators = {
        'legend': [{ type: core_1.Input },],
        'xAxis': [{ type: core_1.Input },],
        'yAxis': [{ type: core_1.Input },],
        'showXAxisLabel': [{ type: core_1.Input },],
        'showYAxisLabel': [{ type: core_1.Input },],
        'xAxisLabel': [{ type: core_1.Input },],
        'yAxisLabel': [{ type: core_1.Input },],
        'gradient': [{ type: core_1.Input },],
        'showGridLines': [{ type: core_1.Input },],
        'activeEntries': [{ type: core_1.Input },],
        'schemeType': [{ type: core_1.Input },],
        'xAxisTickFormatting': [{ type: core_1.Input },],
        'yAxisTickFormatting': [{ type: core_1.Input },],
        'barPadding': [{ type: core_1.Input },],
        'roundDomains': [{ type: core_1.Input },],
        'activate': [{ type: core_1.Output },],
        'deactivate': [{ type: core_1.Output },],
    };
    return BarHorizontalComponent;
}(base_chart_component_1.BaseChartComponent));
exports.BarHorizontalComponent = BarHorizontalComponent;
//# sourceMappingURL=bar-horizontal.component.js.map