RaphAlytics - Advanced line charts for Raphael
=========

Line chart generator based on the Analytics (http://raphaeljs.com/analytics.html) example 
from the RaphaelJS (http://raphaeljs.com) framework, with added functionality and options.

This library expands the functionality exhibited in the example by allowing multiple
lines on the same chart as well as other customization options making it usable in
nearly any situation you can imagine.

Changelog
---------

**v0.3**

* Bug fixes. Closes issues #1 and #2
* Added a new grid type, `minimalist`, which is now the default type
* The number of Y values is now customizable and defaults to 2
* The position of Y values is customizable, outside or inside the graph. Default: `inside`
* The existance of the Y label for value '0' is now customizable. Default: `TRUE`
* Changed normalization algorythm. Default: `TRUE`
* Added `gridbordercolor` and `gridbordertype` elements
* 3 types of grid border: `full`, `minimalist` and `xoy`
* `rightgutter` option now added, in addition to top, bottom and left.
* Changed the default height from 300px to 150px


**v0.2**

* Added Y values to the chart
* `normalize` options to make the Y axis values multiples of 10


**v0.1**

* Multi-line charts
* Two chart styles (filled or not-filled)
* Coloring options for every line represented in the chart
* Coloring options for the tooltip and grid
* Custom tooltips for the chart points
* Customizable grid style
