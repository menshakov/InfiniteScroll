'use strict';

function InfiniteScroll(params) {
    var $mainContainer = $(params.container);

    this.containerName = params.container;

    this._offset = params.offset || 0;
    this._limit = params.limit || 5;
    this._paramName = params.paramName || "page";

    this._current = (getParameter(this._paramName)) ?  +getParameter(this._paramName) : 1;
    this._fetch = false;

    function getParameter(key) {
        var s = window.location.search;
        s = s.match(new RegExp(key + '=([^&=]+)'));
        return s ? s[1] : false;
    }

    function setParameter (url, key, value){
        // http://stackoverflow.com/a/10997390/2391566
        var parts = url.split('?');
        var baseUrl = parts[0];
        var oldQueryString = parts[1];
        var newParameters = [];

        if (oldQueryString) {
            var oldParameters = oldQueryString.split('&');
            for (var i = 0; i < oldParameters.length; i++) {
                if(oldParameters[i].split('=')[0] != key) {
                    newParameters.push(oldParameters[i]);
                }
            }
        }

        if (value !== '' && value !== null && typeof value !== 'undefined') {
            newParameters.push(key + '=' + encodeURI(value));
        }

        if (newParameters.length > 0) {
            return baseUrl + '?' + newParameters.join('&');
        } else {
            return baseUrl;
        }
    }

    function changeUrl (nextUrl) {
        history.pushState({}, "", nextUrl);
    }

    function getDocumentHeight() {
        var body = document.body;
        var html = document.documentElement;

        return Math.max(
            body.scrollHeight,
            body.offsetHeight,
            html.clientHeight,
            html.scrollHeight,
            html.offsetHeight
        );
    }

    function getScrollTop() {
        return (window.pageYOffset !== undefined)
            ? window.pageYOffset
            : (document.documentElement || document.body.parentNode || document.body).scrollTop;
    }

    function getPageSeparator(page) {
        var pageSeparateContent = document.createTextNode('Страница №' + page);
        var separator = document.createElement('div');
        separator.className = 'page-wrapper-style';
        separator.appendChild(pageSeparateContent);

        return separator;
    }

    this.nextPage = function () {
        this._current++;
    };

    this.addPage = function () {
        this.nextPage();
        $mainContainer.append(getPageSeparator(this._current));

        var nextUrl = setParameter(
            window.location.toString(),
            this._paramName,
            this._current
        );

        var that = this;

        this.fetchContent(nextUrl)
            .done(
                function(response) {
                    var $result = $(response).find(that.containerName);
                    console.log(document.getElementById(that.containerNam))
                    changeUrl(nextUrl);
                    $mainContainer.append($result.children());
                    that._fetch = false;
                }
            );

        console.log('page #' + (this._current));
    };

    this.fetchContent = function(url) {
        var that = this;

        return $.ajax({
            method: 'GET',
            url: url,
            beforeSend: function() {
                that._fetch = true;
            }
        });
    };

    this.run = function () {
        if (this._current >= this._limit || this._fetch) return;
        if (getScrollTop() < (getDocumentHeight() - window.innerHeight)) return;

        this.addPage();
    }
}

var $limit = $('.pagination .links .pages a').last();
$limit = ($limit.length) ? $limit.data('page') : 1;

var scroll = new InfiniteScroll({
    container: '#items-container',
    offset: 0,
    limit: $limit,
    paramName: 'page'
});

window.onscroll = function () {
  scroll.run();
};
