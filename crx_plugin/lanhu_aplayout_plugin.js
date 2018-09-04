Array.prototype.indexOf = function (val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) return i;
    }
    return -1;
};

Array.prototype.remove = function (val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};

String.prototype.toDimension = function () {
    return parseFloat(this).toDimension();
};

String.prototype.toFloatValue = function () {
    return parseFloat(parseFloat(this).toFixed(6));
}

Number.prototype.toFloatValue = function () {
    return parseFloat(this.toDimension());
}

Number.prototype.toDimension = function () {
    let str = this.toFixed(6);
    if(str.indexOf('.') >= 0)
        str = str.replace(new RegExp('[\\.]?0+$', 'g'), '');
    return str + "dp";
}


// function MyCopy(text)
// {
//     setTimeout(() => {
//         function handler(event) {
//             console.log("fiowjfowiejfoiwjfoiawjfoiajfiouawejfiuawfailwfhaiuwfhawiufe");
//             event.clipboardData.setData('text/plain', text);
//             document.removeEventListener('copy', handler, true);
//             event.preventDefault();
//             alert("已复制");
//         }
//         document.addEventListener('copy', handler, true);
//         document.execCommand('copy');
//     }, 200);
// }

function startRun() {
    function getInfoUrl()
    {
        var hashstr = window.location.hash;
        if(hashstr.indexOf('?') >= 0) {
            hashstr = hashstr.substr(hashstr.indexOf('?')+1);
            var queryArray = hashstr.split('&');
            var queryObj = {};
            queryArray.forEach( e => {
                var arr = e.split('='); 
                queryObj[arr[0]]=arr[1];
            });
            
            return `https://lanhuapp.com/api/project/image?image_id=${queryObj.image_id}&project_id=${queryObj.project_id}`;
        }
    }

    function getLayoutData()
    {
        document.MyLayoutData = null;

        var url = getInfoUrl();
        if(url)
        {
            axios.get(url).then(
                function (response) {
                    var url = response.data.result.versions[0].json_url;
                    console.log(url);
                    axios.get(url).then(function (response) {
                        genlayout(response.data);
                    }).catch(function (error) {
                    alert(error);
                    });
                }).catch(function (error) {
                alert(error);
                });
        }
    }

    function genlayout(jsonobject)
    {
        let infos = jsonobject.info;
        let viewArray = infos.map((info, index) => {
            var viewObj = parseView(info);
            viewObj.__sortIndex = index;
            return viewObj;
        });

        netestViews(viewArray);
        wrapContentText(viewArray);

        var container = {
            "class" : "RelativeLayout",
            "layout_width" : "match_parent",
            "layout_height" : "match_parent",
            children : viewArray
        }

        document.MyLayoutData = JSON.stringify(container, null, 4);
        return container;
    }

    function parseView(info)
    {
        let viewObj = createView(info);
        parseRect(viewObj, info);
        let background = getBackground(info);
        if(background)
        {
            viewObj.background = background;
        }

        parseStylesForTextView(viewObj, info);
        return viewObj;
    }

    function createView(info)
    {
        var viewObj = {};
        if(info.name)
        {
            viewObj.id = info.name;
        }

        switch(info.type)
        {
            case "text":
                viewObj.class = "TextView";
            break;

            case "bitmap":
            case "slice":
                viewObj.class = "ImageView";
            break;

            default:
                viewObj.class = "RelativeLayout";
            break;
        }
        return viewObj;
    }

    function parseRect(viewObj, info)
    {
        viewObj.layout_marginTop = (info.top||0).toDimension();
        viewObj.layout_marginLeft = (info.left||0).toDimension();

        if(info.width > 0)
        {
            viewObj.layout_width = info.width.toDimension();
        }

        if(info.height > 0)
        {
            viewObj.layout_height = info.height.toDimension();
        }
    }

    function getBackground(info)
    {
        let background = {
            "class": "shape",
            "shape": "rectangle",
            "children": [
            ]
        }

        var shapeRadius = null;
        var shapeSolid = null;
        var shapeShadow = null;
        var shapeStroke = null;
        var shapeGradient = null;

        if(Array.isArray(info.radius))
        {
            shapeRadius = getShapeRadiusChild(info.radius);
            if(shapeRadius)
            {
                background.children.push(shapeRadius);
            }
        }

        if(Array.isArray(info.fills))
        {
            shapeSolid = getShapeSolidChild(info.fills);
            if(shapeSolid)
            {
                background.children.push(shapeSolid);
            }

            shapeGradient = getShapeGradientChild(info.fills);
            if(shapeGradient)
            {
                background.children.push(shapeGradient);
            }
        }

        if(Array.isArray(info.shadow))
        {
            shapeShadow = getShapeShadowChild(info.shadow);
            if(shapeShadow)
            {
                background.children.push(shapeShadow);
            }
        }

        if(Array.isArray(info.borders))
        {
            shapeStroke = getShapeStrokeChild(info.borders);
            if(shapeStroke)
            {
                background.children.push(shapeStroke);
            }
        }

        if(background.children.length > 0)
        {
            if(shapeSolid && 1 == background.children.length)
            {
                background = shapeSolid.color;
            }
            return background;
        }
    }

    //背景圆角解析
    function getShapeRadiusChild(radius)
    {
        let topLeft = (radius[0] || 0).toDimension();
        let topRight = (radius[1] || 0).toDimension();
        let bottomRight = (radius[2] || 0).toDimension();
        let bottomLeft = (radius[3] || 0).toDimension();

        if(radius.length == 1)
        {
            if(topLeft.toFloatValue() > 0)
            {
                return {
                    "class": "corners",
                    "radius": topLeft
                }
            }
        }
        else 
        {
            let corners = {
                "class": "corners"
            }
            if(topLeft.toFloatValue() > 0) 
            {
                corners.topLeftRadius = topLeft;
            }
            if(topRight.toFloatValue() > 0) 
            {
                corners.topRightRadius = topRight;
            }
            if(bottomRight.toFloatValue() > 0) 
            {
                corners.bottomRightRadius = bottomRight;
            }
            if(bottomLeft.toFloatValue() > 0) 
            {
                corners.bottomLeftRadius = bottomLeft;
            }
            return corners;
        }
    }

    //背景色解析
    function getShapeSolidChild(fills)
    {
        for(var i=0; i < fills.length; i++)
        {
            let fillObj = fills[i];
            if('color' == fillObj.type)
            {
                let colorObj = {
                    "class": "solid"
                }
                colorObj.color = toHexColor(fillObj.color);
                return colorObj;
            }
        }
    }

    function getShapeGradientChild(fills)
    {
        for(var i=0; i < fills.length; i++)
        {
            let fillObj = fills[i];
            if('gradient' == fillObj.type)
            {
                let colorObj = {
                    "class": "gradient"
                }
                let gradient = fillObj.gradient;
                if(gradient)
                {
                    if('linear' == gradient.type)
                    {
                        let colorStops = gradient.colorStops;
                        if(Array.isArray(colorStops) && colorStops.length == 2)
                        {
                            colorObj.startColor = toHexColor(colorStops[1].color);
                            colorObj.endColor = toHexColor(colorStops[0].color);

                            let x1 = gradient.from.x.toFloatValue();
                            let y1 = gradient.from.y.toFloatValue();
                            let x2 = gradient.to.x.toFloatValue();
                            let y2 = gradient.to.y.toFloatValue();
                            
                            let radian = Math.atan(Math.abs((y2 - y1) / (x2 - x1))) * 180 / Math.PI;
                            var angle = 0;

                            if(radian <= (Math.PI/8))
                            {
                                angle = x2 > x1 ? 0 : 180;
                            }
                            else if(radian >= (Math.PI*3/8))
                            {
                                angle = y2 > y1 ? 90 : 270;
                            }
                            else
                            {
                                let matchIndex = (y2 > y1) | (1 << x2 > x1);
                                angle = [225,135,315,45][matchIndex];
                            }
                            colorObj.angle = angle;
                            return colorObj;
                        }
                        else
                        {
                            alert("gradient.colorStops format error:" + gradient.colorStops);
                        }
                    }
                    else
                    {
                        alert("not support type : " + gradient.type);
                    }
                    colorObj.color = toHexColor(fillObj.color);
                    return colorObj;
                }
            }
        }
                //             "angle": "270",
                //             "centerX":"0.5",
                //             "centerY":"0.5",
                var jj = {
                    "type": "gradient",
                    "gradient": {
                        "type": "linear",

                        "from": {
                                "x": 0.5,
                                "y": 1
                            },
                        "to": {
                                "x": 0.4999999999999999,
                                "y": 0.026395411849710948
                            }
                        }
                    }
    }

    function getShapeStrokeChild(borders)
    {
        let border = borders[0];
        if(border)
        {
            let stroke = {
                "class": "stroke"
            }
            if(border.thickness)
            {
                stroke.width = border.thickness + "px";
            }
            if(border.color)
            {
                stroke.color = toHexColor(border.color);
            }
            return stroke;
        }
    }

    function toHexColor(colorObj)
    {
        let hexFormat = (hexStr)=>{
            if(hexStr.length < 2) {
                hexStr = "0" + hexStr;
            } else if(hexStr.length > 2) {
                hexStr = hexStr.substr(0,2);
            }
            return hexStr;
        }
        var colorFormat = "";
        var r = hexFormat(colorObj.r.toString(16));
        var g = hexFormat(colorObj.g.toString(16));
        var b = hexFormat(colorObj.b.toString(16));
        colorFormat = r+g+b;
        if(colorObj.a != 1)
        {
            var a = hexFormat(Math.round(colorObj.a*255).toString(16));
            colorFormat = a + colorFormat;
        }
        colorFormat = "#"+colorFormat;
        return colorFormat;
    }

    function getShapeShadowChild(shadows)
    {
        let shadow = shadows[0];
        if(shadow)
        {
            var shadowObj = {
                "class": "shadow"
            }
            if(shadow.offsetX != undefined)
            {
                shadowObj.shadowDx = shadow.offsetX.toFloatValue()+"";
            }

            if(shadow.offsetY != undefined)
            {
                shadowObj.shadowDy = shadow.offsetY.toFloatValue()+"";
            }

            if(shadow.blurRadius != undefined)
            {
                shadowObj.shadowRadius = shadow.blurRadius.toFloatValue() + "";
            }

            if(shadow.color)
            {
                shadowObj.shadowColor = toHexColor(shadow.color);
            }
            return shadowObj;
        }
    }

    function parseStylesForTextView(viewObj, info)
    {
        if(viewObj.class == "TextView")
        {
            var font = info.font;
            viewObj.text = font.content;
            if(font.size)
            {
                viewObj.textSize = font.size.toDimension();
            }
            viewObj.textColor = toHexColor(font.color);
        }
    }


    function netestViews(viewArray)
    {
        let newViewArray = viewArray.slice(0);
        newViewArray = newViewArray.sort((viewA, viewB) => {
            return viewA.layout_width.toFloatValue() * viewA.layout_height.toFloatValue() - viewB.layout_width.toFloatValue()
                * viewB.layout_height.toFloatValue();
        });

        for(var i=0; i<newViewArray.length; i++)
        {
            var view = newViewArray[i];
            for(var j=i+1; j<newViewArray.length; j++)
            {
                var bigView = newViewArray[j];
                if(containsView(bigView, view))
                {
                    bigView.children = bigView.children || []
                    bigView.children.push(view);

                    view.layout_marginLeft = ((view.layout_marginLeft).toFloatValue() - (bigView.layout_marginLeft).toFloatValue()).toDimension();
                    view.layout_marginTop = ((view.layout_marginTop).toFloatValue() - (bigView.layout_marginTop).toFloatValue()).toDimension();

                    viewArray.remove(view);
                    break;
                }
            }
        }
        viewArray.sort((va, vb) => va.__sortIndex - vb.__sortIndex);
        viewArray.forEach(view => {
            var children = view.children || [];
            netestViews(children);
            delete view.__sortIndex;
        })
    }

    function megerTextViewBackground(viewArray)
    {
        for(var i=0; i<viewArray.length; i++) 
        {
            let view = viewArray[i];
            if(view.class == 'RelativeLayout'
                && view.children 
                && view.children.length == 1) 
            {
                var textView = view.children[0];
                if(textView.class == 'TextView' && !textView.background)
                {
                    for(var key in textView)
                    {
                        if("layout_marginTop" == key
                        || "layout_marginLeft" == key
                        || "layout_width" == key
                        || "layout_height" == key)
                        {

                        }
                        else
                        {
                            view[key] = textView[key];
                        }
                    }
                    view.class = textView.class;
                    view.id = textView.id;
                    view.paddingTop = textView.layout_marginTop;
                    view.paddingLeft = textView.layout_marginLeft;
                    view.paddingRight = (
                                        view.layout_width.toFloatValue()
                                        - textView.layout_width.toFloatValue()
                                        - textView.layout_marginLeft.toFloatValue()
                                    ).toDimension();

                    view.paddingBottom = (
                                        (view.layout_height).toFloatValue()
                                        - (textView.layout_height).toFloatValue()
                                        - (textView.layout_marginTop).toFloatValue()
                                    ).toDimension();
                    let tempBg = view.background;
                    delete view.background;
                    view.background = tempBg;
                    delete view.children;
                }
            }
        }
    }

    function containsView(bigView, smallView)
    {
        if(bigView.class == "ViewGroup" 
        || bigView.class == "RelativeLayout"
        || bigView.class == "LinearLayout"
        || bigView.class == "FlowLayout") {
            var b_l = bigView.layout_marginLeft.toFloatValue();
            var b_t = bigView.layout_marginTop.toFloatValue();
            var b_r = (bigView.layout_width.toFloatValue() + b_l).toFloatValue();
            var b_b = (bigView.layout_height.toFloatValue() + b_t).toFloatValue();

            var s_l = smallView.layout_marginLeft.toFloatValue();
            var s_t = smallView.layout_marginTop.toFloatValue();
            var s_r = (smallView.layout_width.toFloatValue() + s_l).toFloatValue();
            var s_b = (smallView.layout_height.toFloatValue() + s_t).toFloatValue();
            
            if(b_l <= s_l && b_t <= s_t 
                && b_r >= s_r && b_b >= s_b )
            {
                return true;
            }
        }
        return false;
    }

    function wrapContentText(viewArray)
    {
        megerTextViewBackground(viewArray);
        viewArray.forEach(view =>{
            if("TextView" == view.class)
            {
                view.layout_width = "wrap_content";
                view.layout_height = "wrap_content";
            }
            else
            {
                wrapContentText(view.children || [])
            }
        })
    }
    if(window.location.href.indexOf('https://lanhuapp.com/web/#/item/board/detail') < 0) {
        alert("请进入详情页 再尝试操作")
    } else {
        getLayoutData();
    }
}

function getLayoutedData()
{
    return document.MyLayoutData;
}
console.log("plugin alayout run");

