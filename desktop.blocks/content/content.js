BEM.DOM.decl('content', {

    onSetMod: {

        js: function() {

            var that = this;

            this.scrollAnimationTime = 100;
            this.nextLink = 'http://api-fotki.yandex.ru/api/users/aig1001/album/63684/photos/?format=json&limit=100&callback=?';
            this.entries = [];
            this._content = $('.content');

            window.addEventListener('mousewheel', function(event) {
                 that.onWheel(event)
            }, false);

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

                that.nextLink = data.links.next + '&limit=100&callback=?';
                that.getImages();
                that.fillThumbnail();
                if (that.entries.length == 100) {

                    that.insertImage($('.slider__item_type_current img'), 'img0');
                    that.insertImage($('.slider__item_type_next img'), 'img1');
                };

            } else {
                console.log('Parsing done. ' + that.entries.length + ' url\'s parsed');
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
            thumbnailSize = $('.thumbnail__item').height();

        this.entries.forEach(function(item, i) {

            thumbnailItem.content = {
                tag: 'img',
                attrs: {
                    src: item.img.S.href,
                    fullimg: item.img.XL.href,
                    title: item.title,
                    id: 'img'+i
                }
            };
            $('.thumbnail').append($(BEMHTML.apply(thumbnailItem)));
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

            if (i == that.entries.length -1) {
                dfd.resolve();
            };
        });
        $.when(dfd).then(function() {
            that.reBind.call(that);
        });

    },

    reBind: function() {

        var that = this;

        $('.thumbnail__item img').off();
        $('.thumbnail__item img').on('click', function(event) {

            var link = $(this).attr('fullimg'),
                id = $(this).attr('id');

            currentId = $('.slider__item_type_current img').attr('id');
            if (currentId < id) {

                that.insertImage($('.slider__item_type_next img'), id );
                that._next().then(function() {
                    var nextId = 'img' + (parseInt(id.match(/\d+/)[0]) - 1);
                    that.insertImage($('.slider__item_type_prev img'), nextId );
                });

            } else if (currentId > id) {

                that.insertImage($('.slider__item_type_prev img'), id );
                that._prev().then(function() {
                    var nextId = 'img' + (parseInt(id.match(/\d+/)[0]) + 1);
                    that.insertImage($('.slider__item_type_next img'), nextId );
                });

            }

        });

    },

    insertImage: function(obj, id) {

        var intId = parseInt(id.match(/\d+/)[0]);

        obj.addClass('not-loaded');
        obj.attr('src', this.entries[intId].img.XL.href);
        obj.attr('id', id);

        this.isImgLoaded(obj).then(function() {
            obj.css('max-height', obj[0].naturalHeight);
            obj.removeClass('not-loaded');
        });

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

        if (parseInt($('.slider__item_type_current img').attr('id').match(/\d+/)[0]) <= this.entries.length) {

            var next = $('.slider__item_type_next'),
                prev = $('.slider__item_type_prev'),
                current = $('.slider__item_type_current'),
                that = this,
                dfd = new $.Deferred;

            this._content.addClass('no-click');
            next
                .one('webkitTransitionEnd oTransitionEnd otransitionend transitionend', function() {
                    that._content.removeClass('no-click');
                });
            console.log(current);
            current[0].className = current[0].className.replace('slider__item_type_current', 'slider__item_type_prev');
            prev[0].className = prev[0].className.replace('slider__item_type_prev', 'slider__item_type_next');
            next[0].className = next[0].className.replace('slider__item_type_next', 'slider__item_type_current');


            var nextId = 'img' + (parseInt($('.slider__item_type_current img').attr('id').match(/\d+/)[0]) + 1);
            this.insertImage($('.slider__item_type_next img'), nextId);
            return dfd.promise();
        }

    },

    _prev: function() {

        if (parseInt($('.slider__item_type_current img').attr('id').match(/\d+/)[0]) > 0) {
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
            console.log(current);
            current[0].className = current[0].className.replace('slider__item_type_current', 'slider__item_type_next');
            prev[0].className = prev[0].className.replace('slider__item_type_prev', 'slider__item_type_current');
            next[0].className = next[0].className.replace('slider__item_type_next', 'slider__item_type_prev');

            var nextId = 'img' + (parseInt($('.slider__item_type_current img').attr('id').match(/\d+/)[0]) - 1);
            this.insertImage($('.slider__item_type_prev img'), nextId);
            return dfd.promise();
        }

    },

    _onResize: function() {

        var lastResize = new Date()
            that = this;

        $(window).on('resize', function() {
            if ( new Date() - lastResize > 100 ) {
                lastResize = new Date();
                that.reCalc();
            };
        })
    },

    reCalc: function() {

        $('.slider__inner img').css('height', window.innerHeight);

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

        var that = this;
        $('.footer').scrollLeft( $('.footer').scrollLeft() + -delta * 200 );

    }
})