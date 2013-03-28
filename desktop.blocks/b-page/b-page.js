BEM.DOM.decl('b-page', {
    onSetMode: {

        js: function() {

            this.nextLink = 'http://api-fotki.yandex.ru/api/users/aig1001/album/63684/photos/?format=json';
            console.log(this.nextLink);
            this.entries = [];
            this.getImages();

        }
    },
    getImages: function () {

        var that = this;
        $.get( this.nextLink, function(data) {

            entries.push(data.entries);
            if (data.links.next) {
                that.nextLink = data.links.next;
                that.getImages();
            } else {
                console.log(that.entries);
            }

        });

    }
})