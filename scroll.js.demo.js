var getUrlParameter = function (name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(window.location.search) || [, ""])[1].replace(/\+/g, '%20')) || null;
};
var getUrlHash = function () {
    var url = window.location.href;
    if (url.indexOf('#') < 0) return '';
    return url.substring(url.indexOf('#') + 1);
};

requirejs.config({
    paths: {
        scroll: './lib/scroll',
        hide: './lib/' + (!getUrlHash() ? 'displayNone' : 'visibilityHidden'),
        domini: './lib/domini',
        domock: './lib/domock'
    }
});

requirejs(['scroll', 'hide', 'domini', 'domock'], function(Scroll, Hide, Domini, Domock) {
    var test_listLength = parseInt(getUrlParameter('size') || '1000', 10);
    var test_targetDom = document.getElementById('div1');
    var test_native = getUrlParameter('native'),
        test_choice = getUrlParameter('hide'),
        test_offset = parseInt(getUrlParameter('offset'), 10),
        test_range = parseInt(getUrlParameter('range'), 10);
    var test_generateContent1 = function(div, levels) {
        for (var i = 0; i < levels[0]; i++) {
            var child = document.createElement('div');
            child.className = 'test-div';
            child.innerHTML = i + 1;
            div.appendChild(child);
        }
    };
    var test_generateContent2 = function(div, levels) {
        Domock(div, levels);
    };

    if(test_native) {
        document.title = '原生滚动';
    } else {
        if(!test_choice) {
            document.title = '模拟滚动';
        } else if(!getUrlHash()) {
            document.title = '模拟滚动-display:none';
        } else {
            document.title = '模拟滚动-visibility:hidden';
        }
    }

    test_generateContent2(test_targetDom, [test_listLength, 4, 4, 4]);

    if(test_native) return;

    new Scroll.control(test_targetDom, function(elem, record) {
        if(test_choice === 'true') Hide.update(-record.endPosition, record.scrollDir);
    });
    if(test_choice === 'true') Hide.init(test_targetDom, {
        offset: test_offset,
        range: test_range
    });
});
