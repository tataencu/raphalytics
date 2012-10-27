Raphael.fn.drawGridBorder = function (x, y, w, h, type, color)
{
	if (type=='full')
	{
		var path = ["M", Math.round(x) , Math.round(y) , "L", Math.round(x + w) , Math.round(y) , Math.round(x + w) , Math.round(y + h) , Math.round(x) , Math.round(y + h) , Math.round(x) , Math.round(y) ];
	}
	
    if (type=='xoy')
    {
        var path = ["M", Math.round(x), Math.round(y+h), "L", Math.round(x + w), Math.round(y+h), "M", Math.round(x), Math.round(y+h), "L", Math.round(x), Math.round(y)];
    }

	if (type=='minimalist')
	{
		var path = ["M", Math.round(x), Math.round(y+h), "L", Math.round(x + w), Math.round(y+h)];
	}
	
	return this.path(path.join(",")).attr({stroke: color,'stroke-width':0.5});
}

Raphael.fn.drawGrid = function (x, y, w, h, wv, hv, type, color)
{
	var path = [],
    rowHeight = h / hv,
    columnWidth = w / wv;
		
	if (type=='y_grid' || type=='full_grid' || type=='minimalist')
	{
		var start_from=(type=='minimalist'?0:1);
	
	    for (var i = start_from; i < hv; i++)
		{
	        path = path.concat(["M", Math.round(x) , Math.round(y + i * rowHeight) , "H", Math.round(x + w) ]);
	    }
	}

	if (type=='x_grid' || type=='full_grid')
	{
		for (i = 1; i < wv; i++)
		{
			path = path.concat(["M", Math.round(x + i * columnWidth) , Math.round(y) , "V", Math.round(y + h) ]);
		}
	}
	
    return this.path(path.join(",")).attr({stroke: color,'stroke-width':0.5});
};

function raphalytics(paper,data,labels,tooltips,options)
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
	
    // Grab the data
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
			max_value=Math.max.apply(Math, data[i]);
		}
	}

    // Graph options and styling
    var width = options.width || 750,
        height = options.height || 150,
        leftgutter = options.leftgutter || 10,
        bottomgutter = options.bottomgutter || 16,
        topgutter = options.topgutter || 14,
        rightgutter = options.rightgutter || 10,
        normalize = options.normalize || true,
        smooth = options.smooth || false,
		fill = options.fill || false,
		gridtype = options.gridtype || 'minimalist',
		gridcolor = options.gridcolor || '#ccc',
		gridbordertype = options.gridbordertype || (gridtype=='minimalist'?'minimalist':'full'),
		gridbordercolor = options.gridbordercolor || (gridtype=='minimalist'?'#000':'#ccc'),
        color = options.color || '#2F69BF',
		tooltipcolor = options.tooltipcolor || '#000',
		tooltipbordercolor = options.tooltipbordercolor || '#666',
		tooltiptextcolor = options.tooltiptextcolor || '#fff',
		labelcolor = options.labelcolor || '#000',
		y_labels_number = options.y_labels_number || 2,
		y_label_0 = options.y_label_0 || false,
		y_labels_position = options.y_labels_position || 'inside',
        txt = {font: '12px Helvetica, Arial', fill: "#fff"};

	if (max_value<y_labels_number)
	{
		max_value=y_labels_number;
	}
	
	if (normalize)
	{
		max_value=Math.ceil(4*max_value/3);
		
		if(max_value>10)
		{
			var pow=Math.pow(10,max_value.toString().length-1);
			max_value=Math.ceil(max_value/pow)*pow;
		}
	}

	if (y_labels_position=='outside' && leftgutter<max_value.toString().length*8)
	{
		leftgutter=max_value.toString().length*8;
	}
	
    var X = (width - leftgutter - rightgutter) / (labels.length-1),
        Y = (height - bottomgutter - topgutter) / max_value;
	
	paper.drawGridBorder(leftgutter, topgutter, width - leftgutter - rightgutter, height - topgutter - bottomgutter, gridbordertype, gridbordercolor);
    paper.drawGrid(leftgutter, topgutter, width - leftgutter - rightgutter, height - topgutter - bottomgutter, labels.length-1, y_labels_number, gridtype, gridcolor);
	
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

	//Draw lines
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
				x = Math.round(leftgutter + X*i );
				
			if (!i)
			{
				if (smooth)
				{
					p = ["M", x, y, "C", x, y];
				}
				else
				{
					p = ["M", x, y, "L", x, y];
				}
				
				if (fill)
				{
					if (smooth)
					{
						bgpp = ["M", leftgutter, height - bottomgutter, "L", x, y, "C", x, y];
					}
					else
					{
						bgpp = ["M", leftgutter, height - bottomgutter, "L", x, y, "L", x, y];
					}
				}
			}
			
			if (i && i < ii - 1)
			{
	            var Y0 = Math.round(height - bottomgutter - Y * data[j][i - 1]),
	                X0 = Math.round(leftgutter + X * i),
	                Y2 = Math.round(height - bottomgutter - Y * data[j][i + 1]),
	                X2 = Math.round(leftgutter + X * (i + 1));
					
	            var a = getAnchors(X0, Y0, x, y, X2, Y2);
				
				if (smooth)
				{
	            	p = p.concat([a.x1, a.y1, x, y, a.x2, a.y2]);
	            }
	            else
	            {
	            	p = p.concat([x,y]);
	            }
				
				if (fill)
				{
					if (smooth)
					{
						bgpp = bgpp.concat([a.x1, a.y1, x, y, a.x2, a.y2]);
					}
					else
					{
						bgpp = bgpp.concat([x,y]);
					}
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
		
		if (smooth)
		{
			p = p.concat([x, y, x, y]);
		}
		else
		{
			p = p.concat([x, y]);
		}
		
		path.attr({path: p});
		
		if (fill)
		{
			if (smooth)
			{
				bgpp = bgpp.concat([x, y, x, y, "L", x, height - bottomgutter, "z"]);
			}
			else
			{
				bgpp = bgpp.concat([x, y, x, height - bottomgutter, "z"]);
			}
			
			bgp.attr({path: bgpp});
		}
	}
	
	//Y labels
	var start_from=(y_label_0?0:1);
	var value=0;
	var y_label_anchor=(y_labels_position=='outside'?'end':'start');
	for (i=start_from;i<=y_labels_number;i++)
	{
		value=Math.round(i*max_value/y_labels_number);
		value=value.toString();
		var label_x=(y_labels_position=='outside'?leftgutter-1:leftgutter +1);
		var label_y=(y_labels_position=='outside'?height-bottomgutter-i*Math.round((height - topgutter - bottomgutter)/y_labels_number):(i==0?height-bottomgutter-i*Math.round((height - topgutter - bottomgutter)/y_labels_number)-8:height-bottomgutter-i*Math.round((height - topgutter - bottomgutter)/y_labels_number)+8));
		paper.text(label_x,label_y,value).attr(txt).attr({fill:'white','stroke':'#fff','stroke-width':2,'text-anchor':y_label_anchor}).toFront();
		paper.text(label_x,label_y,value).attr(txt).attr({fill:labelcolor,'text-anchor':y_label_anchor}).toFront();
	}

	//X labels
	for (var i=0, ii=labels.length;i<ii;i++)
	{
		if (labels[i])
		{
		var x = Math.round(leftgutter + X * i),
			x_label_anchor = (i==0?'start':(i==ii-1?'end':'middle'));
			t = paper.text(x, height - 6, labels[i]).attr(txt).attr({fill: labelcolor,'text-anchor':x_label_anchor}).toBack();
		}
	}

    frame.toFront();
    label[0].toFront();
    blanket.toFront();

};

Raphael.fn.raphalytics =function(data,labels,tooltips,options)
{
	return new raphalytics(this,data,labels,tooltips,options);
}
