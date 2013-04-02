BEM.DOM.decl('content', {

    onSetMod: {

        js: function() {

            var that = this;

            this.scrollAnimationTime = 100;
            this.nextLink = 'http://api-fotki.yandex.ru/api/users/aig1001/album/63684/photos/?format=json&limit=30&callback=?';
            this.entries = [];
            this._content = $('.content');
            this.isFirstRun = true;
            this.count = 0;
            this.countToFill = 0;
            this.currentId = 0;
            this.mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
            this.isOpera = navigator.userAgent.match(/Opera/);

            document.addEventListener(this.mousewheelevt, function(event) {
                that.onWheel(event);
            }, false);

            $('html').hover(function() {
                $('.control').removeClass('disable-controls');
            },
            function() {
                $('.control').addClass('disable-controls');
            })

            this.getImages();
            this.bindControll();
            this.reCalc();
            this._onResize();

        }

    },

    getImages: function() {

        var that = this;

        $.getJSON( this.nextLink, function(data) {

            that.entries = $.merge(that.entries, data.entries);

            if (data.links.next) {

                if (that.isFirstRun){

                    console.log('first run');

                    if (!!JSON.parse(localStorage.getItem('entries')) && JSON.parse(localStorage.getItem('entries')).length == data.imageCount -1) {

                        console.log("localStorage.entries is up to date");

                        that.entries = JSON.parse(localStorage.getItem('entries'));
                        that.isFirstRun = false;
                        that.fillThumbnail();
                        that.startFrom(parseInt(localStorage.currentId));
                        that.doLeftScroll(parseInt(localStorage.currentId));
                        that.currentId = parseInt(localStorage.currentId);
                        that.hideButton();
                        that.toCurrentThumbnail(that.currentId);

                        console.log('start from ' + parseInt(localStorage.currentId));

                        return;

                    } else {

                        console.log("localStorage.entries is empty");

                        that.startFrom(0);
                        that.hideButton();
                        that.toCurrentThumbnail(that.currentId);
                        that.isFirstRun = false;

                    }

                }

                that.nextLink = data.links.next + '&limit=30&callback=?';
                that.fillThumbnail();
                that.getImages();

            } else {

                localStorage.setItem('entries', JSON.stringify(that.entries));
                that.fillThumbnail();
                console.log('Parsing done. ' + (that.entries.length) + ' url\'s parsed');
                console.log(JSON.parse(localStorage.getItem('entries')));
                console.log(that.entries);

            }
        });

    },

    fillThumbnail: function() {

        var dfd = new $.Deferred(),
            thumbnailItem = {
                block: 'thumbnail',
                elem: 'item',
                content: []
            },
            that = this,
            thumbnailSize = 100;

        this.entries.forEach(function(item, i) {

            if ( i >= that.count ) {

                thumbnailItem.content = {
                    tag: 'img',
                    attrs: {
                        src: item.img.S.href,
                        fullimg: item.img.XL.href,
                        title: item.title,
                        id: 'img'+i
                    }
                };


                if (that.isOpera) {
                    thumbnailItem = '<div class="thumbnail__item"><img src="'+item.img.S.href+'" fullimg="'+item.img.XL.href+'" title="'+item.title+'" id="'+ "img"+i +'"></div>';
                    $('.thumbnail')[0].innerHTML += (thumbnailItem);
                    console.log('opera');
                } else {
                    $('.thumbnail').append($(BEMHTML.apply(thumbnailItem)));
                    console.log('not opera');
                }

                var thumbnailImg = $('.thumbnail__item #img'+i);

                that.isImgLoaded(thumbnailImg).then(function() {

                    if (thumbnailImg.height() < thumbnailImg.width()) {

                        thumbnailImg.height(thumbnailSize);
                        thumbnailImg.css('left', -(thumbnailImg.width() - thumbnailSize) / 2 + 'px');

                    } else if (thumbnailImg.width() < thumbnailImg.height()) {

                        thumbnailImg.width(thumbnailSize);
                        thumbnailImg.css('top', -(thumbnailImg.height() - thumbnailSize) / 2 + 'px');

                    }

                });

            }

            if (i == that.entries.length - 1) {

                dfd.resolve();

            };
        });
        $.when(dfd).then(function() {

            that.reBind.call(that);
            that.count = that.entries.length;

        });

    },

    reBind: function() {

        var that = this;

        $('.thumbnail__item img').off();
        $('.thumbnail__item img').on('click', function(event) {

            var link = $(this).attr('fullimg'),
                id = $(this).attr('id'),
                intId = that.getIntId($(this).attr('id'));

            if (that.currentId < intId) {

                that.insertImage($('.slider__item_type_next img'), id );
                that._next().then(function() {

                    var nextId = 'img' + (that.currentId + 1),
                        prevId = 'img' + (that.currentId - 1);

                    that.insertImage($('.slider__item_type_prev img'), prevId);
                    that.insertImage($('.slider__item_type_next img'), nextId);

                });


            }
            if (that.currentId > intId) {

                that.insertImage($('.slider__item_type_prev img'), id );
                that._prev().then(function() {

                    var nextId = 'img' + (that.getIntId(id) + 1),
                        prevId = 'img' + (that.currentId - 1);

                    that.insertImage($('.slider__item_type_next img'), nextId);
                    that.insertImage($('.slider__item_type_prev img'), prevId);

                });

            }

        });

    },

    insertImage: function(obj, id) {

        var intId = this.getIntId(id),
            that = this,
            dfd = new $.Deferred;

        obj.addClass('not-loaded');
        obj.attr('src', this.entries[intId].img.XL.href);
        obj.attr('id', id);

        this.isImgLoaded(obj).then(function() {
            obj.css('max-height', obj[0].naturalHeight);
            obj.css('max-width', obj[0].naturalWidth);
            obj.removeClass('not-loaded');
            that.reCalc();
            dfd.resolve();
        });
        return dfd.promise();
    },

    isImgLoaded: function(obj) {

        var dfd = new $.Deferred;

        var that = this;
        var timeId = setInterval(function () {
            if (obj[0].complete) {
                clearInterval(timeId);
                dfd.resolve();
            }
        }, 100);
        return dfd.promise();

    },

    bindControll: function() {

        var that = this;

        $('.control_type_next').on('click', function() {
            that._next();
        });
        $('.control_type_prev').on('click', function() {
            that._prev();
        });

    },

    _next: function() {
        this.currentId = this.getIntId($('.slider__item_type_current img').attr('id'));

        if (this.currentId <= this.entries.length) {

            var next = $('.slider__item_type_next'),
                prev = $('.slider__item_type_prev'),
                current = $('.slider__item_type_current'),
                that = this,
                dfd = new $.Deferred;

            this._content.addClass('no-click');
            next
                .one('webkitTransitionEnd oTransitionEnd otransitionend transitionend', function() {
                    that._content.removeClass('no-click');
                    dfd.resolve();
                });
            current[0].className = current[0].className.replace('slider__item_type_current', 'slider__item_type_prev');
            prev[0].className = prev[0].className.replace('slider__item_type_prev', 'slider__item_type_next');
            next[0].className = next[0].className.replace('slider__item_type_next', 'slider__item_type_current');

            this.currentId = this.getIntId($('.slider__item_type_current img').attr('id'));
            this.doLeftScroll(this.currentId);

            localStorage.currentId = this.getIntId($('.slider__item_type_current img').attr('id'));

            this.hideButton();
            this.toCurrentThumbnail(this.currentId);

            console.log( ' id 4 next fun ' + this.getIntId($('.slider__item_type_current img').attr('id')));

            this.insertImage($('.slider__item_type_next img'), 'img' + (this.currentId + 1));
            return dfd.promise();

        }

    },

    _prev: function() {
        this.currentId = this.getIntId($('.slider__item_type_current img').attr('id'));

        if (this.currentId > 0) {

            var next = $('.slider__item_type_next'),
                prev = $('.slider__item_type_prev'),
                current = $('.slider__item_type_current'),
                that = this,
                dfd = new $.Deferred;

            this._content.addClass('no-click');
            prev
                .one('webkitTransitionEnd oTransitionEnd otransitionend transitionend', function() {
                    that._content.removeClass('no-click');
                    dfd.resolve();
                });
            current[0].className = current[0].className.replace('slider__item_type_current', 'slider__item_type_next');
            prev[0].className = prev[0].className.replace('slider__item_type_prev', 'slider__item_type_current');
            next[0].className = next[0].className.replace('slider__item_type_next', 'slider__item_type_prev');

            this.currentId = this.getIntId($('.slider__item_type_current img').attr('id'));
            this.doLeftScroll(this.currentId);

            localStorage.currentId = this.getIntId($('.slider__item_type_current img').attr('id'));

            this.hideButton();
            this.toCurrentThumbnail(this.currentId);

            this.insertImage($('.slider__item_type_prev img'), 'img' + (this.currentId - 1));
            return dfd.promise();
        }

    },

    toCurrentThumbnail: function(id) {

        if ($('.thumbnail-current')){
            $('.thumbnail-current').removeClass('thumbnail-current');
        }
        $('.thumbnail__item').eq(id).addClass('thumbnail-current');
    },

    startFrom: function(id) {
        id != -1 && this.insertImage($('.slider__item_type_prev img'), 'img'+(id-1));
        this.insertImage($('.slider__item_type_current img'), 'img'+(id));
        this.insertImage($('.slider__item_type_next img'), 'img'+(id+1));
    },

    _onResize: function() {

        var lastResize = new Date(),
            that = this;

        $(window).on('resize', function() {
                lastResize = new Date();
                that.reCalc();
                that.doLeftScroll(that.currentId);
        })
    },

    reCalc: function() {
        if (window.innerHeight < $('.slider__inner img')[0].naturalWidth || window.innerHeight < $('.slider__inner img')[0].naturalHeight) {
            $('.slider__inner img').css('height', window.innerHeight);
        }
    },

    getIntId: function(id) {
        return parseInt(id.match(/\d+/)[0]);
    },

    hideButton: function() {

        if (this.currentId == this.entries.length){
            $('.control_type_next').addClass('disable-control');
        } else if (this.currentId == 0){
            $('.control_type_prev').addClass('disable-control');
        }else if ($('.disable-control')) {
            $('.disable-control').removeClass('disable-control');
        }

    },

    doLeftScroll: function(id) {
        id+=1;
        if ((id * 110) > (window.innerWidth / 2)) {
            $('.footer').scrollTo({top: 0, left: ( id * 110 -  ( window.innerWidth / 2 + 50 )) + 'px'}, 300);
        } else if ((id * 110) < (window.innerWidth / 2)) {
            $('.footer').scrollTo({top: 0, left: 0}, 300);
        }
        console.log();
    },

    onWheel: function(event) {

        var delta = 0;

        if (!this.lastWeel || new Date() - this.lastWeel > this.scrollAnimationTime) {

            delta = event.wheelDelta
                ? event.wheelDelta/120
                : -event.detail/3;

            delta && this.doScroll(delta);
            event.preventDefault();
        } else this.lastWeel = new Date();

    },

    doScroll: function(delta) {

        $('.footer').scrollLeft( $('.footer').scrollLeft() + -delta * 200 );

    }
})