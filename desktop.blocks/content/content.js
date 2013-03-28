BEM.DOM.decl('content', {
    onSetMod: {

        js: function() {

            var that = this;
            this.scrollAnimationTime = 100;
            this.nextLink = 'http://api-fotki.yandex.ru/api/users/aig1001/album/63684/photos/?format=json&limit=15&callback=?';
            this.entries = [];
            window.addEventListener('mousewheel', function(event) {
                 that.onWheel(event)
            }, false);
            this.getImages();

        }
    },
    getImages: function() {

        var that = this;
        $.getJSON( this.nextLink, function(data) {

            that.entries = $.merge(that.entries, data.entries);
            if (data.links.next) {
                that.nextLink = data.links.next + '&limit=15&callback=?';
                that.getImages();
                that.fillThumbnail();
                if (that.entries.length == 15) {
                    $('.slider__item_type_current').img.attr('src') = that.entries.img.XL.href;
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
                    fullimg: item.img.XL.href
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
        $('.thumbnail__item').off();
        $('.thumbnail__item').on('click', function(event) {
            console.log(this);
            console.log($(this).find('img').attr('fullimg'));
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