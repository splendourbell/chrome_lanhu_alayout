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

function startRun(config) {
    //拼接数据地址

    // function hookStart(){
    //
    //     if(!document.getElementById("cllcopybutton")){
    //         document.querySelector('div.annotation_container').innerHTML = document.querySelector('div.annotation_container').innerHTML + '<p><button id="cllcopybutton">点击复制</button></p>';
    //     }
    //     function MyCllCopy(text)
    //     {
    //        function handler(event) {
    //            event.clipboardData.setData('text/plain', text);
    //            document.removeEventListener('copy', handler, true);
    //            event.preventDefault();
    //            document.getElementById("cllcopybutton").innerText = "已复制";
    //            setTimeout(()=>{
    //                document.getElementById("cllcopybutton").innerText = "点击复制";
    //            }, 2000);
    //        }
    //        document.addEventListener('copy', handler, true);
    //        document.execCommand('copy');
    //     }
    //
    //    document.getElementById('cllcopybutton').onclick=function(){
    //
    //        let result = genlayout(currentJsonData, true) || {}
    //        if(result.layout_marginLeft >= 375){
    //            delete result.layout_marginLeft;
    //         }
    //         delete result.layout_marginTop;
    //
    //        result = {
    //            "class": "RelativeLayout",
    //           "layout_width": "match_parent",
    //             "layout_height": "wrap_content",
    //             "background": "@color/blue",
    //             "gravity": "center",
    //             "children":[result]
    //        }
    //        MyCllCopy( JSON.stringify(result, null, 4) );
    //    }
    // }

    function getSelectedUnikey(){
        let arr = document.querySelectorAll('div.annotation_container_b div.annotation_item li');
        let data = {};
        for(let i=0; i<arr.length; i++){
            let type = (arr[i].querySelector('div.item_title')||{}).innerText;
            switch(type){
                case '图层':
                {
                    data.name = arr[i].querySelector('div.layer_name').innerText;
                    break;
                }

                case '位置':
                {
                    let pos = arr[i].querySelectorAll('div.item_two div.two');
                    data.left = parseInt(pos[0].innerText);
                    data.top = parseInt(pos[1].innerText);
                    break;
                }

                case '大小':
                {
                    let pos = arr[i].querySelectorAll('div.item_two div.two');
                    data.width = parseInt(pos[0].innerText);
                    data.height = parseInt(pos[1].innerText);
                    break;
                }

            }
        }

        let unikey = [data.left, data.top, data.width, data.height, data.name].join('-');
        return unikey;
    }

    function filterCurData(allData){

        let unikey = getSelectedUnikey();
        return searchItem(allData, unikey)
    }

    function searchItem(allData, unikey){

        allData = allData || [];
        for(let i=0; i<allData.length; i++){
            let curData = allData[i];
            if(curData.unikey.trim() == unikey.trim())
            {
                return [curData];
            }

            let matched = searchItem(curData.children, unikey);
            if(matched){
                return matched;
            }
        }
    }

    //hookStart();



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

    //请求真实的布局原始数据
    function getLayoutData()
    {
        document.MyLayoutData = null;
        document.MyLayoutDataSelected = null;

        var url = getInfoUrl();
        if(url)
        {
            axios.get(url).then(
                function (response) {
                    var url = response.data.result.versions[0].json_url;
                    console.log(url);
                    axios.get(url).then(function (response) {
                        genlayout(response.data);
                        if(document.querySelector('div.layer_select')){
                            genlayout(response.data, true);
                        }
                    }).catch(function (error) {
                        alert(error);
                    });
                }).catch(function (error) {
                    alert(error);
                });
        }
    }

    //解析布局数据，生成view
    function genlayout(jsonobject, onlyReturn)
    {
        let infos = jsonobject.info;
        let viewArray = [];
        infos.forEach((info, index) => {
            if(!info.top || info.top <= 667)
            {
                var viewObj = parseView(info);
                viewObj.__sortIndex = index;
                viewArray.push(viewObj);
            }
        });

        let filterKey;
        if(onlyReturn){
            filterKey = getSelectedUnikey()
        }
        netestViews(viewArray, filterKey);
        if(onlyReturn){
            viewArray = filterCurData(viewArray);
        }
        megerTextViewBackground(viewArray);
        sortChildrenByMarginLeft(viewArray);
        adjust_centerVertical(viewArray);
        adjust_layout_alignParentRight(viewArray);
        adjust_match_parent(viewArray, 375);
        wrapContentText(viewArray);
        adjust_sort_and_zeroValue(viewArray);
        remove_status_bar(viewArray);

        var container = {
            "class" : "RelativeLayout",
            "layout_width" : "match_parent",
            "layout_height" : "match_parent",
            children : viewArray
        }

        if(viewArray.length == 1)
        {
            container = viewArray[0];
        }

        if(container.layout_height.toFloatValue() == 667)
        {
            container.layout_height = "match_parent";
        }
        if(onlyReturn){

            if(container.layout_marginLeft >= 375){
                delete container.layout_marginLeft;
             }
             delete container.layout_marginTop;

            container = {
                "class": "RelativeLayout",
               "layout_width": "match_parent",
                 "layout_height": "wrap_content",
                 "background": "@color/blue",
                 "gravity": "center",
                 "children":[container]
            }
            document.MyLayoutDataSelected = JSON.stringify(container, null, 4);
        } else {
            document.MyLayoutData = JSON.stringify(container, null, 4);
        }

        return container;
    }

    function parseView(info)
    {
        let viewObj = createView(info);
        parseRect(viewObj, info);
        let background = getBackground(info);
        background = guessCircelBackground(info, background);
        if(background)
        {
            viewObj.background = background;
        }
        else
        {

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

        if(info.type == "text")
        {
            viewObj.class = "TextView";
        }
        else if(info.type == "bitmap"
            || info.type == "slice"
            || (info.type == "shape" && info.image))
        {
            viewObj.class = "ImageView";
        }
        else
        {
            viewObj.class = "RelativeLayout";
        }

        viewObj.unikey = [info.left, info.top, info.width, info.height, info.name].join('-');
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
        viewObj.layout_width = (viewObj.layout_width || 0).toDimension();
        viewObj.layout_height = (viewObj.layout_height || 0).toDimension();
    }

    function guessCircelBackground(info, background)
    {
        if(info.type == 'shape'
            && info.name && info.name.startsWith('Oval'))
        {
            if(typeof background === 'string')
            {
                background = {
                    "class": "shape",
                    "shape": "rectangle",
                    "children": [
                        {
                            "class":"solid",
                            "color":background
                        }
                    ]
                }
            }

            background = background || {
                "class": "shape",
                "shape": "rectangle",
                "children": [
                ]
            }


            var hasCorners = false;
            for(var i=0; i<background.children.length; i++)
            {
                var child = background.children[i];
                if(child.class == 'corners')
                {
                    hasCorners = true;
                    break;
                }
            }

            if(!hasCorners)
            {
                background.children.push(
                    {
                        "class": "corners",
                        "radius": "1000dp"
                    }
                )
            }
        }
        return background;
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

        if(info.type == 'shape' && info.image && info.image.svg)
        {
            if(info.image.svg.indexOf('<circle') > 0)
            {
                background.children.push(
                    {
                        "class": "corners",
                        "radius": "1000dp"
                    }
                )
                background.children.push(
                    {
                        "class":"solid",
                        "color":"#F00"
                    }
                )
            }
        }

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
            shapeSolid = getShapeSolidChild(info.fills, info.opacity);
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
    function getShapeSolidChild(fills, opacity)
    {
        for(var i=0; i < fills.length; i++)
        {
            let fillObj = fills[i];
            if('color' == fillObj.type)
            {
                let colorObj = {
                    "class": "solid"
                }
                colorObj.color = toHexColor(fillObj.color, opacity);
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
                        if(Array.isArray(colorStops) && colorStops.length > 0)
                        {
                            colorObj.startColor = toHexColor(colorStops[colorStops.length-1].color);
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
                        return;
                        alert("not support type : " + gradient.type);
                    }
                    colorObj.color = toHexColor(fillObj.color);
                    return colorObj;
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

    function toHexColor(colorObj, opacity)
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

        if(opacity != undefined && opacity >=0 && opacity <= 100
            && (colorObj.a == 1 || !colorObj.a))
        {
            colorObj.a = opacity / 100;
        }
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

    //通过生成的绝对坐标，按控制大小判断生成父子关系
    function netestViews(viewArray, filterKey)
    {
        let index = viewArray.findIndex((item) => item.unikey == filterKey);
        if(index > 0){
            viewArray = viewArray.slice(index-1);
        }
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

    //当前为RelativeLayout时(默认普通控制均生成为RelativeLayout)，
    //如果子控制只有一个TextView控件
    //便将两个控制合并，父控件当作Text的背景处理
    function megerTextViewBackground(viewArray)
    {
        for(var i=0; i<viewArray.length; i++)
        {
            let view = viewArray[i];
            if('RelativeLayout' == view.class && view.children && 1 == view.children.length)
            {
                var textView = view.children[0];
                if(textView.class == 'TextView' && !textView.background)
                {
                    for(var key in textView)
                    {
                        if("layout_marginTop" == key || "layout_marginLeft" == key
                            || "layout_width" == key || "layout_height" == key)
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

    //将上下margin相等值控制，设置为垂直居中
    function adjust_centerVertical(viewArray)
    {
        viewArray.forEach(view =>{
            var children = view.children || [];
            for(var i=0, len=children.length; i<len; i++)
            {
                if(view.layout_height)
                {
                    var parentHeight = view.layout_height.toFloatValue();
                    children[i].layout_marginTop = children[i].layout_marginTop || "0dp";
                    if(parentHeight > 0 && children[i].layout_height && children[i].layout_height.toFloatValue() > 0)
                    {
                        var layout_marginBottom = parentHeight - children[i].layout_height.toFloatValue() - children[i].layout_marginTop.toFloatValue();
                        if( Math.abs(layout_marginBottom - children[i].layout_marginTop.toFloatValue()) <= 2 )
                        {
                            delete children[i].layout_marginTop;
                            children[i].layout_centerVertical = "true";
                        }
                    }
                }
            }
            adjust_centerVertical(children);
        });
    }

    //将靠右的控制，调整为右对齐方式
    function adjust_layout_alignParentRight(viewArray)
    {
        viewArray.forEach(view =>{
            var children = view.children || [];
            for(var i=0, len=children.length; i<len; i++)
            {
                if(view.layout_width)
                {
                    var parentWidth = view.layout_width.toFloatValue();
                    children[i].layout_marginLeft = children[i].layout_marginLeft || "0dp";
                    if(parentWidth > 0 && children[i].layout_width && children[i].layout_width.toFloatValue() > 0)
                    {
                        var layout_marginRight = parentWidth - children[i].layout_width.toFloatValue() - children[i].layout_marginLeft.toFloatValue();
                        if( children[i].layout_marginLeft.toFloatValue() >  parentWidth / 2 )
                        {
                            delete children[i].layout_marginLeft;
                            children[i].layout_marginRight = layout_marginRight.toDimension();
                            children[i].layout_alignParentRight = "true";
                        }
                    }
                }
            }
            adjust_layout_alignParentRight(children);
        });
    }

    //将宽度+margin 与父控件相等的控件设置为 match_parent
    function adjust_match_parent(viewArray, parentWidth)
    {
        viewArray.forEach(view => {
            var children = view.children || [];
            view.layout_width = view.layout_width || "0dp";
            adjust_match_parent(children, view.layout_width.toFloatValue());
            if(parentWidth > 0
                && !view.layout_marginRight
                && view.layout_width && view.layout_width.toFloatValue() > 0)
            {
                var viewFullWidth = view.layout_marginLeft.toFloatValue()*2 + view.layout_width.toFloatValue();
                if(Math.abs(viewFullWidth - parentWidth) <= 1)
                {
                    if("TextView" == view.class)
                    {
                        view.layout_width = "match_parent";
                        view.layout_marginRight = view.layout_marginLeft;
                        view.gravity = "center";
                    }
                    else
                    {
                        view.layout_width = "match_parent";
                        view.layout_marginRight = view.layout_marginLeft;
                    }
                }
            }
        });
    }

    //将375宽度 修改为  match_parent
    function adjustScreen_375(viewArray)
    {
        viewArray.forEach(view =>{
            if(view.layout_width.toFloatValue() == 375)
            {
                view.layout_width = "match_parent"
            }
            adjustScreen_375(view.children || [])
        })
    }

    function wrapContentText(viewArray)
    {
        if(!config || !config.doNotAdjust375)
        {
            adjustScreen_375(viewArray);
        }

        viewArray.forEach(view =>{
            if("TextView" == view.class)
            {
                view.lines = "1";
                view.ellipsize = "end";
                view.layout_height = "wrap_content";

                if(view.layout_width != "match_parent")
                {
                    view.layout_width = "wrap_content";
                }

                if(view.layout_centerVertical == "true"
                && view.layout_height == "wrap_content")
                {
                    view.layout_height = "match_parent";
                    if(view.gravity != "center")
                    {
                        view.gravity = "center|left";
                    }
                }
            }
            else
            {
                wrapContentText(view.children || [])
            }
        })
    }

    function sortChildrenByMarginLeft(viewArray)
    {
        viewArray.sort((viewA, viewB) => {
            if(viewA.layout_marginLeft && viewB.layout_marginLeft)
            {
                let cmp = viewA.layout_marginLeft.toFloatValue() - viewB.layout_marginLeft.toFloatValue()
                if(cmp == 0)
                {
                    if(viewA.layout_marginTop && viewB.layout_marginTop)
                    {
                        return viewA.layout_marginTop.toFloatValue() - viewB.layout_marginTop.toFloatValue()
                    }
                    else if(viewA.layout_marginTop)
                    {
                        return -1;
                    }
                    else
                    {
                        return 1;
                    }
                }
            }
            else if(viewA.layout_marginLeft)
            {
                return -1;
            }
            else
            {
                return 1;
            }
        });

        viewArray.forEach(view => {
            sortChildrenByMarginLeft(view.children || [])
        });
    }

    function adjust_sort_and_zeroValue(viewArray)
    {
        viewArray.forEach(view => {
            var children = view.children || [];
            adjust_sort_and_zeroValue(children);

            view.background = view.background;
            view.children = view.children;

            if(view.layout_marginLeft && view.layout_marginLeft.toFloatValue() == 0
                && (!view.layout_marginRight || view.layout_width == 'match_parent') )
            {
                delete view.layout_marginLeft;
            }

            if(view.layout_marginRight && view.layout_marginRight.toFloatValue() == 0
                && (!view.layout_marginLeft || view.layout_width == 'match_parent'))
            {
                delete view.layout_marginRight;
            }

            if(view.layout_marginTop && view.layout_marginTop.toFloatValue() == 0
                && (!view.layout_marginBottom || view.layout_height == 'match_parent') )
            {
                delete view.layout_marginTop;
            }

            if(view.layout_marginBottom && view.layout_marginBottom.toFloatValue() == 0
                && (!view.layout_marginTop || view.layout_height == 'match_parent') )
            {
                delete view.layout_marginBottom;
            }

            var keys = Object.keys(view);
            keys.sort( (a, b)=> {
                if(a.startsWith('layout') && !b.startsWith('layout'))
                {
                    return -1;
                }

                if(b.startsWith('layout') && !a.startsWith('layout'))
                {
                    return 1;
                }

                return  a.localeCompare(b)}
            );

            keys = keys.filter((v)=>{
                return ( v != 'class'
                    && v != 'layout_width'
                    && v != 'layout_height' )
            });

            keys = ['class', 'layout_width', 'layout_height', ...keys];

            keys.forEach(key => {
                var tmpValue = view[key];
                delete view[key];
                if(tmpValue)
                {
                    view[key] = tmpValue;
                }
            });



            //删除再添加，只是为了序列化时
            let tempBg = view.background;
            delete view.background;
            view.background = tempBg;

            let tempChildren = view.children;
            delete view.children;
            view.children = tempChildren;
        })
    }



    function remove_status_bar(viewArray)
    {
        var count = 0;
        for(var len=viewArray.length, i=len-1; i >= 0; i--)
        {
            var view = viewArray[i];
            if(view.id)
            {
                var idStr = view.id.toLowerCase();
                idStr = idStr.replace(/ /g, "");
                if(idStr.indexOf("mobilesignal") >= 0
                || idStr.indexOf("wi-fi") >= 0
                || idStr.indexOf("100%") >= 0)
                {
                    count++;
                }
            }
            if(remove_status_bar(view.children || []))
            {
                viewArray.splice(i,1);
            }
            else
            {
                delete view.id;
                delete view.unikey;
            }
        }
        if(count >= 2)
        {
            return true;
        }
    }


    if(window.location.href.indexOf('lanhuapp.com/web/#/item/project/board/detail') < 0) {
        alert("请进入详情页 再尝试操作")
    } else {
        getLayoutData();
    }
}

function getLayoutedData()
{
    if(document.MyLayoutData){
        return {data:document.MyLayoutData, selectedData:document.MyLayoutDataSelected}
    }
}

console.log("plugin alayout run");
