({
    block: 'b-page',
    title: 'Exam shri',
    favicon: '/favicon.ico',
    head: [
        { elem: 'css', url: '_index.css', ie: false },
        { elem: 'css', url: '_index', ie: true },
        { block: 'i-jquery', elem: 'core' },
        { elem: 'js', url: '_index.js' },
        { elem: 'js', url: '_index.bemhtml.js' },
        { elem: 'meta', attrs: { name: 'description', content: '' }},
        { elem: 'meta', attrs: { name: 'keywords', content: '' }}
    ],
    content:[{
            block: 'content',
            js: 'true',
            content: [,{
                block: 'slider',
                content: [{
                    elem: 'item',
                    mods: {
                        type: 'prev'
                    },
                    content: {
                        tag: 'img'
                    }
                },{
                    elem: 'item',
                    mods: {
                        type: 'current'
                    },
                    content: {
                        tag: 'img'
                    }
                },{
                    elem: 'item',
                    mods: {
                        type: 'next'
                    },
                    content: {
                        tag: 'img'
                    }
                }]
            },{
                block: 'control',
                mods: {
                    type: 'prev'
                },
                content: {
                    elem: 'wrap',
                    content: '◄'
                }
            },{
                block: 'control',
                mods: {
                    type: 'next'
                },
                content: {
                    elem: 'wrap',
                    content: '►'
                }
            }]
        },
        {
            block: 'footer',
            content: {
                block: 'thumbnail'
            }
        }
    ]
})