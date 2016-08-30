define(function () {
    var _list = null,
        _conf = {
            liveRangeOffset: 20,
            liveRange: 40,
            displayNeeded: false
        },
        _cache = {
            begin: 1, // 刚好没过(<=)pos的元素索引，从1到len-2
            pos: 0,
            dir: 0, // 0: down, 1: up
            hIndex: [], // height
            pIndex: [], // position
            vIndex: [], // visibility
            dIndex: [], // display
            preHeight: 0,
            subHeight: 0
        },
        _preBlank = null,
        _subBlank = null;

    var _getStyle = function (oElm, strCssRule) {
        var strValue = '';
        if (document.defaultView && document.defaultView.getComputedStyle) {
            strValue = document.defaultView.getComputedStyle(oElm, '').getPropertyValue(strCssRule);
        } else if (oElm.currentStyle) {
            strCssRule = strCssRule.replace(/\-(\w)/g, function (strMatch, p1) {
                return p1.toUpperCase();
            });
            strValue = oElm.currentStyle[strCssRule];
        }
        return strValue;
    };

    var _initBlank = function () {
        var blankStyle = 'width:100%;height:0;padding:0;border:0;margin:0;';
        _preBlank = document.createElement('div');
        _preBlank.setAttribute('style', blankStyle);
        _list.insertBefore(_preBlank, _list.childNodes[0]);
        _subBlank = document.createElement('div');
        _subBlank.setAttribute('style', blankStyle);
        _list.appendChild(_subBlank);
        _cache.preHeight = 0;
        _cache.subHeight = 0;
    };

    var _initIndex = function () {
        var children = _list.childNodes;
        var len = children.length;
        var h = 0;
        for (var i = 1; i < len; i++) {
            _cache.pIndex[i] = h;
            _cache.hIndex[i] = children[i].offsetHeight;
            h += _cache.hIndex[i];
            _cache.vIndex[i] = true;
            if (_conf.displayNeeded) _cache.dIndex[i] = _getStyle(children[i], 'display');
        }
    };

    var init = function (list, conf) {
        var children = list.childNodes;
        if (!children || !children.length) {
            return;
        }

        _conf.liveRangeOffset = conf.offset || _conf.liveRangeOffset;
        _conf.liveRange = conf.range || _conf.liveRange;
        _conf.displayNeeded = !!conf.displayNeeded;

        _list = list;

        _initBlank();

        _initIndex();

        // 隐藏首尾
        var tempBegin = 1 - _conf.liveRangeOffset,
            tempEnd = 1 + _conf.liveRange,
            len = children.length;
        for(var i = tempBegin - 1; i >= 1; i--) {
            children[i].style.display = 'none';
            _cache.vIndex[i] = false;
        }
        _preBlank.style.height = _cache.pIndex[tempBegin < 1 ? 1 : tempBegin] + 'px';

        for(var i = tempEnd; i < len - 1; i++) {
            children[i].style.display = 'none';
            _cache.vIndex[i] = false;
            _cache.subHeight += _cache.hIndex[i];
        }
        _subBlank.style.height = _cache.subHeight + 'px';
    };

    var _getBegin = function(pos, len) {
        var begin = 1, i;
        if (_cache.dir == 0) { // 向下移动
            for (i = _cache.begin; i >= 1; i--) {
                if (_cache.pIndex[i] <= pos) { // 第i个元素刚好没过pos
                    begin = i;
                    break;
                }
            }
        } else { // 向上移动
            for (i = _cache.begin; i < len; i++) {
                if (_cache.pIndex[i] > pos) { // 第i个元素刚好超过pos
                    begin = i - 1;
                    break;
                }
            }
        }
        if(begin < 1) begin = 1;
        return begin;
    };

    var update = function (pos) {
        // console.log({
        //     h: _list.offsetHeight,
        //     p: pos
        // });
        var children = _list.childNodes;
        var len = children.length;
        var begin = 1;
        var i = 0, j = 0;

        if (pos < 0) pos = -pos;
        if (pos == _cache.pos) return;
        if (pos < _cache.pos) {
            _cache.dir = 0; // 向下移动
        } else {
            _cache.dir = 1; // 向上移动
        }
        _cache.pos = pos;

        begin = _getBegin(pos, len);

        // toggle一些元素 {
        var tempBegin, tempEnd, displayTo = _cache.begin - _conf.liveRangeOffset;
        if(displayTo < 1) displayTo = 1;
        if (_cache.dir == 0) { // 向下移动
            tempBegin = _cache.begin - _conf.liveRangeOffset - 1;
            tempEnd = begin - _conf.liveRangeOffset;
            if(tempBegin > len - 2) tempBegin = len - 2;
            if(tempEnd < 1) tempEnd = 1;
            for (i = tempBegin; i >= tempEnd; i--) {
                children[i].style.display = _conf.displayNeeded ? _cache.dIndex[i] : 'block';
                _cache.vIndex[i] = true;
            }
            displayTo = tempEnd;

            tempBegin = begin + _conf.liveRange;
            tempEnd = _cache.begin + _conf.liveRange;
            if(tempBegin < 1) tempBegin = 1;
            if(tempEnd > len - 1) tempEnd = len - 1;
            for (j = tempBegin; j < tempEnd; j++) {
                children[j].style.display = 'none';
                _cache.vIndex[j] = false;
                _cache.subHeight += _cache.hIndex[j];
            }
        } else { // 向上移动
            tempBegin = _cache.begin + _conf.liveRange;
            tempEnd = begin + _conf.liveRange;
            if(tempBegin < 1) tempBegin = 1;
            if(tempEnd > len - 1) tempEnd = len - 1;
            for (j = tempBegin; j < tempEnd; j++) {
                children[j].style.display = _conf.displayNeeded ? _cache.dIndex[j] : 'block';
                _cache.vIndex[j] = true;
                _cache.subHeight -= _cache.hIndex[j];
            }

            tempBegin = _cache.begin - _conf.liveRangeOffset;
            tempEnd = begin - _conf.liveRangeOffset;
            if(tempBegin < 1) tempBegin = 1;
            if(tempEnd > len - 1) tempEnd = len - 1;
            for (i = tempBegin; i < tempEnd; i++) {
                children[i].style.display = 'none';
                _cache.vIndex[i] = false;
            }
            displayTo = tempEnd;
        }
        if(displayTo < 1) displayTo = 1;
        if(displayTo > len - 2) displayTo = len - 2;
        _preBlank.style.height = _cache.pIndex[displayTo] + 'px';
        _subBlank.style.height = _cache.subHeight + 'px';
        // }

        _cache.begin = begin;

        // console.log({
        //     h: _list.offsetHeight,
        //     begin: begin,
        //     pre: _preBlank.offsetHeight / 130,
        //     sub: _subBlank.offsetHeight / 130
        // });
    };

    return {
        init: init,
        update: update
    }
});
