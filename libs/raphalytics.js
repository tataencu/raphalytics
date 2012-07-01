Raphael.fn.drawGrid = function (x, y, w, h, wv, hv, type, color)
{
    color = color || "#000";
	type= type || 'full_grid';
    var path = ["M", Math.round(x) + .5, Math.round(y) + .5, "L", Math.round(x + w) + .5, Math.round(y) + .5, Math.round(x + w) + .5, Math.round(y + h) + .5, Math.round(x) + .5, Math.round(y + h) + .5, Math.round(x) + .5, Math.round(y) + .5],
        rowHeight = h / hv,
        columnWidth = w / wv;
		
	if (type=='y_grid' || type=='full_grid')
	{
	    for (var i = 1; i < hv; i++)
		{
	        path = path.concat(["M", Math.round(x) + .5, Math.round(y + i * rowHeight) + .5, "H", Math.round(x + w) + .5]);
	    }
	}

	if (type=='x_grid' || type=='full_grid')
	{
		for (i = 1; i < wv; i++)
		{
			path = path.concat(["M", Math.round(x + i * columnWidth) + .5, Math.round(y) + .5, "V", Math.round(y + h) + .5]);
		}
	}
	
    return this.path(path.join(",")).attr({stroke: color});
};

function drawLineChart(paper,data,labels,tooltips,options)
{
    function getAnchors(p1x, p1y, p2x, p2y, p3x, p3y)
	{
        var l1 = (p2x - p1x) / 2,
            l2 = (p3x - p2x) / 2,
            a = Math.atan((p2x - p1x) / Math.abs(p2y - p1y)),
            b = Math.atan((p3x - p2x) / Math.abs(p2y - p3y));
			
        a = p1y < p2y ? Math.PI - a : a;
        b = p3y < p2y ? Math.PI - b : b;
		
        var alpha = Math.PI / 2 - ((a + b) % (Math.PI * 2)) / 2,
            dx1 = l1 * Math.sin(alpha + a),
            dy1 = l1 * Math.cos(alpha + a),
            dx2 = l2 * Math.sin(alpha + b),
            dy2 = l2 * Math.cos(alpha + b);
			
        return {x1: p2x - dx1, y1: p2y + dy1, x2: p2x + dx2, y2: p2y + dy2};
	}
	
	if (typeof data[0] !== 'object')
	{
		data=[data];
	}
	
	if (typeof tooltips[0] !== 'object')
	{
		tooltips=[tooltips];
	}
	
   
	var max_value=Math.max.apply(Math, data[0]);
	
	for (i=0, ii=data.length;i<ii;i++)
	{
		if (Math.max.apply(Math, data[i])>max_value)
		{
			max_value=Math.max.apply(Math.data[i]);
		}
	}

    var width = options.width || 750,
        height = options.height || 300,
        leftgutter = options.leftgutter || 30,
        bottomgutter = options.bottomgutter || 20,
        topgutter = options.topgutter || 20,
		fill = options.fill || false,
		gridtype = options.gridtype || 'full_grid',
		gridcolor = options.gridcolor || '#bbb',
        color = options.color || '#2F69BF',
		tooltipcolor = options.tooltipcolor || '#000',
		tooltipbordercolor = options.tooltipbordercolor || '#666',
		tooltiptextcolor = options.tooltiptextcolor || '#fff',
		labelcolor = options.labelcolor || '#000',
        txt = {font: '12px Helvetica, Arial', fill: "#fff"},
        txt1 = {font: '10px Helvetica, Arial', fill: "#fff"},
        txt2 = {font: '12px Helvetica, Arial', fill: "#000"},
        X = (width - leftgutter) / labels.length,
        Y = (height - bottomgutter - topgutter) / max_value;
		
    paper.drawGrid(leftgutter + X * .5 + .5, topgutter + .5, width - leftgutter - X, height - topgutter - bottomgutter, labels.length-1, 10, gridtype, gridcolor);

	if (typeof color != 'object')
	{
		color=[color];
	}

	var path,
	bgp,
	label = paper.set(),
	lx = 0,
	ly = 0,
	is_label_visible = false,
	blanket = paper.set(),
	p,bgpp,leave_timer,cur_color;
	
	label.push(paper.text(60, 12, tooltips[0][0]).attr(txt).attr({fill: tooltiptextcolor}));
	label.hide();
	frame = paper.popup(100, 100, label, "right").attr({fill: tooltipcolor, stroke: tooltipbordercolor, "stroke-width": 2, "fill-opacity": .7}).hide();

	for (var i=0, ii=labels.length;i<ii;i++)
	{
		var x = Math.round(leftgutter + X * (i + .5)),
			t = paper.text(x, height - 6, labels[i]).attr(txt).attr({fill: labelcolor}).toBack();
	}

	for (var j=0, jj=data.length; j<jj; j++)
	{
		if (typeof color[j] == 'undefined')
		{
			cur_color=color[color.length-1];
		}
		else
		{
			cur_color=color[j];
		}

		path = paper.path().attr({stroke: cur_color, "stroke-width": 4, "stroke-linejoin": "round"});

		if (fill)
		{
			bgp = paper.path().attr({stroke: "none", opacity: .3, fill: cur_color});
		}

		p=null;
		bgpp=null;

		for (var i = 0, ii = labels.length; i < ii; i++)
		{
			var y = Math.round(height - bottomgutter - Y * data[j][i]),
				x = Math.round(leftgutter + X * (i + .5));
				
			if (!i)
			{
				p = ["M", x, y, "C", x, y];
				
				if (fill)
				{
					bgpp = ["M", leftgutter + X * .5, height - bottomgutter, "L", x, y, "C", x, y];
				}
			}
			
			if (i && i < ii - 1)
			{
	            var Y0 = Math.round(height - bottomgutter - Y * data[j][i - 1]),
	                X0 = Math.round(leftgutter + X * (i - .5)),
	                Y2 = Math.round(height - bottomgutter - Y * data[j][i + 1]),
	                X2 = Math.round(leftgutter + X * (i + 1.5));
					
	            var a = getAnchors(X0, Y0, x, y, X2, Y2);
				
	            p = p.concat([a.x1, a.y1, x, y, a.x2, a.y2]);
				
				if (fill)
				{
					bgpp = bgpp.concat([a.x1, a.y1, x, y, a.x2, a.y2]);
				}
			}
			
			var dot = paper.circle(x, y, 4).attr({fill: cur_color, stroke: cur_color, "stroke-width": 2});
			
			if (typeof tooltips[j] == 'object' && typeof tooltips[j][i] != 'undefined' && tooltips[j][i]!=false)
			{
				blanket.push(paper.rect(x-10, y-10, 20, 20).attr({stroke: "none", fill: "#fff", opacity: 0}));
				
				var rect = blanket[blanket.length - 1];
				
				(function (line, x, y, data, tooltip, dot)
				{
					var timer, i = 0;
					
					rect.hover(
						function ()
						{
							clearTimeout(leave_timer);
							
							var side = "right";
							
							if (x + frame.getBBox().width > width)
							{
								side = "left";
							}
							
							var ppp = paper.popup(x, y, label, side, 1),
								anim = Raphael.animation({
								path: ppp.path,
								transform: ["t", ppp.dx, ppp.dy]
								}, 200 * is_label_visible);
								
							lx = label[0].transform()[0][1] + ppp.dx;
							ly = label[0].transform()[0][2] + ppp.dy;
							
							frame.show().stop().animate(anim);
							
							label[0].attr({text: tooltip}).show().stop().animateWith(frame, anim, {transform: ["t", lx, ly]}, 200 * is_label_visible);
							
							dot.attr("r", 6);
							is_label_visible = true;
						},
						function ()
						{
							dot.attr("r", 4);
							
							leave_timer = setTimeout(
								function ()
								{
									frame.hide();
									label[0].hide();
									is_label_visible = false;
								},
								1000
							);
						}
					);
				})(j, x, y, data[j][i], tooltips[j][i], dot);
			}
		}
		
		p = p.concat([x, y, x, y]);
		path.attr({path: p});
		
		if (fill)
		{
			bgpp = bgpp.concat([x, y, x, y, "L", x, height - bottomgutter, "z"]);
			bgp.attr({path: bgpp});
		}
	}

    frame.toFront();
    label[0].toFront();
    blanket.toFront();

};

Raphael.fn.drawLineChart =function(data,labels,tooltips,options)
{
	return new drawLineChart(this,data,labels,tooltips,options);
}
