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
            $(window).resize(function() {
                $('.slider__item_type_current img').attr('height', $(window).innerHeight() - $('.footer').height());
            });
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

                var nextId = parseInt($('.slider__item_type_current img').attr('id')) +1;
                that.insertNextImage(that.entries[nextId].img.XL.href, nextId);
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

                    var prevId = parseInt($('.slider__item_type_current img').attr('id')) -1;
                    that.insertPrevImage(that.entries[prevId].img.XL.href, prevId);
                }
            });
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
                    that.insertCurrentImage(that.entries[0].img.XL.href, '0');
                    that.insertNextImage(that.entries[1].img.XL.href, '1');
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
                    id: i
                }
            }
            $('.thumbnail').append($(BEMHTML.apply(thumbnailItem)));
            if (i == that.entries.length -1) {
                dfd.resolve();
            };
        });
        $.when(dfd).then(this.reBind);

    },
    reBind: function() {

        var that = this;
        $('.thumbnail__item').off();
        $('.thumbnail__item').on('click', function(event) {
            var link = $(this).find('img').attr('fullimg');
            var id = $(this).find('img').attr('id');
            that.insertCurrentImage( link, id );
        });

    },
    insertNextImage: function(link, id) {

        $('.slider__item_type_next img').attr('src', link);
        $('.slider__item_type_next img').attr('id', id);
        currentHeight = $('.slider__item_type_next img').attr('height');
        windowHeight = $(window).innerHeight();

        if ( currentHeight > windowHeight - $('.footer').height()) {
            $('.slider__item_type_next img').attr('height', windowHeight - $('.footer').height())
        };

    },
    insertCurrentImage: function(link, id) {

        $('.slider__item_type_current img').attr('src', link);
        $('.slider__item_type_current img').attr('id', id);
        currentHeight = $('.slider__item_type_current img').attr('height');
        windowHeight = $(window).innerHeight();

        if ( currentHeight > windowHeight - $('.footer').height()) {
            $('.slider__item_type_current img').attr('height', windowHeight - $('.footer').height())
        };

    },
    insertPrevImage: function(link, id) {

        $('.slider__item_type_prev img').attr('src', link);
        $('.slider__item_type_prev img').attr('id', id);
        currentHeight = $('.slider__item_type_prev img').attr('height');
        windowHeight = $(window).innerHeight();

        if ( currentHeight > windowHeight - $('.footer').height()) {
            $('.slider__item_type_prev img').attr('height', windowHeight - $('.footer').height())
        };

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