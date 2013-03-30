BEM.DOM.decl('content', {
    onSetMod: {

        js: function() {

            var that = this;
            this.scrollAnimationTime = 100;
            this.nextLink = 'http://api-fotki.yandex.ru/api/users/aig1001/album/63684/photos/?format=json&limit=100&callback=?';
            this.entries = [];
            window.addEventListener('mousewheel', function(event) {
                 that.onWheel(event)
            }, false);
            this.getImages();
            this.bindControll();
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
            that = this;
        this.entries.forEach(function(item, i) {
            thumbnailItem.content = {
                tag: 'img',
                attrs: {
                    src: item.img.S.href,
                    fullimg: item.img.XL.href,
                    title: item.title,
                    id: 'img'+i
                }
            }
            $('.thumbnail').append($(BEMHTML.apply(thumbnailItem)));
            if (i == that.entries.length -1) {
                dfd.resolve();
            };
        });
        $.when(dfd).then(that.reBind);

    },
    reBind: function() {

        var that = this;

        $('.thumbnail__item img').off();
        $('.thumbnail__item img').on('click', function(event) {
            console.log();
            var link = $(this).attr('fullimg');
            var id = $(this).attr('id');
            that.insertCurrentImage( link, id );
        });

    },
    insertImage: function(obj, id) {
        var intId = parseInt(id.match(/\d+/)[0]);
        obj.attr('src', this.entries[intId].img.XL.href);
        obj.attr('id', id);

        var container = 'current';
        this.isImgLoaded(obj).then(function() {

            var currentHeight = obj.height(),
                windowHeight = $(window).innerHeight(),
                footerHeight = $('.footer').height(),
                marginImage = (windowHeight - currentHeight - footerHeight) / 2;
            console.log('currentHeight '+currentHeight);
            console.log('windowHeight '+windowHeight);
            console.log('footerHeight '+footerHeight);
            console.log('marginImage '+marginImage);
            obj.css('margin-top', marginImage + 'px');
            if ( currentHeight > windowHeight - footerHeight) {
                obj.css('height', windowHeight - footerHeight);
            };
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
    },bindControll: function() {
        var that = this;

        $('.control_type_next').on('click', function() {

            $('.slider__item_type_next').addClass('to-current');
            $('.slider__item_type_current').addClass('to-prev');
            $('.slider__item_type_prev').addClass('to-next');
            $('.to-next').addClass('visibility_false');

            $('.to-current').addClass('slider__item_type_current');
            $('.to-prev').addClass('slider__item_type_prev');
            $('.to-next').addClass('slider__item_type_next');

            $('.to-current').removeClass('slider__item_type_next');
            $('.to-prev').removeClass('slider__item_type_current');
            $('.to-next').removeClass('slider__item_type_prev');

            $('.to-current').removeClass('to-current');
            $('.to-prev').removeClass('to-prev');
            $('.to-next').removeClass('to-next');
            setTimeout(function() {
                $('.slider__item_type_next').removeClass('visibility_false');
            }, 300);

            var nextId = parseInt($('.slider__item_type_current img').attr('id').match(/\d+/)[0]) + 1;
            nextId = 'img' + nextId;
            that.insertImage($('.slider__item_type_next img'), nextId);
        });
        $('.control_type_prev').on('click', function() {
            if (parseInt($('.slider__item_type_current img').attr('id')) > 0) {
                $('.slider__item_type_next').addClass('to-prev');
                $('.slider__item_type_current').addClass('to-next');
                $('.slider__item_type_prev').addClass('to-current');
                $('.to-prev').addClass('visibility_false');

                $('.to-current').removeClass('slider__item_type_prev');
                $('.to-prev').removeClass('slider__item_type_next');
                $('.to-next').removeClass('slider__item_type_current');

                $('.to-current').addClass('slider__item_type_current');
                $('.to-prev').addClass('slider__item_type_prev');
                $('.to-next').addClass('slider__item_type_next');

                $('.to-current').removeClass('to-current');
                $('.to-prev').removeClass('to-prev');
                $('.to-next').removeClass('to-next');
                setTimeout(function() {
                    $('.slider__item_type_prev').removeClass('visibility_false');
                }, 300);

                var nextId = parseInt($('.slider__item_type_current img').attr('id').match(/\d+/)[0]) - 1;
                nextId = 'img' + nextId;
                that.insertImage($('.slider__item_type_prev img'), nextId);
            }
        });
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